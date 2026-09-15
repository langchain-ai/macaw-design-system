import type { ComponentType } from 'react';

// NOTE: Tabs are intentionally NOT re-exported from the design-system barrel
// (components/index.ts). Importing @headlessui/react through the barrel pulls
// ~297KB into every chunk that touches the barrel, bloating the initial load.
// Import directly from '.' instead.
import {
  TabGroup as HeadlessTabGroup,
  TabList as HeadlessTabList,
  TabPanel as HeadlessTabPanel,
  TabPanels as HeadlessTabPanels,
  Tab,
} from '@headlessui/react';

import { cn } from '../../utils/cn';
import type { BadgeProps } from '../Badge';
import { Badge } from '../Badge';
import { Text } from '../Text';

export function TabList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HeadlessTabList
      className={cn(
        'flex gap-space-5 border-b border-secondary text-ls-black',
        className
      )}
    >
      {children}
    </HeadlessTabList>
  );
}

export function TabLabel({
  label,
  icon: Icon,
  badgeProps,
  className,
  disabled,
  dataTestId,
  onClick,
  onBlur,
}: {
  label: React.ReactNode;
  icon?: ComponentType<{ className?: string }>;
  badgeProps?: BadgeProps;
  className?: string;
  disabled?: boolean;
  dataTestId?: string;
  onClick?: () => void;
  onBlur?: () => void;
}) {
  // Absolute positioning uses the padding box; -2px places the indicator inside
  // the reserved bottom border, keeping it visible in scrollable tab lists.
  return (
    <Tab
      onClick={onClick}
      onBlur={onBlur}
      className={cn(
        'group relative flex items-center gap-space-2 border-b-2 border-b-transparent pb-5 text-primary outline-none transition-[color] duration-normal',
        'after:pointer-events-none after:invisible after:absolute after:inset-x-0 after:-bottom-0.5 after:mx-auto after:h-0.5 after:w-full after:rounded-full after:border-b-2 after:border-current',
        'data-[selected]:after:visible data-[selected]:after:animate-tab-indicator-expand motion-reduce:after:animate-none',
        'hover:text-brand-secondary data-[selected]:hover:after:border-b-brand-strong',
        'disabled:cursor-default disabled:text-disabled',
        className
      )}
      disabled={disabled}
      data-testid={dataTestId}
    >
      {Icon && <Icon className="size-3.5" />}
      {typeof label === 'string' ? (
        <Text
          variant="md"
          className="font-normal group-data-[selected]:font-medium"
        >
          {label}
        </Text>
      ) : label != null ? (
        label
      ) : null}
      {badgeProps && <Badge {...badgeProps} />}
    </Tab>
  );
}

export const TabPanels = HeadlessTabPanels;

export const TabGroup = HeadlessTabGroup;

export function TabPanel({
  children,
  className,
  panelRef,
  onScroll,
  unmount,
}: {
  children: React.ReactNode;
  className?: string;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  unmount?: boolean;
}) {
  return (
    <HeadlessTabPanel
      className={cn('outline-none', className)}
      onScroll={onScroll}
      ref={panelRef}
      unmount={unmount}
    >
      {children}
    </HeadlessTabPanel>
  );
}
