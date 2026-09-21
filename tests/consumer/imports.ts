import { Button, Card, Text } from '@langchain/macaw-components';
import { BarChart } from '@langchain/macaw-components/BarChart';
import type { ButtonProps } from '@langchain/macaw-components/Button';
import { Code } from '@langchain/macaw-components/Code';
import { CodeLite } from '@langchain/macaw-components/Code/CodeLite';
import type { CodeLanguageType } from '@langchain/macaw-components/Code/types';
import { AppThemeProvider } from '@langchain/macaw-components/hooks/AppThemeProvider';
import { CheckIcon } from '@langchain/macaw-components/icons';
import tailwindPreset from '@langchain/macaw-components/tailwind-preset';
import {
  ThinkingState,
  LoadingIndicator,
} from '@langchain/macaw-components/ThinkingState';
import type { ThinkingStateProps } from '@langchain/macaw-components/ThinkingState';
import { useScrollParent } from '@langchain/macaw-components/utils/VirtuosoCustomScrollParentContext/useScrollParent';

const buttonProps: ButtonProps = { children: 'Continue' };
const language: CodeLanguageType = 'json';

void [
  ThinkingState,
  LoadingIndicator,
  {
    showElapsed: true,
    elapsedMs: 1500,
    motion: 'subtle',
  } satisfies ThinkingStateProps,
  AppThemeProvider,
  BarChart,
  Button,
  Card,
  CheckIcon,
  Code,
  CodeLite,
  Text,
  buttonProps,
  language,
  tailwindPreset,
  useScrollParent,
];
