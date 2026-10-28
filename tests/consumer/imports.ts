import {
  Attachment,
  Button,
  Card,
  StatusBadge,
  Text,
} from '@langchain/macaw-components';
import type {
  StatusBadgeProps,
  StatusBadgeVariant,
} from '@langchain/macaw-components';
import {
  Accordion,
  AccordionItem,
} from '@langchain/macaw-components/Accordion';
import type {
  AccordionItemMenuItem,
  AccordionItemProps,
} from '@langchain/macaw-components/Accordion';
import { AttachmentList } from '@langchain/macaw-components/Attachment';
import type { AttachmentProps } from '@langchain/macaw-components/Attachment';
import { BarChart } from '@langchain/macaw-components/BarChart';
import type { ButtonProps } from '@langchain/macaw-components/Button';
import { ChartCardSkeleton } from '@langchain/macaw-components/ChartCard';
import type { ChartCardSkeletonVariant } from '@langchain/macaw-components/ChartCard';
import {
  ChatComposer,
  ChatComposerContext,
  ChatComposerInput,
} from '@langchain/macaw-components/ChatComposer';
import type { ChatComposerInputProps } from '@langchain/macaw-components/ChatComposer';
import {
  Code,
  CodeLanguageSelect,
  CodeToolbar,
  resolveCodeLanguage,
} from '@langchain/macaw-components/Code';
import type {
  CodeLanguageSelectProps,
  CodeProps,
  CodeToolbarProps,
} from '@langchain/macaw-components/Code';
import { CodeLite } from '@langchain/macaw-components/Code/CodeLite';
import type { CodeLanguageType } from '@langchain/macaw-components/Code/types';
import {
  HeatmapChart,
  HeatmapBlock,
} from '@langchain/macaw-components/HeatmapChart';
import type { HeatmapChartProps } from '@langchain/macaw-components/HeatmapChart';
import { AppThemeProvider } from '@langchain/macaw-components/hooks/AppThemeProvider';
import { useDebouncedCommit } from '@langchain/macaw-components/hooks/useDebouncedCommit';
import { CheckIcon } from '@langchain/macaw-components/icons';
import type {
  InputIconAction,
  InputProps,
} from '@langchain/macaw-components/Input';
import { SankeyChart } from '@langchain/macaw-components/SankeyChart';
import type { SankeyChartProps } from '@langchain/macaw-components/SankeyChart';
import tailwindPreset from '@langchain/macaw-components/tailwind-preset';
import {
  ThinkingState,
  LoadingIndicator,
} from '@langchain/macaw-components/ThinkingState';
import type {
  LoadingIndicatorProps,
  ThinkingStateProps,
} from '@langchain/macaw-components/ThinkingState';
import { useScrollParent } from '@langchain/macaw-components/utils/VirtuosoCustomScrollParentContext/useScrollParent';

const buttonProps: ButtonProps = { children: 'Continue' };
const language: CodeLanguageType = 'json';

void [
  Accordion,
  AccordionItem,
  { title: 'Notifications', contents: 'Email' } satisfies AccordionItemProps,
  {
    label: 'Remove',
    description: 'Revokes access immediately',
    onSelect: () => {},
    tone: 'destructive',
  } satisfies AccordionItemMenuItem,
  StatusBadge,
  'warning' satisfies StatusBadgeVariant,
  { children: 'Active', size: 'sm' } satisfies StatusBadgeProps,
  Attachment,
  AttachmentList,
  {
    name: 'report.pdf',
    status: 'uploading',
    disabled: true,
  } satisfies AttachmentProps,
  ChatComposer,
  ChatComposerContext,
  ChatComposerInput,
  { value: '', onChange: () => {} } satisfies ChatComposerInputProps,
  HeatmapChart,
  HeatmapBlock,
  {
    data: [[0, 50, 100]],
    size: 'sm',
    color: 'blue',
  } satisfies HeatmapChartProps,
  SankeyChart,
  { nodes: [], links: [], minimumPlotWidth: 0 } satisfies SankeyChartProps,
  useDebouncedCommit,
  ThinkingState,
  LoadingIndicator,
  { size: 'xs' } satisfies LoadingIndicatorProps,
  {
    showElapsed: true,
    elapsedMs: 1500,
    motion: 'subtle',
    size: 'xs',
    speed: 'slow',
  } satisfies ThinkingStateProps,
  { size: 'xs', leftIcon: CheckIcon, onChange: () => {} } satisfies InputProps,
  {
    icon: CheckIcon,
    label: 'Confirm',
    onClick: () => {},
  } satisfies InputIconAction,
  'line' satisfies ChartCardSkeletonVariant,
  ChartCardSkeleton,
  AppThemeProvider,
  BarChart,
  Button,
  Card,
  CheckIcon,
  Code,
  CodeLanguageSelect,
  CodeToolbar,
  resolveCodeLanguage('ts'),
  {
    language: 'json',
    value: '{}',
    showFoldGutter: false,
    onUpdate: () => {},
  } satisfies CodeProps,
  {
    value: 'ts',
    onChange: () => {},
    'aria-label': 'Snippet language',
  } satisfies CodeLanguageSelectProps,
  { language: 'JSON', children: 'Copy' } satisfies CodeToolbarProps,
  CodeLite,
  Text,
  buttonProps,
  language,
  tailwindPreset,
  useScrollParent,
];
