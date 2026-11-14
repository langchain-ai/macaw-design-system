import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
} from 'react';

import { cn } from '../../utils/cn';
import { textVariantClasses } from '../Text';

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  layout?: 'responsive' | 'stacked';
}

export type DescriptionListItemProps = HTMLAttributes<HTMLDivElement>;
export type DescriptionListTermProps = HTMLAttributes<HTMLElement>;
export type DescriptionListDetailProps = HTMLAttributes<HTMLElement>;

const LayoutContext =
  createContext<DescriptionListProps['layout']>('responsive');

export const DescriptionList = forwardRef<
  HTMLDListElement,
  DescriptionListProps
>(({ layout = 'responsive', className, ...props }, ref) => (
  <LayoutContext.Provider value={layout}>
    <dl
      {...props}
      ref={ref}
      className={cn(
        '@container/description-list m-0 min-w-0 divide-y divide-subtle',
        className
      )}
    />
  </LayoutContext.Provider>
));

DescriptionList.displayName = 'DescriptionList';

export const DescriptionListItem = forwardRef<
  HTMLDivElement,
  DescriptionListItemProps
>(({ className, ...props }, ref) => {
  const layout = useContext(LayoutContext);

  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        'grid min-w-0 grid-cols-1 gap-x-space-4 gap-y-space-1 py-space-3',
        layout === 'responsive' &&
          '@sm/description-list:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]',
        className
      )}
    />
  );
});

DescriptionListItem.displayName = 'DescriptionListItem';

export const DescriptionListTerm = forwardRef<
  HTMLElement,
  DescriptionListTermProps
>(({ className, ...props }, ref) => (
  <dt
    {...props}
    ref={ref}
    className={cn(
      'min-w-0 wrap-anywhere text-secondary',
      textVariantClasses.body,
      className
    )}
  />
));

DescriptionListTerm.displayName = 'DescriptionListTerm';

export const DescriptionListDetail = forwardRef<
  HTMLElement,
  DescriptionListDetailProps
>(({ className, ...props }, ref) => (
  <dd
    {...props}
    ref={ref}
    className={cn(
      'm-0 min-w-0 wrap-anywhere text-primary',
      textVariantClasses.body,
      className
    )}
  />
));

DescriptionListDetail.displayName = 'DescriptionListDetail';
