# Chat

Import the shared primitives from `@langchain/macaw-components/Chat` and the optional, dependency-free adapter from `@langchain/macaw-components/Chat/langchain`. Import the package stylesheet once, as described in [DESIGN.md](./DESIGN.md).

## Compose a conversation

- `ChatConversation` is a named, focusable, scrollable log. Give it a bounded height in your layout. Set `aria-busy` while streaming to defer live-log announcements until a response completes. It never steals focus or scrolls a reader away from history; the application owns following the latest message and pagination.
- `ChatMessage` provides an author heading, `avatar`, `metadata`, `actions`, and arbitrary body children. Set `streaming` on the active assistant message. Render plain text with `whitespace-pre-wrap`, or supply your own safe rich-content renderer. Macaw does not parse HTML, markdown, images, attachments, or product-specific output.
- `ChatComposer` is controlled through `value` and `onValueChange`. `onSubmit(text)` receives the unchanged draft; the owner decides when to clear it, display errors, or restore it. Enter sends, Shift+Enter inserts a newline, and IME composition does not submit. Blank, disabled, and streaming submissions are blocked. `onStop` supplies a stop action during `streaming`; without it, send stays disabled. Typing the next draft is still allowed during streaming. Localize the labels with `label`, `placeholder`, `submitLabel`, and `stopLabel`; customize input behavior with `textareaProps`, or add attachments/model controls through `accessories` and help through `footer`.
- `ChatToolCall` is a native keyboard-operable disclosure with a required `state` and customizable `statusLabel`. Supply safe tool details as children; arguments and results are never rendered automatically.
- `ChatStatus` composes `ThinkingState` for streaming, an alert for errors, or an empty-state status. Supply localized copy and application-owned actions as children and `actions`.

## Optional LangChain useStream bridge

The bridge consumes a small structural contract, not an SDK import. It is designed for message-based `useStream` results exposing `messages`, `isLoading`, `error`, `submit`, and `stop`. The initial reference is `@langchain/react` 1.0.32 (also aliased as `@langchain/react-next` by some applications); this is not a promise of compatibility with every SDK version or graph schema. Match your installed SDK, and wrap `submit` for custom state, options, or other SDK versions.

```tsx
import { useState } from 'react';
import { useStream } from '@langchain/react';
import {
  ChatConversation,
  ChatMessage,
  ChatComposer,
  ChatStatus,
} from '@langchain/macaw-components/Chat';
import { createLangChainChatAdapter } from '@langchain/macaw-components/Chat/langchain';

function AgentChat() {
  const stream = useStream({ assistantId: 'agent', apiUrl: '/agent' });
  const chat = createLangChainChatAdapter(stream);
  const [draft, setDraft] = useState('');
  const [submissionError, setSubmissionError] = useState(false);

  return (
    <>
      <ChatConversation className="max-h-96" aria-busy={chat.streaming}>
        {chat.messages
          .filter((message) => message.role !== 'tool')
          .map((message) => (
            <ChatMessage
              key={message.key}
              author={message.role}
              streaming={message.streaming}
            >
              <div className="whitespace-pre-wrap">{message.text}</div>
            </ChatMessage>
          ))}
      </ChatConversation>
      {chat.streaming && <ChatStatus state="streaming" />}
      {(chat.error != null || submissionError) && (
        <ChatStatus state="error">
          The response was interrupted. Try again.
        </ChatStatus>
      )}
      <ChatComposer
        value={draft}
        onValueChange={setDraft}
        streaming={chat.streaming}
        onStop={chat.stop}
        onSubmit={async (text) => {
          setSubmissionError(false);
          try {
            await chat.submit(text);
            setDraft((current) => (current === text ? '' : current));
          } catch {
            setSubmissionError(true);
          }
        }}
      />
    </>
  );
}
```

Configure authentication, endpoints, thread IDs, persistence, reconnect/resume, interrupts, retries, telemetry, and permissions in the application, not Macaw. The example's relative endpoint must be backed by your application's transport configuration. Handle rejected submit promises in your owner; the bridge deliberately preserves the SDK return value and error rather than hiding them. `stop` delegates cancellation to the stream; it does not implement transport cancellation itself. Recreate the adapter each render to read the latest stream snapshot; it is not a hook or a subscription.

Use `mapLangChainMessages(stream.messages, stream.isLoading)` alone when you need only data mapping. It maps `human`/`ai` to `user`/`assistant`, preserves all other roles, concatenates string content and `text` blocks, and keeps every `original` message for custom renderers. Unknown/multimodal blocks are preserved but not rendered. Tool results are correlated by `tool_call_id`, including parallel calls and error results. Missing results remain pending after an interrupted run, not falsely successful. Only a trailing assistant is marked streaming; `chat.streaming` still represents tool-only waits. `toolCalls` include raw `args` and the original result; decide what is safe to expose before rendering them. Render tool results either in their matching disclosure or in the log, not both.

Messages without IDs get positional keys, appropriate only for append-only snapshots. Provide stable IDs upstream if your application prepends or reorders messages. The bridge expects already-assembled snapshots from `useStream`; it does not merge raw token events, tool-call chunks, or infer completion from arbitrary content blocks.

See **Components / AI / Chat** in Storybook for a local simulated stream, stop, preserved draft on errors, tool disclosures, customization, disabled, empty, narrow, and theme states. No consumer application migration or live agent connection is included.
