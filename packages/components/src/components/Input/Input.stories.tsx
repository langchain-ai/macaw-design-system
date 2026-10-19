import type { ComponentProps } from 'react';
import { useState } from 'react';

import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlSizeMatrix,
  ControlVariantGrid,
} from '../../stories/ControlSizeMatrix';
import { Text } from '../Text/Text';
import { Input } from './Input';

const variants: { value: 'outlined' | 'plain'; label: string }[] = [
  { value: 'outlined', label: 'Outlined' },
  { value: 'plain', label: 'Plain' },
];

function InputExample({
  value,
  onChange,
  ...props
}: ComponentProps<typeof Input>) {
  const [currentValue, setCurrentValue] = useState(value ?? '');

  return (
    <Input
      {...props}
      value={currentValue}
      onChange={(nextValue, event) => {
        setCurrentValue(nextValue);
        onChange(nextValue, event);
      }}
    />
  );
}

function ClearableInputExample({
  onChange,
  ...props
}: ComponentProps<typeof Input>) {
  const [value, setValue] = useState('Search traces');

  return (
    <Input
      {...props}
      value={value}
      debounceMs={0}
      onChange={(nextValue, event) => {
        setValue(nextValue);
        onChange(nextValue, event);
      }}
      leftIcon={MagnifyingGlassIcon}
      rightAction={{
        icon: XIcon,
        label: 'Clear search',
        disabled: value.length === 0,
        onClick: () => {
          setValue('');
          onChange('');
        },
      }}
    />
  );
}

const meta: Meta<typeof Input> = {
  title: 'Components/Inputs/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: [
    'autodocs',
    'text field',
    'form',
    'validation',
    'error',
    'hint',
    'single line',
  ],
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    hintText: 'Use the controls to explore sizes, variants, and icons.',
    size: 'md',
    variant: 'outlined',
    type: 'text',
    value: '',
    disabled: false,
    isError: false,
    required: false,
    onChange: () => {},
    debounceMs: 300,
  },
  render: (args) => (
    <div className="w-80 max-w-full">
      <InputExample key={`${args.type}:${args.value}`} {...args} />
    </div>
  ),
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['outlined', 'plain'],
    },
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'number',
        'url',
        'date',
        'datetime-local',
        'file',
      ],
    },
    disabled: {
      control: 'boolean',
    },
    isError: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
    autoFocus: {
      control: 'boolean',
    },
    debounceMs: {
      control: 'number',
    },
    leftIcon: {
      control: 'select',
      options: ['None', 'EnvelopeIcon', 'MagnifyingGlassIcon'],
      mapping: {
        None: undefined,
        EnvelopeIcon,
        MagnifyingGlassIcon,
      },
    },
    rightIcon: {
      control: 'select',
      options: ['None', 'QuestionIcon'],
      mapping: {
        None: undefined,
        QuestionIcon,
      },
    },
    leftAction: { control: false },
    rightAction: { control: false },
    leftDecorator: { control: false },
    rightDecorator: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SizesAndVariants: Story = {
  name: 'Sizes & Variants',
  args: {
    hintText: 'Compare the same field across all sizes and variants.',
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
  },
  render: (args) => (
    <ControlSizeMatrix variants={variants}>
      {(size, variant) => (
        <InputExample
          key={`${args.type}:${args.value}`}
          {...args}
          size={size}
          variant={variant}
        />
      )}
    </ControlSizeMatrix>
  ),
};

export const States: Story = {
  parameters: {
    controls: { include: ['leftIcon', 'rightIcon'] },
  },
  render: (args) => (
    <ControlVariantGrid variants={variants}>
      {(variant) => (
        <>
          <InputExample
            {...args}
            size="md"
            variant={variant}
            label="Default"
            hintText="Enter your email address."
          />
          <InputExample
            {...args}
            size="md"
            variant={variant}
            label="Error"
            value="invalid-email"
            isError
            hintText="Please enter a valid email address."
          />
          <InputExample
            {...args}
            size="md"
            variant={variant}
            label="Disabled"
            value="polly@langchain.dev"
            disabled
            hintText="This field is disabled."
          />
          <InputExample
            {...args}
            size="md"
            variant={variant}
            label={
              <div className="flex items-center gap-space-2">
                <Text as="span">Required</Text>
                <QuestionIcon size={16} weight="regular" />
              </div>
            }
            required
            hintText="This field is required."
          />
        </>
      )}
    </ControlVariantGrid>
  ),
};

const inputTypeExamples = [
  {
    type: 'text',
    label: 'Text / search',
    placeholder: 'Search...',
    hintText: 'A text field with a decorative search icon.',
    leftIcon: MagnifyingGlassIcon,
  },
  {
    type: 'email',
    label: 'Email',
    placeholder: 'name@example.com',
    hintText: 'Uses the native email input.',
    leftIcon: EnvelopeIcon,
  },
  {
    type: 'password',
    label: 'Password',
    value: 'example-password',
    placeholder: 'Enter your password',
    hintText: 'Toggle visibility to reveal or mask the value.',
  },
  {
    type: 'number',
    label: 'Number',
    placeholder: 'Enter a number',
    hintText: 'Uses the native number input.',
  },
  {
    type: 'url',
    label: 'URL',
    placeholder: 'https://example.com',
    hintText: 'Uses the native URL input.',
  },
  {
    type: 'date',
    label: 'Date',
    hintText: 'Pick a date.',
  },
  {
    type: 'datetime-local',
    label: 'Date and time',
    hintText: 'Pick a date and time.',
  },
  {
    type: 'file',
    label: 'Attachments',
    multiple: true,
    hintText: 'Select one or more files.',
  },
] satisfies Partial<ComponentProps<typeof Input>>[];

export const InputTypes: Story = {
  args: {
    placeholder: undefined,
  },
  parameters: {
    controls: { include: ['size', 'variant', 'disabled', 'isError'] },
  },
  render: (args) => (
    <div className="grid w-[48rem] max-w-full grid-cols-1 gap-space-5 sm:grid-cols-2">
      {inputTypeExamples.map((example) => (
        <InputExample key={example.type} {...args} {...example} />
      ))}
    </div>
  ),
};

export const IconsAndActions: Story = {
  name: 'Icons & Actions',
  args: {
    hintText: undefined,
    debounceMs: 0,
  },
  parameters: {
    controls: { include: ['disabled', 'isError'] },
    docs: {
      description: {
        story:
          'Use leftIcon/rightIcon for decoration and leftAction/rightAction for labeled actions. Input owns glyph size, color, and edge spacing. Custom decorators retain caller-defined styling. Date fields keep the native picker.',
      },
    },
  },
  render: (args) => (
    <ControlSizeMatrix variants={variants}>
      {(size, variant) => (
        <div className="flex flex-col gap-space-4">
          <InputExample
            {...args}
            size={size}
            variant={variant}
            label="Decorative Icons"
            leftIcon={EnvelopeIcon}
            rightIcon={QuestionIcon}
          />
          <ClearableInputExample
            {...args}
            size={size}
            variant={variant}
            label="Search"
            placeholder="Search traces"
          />
          {inputTypeExamples
            .filter(({ type }) =>
              ['password', 'date', 'datetime-local', 'file'].includes(type)
            )
            .map((example) => (
              <InputExample
                key={example.type}
                {...args}
                {...example}
                size={size}
                variant={variant}
                hintText={undefined}
              />
            ))}
        </div>
      )}
    </ControlSizeMatrix>
  ),
};
