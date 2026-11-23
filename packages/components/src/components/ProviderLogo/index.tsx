import type { SVGProps } from 'react';

import Anthropic from './AnthropicLogo.svg?react';
import Gemini from './GeminiLogo.svg?react';
import OpenAI from './OpenAILogo.svg?react';

// Provider marks shared with LangSmith's model selector.
export function AnthropicLogo(props: SVGProps<SVGSVGElement>) {
  return <Anthropic {...props} />;
}

export function GeminiLogo(props: SVGProps<SVGSVGElement>) {
  return <Gemini {...props} />;
}

export function OpenAILogo(props: SVGProps<SVGSVGElement>) {
  return <OpenAI {...props} />;
}
