import { forwardRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ComponentType, SVGProps } from 'react';

import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { CopySimpleIcon } from '@phosphor-icons/react/dist/ssr/CopySimple';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../utils/cn';
import { Text } from '../Text/Text';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ContextMenu';

const meta = {
  title: 'Components/Popovers/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Secondary actions for a specific target. Keep an equivalent visible or keyboard-accessible path for essential actions; right-click or control-click the canvas trigger to preview it.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-space-9">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const TriggerPanel = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    title: string;
    description: string;
  }
>(function TriggerPanel({ title, description, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-40 w-[22rem] cursor-context-menu items-center justify-center rounded-lg border border-default bg-surface-level-2 p-space-6 text-center',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-space-2">
        <Text variant="sm" weight="semibold">
          {title}
        </Text>
        <Text variant="xs" color="secondary">
          {description}
        </Text>
      </div>
    </div>
  );
});

function MenuItemRow({
  icon,
  label,
  shortcut,
  tone = 'default',
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  shortcut?: string;
  tone?: 'default' | 'destructive';
}) {
  const Icon = icon;

  return (
    <div className="flex w-full items-center justify-between gap-space-3">
      <div className="flex items-center gap-space-2">
        <Icon
          className={
            tone === 'destructive'
              ? 'size-4 text-error-secondary'
              : 'size-4 text-icon-secondary'
          }
        />
        <Text
          as="span"
          variant="sm"
          className={tone === 'destructive' ? 'text-error-secondary' : ''}
        >
          {label}
        </Text>
      </div>
      {shortcut ? (
        <Text as="span" variant="xs" className="text-tertiary">
          {shortcut}
        </Text>
      ) : null}
    </div>
  );
}

export const Default: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('Nothing selected');

    return (
      <div className="flex flex-col gap-space-4">
        <div className="rounded-lg border border-subtle bg-surface-level-1 p-space-4">
          <Text variant="xs" color="secondary">
            Last action: {lastAction}
          </Text>
        </div>

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <TriggerPanel
              title="Project actions"
              description="Right-click anywhere in this panel"
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem onSelect={() => setLastAction('Rename')}>
              <MenuItemRow
                icon={PencilSimpleIcon}
                label="Rename"
                shortcut="R"
              />
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setLastAction('Copy link')}>
              <MenuItemRow
                icon={ArrowSquareOutIcon}
                label="Copy link"
                shortcut="L"
              />
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setLastAction('Duplicate')}>
              <MenuItemRow
                icon={CopySimpleIcon}
                label="Duplicate"
                shortcut="D"
              />
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    );
  },
};

export const FileActions: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('Nothing selected');

    return (
      <div className="flex flex-col gap-space-4">
        <div className="rounded-lg border border-subtle bg-surface-level-1 p-space-4">
          <Text variant="xs" color="secondary">
            Last action: {lastAction}
          </Text>
        </div>

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <TriggerPanel
              title="SKILL.md"
              description="Right-click for file actions"
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-60">
            <ContextMenuItem onSelect={() => setLastAction('Rename file')}>
              <MenuItemRow icon={PencilSimpleIcon} label="Rename" />
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setLastAction('Copy path')}>
              <MenuItemRow icon={CopySimpleIcon} label="Copy path" />
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-error-secondary"
              onSelect={() => setLastAction('Delete file')}
            >
              <MenuItemRow icon={TrashIcon} label="Delete" tone="destructive" />
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    );
  },
};
