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

`ChatToolCall` takes `meta` for short trailing details, such as an edit count
or a link. It sits outside the row toggle, so it can hold its own link or
button.

## Agent work

`ChatSubagent` (from `@langchain/macaw-components/ChatSubagent`) shows a
delegated agent run, such as a deep agent's `task` call. Render it where the
agent started it, keyed by that call's ID. `activity` names the current step,
`result` the outcome, and `onOpen` hands the full thread to a host pane.
Details in `children` mount only while expanded, so subscribe to the
subagent's stream inside them. Wrap parallel runs in `ChatSubagentGroup`.

`ChatPlan` (from `@langchain/macaw-components/ChatPlan`) shows an agent's
todos with stable IDs. Put `presentation="drawer"` in `ChatComposer`'s `drawer`
slot to keep it above the input while the agent works.

Summarize a turn's work with `ChatToolCallGroup`: pass `showElapsed` and
`startedAt` while it runs, then a label such as
`` `Worked for ${formatChatDuration(ms)} · 6 actions` ``. `ChatToolCallReasoning`
with `expandWhileStreaming` stays open while reasoning streams, unless the
reader toggles it.

`ChatState` takes `startedAt` so a remounted row keeps counting, and
`announce={false}` when a parent announces the outcome.

## Approvals and queued messages

Approval `ChatRichContent` takes `edit` to change a request before approving
it, such as a human-in-the-loop `edit` decision. `edit.content` replaces the
body with host-owned fields; `edit.onSubmit` saves them. `ChatMessageActions`
shows `cancel` on queued messages, and `ChatComposer` takes
`action="stopping"` while a stop is pending.

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
hide a call. A renderer's second argument holds the original AI message and
tool result, for fields Macaw doesn't map, such as artifacts or
provider-specific content; every part in `toChatThread` carries the same
`source`. `renderInterrupt` takes over requests the app understands, such
as sign-in; return undefined for the default approval, reply, or response
card. Requests paused together resume together once each has a decision, and
sending is paused until they do.
