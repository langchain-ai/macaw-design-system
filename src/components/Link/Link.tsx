import { forwardRef } from 'react';

import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from 'react-router-dom';

import { cn } from '../../utils/cn';
import type { IconComponent, IconWeight } from '../../utils/icon-types';
import { textVariantClasses } from '../Text';
import type { TextProps } from '../Text';

type LinkProps = (
  | (RouterLinkProps & { href?: never })
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
      to?: never;
    })
) & {
  /** Typography size — mirrors <Text> styles */
  variant?: TextProps['variant'];
  leftDecorator?: IconComponent;
  rightDecorator?: IconComponent;
  /** Phosphor weight used for decorator icons. */
  iconWeight?: IconWeight;
};

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
      ...props
    },
    ref
  ) => {
    const containerClass = cn(
      'group inline-flex items-center gap-[2px]',
      textVariantClasses[variant],
      className
    );

    if ('href' in props && props.href !== undefined) {
      const { href, ...anchorProps } = props;
      return (
        // eslint-disable-next-line react/forbid-elements
        <a ref={ref} href={href} className={containerClass} {...anchorProps}>
          {TextContent(children, leftDecorator, rightDecorator, iconWeight)}
        </a>
      );
    }

    const { to, ...routerProps } = props as RouterLinkProps;
    return (
      <RouterLink ref={ref} to={to} className={containerClass} {...routerProps}>
        {TextContent(children, leftDecorator, rightDecorator, iconWeight)}
      </RouterLink>
    );
  }
);

Link.displayName = 'Link';

export { Link };
export type { LinkProps };
