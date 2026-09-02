import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '../Avatar';
import type { AvatarSize } from '../Avatar';
import { Text } from '../Text/Text';

interface AvatarStoryArgs {
  size?: AvatarSize;
  shape?: 'circle' | 'square';
  badge?: boolean;
  label?: string;
}

const meta: Meta<AvatarStoryArgs> = {
  title: 'Components/Display/Avatar',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          "Identity marker for a person or organization: shows an image, the first initial of `label` or a `fallbackIcon`. Creates background gradient based from the label. Shares `Icon`'s padded-box scale: `xs`/`sm`/`md`/`lg`/`xl` render at 16/20/24/36/48px, identical to an `Icon` with a color background.",
          '',
          '**Use for** members, reviewers, feedback/comment authors, and organizations (via `OrganizationAvatar`).',
          '',
          '**Not for** letter tiles that label data columns or experiment sessions by index (use `LetterBadge`), or non-identity status/label chips (use `Badge`).',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
    },
    badge: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<AvatarStoryArgs>;

/** Default: an initial + color-from-string gradient, derived from the label. */
export const Default: Story = {
  args: {
    label: 'Ada Lovelace',
    size: 'md',
    shape: 'square',
  },
  render: (args) => (
    <Avatar
      label={args.label ?? ''}
      size={args.size}
      shape={args.shape}
      badge={args.badge}
    />
  ),
};

/**
 * Sizes share Icon's padded-box scale: xs (16px), sm (20px), md (24px),
 * lg (36px), xl (48px).
 */
export const Sizes: Story = {
  render: () => {
    const sizes: { size: AvatarSize; px: number }[] = [
      { size: 'xs', px: 16 },
      { size: 'sm', px: 20 },
      { size: 'md', px: 24 },
      { size: 'lg', px: 36 },
      { size: 'xl', px: 48 },
    ];
    return (
      <div className="flex items-end gap-space-4">
        {sizes.map(({ size, px }) => (
          <div key={size} className="flex flex-col items-center gap-space-2">
            <Avatar label="Ada Lovelace" size={size} />
            <Text variant="xs" color="tertiary">
              {size} · {px}px
            </Text>
          </div>
        ))}
      </div>
    );
  },
};

/** Square (members, orgs) vs circle (reviewers, feedback users). */
export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <Avatar label="LangChain" size="md" shape="square" />
      <Avatar label="Grace Hopper" size="md" shape="circle" />
    </div>
  ),
};

/** An image (e.g. a member's `avatar_url`) replaces the initial when present. */
export const Image: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <Avatar
        label="Harrison Chase"
        imageUrl="https://github.com/hwchase17.png"
        size="md"
        shape="square"
      />
      <Avatar
        label="Harrison Chase"
        imageUrl="https://github.com/hwchase17.png"
        size="md"
        shape="circle"
      />
    </div>
  ),
};

/** Notification dot, as used for pending invites in the org footer menu. */
export const WithBadge: Story = {
  args: {
    label: 'Personal',
    size: 'md',
    badge: true,
  },
  render: (args) => (
    <Avatar label={args.label ?? ''} size={args.size} badge={args.badge} />
  ),
};

/** Empty label falls back to an icon (e.g. a personal workspace with no name). */
export const WithFallbackIcon: Story = {
  render: () => (
    <Avatar
      label=""
      shape="circle"
      size="md"
      fallbackIcon={
        <span className="inline-flex shrink-0 text-brand-on-fill">
          <UserIcon size={16} weight="bold" />
        </span>
      }
    />
  ),
};

/** `active` highlights the current user's own feedback/notes with the brand fill. */
export const Active: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <Avatar label="Alan Turing" shape="circle" size="md" />
      <Avatar label="Alan Turing" shape="circle" size="md" active />
    </div>
  ),
};
