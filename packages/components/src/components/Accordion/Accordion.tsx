import {
  Children,
  Fragment,
  isValidElement,
  type ReactNode,
  useId,
  useState,
} from 'react';

import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';

import { CaretDownIcon } from '../../icons/PaddedPhosphorIcons';
import { animation } from '../../utils/animation';
import { cn } from '../../utils/cn';
import { Avatar } from '../Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

/**
 * Whether a node renders anything, with fragments opened up, so a fragment of
 * only `false` or `null` children counts as empty.
 */
function hasContent(node: ReactNode): boolean {
  return Children.toArray(node).some((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? hasContent(child.props.children)
      : true
  );
}

export interface AccordionProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Sits right of the title, such as a button to add another item. */
  action?: ReactNode;
  /**
   * `AccordionItem`s, or the list's empty or loading content. Without
   * children it's just the header, for a section of plain fields.
   */
  children?: ReactNode;
  className?: string;
}

/**
 * A section of `AccordionItem`s in one bordered card, with an optional title,
 * description, and action above.
 */
export function Accordion({
  title,
  description,
  action,
  children,
  className,
}: AccordionProps) {
  const titleId = useId();
  const hasHeader = title != null || description != null || action != null;
  return (
    <section
      // Names the section after its title, so it reads as a landmark.
      aria-labelledby={title != null ? titleId : undefined}
      className={cn('flex flex-col gap-space-3', className)}
    >
      {hasHeader && (
        <div className="flex flex-col gap-space-1">
          {/* The action centers on the title's line, so it stays put however
              far the description wraps. */}
          <div className="flex items-center justify-between gap-space-3">
            {title != null && (
              <Text as="h3" variant="h3" id={titleId}>
                {title}
              </Text>
            )}
            {action != null && (
              <div className="ml-auto flex shrink-0 items-center gap-space-2">
                {action}
              </div>
            )}
          </div>
          {description != null && (
            <Text as="p" variant="sm" color="tertiary">
              {description}
            </Text>
          )}
        </div>
      )}
      {hasContent(children) && (
        <div className="flex flex-col divide-y divide-subtle overflow-hidden rounded-md border border-default bg-surface-level-1">
          {children}
        </div>
      )}
    </section>
  );
}

export interface AccordionItemProps {
  /** A mark at 16px, which the item puts in a tile. */
  icon?: ReactNode;
  /** A person's or account's name, shown as an avatar in place of `icon`. */
  avatar?: string;
  title: ReactNode;
  /** Sits beside the title, such as a `StatusBadge`. */
  badge?: ReactNode;
  /** A quiet line under the title. */
  description?: ReactNode;
  /**
   * The item's own action, kept on its header whether or not it's expanded,
   * such as a `Switch`, an `InlineSelect`, or a button.
   */
  action?: ReactNode;
  /** `DropdownMenuItem`s for the item's overflow menu, such as Remove. */
  menuItems?: ReactNode;
  /**
   * The item's expandable body, shown below the header when expanded. Without
   * it the item doesn't expand.
   */
  contents?: ReactNode;
  defaultExpanded?: boolean;
  /** Called when the viewer expands or collapses the item. */
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/**
 * One item in an `Accordion`: a header with a title, its action, and an
 * overflow menu, which expands to show its `contents` when it has any.
 */
export function AccordionItem({
  icon: iconProp,
  avatar,
  title,
  badge,
  description,
  action,
  menuItems,
  contents,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: AccordionItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  function toggle() {
    setExpanded(!expanded);
    onExpandedChange?.(!expanded);
  }
  const bodyId = useId();
  const icon =
    avatar != null ? (
      <Avatar label={avatar} size="sm" shape="circle" />
    ) : (
      iconProp
    );
  const label = typeof title === 'string' ? title : 'item';
  const hasBody = hasContent(contents);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Top-aligned, so a wrapped action falls under the title while the
          icon and title stay on the first line. */}
      <div className="flex items-start gap-space-2 px-space-3 py-space-2">
        {icon != null && (
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center',
              // An avatar is its own shape, so it goes without the tile.
              avatar == null &&
                'rounded-sm bg-surface-level-2 text-icon-secondary [&>*]:size-4'
            )}
          >
            {icon}
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-space-3 gap-y-space-2">
          {/* The title also toggles the item for a pointer; the caret is the
              control a keyboard or screen reader uses. */}
          <div
            className={cn(
              'flex min-h-6 min-w-0 flex-1 basis-16 flex-col justify-center',
              hasBody && 'cursor-pointer'
            )}
            onClick={hasBody ? toggle : undefined}
          >
            <span className="flex min-w-0 items-center gap-space-2">
              <Text
                as="span"
                variant="sm"
                weight="medium"
                className="truncate text-primary"
              >
                {title}
              </Text>
              {badge}
            </span>
            {description != null && (
              <Text
                as="span"
                variant="xs"
                color="tertiary"
                className="truncate"
              >
                {description}
              </Text>
            )}
          </div>

          {/* The title grows to fill the header, which keeps these on the
              right until they wrap under it. */}
          <div className="flex min-h-6 shrink-0 items-center gap-space-2">
            {action}
            {menuItems != null && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    icon={DotsThreeIcon}
                    iconWeight="regular"
                    label={`${label} options`}
                    variant="plain"
                    color="secondary"
                    size="sm"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuItems}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasBody && (
              <IconButton
                icon={CaretDownIcon}
                iconWeight="regular"
                label={expanded ? `Hide ${label}` : `Show ${label}`}
                variant="plain"
                color="secondary"
                size="sm"
                aria-expanded={expanded}
                aria-controls={bodyId}
                onClick={toggle}
                className={cn(
                  '[&_svg]:transition-transform [&_svg]:duration-normal motion-reduce:[&_svg]:transition-none',
                  !expanded && '[&_svg]:-rotate-90'
                )}
              />
            )}
          </div>
        </div>
      </div>

      {hasBody && (
        <div
          id={bodyId}
          className={cn(
            animation.contentResize,
            'motion-reduce:transition-none',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden" inert={!expanded}>
            <div className="border-t border-subtle px-space-3 py-space-2">
              {contents}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
