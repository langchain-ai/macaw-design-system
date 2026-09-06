import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Inputs/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
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
    leftDecorator: {
      control: 'select',
      options: ['None', 'EnvelopeIcon', 'MagnifyingGlassIcon', 'EyeIcon'],
      mapping: {
        None: undefined,
        EnvelopeIcon: <EnvelopeIcon size={16} weight="regular" />,
        MagnifyingGlassIcon: <MagnifyingGlassIcon size={16} weight="regular" />,
        EyeIcon: <EyeIcon size={16} weight="regular" />,
      },
    },
    rightDecorator: {
      control: 'select',
      options: ['None', 'QuestionIcon', 'EyeSlashIcon'],
      mapping: {
        None: undefined,
        QuestionIcon: <QuestionIcon size={16} weight="regular" />,
        EyeSlashIcon: <EyeSlashIcon size={16} weight="regular" />,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    hintText: 'This is a hint text to help user.',
    onChange: () => {},
    debounceMs: 300,
  },
};

export const SmallSize: Story = {
  args: {
    placeholder: 'Small size search',
    leftDecorator: <MagnifyingGlassIcon size={16} weight="regular" />,
    size: 'sm',
    onChange: () => {},
    debounceMs: 300,
  },
};

export const WithHintText: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    hintText: 'This is a hint text to help user.',
    onChange: () => {},
    debounceMs: 300,
  },
};

export const WithBothDecorators: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    hintText: 'This is a hint text to help user.',
    leftDecorator: <EnvelopeIcon size={16} weight="regular" />,
    rightDecorator: <QuestionIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

// States
export const ErrorState: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    placeholder: 'Enter your email',
    hintText: 'Please enter a valid email address.',
    isError: true,
    leftDecorator: <EnvelopeIcon size={16} weight="regular" />,
    rightDecorator: <QuestionIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

export const DisabledState: Story = {
  args: {
    label: 'Email',
    value: 'polly@langchain.dev',
    placeholder: 'Enter your email',
    hintText: 'This field is disabled.',
    disabled: true,
    leftDecorator: <EnvelopeIcon size={16} weight="regular" />,
    rightDecorator: <QuestionIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

export const RequiredField: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    hintText: 'This field is required.',
    required: true,
    leftDecorator: <EnvelopeIcon size={16} weight="regular" />,
    rightDecorator: <QuestionIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

// Input types
export const PasswordInput: Story = {
  args: {
    label: 'Password',
    type: 'password',
    value: 'sk-langsmith-secret',
    placeholder: 'Enter your password',
    hintText: 'Password must be at least 8 characters.',
    onChange: () => {},
    debounceMs: 300,
  },
};

export const NumberInput: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: 'Enter your age',
    hintText: 'Please enter a valid number.',
    onChange: () => {},
    debounceMs: 300,
  },
};

export const DateInput: Story = {
  args: {
    label: 'Start date',
    type: 'date',
    hintText: 'Pick a date.',
    onChange: () => {},
  },
};

export const DateTimeLocalInput: Story = {
  args: {
    label: 'End time',
    type: 'datetime-local',
    hintText: 'Pick a date and time.',
    onChange: () => {},
  },
};

export const FileInput: Story = {
  args: {
    label: 'Attachments',
    type: 'file',
    multiple: true,
    hintText: 'Select one or more files.',
    onChange: () => {},
  },
};

export const FileInputSmall: Story = {
  args: {
    label: 'Attachment',
    type: 'file',
    size: 'sm',
    placeholder: 'Attach a file',
    onChange: () => {},
  },
};

export const SearchInput: Story = {
  args: {
    label: 'Search',
    type: 'text',
    placeholder: 'Search...',
    leftDecorator: <MagnifyingGlassIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

export const CustomLabelNode: Story = {
  args: {
    label: (
      <div className="flex items-center gap-space-2">
        <span>Custom Label</span>
        <span className="inline-flex text-tertiary">
          <QuestionIcon size={16} weight="regular" />
        </span>
      </div>
    ),
    placeholder: 'Enter text',
    hintText: 'This input has a custom label with an icon',
    leftDecorator: <EnvelopeIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

// Showcase of all states
export const AllStates: Story = {
  render: () => (
    <div className="w-80 space-y-space-5">
      <Input
        label="Default State"
        placeholder="Enter text"
        hintText="This is a normal input"
        leftDecorator={<EnvelopeIcon size={16} weight="regular" />}
        rightDecorator={<QuestionIcon size={16} weight="regular" />}
        onChange={() => {}}
        debounceMs={300}
        required
      />

      <Input
        label="Error State"
        value="Invalid input"
        placeholder="Enter text"
        hintText="This is an error message"
        isError
        leftDecorator={<EnvelopeIcon size={16} weight="regular" />}
        rightDecorator={<QuestionIcon size={16} weight="regular" />}
        onChange={() => {}}
        debounceMs={300}
      />

      <Input
        label="Disabled State"
        value="Disabled input"
        placeholder="Enter text"
        hintText="This input is disabled"
        disabled
        leftDecorator={<EnvelopeIcon size={16} weight="regular" />}
        rightDecorator={<QuestionIcon size={16} weight="regular" />}
        onChange={() => {}}
        debounceMs={300}
      />
      <Input
        placeholder="Small size"
        leftDecorator={<EnvelopeIcon size={16} weight="regular" />}
        rightDecorator={<QuestionIcon size={16} weight="regular" />}
        onChange={() => {}}
        debounceMs={300}
        size="sm"
        required
      />
    </div>
  ),
};

// Plain variant
export const PlainVariant: Story = {
  args: {
    variant: 'plain',
    placeholder: 'Plain input with no border',
    hintText: 'This input uses the plain variant',
    onChange: () => {},
    debounceMs: 300,
  },
};

export const PlainWithDecorators: Story = {
  args: {
    variant: 'plain',
    label: 'Search',
    placeholder: 'Search...',
    leftDecorator: <MagnifyingGlassIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

export const PlainSmallSize: Story = {
  args: {
    variant: 'plain',
    placeholder: 'Small plain input',
    size: 'sm',
    leftDecorator: <MagnifyingGlassIcon size={16} weight="regular" />,
    onChange: () => {},
    debounceMs: 300,
  },
};

// Comparison of variants
export const VariantComparison: Story = {
  render: () => (
    <div className="w-80 space-y-space-5">
      <div>
        <h3 className="mb-space-3 text-sm font-medium">
          Outlined Variant (Default)
        </h3>
        <Input
          variant="outlined"
          label="Email"
          placeholder="Enter your email"
          hintText="Standard outlined input with border"
          leftDecorator={<EnvelopeIcon size={16} weight="regular" />}
          onChange={() => {}}
          debounceMs={300}
        />
      </div>

      <div>
        <h3 className="mb-space-3 text-sm font-medium">Plain Variant</h3>
        <Input
          variant="plain"
          label="Email"
          placeholder="Enter your email"
          hintText="Plain input with no border and secondary background"
          leftDecorator={<EnvelopeIcon size={16} weight="regular" />}
          onChange={() => {}}
          debounceMs={300}
        />
      </div>

      <div>
        <h3 className="mb-space-3 text-sm font-medium">Plain with Search</h3>
        <Input
          variant="plain"
          placeholder="Search..."
          leftDecorator={<MagnifyingGlassIcon size={16} weight="regular" />}
          onChange={() => {}}
          debounceMs={300}
        />
      </div>
    </div>
  ),
};
