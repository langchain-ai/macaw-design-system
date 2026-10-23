import { Attachment, Button, Card, Text } from '@langchain/macaw-components';
import { AttachmentList } from '@langchain/macaw-components/Attachment';
import type { AttachmentProps } from '@langchain/macaw-components/Attachment';
import { BarChart } from '@langchain/macaw-components/BarChart';
import type { ButtonProps } from '@langchain/macaw-components/Button';
import { ChartCardSkeleton } from '@langchain/macaw-components/ChartCard';
import type { ChartCardSkeletonVariant } from '@langchain/macaw-components/ChartCard';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
  ChatComposerAction,
  ChatComposerAttachmentMenu,
  ChatComposerAttachments,
  ChatComposerAttachment,
  ChatComposerModelSelect,
} from '@langchain/macaw-components/ChatComposer';
import type {
  ChatComposerProps,
  ChatComposerInputProps,
} from '@langchain/macaw-components/ChatComposer';
import { ChatConversation } from '@langchain/macaw-components/ChatConversation';
import type { ChatConversationHandle } from '@langchain/macaw-components/ChatConversation';
import {
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
} from '@langchain/macaw-components/ChatConversationList';
import {
  ChatMessage,
  ChatMessageHeader,
  ChatMessageBody,
  ChatMessageActions,
  ChatTurnDivider,
} from '@langchain/macaw-components/ChatMessage';
import type { ChatMessageModel } from '@langchain/macaw-components/ChatMessage';
import {
  ChatRichContent,
  ChatRichContentChoices,
  ChatRichContentFallback,
} from '@langchain/macaw-components/ChatRichContent';
import type { ChatRichContentProps } from '@langchain/macaw-components/ChatRichContent';
import { ChatState } from '@langchain/macaw-components/ChatState';
import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
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
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
  ChatComposerAction,
  ChatComposerAttachmentMenu,
  ChatComposerAttachments,
  ChatComposerAttachment,
  ChatComposerModelSelect,
  ChatConversation,
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
  ChatMessage,
  ChatMessageHeader,
  ChatMessageBody,
  ChatMessageActions,
  ChatTurnDivider,
  ChatRichContent,
  ChatRichContentChoices,
  ChatRichContentFallback,
  ChatState,
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  { action: 'stop', onStop: () => {} } satisfies ChatComposerProps,
  { value: '', onChange: () => {} } satisfies ChatComposerInputProps,
  { scrollToLatest: () => {} } satisfies ChatConversationHandle,
  {
    id: 'answer',
    role: 'assistant',
    status: 'streaming',
    content: [{ id: 'paragraph', type: 'text', text: 'Hello' }],
  } satisfies ChatMessageModel,
  {
    variant: 'approval',
    title: 'Review changes',
    onApprove: async () => {},
  } satisfies ChatRichContentProps,
  Attachment,
  AttachmentList,
  {
    name: 'report.pdf',
    status: 'uploading',
    disabled: true,
  } satisfies AttachmentProps,
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
