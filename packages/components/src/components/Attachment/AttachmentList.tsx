import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Children, Fragment, forwardRef, isValidElement } from 'react';

import { cn } from '../../utils/cn';

export interface AttachmentListProps extends ComponentPropsWithRef<'ul'> {
  layout?: 'wrap' | 'scroll' | 'stack';
}

function flattenAttachments(
  children: ReactNode,
  parentKeys: string[] = []
): { key: string; child: ReactNode }[] {
  return Children.toArray(children).flatMap((child, index) => {
    const keys = [
      ...parentKeys,
      isValidElement(child) && child.key != null
        ? String(child.key)
        : String(index),
    ];
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.type === Fragment
    ) {
      return flattenAttachments(child.props.children, keys);
    }

    // Keep keys scoped to their fragments, even when sibling keys repeat.
    return [{ key: JSON.stringify(keys), child }];
  });
}

export const AttachmentList = forwardRef<HTMLUListElement, AttachmentListProps>(
  function AttachmentList(
    {
      children,
      layout = 'wrap',
      className,
      'aria-label': ariaLabel = 'Attachments',
      ...props
    },
    ref
  ) {
    const items = flattenAttachments(children);
    if (items.length === 0) {
      return null;
    }

    return (
      <ul
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          'm-0 flex min-w-0 list-none gap-space-2 p-0',
          layout === 'wrap' && 'flex-wrap',
          layout === 'scroll' && 'overflow-x-auto overscroll-x-contain',
          layout === 'stack' && 'flex-col',
          className
        )}
      >
        {items.map(({ key, child }) => (
          <li
            key={key}
            className={cn(
              'min-w-0 max-w-full',
              layout === 'scroll' && 'shrink-0'
            )}
          >
            {child}
          </li>
        ))}
      </ul>
    );
  }
);
