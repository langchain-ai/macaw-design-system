import {
  Children,
  cloneElement,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

import { cn } from '../../utils/cn';
import type { IconComponent } from '../../utils/icon-types';
import type { LinkProps } from '../Link';
import { Text } from '../Text';

type BreadcrumbProps = ComponentPropsWithoutRef<'nav'> & {
  separator?: ReactNode;
};

type BreadcrumbLinkProps = LinkProps;

type BreadcrumbPageProps = ComponentPropsWithoutRef<'span'> & {
  leftDecorator?: IconComponent;
};

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ children, className, separator = '/', ...props }, ref) => {
    const items = Children.toArray(children);
    if (!items.length) return null;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('min-w-0', className)}
        {...props}
      >
        <ol role="list" className="flex flex-wrap items-center gap-space-2">
          {items.map((item, index) => (
            <li
              key={typeof item === 'object' && 'key' in item ? item.key : index}
              className="flex min-w-0 max-w-full items-center gap-space-2"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xxs text-quaternary"
                >
                  {separator}
                </span>
              )}
              {item}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  (
    {
      children,
      className,
      as,
      leftDecorator: LeftIcon,
      rightDecorator: RightIcon,
      iconWeight = 'regular',
      variant = 'xs',
      ...props
    },
    ref
  ) => {
    const linkProps = {
      ...props,
      ref,
      className: cn(
        'inline-flex min-w-0 items-center gap-space-1 rounded-sm text-quaternary hover:text-secondary hover:underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus',
        as?.props.className,
        className
      ),
      title:
        props.title ?? (typeof children === 'string' ? children : undefined),
      children: (
        <>
          {LeftIcon && (
            <LeftIcon
              aria-hidden
              size={12}
              weight={iconWeight}
              className="shrink-0"
            />
          )}
          <Text
            as="span"
            variant={variant}
            weight="medium"
            className="min-w-0 max-w-50 truncate"
          >
            {children}
          </Text>
          {RightIcon && (
            <RightIcon
              aria-hidden
              size={12}
              weight={iconWeight}
              className="shrink-0"
            />
          )}
        </>
      ),
    };

    return as ? cloneElement(as, linkProps) : <a {...linkProps} />;
  }
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ children, className, leftDecorator: LeftIcon, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      title={typeof children === 'string' ? children : undefined}
      className={cn(
        'inline-flex min-w-0 items-center gap-space-1 text-secondary',
        className
      )}
      {...props}
    >
      {LeftIcon && (
        <LeftIcon aria-hidden size={12} weight="regular" className="shrink-0" />
      )}
      <Text
        as="span"
        variant="xs"
        weight="medium"
        className="min-w-0 max-w-50 truncate"
      >
        {children}
      </Text>
    </span>
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

export { Breadcrumb, BreadcrumbLink, BreadcrumbPage };
export type { BreadcrumbProps, BreadcrumbLinkProps, BreadcrumbPageProps };
