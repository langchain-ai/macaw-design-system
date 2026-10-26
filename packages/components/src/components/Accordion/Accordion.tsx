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
  DropdownMenuItem,
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
   * `AccordionItem`s, or the list's empty or loading content, such as an
   * `EmptyState`, which fills the card as-is. Without children it's just the
   * header, for a section of plain fields.
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

/** One entry in an `AccordionItem`'s overflow menu. */
export interface AccordionItemMenuItem {
  /** The entry's name, in Title Case, such as Remove. */
  label: string;
  /** A quiet line under the label, such as what the entry does. */
  description?: string;
  /** Called when the viewer picks the entry; the menu then closes. */
  onSelect: () => void;
  /** `destructive` marks an entry that removes or revokes something. */
  tone?: 'default' | 'destructive';
  disabled?: boolean;
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
   * such as a `Switch`, a `Select` with `variant="plain"`, or a button.
   */
  action?: ReactNode;
  /** Entries for the item's overflow menu, such as Rename or Remove. */
  menuItems?: AccordionItemMenuItem[];
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

  const hasMenu = menuItems != null && menuItems.length > 0;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Everything centers on the header row, so the icon tile, the action,
          the menu, and the caret share one axis with or without a
          description. The tile and the trailing control are both 24px and
          inset by the row's px-space-3, mirroring each other. */}
      <div className="flex items-center gap-space-2 px-space-3 py-space-2">
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

          {/* The title grows to fill the header, which keeps the action on
              the right until it wraps under the title. */}
          {action != null && (
            <div className="flex min-h-6 shrink-0 items-center gap-space-2">
              {action}
            </div>
          )}
        </div>

        {/* Kept out of the wrapping area, so the menu and caret stay pinned
            to the row's right edge, opposite the icon tile. */}
        {(hasMenu || hasBody) && (
          <div className="flex shrink-0 items-center gap-space-2">
            {hasMenu && (
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
                <DropdownMenuContent align="end" className="max-w-xs">
                  {menuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      disabled={item.disabled}
                      onSelect={item.onSelect}
                      className="flex-col items-start justify-center"
                    >
                      <Text
                        as="span"
                        variant="sm"
                        color={
                          item.tone === 'destructive' ? 'error' : 'primary'
                        }
                      >
                        {item.label}
                      </Text>
                      {item.description != null && (
                        <Text as="span" variant="xs" color="tertiary">
                          {item.description}
                        </Text>
                      )}
                    </DropdownMenuItem>
                  ))}
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
        )}
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
