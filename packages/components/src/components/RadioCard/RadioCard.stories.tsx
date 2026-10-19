import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../Badge';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox';
import { RadioGroup } from '../RadioGroup/RadioGroup';
import { Text } from '../Text';
import { RadioCard } from './RadioCard';

const meta: Meta<typeof RadioCard> = {
  title: 'Components/Inputs/RadioCard',
  component: RadioCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'RadioCard remains content-driven. Its sm/md size changes only the radio indicator and the gap to content.',
      },
    },
  },
  tags: ['autodocs', 'single select', 'selectable card', 'details'],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    radioPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadioCard>;

// ---------------------------------------------------------------------------
// Basic states
// ---------------------------------------------------------------------------

export const Unchecked: Story = {
  render: () => (
    <RadioGroup defaultValue="other">
      <RadioCard value="opt">
        <Text weight="medium">Option label</Text>
        <Text variant="sm" color="tertiary">
          Supporting description text goes here.
        </Text>
      </RadioCard>
    </RadioGroup>
  ),
};

export const Checked: Story = {
  render: () => (
    <RadioGroup defaultValue="opt">
      <RadioCard value="opt">
        <Text weight="medium">Option label</Text>
        <Text variant="sm" color="tertiary">
          Supporting description text goes here.
        </Text>
      </RadioCard>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="other" className="gap-space-3 flex flex-col">
      <RadioCard value="disabled-unchecked" disabled>
        <Text weight="medium">Disabled unchecked</Text>
        <Text variant="sm">This option is not available.</Text>
      </RadioCard>
      <RadioCard value="disabled-checked" disabled>
        <Text weight="medium">Disabled checked</Text>
        <Text variant="sm">This option is locked in.</Text>
      </RadioCard>
    </RadioGroup>
  ),
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <RadioGroup defaultValue="disabled-checked">
          <Story />
        </RadioGroup>
      </div>
    ),
  ],
};

// ---------------------------------------------------------------------------
// Radio position
// ---------------------------------------------------------------------------

export const RadioPosition: Story = {
  render: function RadioPositionExample() {
    const [rightValue, setRightValue] = useState('pat');
    const [leftValue, setLeftValue] = useState('pat');
    return (
      <div className="gap-space-5 flex flex-col">
        <div className="gap-space-2 flex flex-col">
          <Text variant="sm" color="tertiary">
            Radio on right
          </Text>
          <RadioGroup
            value={rightValue}
            onValueChange={setRightValue}
            className="gap-space-4 flex-row"
          >
            <RadioCard value="pat" radioPosition="right" className="flex-1">
              <Text weight="medium">Personal Access Token</Text>
              <Text variant="sm" color="tertiary">
                Used for authenticating with the API as an individual user.
              </Text>
            </RadioCard>
            <RadioCard value="service" radioPosition="right" className="flex-1">
              <Text weight="medium">Service Key</Text>
              <Text variant="sm" color="tertiary">
                Tied to a service principal for automation and CI workflows.
              </Text>
            </RadioCard>
          </RadioGroup>
        </div>

        <div className="gap-space-2 flex flex-col">
          <Text variant="sm" color="tertiary">
            Radio on left
          </Text>
          <RadioGroup
            value={leftValue}
            onValueChange={setLeftValue}
            className="gap-space-4 flex-row"
          >
            <RadioCard value="pat" radioPosition="left" className="flex-1">
              <Text weight="medium">Personal Access Token</Text>
              <Text variant="sm" color="tertiary">
                Used for authenticating with the API as an individual user.
              </Text>
            </RadioCard>
            <RadioCard value="service" radioPosition="left" className="flex-1">
              <Text weight="medium">Service Key</Text>
              <Text variant="sm" color="tertiary">
                Tied to a service principal for automation and CI workflows.
              </Text>
            </RadioCard>
          </RadioGroup>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Collapsible content
// ---------------------------------------------------------------------------

export const WithCollapsibleContent: Story = {
  render: function CollapsibleExample() {
    const [value, setValue] = useState('');
    return (
      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="gap-space-3 flex flex-col"
      >
        <RadioCard
          value="queue"
          collapsible={
            <Text variant="sm" color="tertiary">
              Queue selector would appear here when this option is selected.
            </Text>
          }
        >
          <Text weight="medium">Add to annotation queue</Text>
        </RadioCard>
        <RadioCard
          value="dataset"
          collapsible={
            <Text variant="sm" color="tertiary">
              Dataset selector would appear here when this option is selected.
            </Text>
          }
        >
          <Text weight="medium">Add to dataset</Text>
        </RadioCard>
        <RadioCard
          value="extend"
          collapsible={
            <Text variant="sm" color="tertiary">
              Data retention duration selector would appear here when this
              option is selected.
            </Text>
          }
        >
          <Text weight="medium">Extend Data Retention</Text>
        </RadioCard>
      </RadioGroup>
    );
  },
};

// ---------------------------------------------------------------------------
// Rich children
// ---------------------------------------------------------------------------

export const RichContent: Story = {
  render: function RichContentExample() {
    const [value, setValue] = useState('shortlived');
    const [useCorrections, setUseCorrections] = useState(false);
    return (
      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="gap-space-4 flex flex-col"
      >
        <RadioCard value="shortlived" className="p-space-5 items-start">
          <div className="gap-space-2 flex flex-col">
            <div className="gap-space-2 flex items-center">
              <Text weight="semibold" variant="h3">
                Base
              </Text>
              <Badge color="secondary" size="xs">
                DEFAULT
              </Badge>
            </div>
            <Text variant="sm">Delete traces after 14 days by default.</Text>
            <div className="gap-space-1 flex flex-col">
              <Text variant="sm" color="tertiary">
                ✓ Some traces may auto-upgrade to extended retention
              </Text>
              <Text variant="sm" color="tertiary">
                ✓ Calculated at $0.0001 per base retention trace
              </Text>
            </div>
            <Button
              size="sm"
              variant="outlined"
              color="secondary"
              className="mt-space-1 w-fit"
              onClick={(e) => {
                // Stop propagation so clicking this button doesn't also
                // activate the card's radio when the card is already selected.
                e.stopPropagation();
                alert('Learn more clicked');
              }}
            >
              Learn more
            </Button>
          </div>
        </RadioCard>

        <RadioCard value="longlived" className="p-space-5 items-start">
          <div className="gap-space-2 flex flex-col">
            <Text weight="semibold" variant="h3">
              Extended
            </Text>
            <Text variant="sm">
              All traces are retained for the extended retention period.
            </Text>
            <Text variant="sm" color="tertiary">
              ✓ All traces calculated at $0.0002 per trace
            </Text>
            <div className="gap-space-1 flex items-center">
              <Checkbox
                size="sm"
                checked={useCorrections}
                onCheckedChange={(checked) => setUseCorrections(!!checked)}
                label={
                  <Text as="span" variant="sm">
                    Use Corrections
                  </Text>
                }
              />
            </div>
          </div>
        </RadioCard>
      </RadioGroup>
    );
  },
};

// ---------------------------------------------------------------------------
// Hidden indicator
// ---------------------------------------------------------------------------

export const HiddenIndicator: Story = {
  render: function HiddenIndicatorExample() {
    const [value, setValue] = useState('monthly');
    return (
      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="gap-space-3 flex flex-col"
      >
        <RadioCard value="monthly" hideIndicator>
          <div className="flex items-center justify-between">
            <div className="gap-space-1 flex flex-col">
              <Text weight="medium">Monthly billing</Text>
              <Text variant="sm" color="tertiary">
                $10 / month
              </Text>
            </div>
          </div>
        </RadioCard>
        <RadioCard value="annual" hideIndicator>
          <div className="flex items-center justify-between">
            <div className="gap-space-1 flex flex-col">
              <Text weight="medium">Annual billing</Text>
              <Text variant="sm" color="tertiary">
                $96 / year — save 20%
              </Text>
            </div>
            <Badge color="primary" size="sm">
              Best value
            </Badge>
          </div>
        </RadioCard>
      </RadioGroup>
    );
  },
};

// ---------------------------------------------------------------------------
// Interactive full group
// ---------------------------------------------------------------------------

export const InteractiveGroup: Story = {
  render: function InteractiveGroupExample() {
    const [value, setValue] = useState('dev');
    return (
      <div className="gap-space-4 flex flex-col">
        <RadioGroup
          value={value}
          onValueChange={setValue}
          className="gap-space-2 flex flex-col"
        >
          <RadioCard value="dev_free">
            <Text weight="medium">Free Development</Text>
            <Text variant="sm" color="tertiary">
              1 container, no backups. For early-stage development.
            </Text>
          </RadioCard>
          <RadioCard value="dev">
            <Text weight="medium">Development</Text>
            <Text variant="sm" color="tertiary">
              1 container (1 CPU, 1 GB memory), 10 GB disk capacity.
            </Text>
          </RadioCard>
          <RadioCard value="prod">
            <Text weight="medium">Production</Text>
            <Text variant="sm" color="tertiary">
              Autoscales up to 10 containers, highly available storage with
              automated backups.
            </Text>
          </RadioCard>
        </RadioGroup>
        <Text variant="sm" color="tertiary">
          Selected: <span className="text-primary font-medium">{value}</span>
        </Text>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Size variants
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  render: function SizesExample() {
    return (
      <div className="gap-space-5 flex flex-col">
        <div>
          <Text variant="sm" color="tertiary" className="mb-space-2">
            Small (sm, default)
          </Text>
          <RadioGroup defaultValue="opt" className="gap-space-1 flex flex-col">
            <RadioCard value="opt" size="sm">
              <Text variant="sm" weight="medium">
                Small radio indicator
              </Text>
            </RadioCard>
          </RadioGroup>
        </div>
        <div>
          <Text variant="sm" color="tertiary" className="mb-space-2">
            Medium (md)
          </Text>
          <RadioGroup defaultValue="opt" className="gap-space-1 flex flex-col">
            <RadioCard value="opt" size="md">
              <Text weight="medium">Medium radio indicator</Text>
            </RadioCard>
          </RadioGroup>
        </div>
      </div>
    );
  },
};
