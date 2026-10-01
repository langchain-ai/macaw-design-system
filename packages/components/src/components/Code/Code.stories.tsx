import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Code } from '.';
import { CopyButton } from '../CopyButton';
import { Text } from '../Text';
import { CODE_LANGUAGES } from './codeLanguages';
import { CodeLanguageSelect } from './CodeLanguageSelect';
import { CodeToolbar } from './CodeToolbar';

const SAMPLE_CODE = `type Greeting = {
  message: string;
};

export function greet(name: string): Greeting {
  return { message: \`Hello, \${name}!\` };
}`;

const meta = {
  title: 'Components/Display/Code',
  component: Code,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Editable code with syntax highlighting. Compose `toolbar` with `CodeToolbar`, `CodeLanguageSelect`, and `CopyButton`. Without a toolbar, `showCopyButton` keeps its floating behavior. Prefer `CodeLite` for lightweight read-only snippets.',
      },
    },
  },
  tags: [
    'autodocs',
    'code',
    'editor',
    'syntax highlighting',
    'json',
    'toolbar',
    'language picker',
  ],
  args: {
    language: 'typescript',
    readOnly: false,
    showFoldGutter: true,
    value: SAMPLE_CODE,
  },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Editable code with the same controlled value contract used in product. */
export const Editable: Story = {
  args: {
    autoFocus: true,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return <Code {...args} value={value} onChange={setValue} />;
  },
};

/** Read-only syntax highlighting with copy support. */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    showCopyButton: true,
  },
};

/** No highlighting, for files with no grammar — a requirements.txt pin list. */
export const PlainText: Story = {
  args: {
    language: 'plaintext',
    ariaLabel: 'requirements.txt',
    value: 'scikit-learn==1.7.2\nurllib3==2.0.0\nrapidfuzz==3.0.0',
  },
};

/** Compact highlighting without line numbers or selection matching. */
export const Plain: Story = {
  args: {
    readOnly: true,
    variant: 'plain',
  },
};

export const WithToolbar: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: {
    language: 'typescript',
    ariaLabel: 'Code editor',
    variant: 'plain',
    showFoldGutter: false,
    value: SAMPLE_CODE,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    const [language, setLanguage] = useState(args.language);

    return (
      <Code
        {...args}
        value={value}
        onChange={setValue}
        language={language}
        toolbar={
          <CodeToolbar
            language={
              args.readOnly ? (
                <Text as="span" variant="xs" className="mr-space-1">
                  {
                    CODE_LANGUAGES.find((item) => item.value === language)
                      ?.label
                  }
                </Text>
              ) : (
                <CodeLanguageSelect value={language} onChange={setLanguage} />
              )
            }
          >
            <CopyButton copy={value ?? ''} variant="icon" />
          </CodeToolbar>
        }
      />
    );
  },
};

export const ReadOnlyWithToolbar: Story = {
  ...WithToolbar,
  args: { ...WithToolbar.args, readOnly: true },
};
