import type { ChatComposerModelOption } from '..';
import { Badge } from '../../Badge';
import { AnthropicLogo, GeminiLogo, OpenAILogo } from '../../ProviderLogo';

const anthropic = <AnthropicLogo className="size-4" />;
const openai = <OpenAILogo className="size-4" />;
const google = <GeminiLogo className="size-4" />;

export const MODEL_OPTIONS: ChatComposerModelOption[] = [
  {
    value: 'claude-sonnet-5-5',
    label: 'Sonnet 5.5',
    group: 'Anthropic',
    icon: anthropic,
    badge: (
      <Badge color="special" size="sm">
        Default
      </Badge>
    ),
  },
  {
    value: 'claude-opus-5',
    label: 'Opus 5',
    group: 'Anthropic',
    icon: anthropic,
  },
  {
    value: 'claude-haiku-5',
    label: 'Haiku 5',
    group: 'Anthropic',
    icon: anthropic,
  },
  { value: 'gpt-6', label: 'GPT-6', group: 'OpenAI', icon: openai },
  { value: 'gpt-6-mini', label: 'GPT-6 mini', group: 'OpenAI', icon: openai },
  {
    value: 'gemini-4-pro',
    label: 'Gemini 4 Pro',
    group: 'Google',
    icon: google,
  },
  {
    value: 'gemini-4-flash',
    label: 'Gemini 4 Flash',
    group: 'Google',
    icon: google,
    disabled: true,
    badge: (
      <Badge color="secondary" size="sm">
        Needs API key
      </Badge>
    ),
  },
];
