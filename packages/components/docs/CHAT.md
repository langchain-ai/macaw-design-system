# Chat components

Chat families provide presentation and local interactions. Applications own
message parsing, network requests, streaming, persistence, authorization,
analytics, uploads, Markdown rendering, and product-specific tool bodies.
Import the normal Macaw stylesheet once; no additional editor stylesheet is
required.

## Families

| Import subpath          | Public components                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/ChatState`            | `ChatState`                                                                                                                                                                                    |
| `/ChatToolCall`         | `ChatToolCall`, `ChatToolCallGroup`, `ChatToolCallReasoning`                                                                                                                                   |
| `/ChatMessage`          | `ChatMessage`, `ChatMessageHeader`, `ChatMessageBody`, `ChatMessageActions`, `ChatTurnDivider`                                                                                                 |
| `/ChatRichContent`      | `ChatRichContent`, `ChatRichContentChoices`, `ChatRichContentFallback`                                                                                                                         |
| `/ChatConversationList` | `ChatConversationList`, `ChatConversationListGroup`, `ChatConversationListItem`                                                                                                                |
| `/ChatComposer`         | `ChatComposer`, `ChatComposerInput`, `ChatComposerToolbar`, `ChatComposerAction`, `ChatComposerAttachmentMenu`, `ChatComposerAttachments`, `ChatComposerAttachment`, `ChatComposerModelSelect` |
| `/ChatConversation`     | `ChatConversation`                                                                                                                                                                             |

All subpaths start with `@langchain/macaw-components`. Each family also exports
its prop and presentation-model types. The root package does not export chat
families, keeping their dependencies out of unrelated imports.

## Messages and tool calls

Adapt application messages into `ChatMessageModel`. Preserve message and content
block IDs across streaming updates. A `text` block renders escaped plain text;
use a `custom` block for host-rendered Markdown, attachments, rich content, or
tool calls. Validate external payloads before creating interactive custom
content. Keep tool results in the order supplied by the application's stream.

Message actions are capabilities supplied by the application. Missing actions
are omitted, read-only messages allow copying, and queued/submitting messages
disable mutations. Streaming hides the footer and moves focus to the message
if a focused footer control disappears. Historical metadata stays visible;
historical actions reveal on hover or focus on devices with a fine pointer.

`ChatState` owns its stable status announcement and a local elapsed clock.
Supply `elapsedMs` for replayed or server-measured durations. Message, tool,
and interactive-content states describe different lifecycles; map application
states explicitly to the relevant presentation type.

`ChatToolCall` renders bounded plain-text/JSON previews without invoking
getters or `toJSON`. Supply `summary`, `icon`, and `children` for validated
application-specific details. The `simple` variant delegates inspection through
`onInspect`; the application owns navigation, dialogs, and permissions.

## Composer

```tsx
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
} from '@langchain/macaw-components/ChatComposer';

<ChatComposer onSubmit={sendMessage} submitDisabled={!draft.trim()}>
  <ChatComposerInput value={draft} onChange={setDraft} />
  <ChatComposerToolbar />
</ChatComposer>;
```

The application owns the Markdown draft and clears it after accepting a send.
Use `action="stop"` with `onStop` while generation can be canceled. Composer
controls honor the parent disabled state. Model choices and attachment menus
are optional composition pieces; no model registry or upload client is built in.
`onFilesSelected` receives selected, dropped, or pasted files. The application
owns file validation, upload state, preview URLs, and their cleanup.

Tiptap and the embedded code editor load when `ChatComposerInput` renders. The
shell and toolbar can be used without rendering an input. The input renders a
loading fallback during server rendering and hydrates on the client. Enter
submits prose; Shift+Enter inserts a line break. Lists, tables, and code blocks
retain multiline editing, and Ctrl/Cmd+Enter submits from multiline content.

## Conversation and navigation

Give `ChatConversation` a bounded height. Its header and footer stay fixed while
children scroll. Content follows while the reader is near the bottom and pauses
when they scroll up. Resize updates are batched per animation frame. The log
does not announce the entire transcript; individual status regions announce
changes.

Key the conversation by its application ID when switching conversations. Keep
drafts, messages, history loading, pagination, and any virtualization in the
application. The shell renders its children directly and is suitable for
bounded histories; it does not virtualize messages.

Use a `ref` of type `ChatConversationHandle` to call `scrollToLatest()` when
sending a new message while reading history. It resumes following without
moving focus out of the composer. `scrollToLatest({ focus: true })`, also used by
the jump button, focuses the latest `ChatMessage` or the content region when
there are no message targets.

`ChatConversationList` provides arrow-key/Home/End focus navigation without
changing application selection. The application supplies grouping, selection,
rename/delete confirmation, persistence, and pagination. Groups cannot nest.

## Interactive responses

`ChatRichContent` supports forms and approvals. The application validates and
saves responses, then supplies the confirmed state. Return a promise from action
callbacks and reject it on failure. After a successful callback, set the final
state; controls remain guarded while awaiting confirmation. For a retry that
fails with the same error state, reject the callback again. Key a new request by
its ID. Keep controlled values mounted when navigating between questions.

`ChatRichContentFallback` accepts host-owned recovery actions for unsupported or
invalid blocks. It does not parse payloads or perform retries itself.
