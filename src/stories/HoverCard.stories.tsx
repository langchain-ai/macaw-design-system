import { ChatsIcon } from '@phosphor-icons/react/dist/ssr/Chats';
import { PencilSimpleLineIcon } from '@phosphor-icons/react/dist/ssr/PencilSimpleLine';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/HoverCard';
import { Text } from '../components/Text/Text';

const meta = {
  title: 'Components/Popovers/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'A floating card that reveals supplemental **preview** content when the user hovers (or focuses) the trigger, built on `@radix-ui/react-hover-card`. Use it to preview what sits behind a link or item without a click.',
          '',
          '**vs. Popover:** Popover opens on click and holds interactive content (forms, menus); it is dismissable and keyboard-first. HoverCard opens on hover and is meant for non-essential preview content. Both share the same surface styling. If the primary purpose becomes clicking things inside the card, use Popover instead.',
          '',
          '**vs. Tooltip:** Tooltip is for short text labels. Reach for HoverCard when the preview needs rich layout (icons, badges, multiple lines).',
        ].join('\n'),
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
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outlined" color="secondary" size="sm">
          Hover me
        </Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col gap-space-2">
          <Text variant="sm" weight="semibold">
            Hover card title
          </Text>
          <Text variant="sm" color="secondary">
            Hover cards reveal contextual detail on hover, without a click. Use
            them for lightweight previews.
          </Text>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

// Rich content preview, modeled on the agent preview shown when hovering an
// agent in the NavSidebar (AgentHoverCard).
export const RichPreview: Story = {
  render: () => (
    <HoverCard openDelay={250} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Button variant="plain" color="secondary" size="sm">
          Support Agent
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-[18.75rem] p-0">
        <div className="flex flex-col">
          <div className="flex flex-col gap-space-1 px-space-4 pb-space-2 pt-space-3">
            <Text variant="sm" weight="semibold">
              Support Agent
            </Text>
            <Text variant="xs" color="tertiary" className="line-clamp-2">
              Triages inbound tickets and drafts replies from the knowledge
              base.
            </Text>
            <Text variant="xs" color="quaternary">
              Updated 2h ago
            </Text>
          </div>
          <div className="flex flex-wrap gap-space-1 px-space-4 pb-space-3">
            <Badge color="secondary" size="xs">
              Gmail
            </Badge>
            <Badge color="secondary" size="xs">
              Slack
            </Badge>
            <Badge color="secondary" size="xs">
              +3
            </Badge>
          </div>
          <div className="flex gap-space-1 border-t border-default px-space-2 py-space-1">
            <Button
              variant="plain"
              color="secondary"
              size="xs"
              leftDecorator={PencilSimpleLineIcon}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="plain"
              color="secondary"
              size="xs"
              leftDecorator={ChatsIcon}
              className="flex-1"
            >
              Run
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

// Side / alignment + open/close delays, mirroring the sidebar usage.
export const Placement: Story = {
  render: () => (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Button variant="outlined" color="secondary" size="sm">
          Open to the right
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" sideOffset={12}>
        <Text variant="sm" color="secondary">
          Rendered on the{' '}
          <Text as="span" weight="semibold">
            right
          </Text>
          , aligned to the start of the trigger.
        </Text>
      </HoverCardContent>
    </HoverCard>
  ),
};
