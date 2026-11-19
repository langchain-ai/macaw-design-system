import { expect, fn } from 'storybook/test';

import { FolderIcon } from '@phosphor-icons/react/dist/ssr/Folder';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../Badge';
import { TabGroup, TabLabel, TabList, TabPanel, TabPanels } from '../Tabs';
import { PageHeader } from './index';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Layout/PageHeader',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'header', 'title', 'navigation', 'page actions'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  args: { title: 'Projects' },
};

export const WithTabs: Story = {
  args: {
    title: 'Projects',
    icon: FolderIcon,
    backButton: { label: 'Back to workspace', onClick: fn() },
    rightItems: <Badge color="secondary">Preview</Badge>,
    actions: {
      secondary: { label: 'Export', onClick: fn() },
      additional: { label: 'Settings', onClick: fn() },
      primary: { label: 'New project', onClick: fn() },
    },
  },
  render: (args) => (
    <TabGroup>
      <PageHeader
        {...args}
        leftItems={
          <TabList responsiveHeight>
            <TabLabel label="Overview" />
            <TabLabel label="Activity" />
          </TabList>
        }
      />
      <TabPanels className="p-space-4">
        <TabPanel>Project overview</TabPanel>
        <TabPanel>Project activity</TabPanel>
      </TabPanels>
    </TabGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Projects' })
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Back to workspace' })
    );
    await expect(args.backButton?.onClick).toHaveBeenCalledOnce();
    for (const action of [
      args.actions?.secondary,
      args.actions?.additional,
      args.actions?.primary,
    ]) {
      if (!action) continue;
      await userEvent.click(canvas.getByRole('button', { name: action.label }));
      await expect(action.onClick).toHaveBeenCalledOnce();
    }
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Project activity'
    );
  },
};
