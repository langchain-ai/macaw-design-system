import type { ReactNode } from 'react';

import { fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text/Text';
import { CopyButton, CopyIconButton } from './CopyButton';

const CopyExample = ({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex items-center gap-space-3">
      <Text variant="sm" className="break-all font-mono">
        {value}
      </Text>
      {children}
    </div>
  );
};

const meta = {
  title: 'Components/Buttons/CopyButton',
  component: CopyButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Copies a value to the clipboard and confirms success for two seconds. Use the labeled button when space allows and CopyIconButton for compact actions.',
      },
    },
  },
  tags: ['autodocs', 'clipboard', 'copy', 'text'],
  args: {
    copy: 'LangSmith keeps your traces observable.',
    copyText: 'Copy',
    onCopy: fn(),
    variant: 'full',
  },
  argTypes: {
    copy: { control: { type: 'text' } },
    copyText: { control: { type: 'text' } },
    variant: {
      control: { type: 'select' },
      options: ['full', 'icon'],
    },
    className: { control: false },
  },
  render: (args) => (
    <CopyExample value={args.copy}>
      <CopyButton {...args} />
    </CopyExample>
  ),
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: {
    copy: 'run_019f8b33-4dfb-76a1-9fd6-987c9576ce38',
    copyText: 'Copy run ID',
  },
};

export const IconOnly: Story = {
  args: {
    copy: 'https://smith.langchain.com/o/example/projects/p/example',
    variant: 'icon',
    copyText: 'Copy project URL',
  },
};

export const IconButtonOptions: Story = {
  render: () => (
    <div className="flex flex-col gap-space-3">
      <CopyExample value="Plain text example">
        <CopyIconButton copy="Plain text example" label="Copy plain text" />
      </CopyExample>
      <CopyExample value="trace_id=019f8b33-4dfb-76a1-9fd6-987c9576ce38">
        <CopyIconButton
          copy="trace_id=019f8b33-4dfb-76a1-9fd6-987c9576ce38"
          label="Copy trace ID filter"
          variant="outlined"
        />
      </CopyExample>
      <CopyExample value={'{"status":"success"}'}>
        <CopyIconButton
          copy={'{"status":"success"}'}
          label="Copy JSON"
          color="primary"
          variant="normal"
        />
      </CopyExample>
      <CopyExample value="A larger copy action">
        <CopyIconButton
          copy="A larger copy action"
          label="Copy larger example"
          size="md"
        />
      </CopyExample>
    </div>
  ),
};
