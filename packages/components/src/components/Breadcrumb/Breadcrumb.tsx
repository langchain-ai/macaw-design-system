import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

import { TooltipProvider } from '@radix-ui/react-tooltip';

import { cn } from '../../utils/cn';
import type { IconComponent } from '../../utils/icon-types';
import type { LinkProps } from '../Link';
import { Text } from '../Text';
import { Tooltip, type TooltipProps } from '../Tooltip';

type BreadcrumbProps = ComponentPropsWithoutRef<'nav'> & {
  separator?: ReactNode;
  /** Wrap by default; single-line trails scroll when they cannot fit. */
  layout?: 'wrap' | 'single-line';
  /** Cap labels at 150px instead of 200px. The consuming layout chooses when. */
  condensed?: boolean;
};

type BreadcrumbLinkProps = LinkProps;

type BreadcrumbPageProps = ComponentPropsWithoutRef<'span'> & {
  leftDecorator?: IconComponent;
};

const BreadcrumbContext = createContext({
  condensed: false,
  singleLine: false,
  hasTooltipProvider: false,
});

function SlashSeparator() {
  return (
    <svg
      aria-hidden="true"
      width={10}
      height={10}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 22 17 2"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      children,
      className,
      separator = <SlashSeparator />,
      layout = 'wrap',
      condensed = false,
      ...props
    },
    ref
  ) => {
    const items = Children.toArray(children).filter((item) => item !== '');
    const singleLine = layout === 'single-line';
    const listRef = useRef<HTMLOListElement>(null);
    const [scrollable, setScrollable] = useState(false);

    useLayoutEffect(() => {
      const list = listRef.current;
      if (!singleLine || !list) {
        setScrollable(false);
        return;
      }
      const measure = () => setScrollable(list.scrollWidth > list.clientWidth);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(list);
      for (const item of list.children) observer.observe(item);
      return () => observer.disconnect();
    }, [singleLine, children, condensed]);

    if (!items.length) return null;

    return (
      <BreadcrumbContext.Provider
        value={{ condensed, singleLine, hasTooltipProvider: true }}
      >
        <TooltipProvider>
          <nav
            ref={ref}
            aria-label="Breadcrumb"
            className={cn('min-w-0', className)}
            {...props}
          >
            <ol
              ref={listRef}
              role="list"
              tabIndex={singleLine ? (scrollable ? 0 : -1) : undefined}
              className={cn(
                'flex items-center gap-space-2',
                singleLine
                  ? 'flex-nowrap overflow-x-auto rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus'
                  : 'flex-wrap'
              )}
            >
              {items.map((item, index) => (
                <li
                  key={
                    typeof item === 'object' && 'key' in item ? item.key : index
                  }
                  className={cn(
                    'flex min-w-0 max-w-full items-center gap-space-2',
                    singleLine && 'shrink-0'
                  )}
                >
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="flex shrink-0 items-center text-xxs text-quaternary"
                    >
                      {separator}
                    </span>
                  )}
                  {item}
                </li>
              ))}
            </ol>
          </nav>
        </TooltipProvider>
      </BreadcrumbContext.Provider>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

function useBreadcrumbLabel(children: ReactNode) {
  const { condensed, singleLine } = useContext(BreadcrumbContext);
  const labelRef = useRef<HTMLElement>(null);
  const [text, setText] = useState('');
  const [clipped, setClipped] = useState(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const label = labelRef.current;
    if (!label) return;
    let active = true;
    function measure() {
      if (!active || !label) return;
      const isClipped = label.scrollWidth > label.clientWidth;
      setText(label.textContent ?? '');
      setClipped(isClipped);
      if (!isClipped) setOpen(false);
    }

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(label);
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(label, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    // A font change can change scrollWidth without changing the capped width.
    const fonts = label.ownerDocument.fonts;
    void fonts?.ready.then(measure);
    fonts?.addEventListener('loadingdone', measure);
    return () => {
      active = false;
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      fonts?.removeEventListener('loadingdone', measure);
    };
  }, [children, condensed]);

  return {
    labelRef,
    clipped,
    singleLine,
    labelClassName: cn(
      'min-w-0 max-w-50 truncate',
      condensed && 'max-w-[9.375rem]'
    ),
    tooltipProps: {
      // Keep the trigger mounted when clipping changes, preserving keyboard focus.
      title: (
        <Text variant="sm" className="text-primary">
          {text}
        </Text>
      ),
      open: clipped && open,
      onOpenChange: (nextOpen: boolean) => setOpen(clipped && nextOpen),
    },
  };
}

function BreadcrumbTooltip(props: TooltipProps) {
  const { hasTooltipProvider } = useContext(BreadcrumbContext);
  const tooltip = <Tooltip {...props} />;
  // Exported links/pages also work on their own, without an application provider.
  return hasTooltipProvider ? (
    tooltip
  ) : (
    <TooltipProvider>{tooltip}</TooltipProvider>
  );
}

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
    const { labelRef, labelClassName, singleLine, tooltipProps } =
      useBreadcrumbLabel(children);
    const linkProps = {
      ...props,
      ref,
      className: cn(
        'inline-flex min-w-0 items-center gap-space-1 rounded-sm text-quaternary hover:underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus',
        singleLine && 'focus-visible:ring-inset',
        as?.props.className,
        className
      ),
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
            ref={labelRef}
            as="span"
            variant={variant}
            weight="medium"
            className={labelClassName}
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

    return (
      <BreadcrumbTooltip {...tooltipProps}>
        {as ? cloneElement(as, linkProps) : <a {...linkProps} />}
      </BreadcrumbTooltip>
    );
  }
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  (
    {
      children,
      className,
      leftDecorator: LeftIcon,
      tabIndex,
      onFocus,
      ...props
    },
    ref
  ) => {
    const { labelRef, labelClassName, clipped, singleLine, tooltipProps } =
      useBreadcrumbLabel(children);
    return (
      <BreadcrumbTooltip {...tooltipProps}>
        <span
          ref={ref}
          aria-current="page"
          tabIndex={tabIndex ?? (clipped ? 0 : -1)}
          onFocus={(event) => {
            onFocus?.(event);
            if (singleLine && !event.defaultPrevented) {
              event.currentTarget.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
              });
            }
          }}
          className={cn(
            'inline-flex min-w-0 items-center gap-space-1 rounded-sm text-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus',
            singleLine && 'focus-visible:ring-inset',
            className
          )}
          {...props}
        >
          {LeftIcon && (
            <LeftIcon
              aria-hidden
              size={12}
              weight="regular"
              className="shrink-0"
            />
          )}
          <Text
            ref={labelRef}
            as="span"
            variant="xs"
            weight="medium"
            className={labelClassName}
          >
            {children}
          </Text>
        </span>
      </BreadcrumbTooltip>
    );
  }
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

export { Breadcrumb, BreadcrumbLink, BreadcrumbPage };
export type { BreadcrumbProps, BreadcrumbLinkProps, BreadcrumbPageProps };
