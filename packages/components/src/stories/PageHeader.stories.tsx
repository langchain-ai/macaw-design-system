import type { ReactNode } from 'react';

import { expect, fn } from 'storybook/test';

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { FolderIcon } from '@phosphor-icons/react/dist/ssr/Folder';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../components/Badge';
import { Button, type ButtonProps } from '../components/Button';
import { Icon, type IconProps } from '../components/Icon';
import { IconButton, type IconButtonProps } from '../components/IconButton';
import {
  TabGroup,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
} from '../components/Tabs';
import { Text } from '../components/Text';

type PageHeaderAction = Pick<
  ButtonProps,
  'disabled' | 'loading' | 'onClick' | 'leftDecorator' | 'rightDecorator'
> & { label: string };

interface PageHeaderProps {
  title: string;
  icon?: IconProps['icon'];
  backButton?: Pick<IconButtonProps, 'label' | 'disabled' | 'onClick'>;
  leftItems?: ReactNode;
  rightItems?: ReactNode;
  actions?: {
    secondary?: PageHeaderAction;
    additional?: PageHeaderAction;
    primary?: PageHeaderAction;
  };
}

function PageHeader({
  title,
  icon,
  backButton,
  leftItems,
  rightItems,
  actions,
}: PageHeaderProps) {
  const { secondary, additional, primary } = actions ?? {};

  return (
    <header className="flex flex-wrap items-stretch justify-between gap-x-space-4 border-b border-subtle px-space-4">
      <div className="flex min-w-0 max-w-full flex-wrap items-stretch gap-x-space-4">
        <div className="flex min-h-12 min-w-0 items-center gap-space-2 py-space-2">
          {backButton && (
            <IconButton
              {...backButton}
              icon={ArrowLeftIcon}
              size="md"
              color="secondary"
              variant="plain"
            />
          )}
          {icon && (
            <Icon icon={icon} size="md" className="shrink-0" aria-hidden />
          )}
          <Text as="h1" variant="h3" className="min-w-0 truncate">
            {title}
          </Text>
        </div>
        {leftItems != null && (
          <div className="flex min-h-12 min-w-0 max-w-full items-stretch overflow-x-auto">
            {leftItems}
          </div>
        )}
      </div>
      {(rightItems != null || secondary || additional || primary) && (
        <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-space-2 py-space-2">
          {rightItems}
          {(['secondary', 'additional', 'primary'] as const).map((key) => {
            const action = actions?.[key];
            if (!action) return null;
            const { label, ...buttonProps } = action;
            return (
              <Button
                key={key}
                {...buttonProps}
                color={key === 'primary' ? 'primary' : 'secondary'}
                variant={key === 'primary' ? 'normal' : 'outlined'}
                size="md"
              >
                {label}
              </Button>
            );
          })}
        </div>
      )}
    </header>
  );
}

const meta: Meta<typeof PageHeader> = {
  title: 'POC/PageHeader',
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
