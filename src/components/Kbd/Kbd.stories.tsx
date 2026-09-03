import { ArrowBendDownLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowBendDownLeft';
import { CommandIcon } from '@phosphor-icons/react/dist/ssr/Command';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Banner } from '../Banner/Banner';
import { Kbd, KbdGroup } from '../Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Display/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'inherit'],
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'K',
  },
};

/** Compose multiple `Kbd` chips into a shortcut with `KbdGroup` (e.g. ⌘K). */
export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

/** Keys can be icons, as used by the annotation "submit" hint. */
export const GroupWithIcon: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>
        <CommandIcon size={12} weight="bold" />
      </Kbd>
      <Kbd>
        <ArrowBendDownLeftIcon size={12} weight="bold" />
      </Kbd>
    </KbdGroup>
  ),
};

/**
 * `inherit` makes the chip's border and text adopt the ambient `currentColor`,
 * so a shortcut hint blends into whatever colored surface it sits on — here the
 * `action` slot of a `Banner`, tinted to match each intent.
 */
export const Inherit: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-space-3">
      <Banner
        intent="info"
        title="Open command palette"
        action={
          <span className="text-brand-primary">
            <KbdGroup>
              <Kbd variant="inherit">⌘</Kbd>
              <Kbd variant="inherit">K</Kbd>
            </KbdGroup>
          </span>
        }
      />
      <Banner
        intent="success"
        title="Changes saved"
        action={
          <span className="text-success-secondary">
            <Kbd variant="inherit">S</Kbd>
          </span>
        }
      />
      <Banner
        intent="warning"
        title="Unsaved changes"
        action={
          <span className="text-warning-secondary">
            <KbdGroup>
              <Kbd variant="inherit">⌘</Kbd>
              <Kbd variant="inherit">S</Kbd>
            </KbdGroup>
          </span>
        }
      />
      <Banner
        intent="error"
        title="Delete item"
        action={
          <span className="text-error-secondary">
            <Kbd variant="inherit">⌫</Kbd>
          </span>
        }
      />
    </div>
  ),
};
