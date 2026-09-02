import {
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from '../../utils/cn';
import type { IconComponent, IconWeight } from '../../utils/icon-types';
import { textVariantClasses } from '../Text';
import type { TextProps } from '../Text';

type LinkRenderElement = ReactElement<{
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}>;

type LinkProps = {
  /** Typography size — mirrors <Text> styles */
  variant?: TextProps['variant'];
  leftDecorator?: IconComponent;
  rightDecorator?: IconComponent;
  /** Phosphor weight used for decorator icons. */
  iconWeight?: IconWeight;
} & (
  | (AnchorHTMLAttributes<HTMLAnchorElement> & {
      /** Render a native anchor with this URL. */
      href: string;
      as?: never;
    })
  | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
      /**
       * Render link styling through a routing framework's anchor component.
       * For example: `as={<RouterLink to="/runs" />}`.
       */
      as: LinkRenderElement;
      href?: never;
    })
);

const TextContent = (
  children: React.ReactNode,
  leftDecorator: IconComponent | undefined,
  rightDecorator: IconComponent | undefined,
  iconWeight: IconWeight | undefined
) => {
  const LeftIcon = leftDecorator;
  const RightIcon = rightDecorator;
  return (
    <>
      {LeftIcon && (
        <LeftIcon
          aria-hidden
          className="h-[1em] w-[1em] flex-shrink-0 text-link dark:text-brand-secondary dark:group-hover:text-brand-primary"
          weight={iconWeight}
        />
      )}
      <span className="text-link underline-offset-2 hover:text-link-hover hover:underline hover:decoration-ls-neutral-300 hover:decoration-1 dark:text-brand-secondary dark:hover:text-brand-primary dark:hover:decoration-ls-neutral-400">
        {children}
      </span>
      {RightIcon && (
        <RightIcon
          aria-hidden
          className="h-[1em] w-[1em] flex-shrink-0 text-link dark:text-brand-secondary dark:group-hover:text-brand-primary"
          weight={iconWeight}
        />
      )}
    </>
  );
};

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      variant = 'body',
      leftDecorator,
      rightDecorator,
      iconWeight,
      className,
      children,
      as,
      ...props
    },
    ref
  ) => {
    const containerClass = cn(
      'group inline-flex items-center gap-[2px]',
      textVariantClasses[variant],
      className
    );

    const content = TextContent(
      children,
      leftDecorator,
      rightDecorator,
      iconWeight
    );

    if (as) {
      if (!isValidElement(as)) return null;

      return cloneElement(as, {
        ...props,
        ref,
        className: cn(as.props.className, containerClass),
        children: content,
      });
    }

    const { href, ...anchorProps } = props;
    return (
      // eslint-disable-next-line react/forbid-elements
      <a ref={ref} href={href} className={containerClass} {...anchorProps}>
        {content}
      </a>
    );
  }
);

Link.displayName = 'Link';

export { Link };
export type { LinkProps };
