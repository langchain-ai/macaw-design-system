import { useState } from 'react';

import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CaretRightIcon } from '../../icons/PaddedPhosphorIcons';
import { GroupedTabs } from './GroupedTabs';

const meta: Meta<typeof GroupedTabs> = {
  title: 'Components/Navigation/GroupedTabs',
  component: GroupedTabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-[37.5rem] p-space-4">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// All Sizes
export const Sizes: Story = {
  render: () => {
    const [xsValue, setXsValue] = useState<
      'overview' | 'analytics' | 'settings'
    >('overview');
    const [smValue, setSmValue] = useState<
      'overview' | 'analytics' | 'settings'
    >('overview');
    const [mdValue, setMdValue] = useState<
      'overview' | 'analytics' | 'settings'
    >('overview');

    const options = [
      { value: 'overview' as const, display: 'Overview' },
      { value: 'analytics' as const, display: 'Analytics' },
      { value: 'settings' as const, display: 'Settings' },
    ];

    return (
      <div className="flex flex-col gap-space-3">
        <GroupedTabs
          value={xsValue}
          onChange={setXsValue}
          options={options}
          size="xs"
        />
        <GroupedTabs
          value={smValue}
          onChange={setSmValue}
          options={options}
          size="sm"
        />
        <GroupedTabs
          value={mdValue}
          onChange={setMdValue}
          options={options}
          size="md"
        />
      </div>
    );
  },
};

// Tabs with Icons
export const TabsWithIcons: Story = {
  render: () => {
    const [xsValue, setXsValue] = useState<'profile' | 'search' | 'settings'>(
      'profile'
    );
    const [smValue, setSmValue] = useState<'profile' | 'search' | 'settings'>(
      'profile'
    );
    const [mdValue, setMdValue] = useState<'profile' | 'search' | 'settings'>(
      'profile'
    );

    const options = [
      {
        value: 'profile' as const,
        display: 'Profile',
        icon: UserIcon,
        iconWeight: 'regular' as const,
      },
      {
        value: 'search' as const,
        display: 'Search',
        icon: MagnifyingGlassIcon,
        iconWeight: 'regular' as const,
      },
      {
        value: 'settings' as const,
        display: 'Settings',
        icon: GearIcon,
        iconWeight: 'regular' as const,
      },
    ];

    return (
      <div className="flex flex-col gap-space-3">
        <GroupedTabs
          value={xsValue}
          onChange={setXsValue}
          options={options}
          size="xs"
        />
        <GroupedTabs
          value={smValue}
          onChange={setSmValue}
          options={options}
          size="sm"
        />
        <GroupedTabs
          value={mdValue}
          onChange={setMdValue}
          options={options}
          size="md"
        />
      </div>
    );
  },
};

// Disabled Tab
export const DisabledTab: Story = {
  render: () => {
    const [value, setValue] = useState<'active' | 'disabled' | 'another'>(
      'active'
    );

    return (
      <GroupedTabs
        value={value}
        onChange={setValue}
        options={[
          { value: 'active', display: 'Active Tab' },
          {
            value: 'disabled',
            display: 'Disabled Tab',
            disabled: true,
            tooltip: 'This tab is disabled',
          },
          { value: 'another', display: 'Another Tab' },
        ]}
      />
    );
  },
};

// Icon Only Tabs
export const IconOnlyTabs: Story = {
  render: () => {
    const [xsValue, setXsValue] = useState<'chart' | 'search' | 'info'>(
      'chart'
    );
    const [smValue, setSmValue] = useState<'chart' | 'search' | 'info'>(
      'chart'
    );
    const [mdValue, setMdValue] = useState<'chart' | 'search' | 'info'>(
      'chart'
    );

    const options = [
      {
        value: 'chart' as const,
        icon: ChartBarIcon,
        iconWeight: 'regular' as const,
        tooltip: 'Chart View',
      },
      {
        value: 'search' as const,
        icon: MagnifyingGlassIcon,
        iconWeight: 'regular' as const,
        tooltip: 'Search',
      },
      {
        value: 'info' as const,
        icon: InfoIcon,
        iconWeight: 'regular' as const,
        tooltip: 'Information',
      },
    ];

    return (
      <div className="flex flex-col gap-space-3">
        <GroupedTabs
          value={xsValue}
          onChange={setXsValue}
          options={options}
          size="xs"
        />
        <GroupedTabs
          value={smValue}
          onChange={setSmValue}
          options={options}
          size="sm"
        />
        <GroupedTabs
          value={mdValue}
          onChange={setMdValue}
          options={options}
          size="md"
        />
      </div>
    );
  },
};

// Many Tabs
export const ManyTabs: Story = {
  render: () => {
    const [value, setValue] = useState<string>('tab1');

    const options = Array.from({ length: 8 }, (_, i) => ({
      value: `tab${i + 1}`,
      display: `Tab ${i + 1}`,
      tooltip: `Content for tab ${i + 1}`,
    }));

    return <GroupedTabs value={value} onChange={setValue} options={options} />;
  },
};

// Custom Styling
export const CustomStyling: Story = {
  render: () => {
    const [value, setValue] = useState<'primary' | 'secondary' | 'tertiary'>(
      'primary'
    );

    return (
      <GroupedTabs
        value={value}
        onChange={setValue}
        className="border-default"
        options={[
          {
            value: 'primary',
            display: 'Primary',
            className: 'text-primary font-bold',
          },
          {
            value: 'secondary',
            display: 'Secondary',
            leftDecorator: <CaretRightIcon size={16} weight="regular" />,
          },
          {
            value: 'tertiary',
            display: 'Tertiary',
            tooltip: 'Custom styled tab',
          },
        ]}
      />
    );
  },
};

// Long Text Tabs
export const LongTextTabs: Story = {
  render: () => {
    const [value, setValue] = useState<'first' | 'second' | 'third'>('first');

    return (
      <GroupedTabs
        value={value}
        onChange={setValue}
        options={[
          {
            value: 'first',
            display: 'Long Tab Name Here',
            tooltip: 'This is a longer tab name to test wrapping',
          },
          {
            value: 'second',
            display: 'Another Long Name',
            leftDecorator: <ChartBarIcon size={16} weight="regular" />,
          },
          {
            value: 'third',
            display: 'Short',
          },
        ]}
      />
    );
  },
};
