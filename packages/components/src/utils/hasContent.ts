import { Children, Fragment, isValidElement, type ReactNode } from 'react';

/** Checks for children, opening fragments and ignoring null/boolean entries. */
export function hasContent(node: ReactNode): boolean {
  return Children.toArray(node).some((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? hasContent(child.props.children)
      : true
  );
}
