import type { ReactNode } from 'react';

import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button/Button';
import { ButtonGroup } from '../components/ButtonGroup';
import { Checkbox } from '../components/Checkbox';
import { Command, CommandItem, CommandList } from '../components/Command';
import { GroupedTabs } from '../components/GroupedTabs/GroupedTabs';
import { Icon } from '../components/Icon';
import { Input } from '../components/Input/Input';
import { RadioButton } from '../components/RadioButton';
import { RadioGroup } from '../components/RadioGroup';
import { Select } from '../components/Select';
import { Spinner } from '../components/Spinner/Spinner';
import { Switch } from '../components/Switch';
import { Text } from '../components/Text/Text';
import { Typeahead } from '../components/Typeahead';
import { cn } from '../utils/cn';
import {
  CONTROL_SIZES,
  OPTION_ROW_SIZES,
  SELECTION_CONTROL_SIZES,
  VISUAL_ELEMENT_SIZES,
} from '../utils/componentSizes';

const noop = () => undefined;
const options = [
  { value: 'traces', label: 'Traces' },
  { value: 'datasets', label: 'Datasets' },
];
const groupedTabOptions = [
  { value: 'traces', display: 'Traces' },
  { value: 'datasets', display: 'Datasets' },
];

const meta: Meta = {
  title: 'Foundations/Component Sizes',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Migration reference for named outer border-box component heights. Dashed rulers show the proposed dimension; live components show the current implementation until their focused follow-up migration lands.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const FamilyHeading = ({
  title,
  description,
  components,
}: {
  title: string;
  description: string;
  components: string;
}) => (
  <div className="flex flex-col gap-space-1">
    <Text as="h2" variant="h2">
      {title}
    </Text>
    <Text color="secondary">{description}</Text>
    <Text as="p" variant="sm" color="quaternary">
      {components}
    </Text>
  </div>
);

const DEFAULT_ROOT_FONT_SIZE_PX = 16;

const SizeHeading = ({ name, rem }: { name: string; rem: number }) => (
  <div className="flex w-20 shrink-0 flex-col gap-space-1">
    <Text as="span" variant="sm" weight="semibold">
      {name}
    </Text>
    <Text as="span" variant="xs" color="tertiary">
      {rem}rem ({rem * DEFAULT_ROOT_FONT_SIZE_PX}px)
    </Text>
  </div>
);

const Ruler = ({
  rem,
  square = false,
  children,
}: {
  rem: number;
  square?: boolean;
  children: ReactNode;
}) => (
  <div className="relative flex min-h-16 min-w-36 items-center justify-center px-space-2">
    <div
      aria-hidden
      className={cn(
        'absolute border border-dashed border-brand',
        square ? undefined : 'inset-x-0'
      )}
      style={{ height: `${rem}rem`, width: square ? `${rem}rem` : undefined }}
    />
    <div className="relative flex items-center justify-center">{children}</div>
  </div>
);

const GuidedSpecimen = ({
  label,
  rem,
  square,
  children,
}: {
  label: string;
  rem: number;
  square?: boolean;
  children: ReactNode;
}) => (
  <div className="flex min-w-36 flex-col items-center gap-space-1">
    <Ruler rem={rem} square={square}>
      {children}
    </Ruler>
    <Text as="span" variant="xs" color="tertiary">
      {label}
    </Text>
  </div>
);

const SameSizeSpecimen = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex min-w-24 flex-col items-center gap-space-1">
    <div className="flex h-12 items-center justify-center">{children}</div>
    <Text as="span" variant="xs" color="tertiary">
      {label}
    </Text>
  </div>
);

const SameSizeRow = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => (
  <div className="flex items-center gap-space-3">
    <Text as="span" variant="sm" weight="semibold" className="w-10 shrink-0">
      {name}
    </Text>
    <div className="flex items-center gap-space-3">{children}</div>
  </div>
);

const SameNamedSizeComparison = () => (
  <section className="flex flex-col gap-space-3">
    <FamilyHeading
      title="Same name across component families"
      description="Each row passes the same named size to every component that supports it. Unsupported tiers are omitted."
      components="Decorated Icon, Badge, Button, ButtonGroup, Input, Select, GroupedTabs, Checkbox, Switch"
    />
    <div className="overflow-x-auto rounded-lg border border-subtle bg-surface-level-2 p-space-4">
      <div className="flex min-w-max flex-col gap-space-4">
        <SameSizeRow name="xs">
          <SameSizeSpecimen label="Decorated Icon">
            <Icon icon={InfoIcon} color="neutral" size="xs" />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Badge">
            <Badge size="xs">Status</Badge>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Button">
            <Button size="xs">Continue</Button>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Select">
            <div className="w-36">
              <Select
                size="xs"
                options={options}
                onChange={noop}
                placeholder="Select"
              />
            </div>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="GroupedTabs">
            <GroupedTabs
              value="traces"
              onChange={noop}
              options={groupedTabOptions}
              size="xs"
            />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Switch">
            <Switch checked size="xs" aria-label="xs switch" onChange={noop} />
          </SameSizeSpecimen>
        </SameSizeRow>

        <SameSizeRow name="sm">
          <SameSizeSpecimen label="Decorated Icon">
            <Icon icon={InfoIcon} color="neutral" size="sm" />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Badge">
            <Badge size="sm">Status</Badge>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Button">
            <Button size="sm">Continue</Button>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="ButtonGroup">
            <ButtonGroup size="sm" color="secondary" variant="outlined">
              <Button>First</Button>
              <Button>Second</Button>
            </ButtonGroup>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Input">
            <div className="w-36">
              <Input
                size="sm"
                placeholder="Search"
                aria-label="sm input"
                onChange={noop}
              />
            </div>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Select">
            <div className="w-36">
              <Select
                size="sm"
                options={options}
                onChange={noop}
                placeholder="Select"
              />
            </div>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="GroupedTabs">
            <GroupedTabs
              value="traces"
              onChange={noop}
              options={groupedTabOptions}
              size="sm"
            />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Checkbox">
            <Checkbox
              checked
              size="sm"
              aria-label="sm checkbox"
              onCheckedChange={noop}
            />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Switch">
            <Switch checked size="sm" aria-label="sm switch" onChange={noop} />
          </SameSizeSpecimen>
        </SameSizeRow>

        <SameSizeRow name="md">
          <SameSizeSpecimen label="Decorated Icon">
            <Icon icon={InfoIcon} color="neutral" size="md" />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Badge">
            <Badge size="md">Status</Badge>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Button">
            <Button size="md">Continue</Button>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="ButtonGroup">
            <ButtonGroup size="md" color="secondary" variant="outlined">
              <Button>First</Button>
              <Button>Second</Button>
            </ButtonGroup>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Input">
            <div className="w-36">
              <Input
                size="md"
                placeholder="Search"
                aria-label="md input"
                onChange={noop}
              />
            </div>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Select">
            <div className="w-36">
              <Select
                size="md"
                options={options}
                onChange={noop}
                placeholder="Select"
              />
            </div>
          </SameSizeSpecimen>
          <SameSizeSpecimen label="GroupedTabs">
            <GroupedTabs
              value="traces"
              onChange={noop}
              options={groupedTabOptions}
              size="md"
            />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Checkbox">
            <Checkbox
              checked
              size="md"
              aria-label="md checkbox"
              onCheckedChange={noop}
            />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Switch">
            <Switch checked size="md" aria-label="md switch" onChange={noop} />
          </SameSizeSpecimen>
        </SameSizeRow>

        <SameSizeRow name="lg">
          <SameSizeSpecimen label="Decorated Icon">
            <Icon icon={InfoIcon} color="neutral" size="lg" />
          </SameSizeSpecimen>
          <SameSizeSpecimen label="Select">
            <div className="w-36">
              <Select
                size="lg"
                options={options}
                onChange={noop}
                placeholder="Select"
              />
            </div>
          </SameSizeSpecimen>
        </SameSizeRow>
      </div>
    </div>
  </section>
);

const VisualElementMatrix = () => (
  <section className="flex flex-col gap-space-3">
    <FamilyHeading
      title="Visual elements"
      description="The Icon contract applies to the decorated presentation. Plain Icon remains intrinsic for compatibility."
      components="Decorated Icon, Avatar, Spinner"
    />
    <div className="overflow-x-auto rounded-lg border border-subtle bg-surface-level-2 p-space-4">
      <div className="flex min-w-max flex-col gap-space-3">
        {Object.values(VISUAL_ELEMENT_SIZES).map((contract) => {
          const { name } = contract;
          return (
            <div key={name} className="flex items-center gap-space-3">
              <SizeHeading name={name} rem={contract.rem} />
              <GuidedSpecimen label="Icon" rem={contract.rem} square>
                <Icon
                  icon={InfoIcon}
                  color="neutral"
                  size={name}
                  weight="regular"
                />
              </GuidedSpecimen>
              {name !== 'xxs' && (
                <GuidedSpecimen label="Avatar" rem={contract.rem} square>
                  <Avatar label="Ada" size={name} />
                </GuidedSpecimen>
              )}
              {name !== 'xxs' && (
                <GuidedSpecimen label="Spinner" rem={contract.rem} square>
                  <Spinner size={name} />
                </GuidedSpecimen>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const ControlMatrix = () => (
  <section className="flex flex-col gap-space-3">
    <FamilyHeading
      title="Controls"
      description="The ruler marks exact outer height. Multiline Textarea and multi-value Typeahead use these as first-row or minimum-height metrics."
      components="Button, IconButton, ButtonGroup, CopyButton, Input, CommandInput, Select, Typeahead, GroupedTabs"
    />
    <div className="overflow-x-auto rounded-lg border border-subtle bg-surface-level-2 p-space-4">
      <div className="flex min-w-max flex-col gap-space-3">
        {Object.values(CONTROL_SIZES).map((contract) => {
          const { name } = contract;
          return (
            <div key={name} className="flex items-center gap-space-3">
              <SizeHeading name={name} rem={contract.rem} />
              {name !== 'lg' && (
                <GuidedSpecimen label="Button" rem={contract.rem}>
                  <Button size={name}>Continue</Button>
                </GuidedSpecimen>
              )}
              {(name === 'sm' || name === 'md') && (
                <GuidedSpecimen label="ButtonGroup" rem={contract.rem}>
                  <ButtonGroup size={name} color="secondary" variant="outlined">
                    <Button>First</Button>
                    <Button>Second</Button>
                  </ButtonGroup>
                </GuidedSpecimen>
              )}
              {(name === 'sm' || name === 'md') && (
                <GuidedSpecimen label="Input" rem={contract.rem}>
                  <div className="w-36">
                    <Input
                      size={name}
                      placeholder="Search"
                      aria-label={`${name} input`}
                      onChange={noop}
                    />
                  </div>
                </GuidedSpecimen>
              )}
              <GuidedSpecimen label="Select" rem={contract.rem}>
                <div className="w-36">
                  <Select
                    size={name}
                    options={options}
                    onChange={noop}
                    placeholder="Select"
                  />
                </div>
              </GuidedSpecimen>
              <GuidedSpecimen label="Typeahead" rem={contract.rem}>
                <div className="w-36">
                  <Typeahead
                    size={name}
                    options={options}
                    value={null}
                    onChange={noop}
                    placeholder="Search"
                    aria-label={`${name} typeahead`}
                  />
                </div>
              </GuidedSpecimen>
              {name !== 'lg' && (
                <GuidedSpecimen label="GroupedTabs" rem={contract.rem}>
                  <GroupedTabs
                    value="traces"
                    onChange={noop}
                    options={groupedTabOptions}
                    size={name}
                  />
                </GuidedSpecimen>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const SelectionControlMatrix = () => (
  <section className="flex flex-col gap-space-3">
    <FamilyHeading
      title="Selection controls"
      description="The ruler measures indicator geometry. Labeled rows and RadioCard remain intrinsically sized; Switch and Slider own their track widths."
      components="Checkbox, RadioButton, RadioGroupItem, RadioCard, Switch, Slider"
    />
    <div className="overflow-x-auto rounded-lg border border-subtle bg-surface-level-2 p-space-4">
      <div className="flex min-w-max flex-col gap-space-3">
        {Object.values(SELECTION_CONTROL_SIZES).map((contract) => {
          const { name } = contract;
          return (
            <div key={name} className="flex items-center gap-space-3">
              <SizeHeading name={name} rem={contract.rem} />
              {(name === 'sm' || name === 'md') && (
                <GuidedSpecimen label="Checkbox" rem={contract.rem} square>
                  <Checkbox
                    checked
                    size={name}
                    aria-label={`${name} checkbox`}
                    onCheckedChange={noop}
                  />
                </GuidedSpecimen>
              )}
              {(name === 'sm' || name === 'md') && (
                <GuidedSpecimen label="RadioButton" rem={contract.rem} square>
                  <RadioGroup value="selected" onValueChange={noop}>
                    <RadioButton
                      value="selected"
                      size={name}
                      aria-label={`${name} radio`}
                    />
                  </RadioGroup>
                </GuidedSpecimen>
              )}
              <GuidedSpecimen label="Switch" rem={contract.rem}>
                <Switch
                  checked
                  size={name}
                  aria-label={`${name} switch`}
                  onChange={noop}
                />
              </GuidedSpecimen>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const OptionRowMatrix = () => (
  <section className="flex flex-col gap-space-3">
    <FamilyHeading
      title="Option rows"
      description="Rows use minimum heights. Multiline content may grow beyond the ruler and must never be clipped."
      components="CommandItem, DropdownMenuItem, DropdownMenuSubTrigger, ContextMenuItem, SelectItem, Typeahead option and create-option rows"
    />
    <div className="overflow-x-auto rounded-lg border border-subtle bg-surface-level-2 p-space-4">
      <div className="flex min-w-max flex-col gap-space-3">
        {Object.values(OPTION_ROW_SIZES).map((contract) => {
          const { name } = contract;
          return (
            <div key={name} className="flex items-center gap-space-3">
              <SizeHeading name={name} rem={contract.rem} />
              <GuidedSpecimen label="Single line" rem={contract.rem}>
                <Command className="h-auto w-48 bg-transparent">
                  <CommandList className="max-h-none">
                    <CommandItem className={contract.minHeightClassName}>
                      <Text as="span" variant="sm">
                        Dataset
                      </Text>
                    </CommandItem>
                  </CommandList>
                </Command>
              </GuidedSpecimen>
              <GuidedSpecimen label="Multiline growth" rem={contract.rem}>
                <Command className="h-auto w-56 bg-transparent">
                  <CommandList className="max-h-none">
                    <CommandItem
                      className={cn(
                        contract.minHeightClassName,
                        'items-start gap-space-2'
                      )}
                    >
                      <MagnifyingGlassIcon
                        aria-hidden
                        className="mt-space-1 shrink-0"
                        size={16}
                        weight="regular"
                      />
                      <div className="flex flex-col">
                        <Text as="span" variant="sm">
                          Search traces
                        </Text>
                        <Text as="span" variant="xs" color="tertiary">
                          Includes archived projects
                        </Text>
                      </div>
                    </CommandItem>
                  </CommandList>
                </Command>
              </GuidedSpecimen>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export const ComparisonMatrix: Story = {
  render: () => (
    <main className="flex flex-col gap-space-6 bg-surface-level-1 text-primary">
      <div className="flex max-w-3xl flex-col gap-space-2">
        <Text as="h1" variant="h1">
          Component size comparison
        </Text>
        <Text color="secondary">
          Dashed rulers show the proposed border-box dimension. The specimens
          intentionally render today&apos;s components so migration gaps remain
          visible until component-specific follow-ups adopt the shared mapping.
        </Text>
      </div>
      <SameNamedSizeComparison />
      <VisualElementMatrix />
      <ControlMatrix />
      <SelectionControlMatrix />
      <OptionRowMatrix />
    </main>
  ),
};
