# Chat components

Macaw chat families provide presentation and local interaction. Applications
own message and event parsing, network requests, streaming, persistence,
authorization, analytics, tool execution, and product-specific tool or logo
mapping.

## Conversation scrolling

`ChatConversation` follows new output while the reader is at the bottom;
scrolling up pauses it and shows **Jump to latest**. `follow="none"` never
scrolls on its own.

Set `pinnedMessageId` to the message the reader just sent: it moves to the top,
and the reply streams in below it. Following resumes when the reader scrolls
to the end or uses **Jump to latest**.

Earlier messages inserted above the reader keep the first visible message in
place, so the host only fetches and renders them. Both find messages by
`data-chat-message-id`, which `ChatMessage` sets; give custom rows the same
attribute.

## Model selection

`ChatComposerModelSelect` (from `@langchain/macaw-components/ChatComposer`)
goes in `ChatComposerToolbar`'s `modelSelector` slot. The trigger has no border,
so it reads as part of the composer. The host owns the model catalog,
availability, credentials, and defaults, and maps them to options:

- `label` names a concrete model ("Sonnet 5.5") or a tier ("Balanced model").
- `icon` is the host's provider or tier mark, about 16px; the trigger shows it
  too.
- `badge` holds a short status such as "Default" or "Needs API key", and
  `description` a one-line summary. Set `disabled` on models that can't be used
  now, and say why in the badge or description.
- `groups` groups models by provider or tier. Searching for a heading, or for
  an option's `keywords`, finds its models.

Use `value`/`onChange`, or `defaultValue` for an uncontrolled picker.
`open`/`onOpenChange` let a shortcut or slash command open it. `footer` holds
host actions such as **Manage models**. Search appears from eight models; for
server-side search, set `hideSearch={false}`, `disableFilter`, and
`onSearchChange`. Without search, the menu opens with the current model
highlighted, so Enter keeps it. Outside `ChatComposer` it works on its own,
without the narrow layout or the move to the message input.

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

`ChatPlan` (from `@langchain/macaw-components/ChatPlan`) shows an agent's
todos with stable IDs. Put `presentation="drawer"` in `ChatComposer`'s `drawer`
slot to keep it above the input while the agent works. It can share the drawer:
the drawer stacks its items with dividers, so pass the plan first and a
question last, next to the input that answers it. The plan keeps a neutral
surface under any `drawerIntent`.

Show a delegated subagent run, such as a deep agent's `task` call, as a
`ChatToolCall` with the subagent's name as `label` and its task as `summary`.
Its own tool calls go in the details, which mount only while expanded.

Summarize a turn's work with `ChatToolCallGroup`: pass `running`,
`showElapsed`, and `startedAt` while it runs, so the header keeps working
between calls, then a label such as
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
