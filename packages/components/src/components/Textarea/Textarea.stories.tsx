import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlSizeMatrix,
  ControlVariantGrid,
} from '../../stories/ControlSizeMatrix';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import { Textarea } from './Textarea';

const variants: { value: 'default' | 'plain'; label: string }[] = [
  { value: 'default', label: 'Bordered' },
  { value: 'plain', label: 'Plain' },
];

const meta: Meta<typeof Textarea> = {
  title: 'Components/Inputs/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: [
    'autodocs',
    'multiline',
    'long',
    'text',
    'form',
    'field',
    'validation',
    'error',
    'hint',
  ],
  args: {
    label: 'Description',
    placeholder: 'Enter your description...',
    hintText: 'Use the controls to explore sizes, variants, and decorators.',
    size: 'md',
    variant: 'default',
    value: '',
    disabled: false,
    isError: false,
    required: false,
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
  render: (args) => (
    <div className="w-80 max-w-full">
      <Textarea {...args} />
    </div>
  ),
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
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
    rows: {
      control: 'number',
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    autoResize: {
      control: 'boolean',
    },
    maxHeight: {
      control: 'number',
    },
    variant: {
      control: 'select',
      options: ['default', 'plain'],
    },
    leftDecorator: {
      control: 'select',
      options: ['None', 'EnvelopeIcon', 'MagnifyingGlassIcon', 'EyeIcon'],
      mapping: {
        None: undefined,
        EnvelopeIcon: (
          <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
        ),
        MagnifyingGlassIcon: (
          <Icon
            icon={MagnifyingGlassIcon}
            size="md"
            className="text-tertiary"
          />
        ),
        EyeIcon: <Icon icon={EyeIcon} size="md" className="text-tertiary" />,
      },
    },
    rightDecorator: {
      control: 'select',
      options: ['None', 'QuestionIcon', 'EyeSlashIcon'],
      mapping: {
        None: undefined,
        QuestionIcon: (
          <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
        ),
        EyeSlashIcon: (
          <Icon icon={EyeSlashIcon} size="md" className="text-tertiary" />
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SizesAndVariants: Story = {
  name: 'Sizes & Variants',
  args: {
    rows: 1,
    resize: 'none',
    autoResize: false,
    hintText: 'One row by default; change rows to compare multiline fields.',
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
  },
  render: (args) => (
    <ControlSizeMatrix variants={variants}>
      {(size, variant) => <Textarea {...args} size={size} variant={variant} />}
    </ControlSizeMatrix>
  ),
};

export const States: Story = {
  parameters: {
    controls: { include: ['leftDecorator', 'rightDecorator'] },
  },
  render: (args) => (
    <ControlVariantGrid variants={variants}>
      {(variant) => (
        <>
          <Textarea
            {...args}
            size="md"
            variant={variant}
            label="Default"
            hintText="Describe what you want to share."
          />
          <Textarea
            {...args}
            size="md"
            variant={variant}
            label="Error"
            value="This content has validation errors..."
            isError
            hintText="Please fix the errors in your description."
          />
          <Textarea
            {...args}
            size="md"
            variant={variant}
            label="Disabled"
            value="This textarea is disabled and cannot be edited."
            disabled
            hintText="This field is disabled."
          />
          <Textarea
            {...args}
            size="md"
            variant={variant}
            label={
              <div className="flex items-center gap-space-2">
                <Text as="span">Required</Text>
                <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
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

export const Resizing: Story = {
  args: {
    maxHeight: 200,
  },
  parameters: {
    controls: {
      include: ['size', 'maxHeight', 'leftDecorator', 'rightDecorator'],
    },
  },
  render: (args) => (
    <ControlVariantGrid variants={variants}>
      {(variant) => (
        <>
          <Textarea
            {...args}
            variant={variant}
            label="Single line"
            placeholder="Type a message..."
            rows={1}
            resize="none"
            autoResize={false}
            hintText="One row with manual resizing disabled."
          />
          <Textarea
            {...args}
            variant={variant}
            label="Fixed multiline"
            rows={3}
            resize="none"
            autoResize={false}
            hintText="Three rows with manual resizing disabled."
          />
          <Textarea
            {...args}
            variant={variant}
            label="Manual resize"
            rows={3}
            resize="both"
            autoResize={false}
            hintText="Drag the bottom-right corner to resize in either direction."
          />
          <Textarea
            {...args}
            variant={variant}
            label="Auto-resize"
            value={'First line\nSecond line\nThird line'}
            rows={1}
            resize="none"
            autoResize
            hintText="Type multiple lines to grow the field up to maxHeight."
          />
        </>
      )}
    </ControlVariantGrid>
  ),
};
