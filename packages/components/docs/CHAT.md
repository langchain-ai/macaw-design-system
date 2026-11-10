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
validating product-specific payloads. The `simple` variant delegates inspection
through `onInspect`; the host owns navigation, dialogs, permissions, and trace
loading. Use `inspectLabel` to describe the host-owned action when the default
“View tool details” label is not accurate. Reasoning content must be an
intentionally disclosed summary, never raw hidden model reasoning.

The default variant provides local expandable details. Groups preserve nested
expansion state while collapsed. Controlled `expanded` props allow a host to
coordinate disclosure without moving tool execution or event parsing into the
component.
