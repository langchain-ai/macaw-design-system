import {
  Attachment,
  Button,
  Card,
  ChatRichContent as RootChatRichContent,
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
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbPage,
} from '@langchain/macaw-components/Breadcrumb';
import type {
  BreadcrumbProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
} from '@langchain/macaw-components/Breadcrumb';
import type { ButtonProps } from '@langchain/macaw-components/Button';
import { ChartCardSkeleton } from '@langchain/macaw-components/ChartCard';
import type { ChartCardSkeletonVariant } from '@langchain/macaw-components/ChartCard';
import {
  ChatComposer,
  ChatComposerContext,
  ChatComposerInput,
} from '@langchain/macaw-components/ChatComposer';
import type {
  ChatComposerInputProps,
  ChatComposerProps,
} from '@langchain/macaw-components/ChatComposer';
import {
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
} from '@langchain/macaw-components/ChatConversationList';
import type {
  ChatConversationListGroupActions,
  ChatConversationListItemActions,
  ChatConversationListProps,
} from '@langchain/macaw-components/ChatConversationList';
import {
  ChatMessage,
  ChatMessageActions,
} from '@langchain/macaw-components/ChatMessage';
import type { ChatMessageModel } from '@langchain/macaw-components/ChatMessage';
import {
  ChatRichContent,
  ChatRichContentChoices,
  ChatRichContentFallback,
} from '@langchain/macaw-components/ChatRichContent';
import type {
  ChatRichContentChoicesProps,
  ChatRichContentChoicesValue,
  ChatRichContentFallbackProps,
  ChatRichContentNavigation,
  ChatRichContentProps,
  ChatRichContentRenderer,
  ChatRichContentRendererContext,
  ChatRichContentState,
} from '@langchain/macaw-components/ChatRichContent';
import { ChatState } from '@langchain/macaw-components/ChatState';
import type {
  ChatStateProps,
  ChatStateStatus,
  ChatStateTimerPrecision,
} from '@langchain/macaw-components/ChatState';
import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
} from '@langchain/macaw-components/ChatToolCall';
import type {
  ChatToolCallModel,
  ChatToolCallProps,
} from '@langchain/macaw-components/ChatToolCall';
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
import {
  RadarChart,
  type RadarChartProps,
} from '@langchain/macaw-components/RadarChart';
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
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbPage,
  { 'aria-label': 'Breadcrumb' } satisfies BreadcrumbProps,
  {
    'aria-label': 'Project breadcrumb',
    condensed: true,
  } satisfies BreadcrumbProps,
  { condensed: false } satisfies BreadcrumbProps,
  { href: '/files', children: 'Files' } satisfies BreadcrumbLinkProps,
  { children: 'Notes', title: 'Current note' } satisfies BreadcrumbPageProps,
  { children: 'Notes', tabIndex: -1 } satisfies BreadcrumbPageProps,
  Accordion,
  AccordionItem,
  { title: 'Notifications', contents: 'Email' } satisfies AccordionItemProps,
  {
    label: 'Remove',
    description: 'Revokes access immediately',
    onSelect: () => {},
    tone: 'destructive',
  } satisfies AccordionItemMenuItem,
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
  {
    'aria-label': 'Conversations',
    loading: true,
  } satisfies ChatConversationListProps,
  {
    onRename: () => {},
    pinned: true,
  } satisfies ChatConversationListItemActions,
  { onDelete: () => {} } satisfies ChatConversationListGroupActions,
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
  { action: 'sending' } satisfies ChatComposerProps,
  // @ts-expect-error onStop belongs to action="stop".
  { action: 'sending', onStop: () => {} } satisfies ChatComposerProps,
  ChatMessage,
  ChatMessageActions,
  RootChatRichContent,
  ChatRichContent,
  ChatRichContentChoices,
  ChatRichContentFallback,
  { title: 'Review', variant: 'approval' } satisfies ChatRichContentProps,
  {
    title: 'Review',
    variant: 'approval',
    // @ts-expect-error onSkip belongs to the form variant.
    onSkip() {},
  } satisfies ChatRichContentProps,
  'validation-error' satisfies ChatRichContentState,
  { current: 1, total: 2, onChange() {} } satisfies ChatRichContentNavigation,
  ((context: ChatRichContentRendererContext) =>
    context.errorId) satisfies ChatRichContentRenderer,
  { selected: [] } satisfies ChatRichContentChoicesValue,
  {
    mode: 'single',
    options: [],
    value: { selected: [] },
    onChange() {},
    'aria-label': 'Tasks',
  } satisfies ChatRichContentChoicesProps,
  {} satisfies ChatRichContentFallbackProps,
  ChatState,
  { status: 'streaming', showElapsed: true } satisfies ChatStateProps,
  'input-required' satisfies ChatStateStatus,
  'tenths' satisfies ChatStateTimerPrecision,
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  {
    toolCall: { id: 'search-1', name: 'search', status: 'running' },
  } satisfies ChatToolCallProps,
  {
    id: 'search-1',
    name: 'search',
    status: 'succeeded',
  } satisfies ChatToolCallModel,
  {
    id: 'message',
    role: 'assistant',
    status: 'completed',
    content: [{ id: 'text', type: 'text', text: 'Hello' }],
  } satisfies ChatMessageModel,
  HeatmapChart,
  HeatmapBlock,
  {
    data: [[0, 50, 100]],
    size: 'sm',
    color: 'blue',
  } satisfies HeatmapChartProps,
  RadarChart,
  {
    data: [{ id: 'axis', label: 'Axis', value: 1, color: 'currentColor' }],
    renderTooltip: (datum) => datum.label,
  } satisfies RadarChartProps,
  {
    axes: [{ id: 'axis', label: 'Axis' }],
    series: [{ id: 'series', label: 'Series', values: { axis: 1 } }],
    renderAxisTooltip: (axis) => axis.values.map(({ label }) => label).join(),
    selectedIds: new Set(['series']),
    activeLegendItemId: 'series',
  } satisfies RadarChartProps,
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
  'radar' satisfies ChartCardSkeletonVariant,
  'heatmap' satisfies ChartCardSkeletonVariant,
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
