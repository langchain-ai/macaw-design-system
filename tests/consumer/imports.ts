import { Button, Card, Text } from '@langchain/macaw-design-system';
import { BarChart } from '@langchain/macaw-design-system/components/BarChart';
import type { ButtonProps } from '@langchain/macaw-design-system/components/Button';
import { Code } from '@langchain/macaw-design-system/components/Code';
import { CodeLite } from '@langchain/macaw-design-system/components/Code/CodeLite';
import type { CodeLanguageType } from '@langchain/macaw-design-system/components/Code/types';
import {
  ThinkingState,
  LoadingIndicator,
} from '@langchain/macaw-design-system/components/ThinkingState';
import type { ThinkingStateProps } from '@langchain/macaw-design-system/components/ThinkingState';
import { AppThemeProvider } from '@langchain/macaw-design-system/hooks/AppThemeProvider';
import { CheckIcon } from '@langchain/macaw-design-system/icons';
import tailwindPreset from '@langchain/macaw-design-system/tailwind-preset';
import { useScrollParent } from '@langchain/macaw-design-system/utils/VirtuosoCustomScrollParentContext/useScrollParent';

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
