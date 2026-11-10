# Chat components

Macaw chat families provide presentation and local interaction. Applications
own network requests, authentication, persistence, analytics, tool execution,
and product-specific tool or logo mapping. For LangGraph agents, the
`ChatThread` family also maps a `useStream` handle's state to these parts, so
apps don't each rebuild that mapping; the app still creates the stream.

## Tool calls and shared state

Import `ChatState` from `@langchain/macaw-components/ChatState`. It owns the
stable status announcement and local elapsed clock. Supply `elapsedMs` for
replayed or server-measured durations, and key it by operation ID when a new
operation should restart the internal clock. `LoadingIndicator` remains the
shared decorative animation; `ChatState` owns its accessible lifecycle label.

Import `ChatToolCall`, `ChatToolCallGroup`, and `ChatToolCallReasoning` from
`@langchain/macaw-components/ChatToolCall`. Map host lifecycle values explicitly
to the public presentation types and preserve stable IDs and stream order.

`ChatToolCall` renders bounded plain-text or JSON previews without invoking
getters or `toJSON`. Supply `summary`, `icon`, and `children` only after
validating product-specific payloads. Every row leads with a 12px single-color
icon: map product or provider marks through `icon`; rows without one use a
generic wrench, and `icon={null}` omits it. The `simple` variant delegates inspection
through `onInspect`; the host owns navigation, dialogs, permissions, and trace
loading. Use `inspectLabel` to describe the host-owned action when the default
“View tool details” label is not accurate. Reasoning content must be an
intentionally disclosed summary, never raw hidden model reasoning.

Rows show success by omission: pending, running, failed, canceled, and
needs-input keep their own status, and a succeeded row shows none. Inside
`ChatToolCallGroup`, the header shows the loading indicator while any row is
running (those rows show only elapsed seconds) and a single check once every
row has succeeded. It also stacks up to three distinct host-supplied row icons
beside its label.

The default variant provides local expandable details. Groups preserve nested
expansion state while collapsed. Controlled `expanded` props allow a host to
coordinate disclosure without moving tool execution or event parsing into the
component.

`ChatToolCall` takes `meta` for short trailing details, such as a duration, an
edit count, or a link to related work. It sits outside the row toggle, so it can
hold its own link or button. Set `keepMounted` when custom details hold state,
such as a selected result view, that should survive closing them.

## Agent work

Import `ChatSubagent` and `ChatSubagentGroup` from
`@langchain/macaw-components/ChatSubagent` for delegated agent runs, such as a
deep agent's `task` tool calls. Render each where the agent started it, keyed by
that call's ID, and map the call's lifecycle to `status`. `activity` names the
current step while it runs and is not announced; status changes are. `result`
summarizes the outcome. Details in `children` mount only while expanded, so
subscribe to the subagent's own stream inside them. `onOpen` hands the full
thread to a host-owned pane. Wrap subagents that run in parallel in
`ChatSubagentGroup`.

Import `ChatPlan` from `@langchain/macaw-components/ChatPlan` for an agent's
task list, such as the todos a deep agent writes with `write_todos`. Give each
item a stable ID. Put `presentation="drawer"` in `ChatComposer`'s `drawer` slot
to keep the plan above the message input while the agent works.

Summarize a turn's work with `ChatToolCallGroup`. While it runs, pass
`showElapsed` and `startedAt`; when it ends, use a label such as
`` `Worked for ${formatChatDuration(ms)} · 6 actions` ``. Keep calls that are
running, failed, or waiting for input outside a collapsed group when the reader
needs to see them. `ChatToolCallReasoning` with `expandWhileStreaming` opens
while reasoning streams and closes when it ends, unless the reader has toggled
it; pass `icon` to replace the lightbulb.

`ChatState` takes `startedAt` so a remounted row keeps counting, and switches to
hours and minutes after an hour. Set `announce={false}` when a parent announces
the outcome, so rows of a long list stay quiet. `formatChatDuration` formats
durations the same way for labels.

## Approvals and queued messages

The approval variant of `ChatRichContent` takes `edit` for decisions that may
change the request before approving it, such as a human-in-the-loop `edit`
decision on a tool call. Edit swaps the card body for `edit.content`, whose
fields the host owns and validates; `edit.onSubmit` saves the edited request.

`ChatMessageActions` shows `cancel` only on a queued message. Set
`action="stopping"` on `ChatComposer` while a stop request is pending; Stop shows
progress and sending stays blocked.

## LangGraph streams

Import from `@langchain/macaw-components/ChatThread`. Macaw never imports the
LangGraph SDK: it reads the `useStream` handle the app passes in, so it works
with `@langchain/react` 1.x and 2.0 under any package alias, and with the 0.3.x
hook.

- `LangGraphChat` is the drop-in agent chat for a stream.
- `useChatThread(stream, options)` returns the thread model and actions
  (`send`, `stop`, `respond`, `resume`, `cancelQueued`, `fork`) for apps that
  place `ChatThread` in their own layout or render their own rows.
- `toChatThread(snapshot)` is the pure mapping, for plain data such as recorded
  threads.

The mapping merges each tool call's status from its result message, the live
tool stream, pending interrupts, and the run; groups messages into turns;
matches deep agent `task` calls to subagent handles; anchors human-in-the-loop
requests, in either casing, to the calls they gate; and reads deep agent todos
and files. Pass selector hooks from your own `@langchain/react` import to turn
on queued messages, edit and retry, and subagent details. Keep that object at
module level so it never changes between renders.

```tsx
import {
  useMessageMetadata,
  useMessages,
  useStream,
  useSubmissionQueue,
  useToolCalls,
} from '@langchain/react';
import { LangGraphChat } from '@langchain/macaw-components/ChatThread';

const selectors = {
  useMessageMetadata,
  useMessages,
  useSubmissionQueue,
  useToolCalls,
};

export function AgentChat() {
  const stream = useStream({ assistantId: 'agent', apiUrl: '/api/agent' });
  return <LangGraphChat stream={stream} selectors={selectors} />;
}
```

Tool rows use `deepAgentTools` for the built-in deep agent tools. Pass `tools`
to present others by name: return row props, your own element, or `null` to
hide a call. `renderInterrupt` takes over requests the app understands, such
as sign-in; return undefined for the default approval, reply, or response
card. Requests paused together resume together once each has a decision, and
sending is paused until they do.
