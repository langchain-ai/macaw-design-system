import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text';
import { TabGroup, TabLabel, TabList, TabPanel, TabPanels } from './index';

const meta: Meta<typeof TabList> = {
  title: 'Components/Navigation/Tabs',
  component: TabList,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subcomponents: { TabLabel, TabPanel, TabPanels } as any,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'navigation', 'tabs', 'sections', 'panels'],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RemountedTabGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Recreates the tab group on selection, as navigation through a redirect can recreate a page header. The selected indicator should animate after each navigation.',
      },
    },
  },
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState(1);

    return (
      <TabGroup
        key={selectedIndex}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
      >
        <TabList>
          <TabLabel label="Dashboards" />
          <TabLabel label="Alerts" />
        </TabList>
        <TabPanels>
          <TabPanel className="p-space-4">Dashboard content</TabPanel>
          <TabPanel className="p-space-4">Alerts content</TabPanel>
        </TabPanels>
      </TabGroup>
    );
  },
};

// Basic Tabs
export const BasicTabs: Story = {
  render: () => (
    <TabGroup>
      <TabList>
        <TabLabel label="Overview" />
        <TabLabel label="Analytics" />
        <TabLabel label="Settings" />
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">Overview</h3>
            <p>This is the overview panel content.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">Analytics</h3>
            <p>This is the analytics panel content with charts and data.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">Settings</h3>
            <p>This is the settings panel content.</p>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};

export const ScrollableTabs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Scrollable lists with the chart, deployment, and code example layouts. Selected indicators should remain visible when switching tabs and scrolling horizontally.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-space-5">
      {[
        {
          name: 'Chart Runs',
          listClassName: 'max-w-full overflow-x-auto',
          labelClassName: '',
        },
        {
          name: 'Chart Breakdown',
          listClassName:
            'scroll-mask-l scroll-mask-r mx-0 mb-0 overflow-x-auto px-space-4 no-scrollbar',
          labelClassName: 'pb-space-3 pt-space-4',
        },
        {
          name: 'Table Chart',
          listClassName:
            'scroll-mask-l scroll-mask-r overflow-x-auto px-space-4 no-scrollbar',
          labelClassName: 'pb-space-3',
        },
        {
          name: 'Deployment',
          listClassName: 'min-h-10 overflow-x-auto',
          labelClassName: '',
        },
        {
          name: 'Code Examples',
          listClassName:
            'max-w-full overflow-x-auto rounded-md border border-subtle p-space-1',
          labelClassName:
            'shrink-0 px-space-3 py-space-2 data-[selected]:bg-surface-level-2',
        },
      ].map(({ name, listClassName, labelClassName }) => (
        <div key={name}>
          <Text as="h3" variant="sm" color="secondary" className="mb-space-2">
            {name}
          </Text>
          <TabGroup className="w-80">
            <TabList className={listClassName}>
              {Array.from({ length: 6 }, (_, index) => (
                <TabLabel
                  key={index}
                  className={labelClassName}
                  label={
                    <span className="whitespace-nowrap">
                      Series {index + 1}
                    </span>
                  }
                />
              ))}
            </TabList>
          </TabGroup>
        </div>
      ))}
    </div>
  ),
};

// Tabs with Badges
export const TabsWithBadges: Story = {
  render: () => (
    <TabGroup>
      <TabList>
        <TabLabel
          label="Profile"
          badgeProps={{ children: '1', color: 'primary' }}
        />
        <TabLabel
          label="Settings"
          badgeProps={{ children: '3', color: 'primary' }}
        />
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">Profile</h3>
            <p>Manage your profile information and preferences.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">Analytics</h3>
            <p>View detailed analytics and performance metrics.</p>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};

// Disabled Tab
export const DisabledTab: Story = {
  render: () => (
    <TabGroup>
      <TabList>
        <TabLabel label="Active Tab" />
        <TabLabel disabled label="Disabled Tab" />
        <TabLabel label="Another Active Tab" />
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">Active Content</h3>
            <p>This tab is active and clickable.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">
              Disabled Content
            </h3>
            <p>This content is not accessible due to disabled tab.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-space-4">
            <h3 className="mb-space-2 text-lg font-semibold">
              Another Active Content
            </h3>
            <p>This is another active tab content.</p>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};

// Many Tabs
export const ManyTabs: Story = {
  render: () => (
    <TabGroup>
      <TabList>
        {Array.from({ length: 8 }, (_, i) => (
          <TabLabel key={i} label={`Tab ${i + 1}`} />
        ))}
      </TabList>
      <TabPanels>
        {Array.from({ length: 8 }, (_, i) => (
          <TabPanel key={i}>
            <div className="p-space-4">
              <h3 className="mb-space-2 text-lg font-semibold">
                Content for Tab {i + 1}
              </h3>
              <p>This is the content for tab number {i + 1}.</p>
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  ),
};
