import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  TabGroup,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
} from '../components/Tabs/index';

const meta: Meta<typeof TabList> = {
  title: 'Components/Navigation/Tabs',
  component: TabList,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subcomponents: { TabLabel, TabPanel, TabPanels } as any,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
