import { Children, Fragment, isValidElement, type ReactNode } from 'react';

/** Checks children, including arrays and fragments, for renderable content. */
export function hasContent(node: ReactNode): boolean {
  return Children.toArray(node).some((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? hasContent(child.props.children)
      : child !== ''
  );
}
