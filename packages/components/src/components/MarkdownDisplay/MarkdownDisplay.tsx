import {
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';

import type { Components, ExtraProps } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

type TextColor = NonNullable<TextProps['color']>;
type ListType = 'ordered' | 'unordered';
type ListItemProps = React.LiHTMLAttributes<HTMLLIElement> & ExtraProps;
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & ExtraProps;

const COMPONENT_NAME = makeComponentName('MarkdownDisplay');
const PLAIN_TEXT_FALLBACK_MESSAGE =
  'Shown as plain text because this block is too large for Markdown.';
const REMARK_PLUGINS = [remarkGfm];
const ListTypeContext = createContext<ListType>('unordered');
const TextColorContext = createContext<TextColor>('primary');

const blockSpacing =
  'mt-space-4 first:mt-0 [:is(h1,h2,h3,h4,h5,h6)+&]:mt-space-2';

function omitNode<T extends { node?: unknown }>(props: T): Omit<T, 'node'> {
  const elementProps = { ...props };
  delete elementProps.node;
  return elementProps;
}

function MarkdownListItem({ children, className, ...props }: ListItemProps) {
  const listType = useContext(ListTypeContext);
  const isTask = className?.split(' ').includes('task-list-item');

  return (
    <li
      {...omitNode(props)}
      className={cn(
        'text-sm leading-normal tracking-normal text-primary',
        listType === 'unordered' && !isTask && 'flex items-start gap-space-2',
        isTask &&
          'flex items-start gap-space-2 has-[[data-state=checked]]:text-quaternary has-[[data-state=checked]]:line-through',
        className
      )}
    >
      {listType === 'unordered' && !isTask && (
        <span
          aria-hidden
          className="mt-[0.65em] size-1 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
    </li>
  );
}

function getMarkdownComponents(textColor: TextColor): Components {
  const heading = (
    variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
    className: string,
    weight: TextProps['weight'] = 'semibold'
  ) =>
    function MarkdownHeading({ children, ...props }: HeadingProps) {
      return (
        <Text
          {...omitNode(props)}
          as={variant}
          variant={variant}
          color={textColor}
          weight={weight}
          className={cn(blockSpacing, className)}
        >
          {children}
        </Text>
      );
    };

  return {
    pre: ({ children }) => {
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
        <div className={cn('w-full min-w-0', blockSpacing)}>
          <MarkdownCodeBlock code={code} language={language} />
        </div>
      );
    },
    code: ({ children, ...props }) => (
      <code
        {...omitNode(props)}
        className={cn(
          'rounded-xs bg-surface-level-3 px-space-1 py-px font-mono text-xs leading-normal tracking-normal text-tertiary',
          omitNode(props).className
        )}
      >
        {children}
      </code>
    ),
    a: ({ children, href, ...props }) =>
      href ? (
        <Link
          {...omitNode(props)}
          href={href}
          variant="body"
          target="_blank"
          rel="noopener noreferrer"
          className="inline"
        >
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      ),
    h1: heading('h1', 'text-xl leading-tight'),
    h2: heading('h2', 'text-lg leading-tight'),
    h3: heading('h3', 'text-base leading-tight'),
    h4: heading('h4', 'text-sm leading-tight'),
    h5: heading('h5', 'text-sm leading-tight'),
    h6: heading('h6', 'text-sm leading-tight', 'medium'),
    p: ({ children, ...props }) => (
      <Text
        {...omitNode(props)}
        as="p"
        variant="body"
        color={textColor}
        className="mt-space-3 first:mt-0"
      >
        {children}
      </Text>
    ),
    blockquote: (props) => (
      <blockquote
        {...omitNode(props)}
        className={cn(
          blockSpacing,
          'border-l-4 border-default bg-surface-level-2 py-space-2 pl-space-4 pr-space-3 italic [overflow-wrap:anywhere]'
        )}
      />
    ),
    ul: (props) => (
      <ListTypeContext.Provider value="unordered">
        <ul
          {...omitNode(props)}
          className={cn(
            blockSpacing,
            'ml-space-3 flex flex-col gap-space-1 whitespace-normal'
          )}
        />
      </ListTypeContext.Provider>
    ),
    ol: (props) => (
      <ListTypeContext.Provider value="ordered">
        <ol
          {...omitNode(props)}
          className={cn(
            blockSpacing,
            'ml-space-5 flex list-outside list-decimal flex-col gap-space-1 whitespace-normal'
          )}
        />
      </ListTypeContext.Provider>
    ),
    li: MarkdownListItem,
    input: ({ checked, type }) =>
      type === 'checkbox' ? (
        <Checkbox
          aria-label={checked ? 'Completed' : 'Not completed'}
          checked={checked ?? false}
          disabled
          size="sm"
          className="pointer-events-none"
        />
      ) : null,
    table: (props) => (
      <div className={cn(blockSpacing, 'w-full overflow-x-auto')}>
        <table
          {...omitNode(props)}
          className="w-full min-w-max border-collapse text-left text-xs"
        />
      </div>
    ),
    th: (props) => (
      <th
        {...omitNode(props)}
        className="border border-default bg-surface-level-2 px-space-2 py-space-1 font-semibold text-primary"
      />
    ),
    td: (props) => (
      <td
        {...omitNode(props)}
        className="border border-default px-space-2 py-space-1 align-top text-primary"
      />
    ),
    hr: (props) => (
      <hr {...omitNode(props)} className={cn(blockSpacing, 'border-default')} />
    ),
    strong: ({ children, ...props }) => (
      <Text
        {...omitNode(props)}
        as="span"
        variant="body"
        color={textColor}
        weight="semibold"
      >
        {children}
      </Text>
    ),
    em: ({ children, ...props }) => (
      <Text
        {...omitNode(props)}
        as="span"
        variant="body"
        color={textColor}
        className="italic"
      >
        {children}
      </Text>
    ),
    del: (props) => <del {...omitNode(props)} className="text-tertiary" />,
    img: ({ alt = '', src, ...props }) =>
      src ? (
        <img
          {...omitNode(props)}
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            blockSpacing,
            'h-auto max-w-full rounded-md border border-subtle',
            omitNode(props).className
          )}
        />
      ) : (
        <span className="text-tertiary">{alt}</span>
      ),
  };
}

export interface MarkdownDisplayProps {
  /** Markdown source to render. */
  content: string;
  className?: string;
  /** Disable truncation in the plain-text fallback. */
  fullLength?: boolean;
  /** Height used by the virtualized plain-text fallback. */
  containerHeight?: string;
  /** Preserve single newlines visually without changing Markdown parsing. */
  preserveNewlines?: boolean;
  /** Color applied to text-bearing Markdown elements. */
  textColor?: TextColor;
  /** Override or extend the default react-markdown component mapping. */
  components?: Components;
  /** Content appended inside the Markdown or plain-text content flow. */
  trailingContent?: ReactNode;
  /** Content rendered after the Markdown content container. */
  afterContent?: ReactNode;
}

/**
 * Renders untrusted Markdown with GFM support and Macaw presentation.
 *
 * Raw HTML is intentionally not interpreted. Content above the shared text
 * length limit falls back to linkified plain text to keep rendering bounded.
 */
export function MarkdownDisplay({
  content,
  className,
  fullLength = false,
  containerHeight,
  preserveNewlines = false,
  textColor = 'primary',
  components,
  trailingContent,
  afterContent,
}: MarkdownDisplayProps) {
  const markdownComponents = useMemo(
    () => ({ ...getMarkdownComponents(textColor), ...components }),
    [components, textColor]
  );
  const isPlainText = content.length > MAX_TEXT_LENGTH;

  const fallback = (
    <TextWithLinks
      text={content}
      fullLength={fullLength}
      containerHeight={containerHeight}
      useRawSpan
    />
  );

  return (
    <div
      data-component={COMPONENT_NAME}
      className={cn('min-w-0 text-sm', className)}
    >
      <div
        data-search-kind="container"
        className={cn(
          'min-w-0 break-words',
          preserveNewlines && 'whitespace-pre-wrap'
        )}
      >
        {isPlainText ? (
          <div className="relative pr-space-5 leading-normal">
            <Icon
              icon={WarningCircleIcon}
              color="warning"
              size="xs"
              label={PLAIN_TEXT_FALLBACK_MESSAGE}
              role="img"
              tabIndex={0}
              aria-label={PLAIN_TEXT_FALLBACK_MESSAGE}
              className="absolute right-0 top-0"
            />
            {fallback}
          </div>
        ) : (
          <ErrorBoundary resetKey={content} fallback={() => fallback}>
            <TextColorContext.Provider value={textColor}>
              <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            </TextColorContext.Provider>
          </ErrorBoundary>
        )}
        {trailingContent}
      </div>
      {afterContent}
    </div>
  );
}

MarkdownDisplay.displayName = COMPONENT_NAME;
