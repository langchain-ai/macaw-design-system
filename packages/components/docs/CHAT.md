# Chat components

Macaw chat families provide presentation and local interaction. Applications
own message and event parsing, network requests, streaming, persistence,
authorization, analytics, tool execution, and product-specific tool or logo
mapping.

## Conversation scrolling

`ChatConversation` follows new output while the reader is at the bottom;
scrolling up pauses following and shows **Jump to latest**. `follow="none"`
never scrolls on its own, so the log opens at the top unless the host sets
`scrollTop` through `viewportRef`, and **Jump to latest** still appears.

Set `pinnedMessageId` to a message's ID when the reader sends it. Each new ID
scrolls that message to the top once and reserves space below it, so the reply
streams in underneath instead of pushing it away. The space shrinks as the
reply grows and is gone once the reply fills the viewport. Following pauses
while pinned and resumes when the reader scrolls to the end or uses **Jump to
latest**. Clearing the ID neither scrolls nor ends the pin.

When the reader isn't following the bottom, content inserted above the first
visible message, such as a page of earlier messages, keeps that message where
it was in the viewport. The host fetches history and decides when to load it,
without adjusting `scrollTop`. Pinning and anchoring find messages by
`data-chat-message-id`, which `ChatMessage` sets on its root; give custom rows
the same attribute. All scrolling is instant.

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
