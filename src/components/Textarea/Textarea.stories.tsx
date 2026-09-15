import { useState } from 'react';

import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../Icon/Icon';
import { Textarea } from './Textarea';

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
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
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

// Basic variants
export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description...',
    hintText: 'This is a hint text to help user.',
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

export const SmallSize: Story = {
  args: {
    placeholder: 'Small size textarea',
    leftDecorator: (
      <Icon icon={MagnifyingGlassIcon} size="md" className="text-tertiary" />
    ),
    size: 'sm',
    onChange: () => {},
    debounceMs: 300,
    rows: 2,
  },
};

export const WithHintText: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Enter your comments...',
    hintText: 'Please provide detailed feedback.',
    onChange: () => {},
    debounceMs: 300,
    rows: 4,
  },
};

export const WithBothDecorators: Story = {
  args: {
    label: 'Message',
    placeholder: 'Type your message...',
    hintText: 'This is a hint text to help user.',
    leftDecorator: (
      <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
    ),
    rightDecorator: (
      <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
    ),
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

// States
export const ErrorState: Story = {
  args: {
    label: 'Description',
    value: 'This content has validation errors...',
    placeholder: 'Enter your description...',
    hintText: 'Please fix the errors in your description.',
    isError: true,
    leftDecorator: (
      <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
    ),
    rightDecorator: (
      <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
    ),
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

export const DisabledState: Story = {
  args: {
    label: 'Notes',
    value: 'This textarea is disabled and cannot be edited.',
    placeholder: 'Enter your notes...',
    hintText: 'This field is disabled.',
    disabled: true,
    leftDecorator: (
      <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
    ),
    rightDecorator: (
      <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
    ),
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

export const RequiredField: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Enter your feedback...',
    hintText: 'This field is required.',
    required: true,
    leftDecorator: (
      <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
    ),
    rightDecorator: (
      <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
    ),
    onChange: () => {},
    debounceMs: 300,
    rows: 4,
  },
};

// Resize variants
export const ResizeVertical: Story = {
  args: {
    label: 'Resizable Textarea (Vertical)',
    placeholder: 'This textarea can be resized vertically...',
    hintText: 'Try dragging the bottom-right corner to resize.',
    resize: 'vertical',
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

export const ResizeNone: Story = {
  args: {
    label: 'Fixed Size Textarea',
    placeholder: 'This textarea cannot be resized...',
    hintText: 'This textarea has a fixed size.',
    resize: 'none',
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

export const AutoResize: Story = {
  args: {
    label: 'Auto-Growing Textarea',
    hintText:
      'Type multiple lines to see the field grow until it reaches its max height.',
    autoResize: true,
    rows: 1,
    maxHeight: 200,
    placeholder: 'Write a detailed note...',
  },
  render: (args) => {
    const [value, setValue] = useState('First line\nSecond line\nThird line');

    return (
      <div className="w-80">
        <Textarea {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const AutoResizePlain: Story = {
  args: {
    placeholder: 'Type to see auto-resize (plain variant, no border)...',
    variant: 'plain',
    autoResize: true,
    rows: 1,
    maxHeight: 160,
  },
  render: (args) => {
    const [value, setValue] = useState('Plain variant\nwith auto-resize');

    return (
      <div className="w-80">
        <Textarea {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const ResizeBoth: Story = {
  args: {
    label: 'Fully Resizable Textarea',
    placeholder: 'This textarea can be resized in both directions...',
    hintText: 'Try dragging the bottom-right corner to resize.',
    resize: 'both',
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

// Row variants
export const LargeTextarea: Story = {
  args: {
    label: 'Large Text Area',
    placeholder: 'Enter a long description or article...',
    hintText: 'This textarea has more rows for longer content.',
    onChange: () => {},
    debounceMs: 300,
    rows: 8,
  },
};

export const CustomLabelNode: Story = {
  args: {
    label: (
      <div className="flex items-center gap-space-2">
        <span>Custom Label</span>
        <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
      </div>
    ),
    placeholder: 'Enter text...',
    hintText: 'This textarea has a custom label with an icon',
    leftDecorator: (
      <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
    ),
    onChange: () => {},
    debounceMs: 300,
    rows: 3,
  },
};

// Showcase of all states
export const AllStates: Story = {
  render: () => (
    <div className="w-80 space-y-space-5">
      <Textarea
        label="Default State"
        placeholder="Enter text..."
        hintText="This is a normal textarea"
        leftDecorator={
          <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
        }
        rightDecorator={
          <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
        }
        onChange={() => {}}
        debounceMs={300}
        required
        rows={3}
      />

      <Textarea
        label="Error State"
        value="Invalid content that needs to be fixed..."
        placeholder="Enter text..."
        hintText="This is an error message"
        isError
        leftDecorator={
          <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
        }
        rightDecorator={
          <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
        }
        onChange={() => {}}
        debounceMs={300}
        rows={3}
      />

      <Textarea
        label="Disabled State"
        value="This textarea is disabled and cannot be edited."
        placeholder="Enter text..."
        hintText="This textarea is disabled"
        disabled
        leftDecorator={
          <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
        }
        rightDecorator={
          <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
        }
        onChange={() => {}}
        debounceMs={300}
        rows={3}
      />

      <Textarea
        placeholder="Small size textarea"
        leftDecorator={
          <Icon icon={EnvelopeIcon} size="md" className="text-tertiary" />
        }
        rightDecorator={
          <Icon icon={QuestionIcon} size="md" className="text-tertiary" />
        }
        onChange={() => {}}
        debounceMs={300}
        size="sm"
        required
        rows={2}
      />

      <Textarea
        label="Large Textarea"
        placeholder="Enter a long description..."
        hintText="This textarea has more rows for longer content"
        onChange={() => {}}
        debounceMs={300}
        rows={6}
        resize="vertical"
      />
    </div>
  ),
};
