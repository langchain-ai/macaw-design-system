import { Button, Card, Text } from '@langchain/design-system';
import { BarChart } from '@langchain/design-system/components/BarChart';
import type { ButtonProps } from '@langchain/design-system/components/Button';
import { Code } from '@langchain/design-system/components/Code';
import { CodeLite } from '@langchain/design-system/components/Code/CodeLite';
import type { CodeLanguageType } from '@langchain/design-system/components/Code/types';
import {
  ThinkingState,
  LoadingIndicator,
} from '@langchain/design-system/components/ThinkingState';
import type { ThinkingStateProps } from '@langchain/design-system/components/ThinkingState';
import { AppThemeProvider } from '@langchain/design-system/hooks/AppThemeProvider';
import { CheckIcon } from '@langchain/design-system/icons';
import tailwindPreset from '@langchain/design-system/tailwind-preset';
import { useScrollParent } from '@langchain/design-system/utils/VirtuosoCustomScrollParentContext/useScrollParent';

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
