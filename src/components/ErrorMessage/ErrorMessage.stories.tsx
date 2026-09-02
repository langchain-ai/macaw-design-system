import { WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorMessage } from '../ErrorMessage';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/Status/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['WarningCircleIcon', 'WarningIcon', 'XCircleIcon'],
      mapping: {
        WarningCircleIcon,
        WarningIcon,
        XCircleIcon,
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    copyable: { control: 'boolean' },
    prettify: { control: 'boolean' },
    defaultExpanded: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const LONG_MESSAGE =
  'Missing 2 input variables from prompt: input, output. Check your input format and try again.';
const STACK_DETAILS =
  'TypeError: Cannot read properties of undefined (reading "input")\n  at PromptTemplate.format (/app/prompt.ts:42:13)\n  at run (/app/run.ts:88:5)';
const STRUCTURED_MESSAGE =
  "GraphInterrupt((Interrupt(value={'action_requests': [{'name': 'message_user', 'args': {'questions': ['Which usernames would you like to track?']}}], 'review_configs': [{'action_name': 'message_user', 'allowed_decisions': ['respond']}]}, id='abc123'),))";

export const Default: Story = {
  args: {
    message: LONG_MESSAGE,
    details: STACK_DETAILS,
  },
  render: (args) => (
    <div className="w-[300px]">
      <ErrorMessage {...args} />
    </div>
  ),
};
export const InsideNarrowContainer: Story = {
  args: {
    message: LONG_MESSAGE,
    details: STACK_DETAILS,
  },
  render: (args) => (
    <table className="w-[480px] border-separate border-spacing-0">
      <thead>
        <tr>
          <th className="border-b border-secondary p-space-2 text-left text-xs font-medium text-secondary">
            Run
          </th>
          <th className="border-b border-secondary p-space-2 text-left text-xs font-medium text-secondary">
            Result
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border-b border-secondary p-space-2 text-xs">
            run-001
          </td>
          <td className="max-w-0 border-b border-secondary p-space-2">
            <ErrorMessage {...args} />
          </td>
        </tr>
        <tr>
          <td className="border-b border-secondary p-space-2 text-xs">
            run-002
          </td>
          <td className="border-b border-secondary p-space-2 text-xs">OK</td>
        </tr>
      </tbody>
    </table>
  ),
};

export const Sizes: Story = {
  args: {
    message: LONG_MESSAGE,
    details: STACK_DETAILS,
    defaultExpanded: true,
  },
  render: (args) => (
    <div className="flex flex-row items-start gap-space-4">
      <ErrorMessage className="w-[360px]" {...args} size="sm" />
      <ErrorMessage className="w-[360px]" {...args} size="md" />
    </div>
  ),
};

export const PrettifyVariants: Story = {
  args: {
    message: STRUCTURED_MESSAGE,
    size: 'md',
    defaultExpanded: true,
  },
  render: (args) => (
    <div className="flex flex-row items-start gap-space-4">
      <ErrorMessage className="w-[360px]" {...args} prettify />
      <ErrorMessage className="w-[360px]" {...args} prettify={false} />
    </div>
  ),
};

// A payload that was serialized upstream (repr()/json.dumps()) and never
// unescaped, so `\n`/`\"` are literal 2-char sequences, not real newlines.
const FULLY_ESCAPED_TRACEBACK = String.raw`CancelledError(UserInterrupt('User interrupted the run'))Traceback (most recent call last):\n\n\n  File \"/usr/local/lib/python3.12/site-packages/langgraph/pregel/main.py\", line 3440, in astream\n    async for _ in runner.atick(\n\n\n  File \"/usr/local/lib/python3.12/site-packages/langgraph/pregel/_retry.py\", line 744, in arun_with_retry\n    return await task.proc.ainvoke(task.input, config)\n           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\n\nasyncio.exceptions.CancelledError: User interrupted the run`;
export const FullyEscapedTraceback: Story = {
  args: {
    message: FULLY_ESCAPED_TRACEBACK,
    size: 'md',
    defaultExpanded: true,
  },
  render: (args) => (
    <div className="w-[31.25rem]">
      <ErrorMessage {...args} />
    </div>
  ),
};
