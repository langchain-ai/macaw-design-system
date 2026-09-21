import { useState } from 'react';
import type { ComponentType, SVGProps } from 'react';

import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { CopySimpleIcon } from '@phosphor-icons/react/dist/ssr/CopySimple';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '.';
import { CaretDownIcon, CaretRightIcon } from '../../icons/PaddedPhosphorIcons';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

const meta = {
  title: 'Components/Popovers/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'actions', 'menu', 'overflow', 'kebab'],
  decorators: [
    (Story) => (
      <div className="p-space-9">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function MenuItemRow({
  icon,
  label,
  shortcut,
  endIcon,
  tone = 'default',
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  shortcut?: string;
  endIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: 'default' | 'destructive';
}) {
  const Icon = icon;
  const EndIcon = endIcon;
  const iconClassName =
    tone === 'destructive'
      ? 'size-4 text-error-secondary'
      : 'size-4 text-icon-secondary';

  return (
    <div className="flex w-full items-center justify-between gap-space-4">
      <div className="flex items-center gap-space-2">
        <Icon className={iconClassName} />
        <Text
          as="span"
          variant="sm"
          color={tone === 'destructive' ? 'error' : 'primary'}
        >
          {label}
        </Text>
      </div>
      {EndIcon ? (
        <EndIcon className="size-4 text-icon-tertiary" />
      ) : shortcut ? (
        <Text as="span" variant="xs" color="tertiary">
          {shortcut}
        </Text>
      ) : null}
    </div>
  );
}

function ActionStatus({ action }: { action: string }) {
  return (
    <div className="rounded-lg border border-subtle bg-surface-level-1 p-space-4">
      <Text variant="xs" color="secondary">
        Last action: {action}
      </Text>
    </div>
  );
}

export const Default: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('Nothing selected');

    return (
      <div className="flex flex-col gap-space-4">
        <ActionStatus action={lastAction} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              color="secondary"
              variant="outlined"
              rightDecorator={CaretDownIcon}
            >
              Project actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-space-2 py-space-1">
                <Text as="span" variant="xs" color="tertiary" weight="medium">
                  Project actions
                </Text>
              </DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setLastAction('Rename')}>
                <MenuItemRow
                  icon={PencilSimpleIcon}
                  label="Rename"
                  shortcut="R"
                />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLastAction('Copy link')}>
                <MenuItemRow
                  icon={ArrowSquareOutIcon}
                  label="Copy link"
                  shortcut="L"
                />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLastAction('Duplicate')}>
                <MenuItemRow
                  icon={CopySimpleIcon}
                  label="Duplicate"
                  shortcut="D"
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
};

export const WithSubmenu: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('Nothing selected');

    return (
      <div className="flex flex-col gap-space-4">
        <ActionStatus action={lastAction} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              color="secondary"
              variant="outlined"
              rightDecorator={CaretDownIcon}
            >
              File actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="start">
            <DropdownMenuItem onSelect={() => setLastAction('Rename file')}>
              <MenuItemRow icon={PencilSimpleIcon} label="Rename" />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLastAction('Copy path')}>
              <MenuItemRow icon={CopySimpleIcon} label="Copy path" />
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <MenuItemRow icon={ArrowSquareOutIcon} label="Open in new tab" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MenuItemRow
                  icon={ArrowSquareOutIcon}
                  label="Share"
                  endIcon={CaretRightIcon}
                />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem onSelect={() => setLastAction('Share link')}>
                  <Text as="span" variant="sm">
                    Share link
                  </Text>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setLastAction('Invite member')}
                >
                  <Text as="span" variant="sm">
                    Invite member
                  </Text>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-error-secondary"
              onSelect={() => setLastAction('Delete file')}
            >
              <MenuItemRow icon={TrashIcon} label="Delete" tone="destructive" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
};

export const PreventClickThrough: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('Nothing selected');
    const [rowClicks, setRowClicks] = useState(0);

    return (
      <div className="flex w-[22rem] flex-col gap-space-4">
        <ActionStatus action={lastAction} />
        <div
          className="flex items-center justify-between rounded-lg border border-default bg-surface-level-2 p-space-4"
          onClick={() => setRowClicks((count) => count + 1)}
        >
          <div className="flex flex-col gap-space-1">
            <Text variant="sm" weight="semibold">
              Project row
            </Text>
            <Text variant="xs" color="secondary">
              Row clicks: {rowClicks}
            </Text>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                color="secondary"
                variant="outlined"
                rightDecorator={CaretDownIcon}
              >
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="end"
              preventClickThrough
            >
              <DropdownMenuItem onSelect={() => setLastAction('Open project')}>
                <MenuItemRow icon={ArrowSquareOutIcon} label="Open project" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setLastAction('Copy project id')}
              >
                <MenuItemRow icon={CopySimpleIcon} label="Copy project id" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  },
};
