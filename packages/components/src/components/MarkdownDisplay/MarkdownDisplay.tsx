import {
  createContext,
  isValidElement,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useContext,
  useId,
  useMemo,
} from 'react';

import type { Components, ExtraProps } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remend from 'remend';

import { ImageIcon } from '@phosphor-icons/react/dist/ssr/Image';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';

import { cn } from '../../utils/cn';
import { makeComponentName } from '../../utils/componentUtils';
import { Checkbox } from '../Checkbox';
import { MAX_TEXT_LENGTH } from '../Code/constants';
import { ErrorBoundary } from '../ErrorBoundary';
import { Icon } from '../Icon';
import { Link } from '../Link';
import { Text, type TextProps } from '../Text';
import { TextWithLinks } from '../TextWithLinks';
import { MarkdownCodeBlock } from './MarkdownCodeBlock';
import {
  TRAILING_SLOT_ATTRIBUTE,
  rehypeMarkdownDisplay,
  remarkDisableRawHtml,
} from './markdownPlugins';
import { prepareMarkdownXml } from './prepareMarkdownXml';

type TextColor = NonNullable<TextProps['color']>;
type ListType = 'ordered' | 'unordered';
type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingProps = ComponentProps<HeadingVariant> & ExtraProps;
type ListItemProps = ComponentProps<'li'> & ExtraProps;
type InputProps = ComponentProps<'input'> & ExtraProps;
type ImageProps = ComponentProps<'img'> & ExtraProps;
type SpanProps = ComponentProps<'span'> & ExtraProps;

interface MarkdownDisplayContextValue {
  loadImages: boolean;
  trailingContent: ReactNode;
  codeOverflow: 'wrap' | 'scroll';
}

const COMPONENT_NAME = makeComponentName('MarkdownDisplay');
const PLAIN_TEXT_FALLBACK_MESSAGE =
  'Shown as plain text because this block is too large for Markdown.';
const REMARK_PLUGINS = [remarkGfm, remarkDisableRawHtml];
const REHYPE_PLUGINS = [rehypeMarkdownDisplay];
const ListTypeContext = createContext<ListType>('unordered');
/** The id of the enclosing task list item, which names its checkbox. */
const TaskItemContext = createContext<string | undefined>(undefined);
const MarkdownDisplayContext = createContext<MarkdownDisplayContextValue>({
  loadImages: false,
  trailingContent: null,
  codeOverflow: 'wrap',
});

const blockSpacing =
  'mt-space-4 first:mt-0 [:is(h1,h2,h3,h4,h5,h6)+&]:mt-space-2';
/** Inline links keep the size and rhythm of the text they sit in. */
const inlineLinkClassName =
  'inline text-[length:inherit] leading-[inherit] tracking-[inherit]';

function MarkdownListItem({
  children,
  className,
  id,
  node: _node,
  ...props
}: ListItemProps) {
  const listType = useContext(ListTypeContext);
  const generatedId = useId();
  const isTask = className?.split(' ').includes('task-list-item') ?? false;
  const hasBullet = listType === 'unordered' && !isTask;
  const itemId = id ?? (isTask ? generatedId : undefined);

  return (
    <TaskItemContext.Provider value={isTask ? itemId : undefined}>
      <li
        {...props}
        id={itemId}
        className={cn(
          'text-sm leading-normal tracking-normal',
          hasBullet && 'relative pl-space-3',
          isTask &&
            'relative list-none pl-space-5 has-[[data-state=checked]]:text-quaternary has-[[data-state=checked]]:line-through',
          className
        )}
      >
        {children}
        {/* Last so the item's first block keeps its first-child spacing. */}
        {hasBullet && (
          <span
            aria-hidden
            className="absolute left-0 top-[0.65em] size-1 rounded-full bg-current"
          />
        )}
      </li>
    </TaskItemContext.Provider>
  );
}

function MarkdownTaskCheckbox({ checked, type }: InputProps) {
  const taskItemId = useContext(TaskItemContext);
  if (type !== 'checkbox') return null;

  const checkboxProps = {
    checked: checked ?? false,
    'aria-readonly': true,
    tabIndex: -1,
    onClick: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
    size: 'sm',
    className: 'pointer-events-none',
    containerClassName: 'absolute left-0 top-[calc(0.75em_-_0.5rem)]',
  } as const;

  return taskItemId ? (
    <Checkbox {...checkboxProps} aria-labelledby={taskItemId} />
  ) : (
    <Checkbox
      {...checkboxProps}
      aria-label={checked ? 'Completed task' : 'Open task'}
    />
  );
}

function MarkdownImage({
  alt = '',
  src,
  className,
  node: _node,
  ...props
}: ImageProps) {
  const { loadImages } = useContext(MarkdownDisplayContext);

  if (typeof src !== 'string' || !src) {
    return <span className="text-tertiary">{alt}</span>;
  }

  if (!loadImages) {
    return (
      <Link
        href={src}
        variant="body"
        target="_blank"
        rel="noopener noreferrer"
        leftDecorator={ImageIcon}
        // Preflight makes SVGs block-level; keep the icon on the text line.
        className={cn(
          inlineLinkClassName,
          '[&>svg]:mr-[2px] [&>svg]:inline [&>svg]:align-[-0.125em]'
        )}
      >
        {alt || src}
      </Link>
    );
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={cn(
        blockSpacing,
        'h-auto max-w-full rounded-md border border-subtle',
        className
      )}
    />
  );
}

function MarkdownSpan({ node: _node, ...props }: SpanProps) {
  const { trailingContent } = useContext(MarkdownDisplayContext);
  if (TRAILING_SLOT_ATTRIBUTE in props) return <>{trailingContent}</>;
  return <span {...props} />;
}

const createHeading = (
  variant: HeadingVariant,
  headingClassName: string,
  weight: TextProps['weight'] = 'semibold',
  color?: TextColor
) =>
  function MarkdownHeading({
    children,
    className,
    color: _color,
    node: _node,
    ...props
  }: HeadingProps) {
    return (
      <Text
        {...props}
        as={variant}
        variant={variant}
        weight={weight}
        color={color}
        className={cn(blockSpacing, headingClassName, className)}
      >
        {children}
      </Text>
    );
  };

const MARKDOWN_COMPONENTS: Components = {
  pre: function MarkdownPre({ children }) {
    const { codeOverflow } = useContext(MarkdownDisplayContext);
    const child = isValidElement<{
      children?: ReactNode;
      className?: string;
    }>(children)
      ? children
      : undefined;
    const language = child?.props.className?.match(/language-([^\s]+)/)?.[1];
    const code =
      typeof child?.props.children === 'string'
        ? child.props.children
        : String(child?.props.children ?? '');

    return (
      <div
        data-search-block=""
        data-search-code=""
        className={cn('w-full min-w-0', blockSpacing)}
      >
        <MarkdownCodeBlock
          code={code}
          language={language}
          codeOverflow={codeOverflow}
        />
      </div>
    );
  },
  code: ({ children, className, node: _node, ...props }) => (
    <code
      {...props}
      className={cn(
        'rounded-xs bg-surface-level-3 px-space-1 py-px font-mono text-[length:0.9em] leading-[inherit] tracking-normal text-tertiary',
        className
      )}
    >
      {children}
    </code>
  ),
  a: ({ children, href, className, node: _node, ...props }) => {
    if (!href) return <span>{children}</span>;
    // Fragment links (footnote references and back-references) stay in page.
    const opensNewTab = !href.startsWith('#');

    return (
      <Link
        {...props}
        href={href}
        variant="body"
        target={opensNewTab ? '_blank' : undefined}
        rel={opensNewTab ? 'noopener noreferrer' : undefined}
        className={cn(inlineLinkClassName, className)}
      >
        {children}
      </Link>
    );
  },
  h1: createHeading('h1', 'text-xl leading-tight'),
  h2: createHeading('h2', 'text-lg leading-tight'),
  h3: createHeading('h3', 'text-base leading-tight'),
  h4: createHeading('h4', 'text-sm leading-tight', 'semibold', 'quaternary'),
  h5: createHeading('h5', 'text-sm leading-tight', 'semibold', 'secondary'),
  h6: createHeading('h6', 'text-sm leading-tight', 'medium', 'secondary'),
  p: ({ children, className, color: _color, node: _node, ...props }) => (
    <Text
      {...props}
      as="p"
      variant="body"
      className={cn('mt-space-3 first:mt-0', className)}
    >
      {children}
    </Text>
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      {...props}
      className={cn(
        blockSpacing,
        'border-l-4 border-default bg-surface-level-2 py-space-2 pl-space-4 pr-space-3 italic [overflow-wrap:anywhere]'
      )}
    />
  ),
  ul: ({ className, node: _node, ...props }) => (
    <ListTypeContext.Provider value="unordered">
      <ul
        {...props}
        className={cn(
          blockSpacing,
          'ml-space-3 flex flex-col gap-space-1 [li>&]:mt-space-1',
          className
        )}
      />
    </ListTypeContext.Provider>
  ),
  ol: ({ className, start, style, node, ...props }) => {
    const itemCount =
      node?.children.filter(
        (child) => child.type === 'element' && child.tagName === 'li'
      ).length ?? 0;
    const firstNumber = start ?? 1;
    const lastNumber = firstNumber + Math.max(itemCount - 1, 0);
    const markerDigits = Math.max(
      String(firstNumber).length,
      String(lastNumber).length
    );

    return (
      <ListTypeContext.Provider value="ordered">
        <ol
          {...props}
          start={start}
          // Outside markers sit in this padding, so it widens with the
          // longest number instead of letting markers overflow and clip.
          style={{ ...style, paddingInlineStart: `${markerDigits + 1.5}ch` }}
          className={cn(
            blockSpacing,
            'flex list-outside list-decimal flex-col gap-space-1 [li>&]:mt-space-1',
            className
          )}
        />
      </ListTypeContext.Provider>
    );
  },
  li: MarkdownListItem,
  input: MarkdownTaskCheckbox,
  table: ({ node: _node, ...props }) => (
    <div
      data-search-block=""
      role="region"
      aria-label="Table"
      tabIndex={0}
      className={cn(
        blockSpacing,
        'w-full overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus'
      )}
    >
      <table
        {...props}
        className="w-full min-w-max border-collapse text-left text-xs"
      />
    </div>
  ),
  th: ({ node: _node, ...props }) => (
    <th
      {...props}
      className="border border-default bg-surface-level-2 px-space-2 py-space-1 font-semibold"
    />
  ),
  td: ({ node: _node, ...props }) => (
    <td
      {...props}
      className="border border-default px-space-2 py-space-1 align-top"
    />
  ),
  hr: ({ node: _node, ...props }) => (
    <hr {...props} className={cn(blockSpacing, 'border-default')} />
  ),
  strong: ({ className, node: _node, ...props }) => (
    <strong {...props} className={cn('font-semibold', className)} />
  ),
  em: ({ className, node: _node, ...props }) => (
    <em {...props} className={cn('italic', className)} />
  ),
  del: ({ node: _node, ...props }) => (
    <del {...props} className="text-tertiary" />
  ),
  img: MarkdownImage,
  span: MarkdownSpan,
};

export interface MarkdownDisplayProps {
  /** Markdown source to render. */
  content: string;
  /** Render custom XML wrappers as labeled sections, or keep tags literal (default). */
  xmlTags?: 'literal' | 'sections';
  /** Repair unfinished Markdown while content streams; use the original Markdown when false. */
  isStreaming?: boolean;
  className?: string;
  /**
   * Render oversized content in full as linkified, non-virtualized plain text
   * instead of truncating it behind a Show more toggle. Ignores
   * `containerHeight`.
   */
  fullLength?: boolean;
  /**
   * Viewport height for truncated oversized content. When set, that content
   * renders in a virtualized plain-text viewport whose URLs are not
   * linkified.
   */
  containerHeight?: string;
  /** Preserve single newlines visually without changing Markdown parsing. */
  preserveNewlines?: boolean;
  /** Wrap long fenced code lines by default, or scroll them horizontally. */
  codeOverflow?: 'wrap' | 'scroll';
  /** Color applied to text-bearing Markdown elements. */
  textColor?: TextColor;
  /**
   * Load images referenced by the Markdown. Off by default: loading a remote
   * image from untrusted content sends a request, and anything encoded in its
   * URL, without user action. Images otherwise render as links.
   */
  loadImages?: boolean;
  /**
   * Override or extend the default react-markdown component mapping. Keep
   * override components stable across renders; a new component function
   * remounts every element it renders.
   */
  components?: Components;
  /**
   * Content that continues the rendered flow: inline after the final
   * paragraph's text, or after the last block when content ends otherwise.
   */
  trailingContent?: ReactNode;
  /** Content rendered after the Markdown content container. */
  afterContent?: ReactNode;
}

/**
 * Renders untrusted Markdown with GFM support and Macaw presentation.
 *
 * Raw HTML is never interpreted. Tags display as text by default; opt in to
 * XML sections turn custom wrappers into labels and nested blockquotes.
 * Content above the shared text length limit renders as plain text,
 * truncated behind a Show more toggle unless `fullLength` is set.
 */
export function MarkdownDisplay({
  content,
  isStreaming = false,
  xmlTags = 'literal',
  className,
  fullLength = false,
  containerHeight,
  preserveNewlines = false,
  codeOverflow = 'wrap',
  textColor = 'primary',
  loadImages = false,
  components,
  trailingContent,
  afterContent,
}: MarkdownDisplayProps) {
  const markdownComponents = useMemo(
    () =>
      components
        ? { ...MARKDOWN_COMPONENTS, ...components }
        : MARKDOWN_COMPONENTS,
    [components]
  );
  const contextValue = useMemo(
    () => ({ loadImages, trailingContent, codeOverflow }),
    [loadImages, trailingContent, codeOverflow]
  );
  const isPlainText = content.length > MAX_TEXT_LENGTH;
  const markdown = useMemo(() => {
    if (isPlainText) return content;
    const prepared =
      xmlTags === 'sections' ? prepareMarkdownXml(content) : content;
    return isStreaming
      ? remend(prepared, {
          // Partial destinations must never become clickable links.
          linkMode: 'text-only',
          // HTML is literal text here, and math rendering is unsupported.
          htmlTags: false,
          katex: false,
        })
      : prepared;
  }, [content, isPlainText, isStreaming, xmlTags]);

  const plainText = (
    <>
      <TextWithLinks
        text={content}
        fullLength={fullLength}
        containerHeight={containerHeight}
        useRawSpan
      />
      {trailingContent}
    </>
  );

  return (
    <div
      data-component={COMPONENT_NAME}
      aria-busy={isStreaming || undefined}
      className={cn('min-w-0 text-sm', className)}
    >
      <Text
        as="div"
        variant="body"
        color={textColor}
        data-search-kind="container"
        className={cn(
          'min-w-0 break-words',
          preserveNewlines && 'whitespace-pre-wrap'
        )}
      >
        {isPlainText ? (
          <div className="relative pr-space-5">
            <Icon
              data-search-ignore=""
              icon={WarningCircleIcon}
              color="warning"
              size="xs"
              label={PLAIN_TEXT_FALLBACK_MESSAGE}
              role="img"
              tabIndex={0}
              aria-label={PLAIN_TEXT_FALLBACK_MESSAGE}
              className="absolute right-0 top-0"
            />
            {plainText}
          </div>
        ) : (
          <ErrorBoundary resetKey={content} fallback={() => plainText}>
            <MarkdownDisplayContext.Provider value={contextValue}>
              <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS}
                components={markdownComponents}
              >
                {markdown}
              </ReactMarkdown>
            </MarkdownDisplayContext.Provider>
          </ErrorBoundary>
        )}
      </Text>
      {afterContent}
    </div>
  );
}

MarkdownDisplay.displayName = COMPONENT_NAME;
