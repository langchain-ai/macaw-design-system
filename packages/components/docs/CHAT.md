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

Use a `ref` typed as `ChatConversationHandle` for `jumpToLatest()` and
`pinMessage(id)`. These use the same scrolling/follow behavior as the built-in
control and `pinnedMessageId`; use `viewportRef` for raw position reads or
restoration. The handle's `jumpToLatest()` leaves focus where it is, so the
composer can call it. Replace the floating control with
`renderJumpToLatest={({ jumpToLatest }) => ...}`; return `null` to hide it.
That `jumpToLatest` moves focus to the message log, since the control
disappears. The host owns the replacement's accessible label, focus styles,
and pointer events. `columnClassName` overrides the shared
message/footer width and padding (for example `max-w-full`), not the viewport.

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
beside its label. Set `iconKey` to a stable integration identity when different
marks use the same wrapper component. Without it, icons retain component-type
deduplication. Change the key when replacing a mark's visual identity.

Custom rows call `useChatToolCallGroupRow({ status, icon, iconKey })` from the
same family import. It returns whether the row is inside a group; use that to
avoid a duplicate streaming indicator in the row. Registration follows mount,
status/identity updates, and unmount, including while the group is closed.
Call it once per logical row, not around a `ChatToolCall` that already reports.
The host retains the row's own lifecycle announcement and error presentation.

The default variant provides local expandable details. Groups preserve nested
expansion state while collapsed. Controlled `expanded` props allow a host to
coordinate disclosure without moving tool execution or event parsing into the
component. Set `keepMounted` on `ChatToolCall` or `ChatToolCallReasoning`
to preserve stateful details while closed. Closed details are hidden and inert;
the default still unmounts them after closing, avoiding eager work for large
result views. A kept-mounted child's effects keep running, so the host must
still gate expensive fetching or execution.

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
reader toggles it. It also takes `startedAt`, so its streaming clock keeps
counting across remounts.

`ChatState` takes `startedAt` so a remounted row keeps counting, and
`announce={false}` when a parent announces the outcome.

## Approvals and queued messages

Approval `ChatRichContent` takes `edit` to change a request before approving
it, such as a human-in-the-loop `edit` decision. `edit.content` replaces the
body with host-owned fields; `edit.onSubmit` saves them. `ChatMessageActions`
shows `cancel` on queued messages, and `ChatComposer` takes
`action="stopping"` while a stop is pending.

## Composer input surface

`ChatComposer`'s `className` styles the outer form, including its drawer.
Use `inputSurfaceClassName` for an input-only border, ring, shadow, or fill;
disabled and file drop-target styles still apply over it. Existing `ChatComposerTextarea` supports native selection and key handling;
a host-owned rich editor can still be composed as children. Entity/mention
serialization, atomic editing, and caret-anchored suggestion menus are not a
public rich-input contract yet; keep those editors host-owned rather than
flattening entities into Markdown or guessing a menu anchor.

## Markdown extensions

`MarkdownDisplay` accepts trusted application `remarkPlugins` and
`rehypePlugins`. Remark plugins run after GFM. Raw HTML stays disabled in the
parser, so they never receive HTML from the content. Rehype transforms run
before Macaw's trailing-content decoration.
Defaults, component mappings, and the oversized plain-text fallback remain in
place. Plugins are application code, not a sandbox: audit their output and do
not pass plugins supplied by untrusted content.

Use `renderCodeBlock={({ code, language, codeOverflow }) => ...}` for selected
fenced languages. Returning `undefined` or `false` keeps Macaw's code
renderer, so `language === 'mermaid' && ...` works; `null` omits the block.
`code` excludes the line ending before the closing fence. For example, the host can supply its safe Mermaid renderer
for `language === 'mermaid'` without loading a diagram library for every
Markdown consumer. The host owns diagram loading, sanitization, streaming
completion, error handling, and accessibility. A full `components.pre`
override still takes precedence. Slack's mrkdwn dialect and Mermaid rendering
are not bundled; supply an audited dialect plugin/adapter and diagram renderer
rather than treating Slack source as CommonMark or enabling raw HTML.
