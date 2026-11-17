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
  `description` supporting text. Set `disabled` on models that can't be used
  now, and say why in the badge or description.
- `groups` groups models by provider or tier. Searching for a heading, or for
  an option's `keywords`, finds its models.

The host controls `value`/`onChange`, including `value={undefined}` for no
selection. This preserves the existing `Select` contract: `onChange` receives
`T | undefined`, reselecting the current value reports it again, and
`allowDeselect` reports `undefined` when it is selected again. `variant` still
accepts `outlined` for a field; the composer default is `plain`.

Search appears from eight models. `hideSearch` overrides this; `disableFilter`
keeps search visible for server-filtered catalogs regardless of result count.
Pass `onSearchChange` to request results, `loading` for pending results, and
`selectedOption` to retain the selected label and icon when that model is not
in the current page. Metadata is only used when its value matches `value`;
it does not add an option to the search results. Reset the host's query when
`onOpenChange(false)` fires, since the search input resets when the menu closes.

`open`/`onOpenChange` let shortcuts and slash commands open the menu. Without
search, it opens with the current enabled model highlighted; missing or
disabled selections start on the first enabled option. Choosing a model inside
`ChatComposer` moves focus back to its message input. Escape preserves normal
trigger focus, and `onCloseAutoFocus` can override the behavior. Outside a
composer it uses the ordinary `Select` focus behavior.

The selected name remains visible in narrow composers, truncating only the
trigger. Menu labels and descriptions wrap so workspace model names and
unavailability explanations remain readable. Provider marks belong to the host.
Use `footer` for buttons or links; keep interactive controls out of option rows.
A footer action that navigates or opens a dialog should close the picker through
the host's `open`/`onOpenChange` state.

### Product adapters

All three products can share the picker without moving their model catalogs,
permissions, routing, or request payloads into Macaw. The **Product Adapters**
story demonstrates these shapes; it is not a migration of the running products.

| Consumer                   | Map into the shared picker                                                                                                                                          | Keep in the application                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Fleet `FleetModelSelect`   | Fast/Pro/Max as text-only `options`; mixed catalogs as `groups`; credential status in `rightDecorator`; configuration actions in `footer`.                          | Served-tier detection, catalog loading, availability, credentials, and persistence.                                                    |
| Polly `UnifiedModelSelect` | Built-in/workspace/hosted `groups`; provider `icon`; status `badge`; hosted usage in `description` or `rightDecorator`; `allowDeselect` when clearing is supported. | Hosted quotas, permissions, provider credentials, settings navigation, and mapping `undefined` to `onClear`.                           |
| Robin `ModelPicker`        | Catalog entries plus an explicit Auto option; image incompatibility as `disabled` with a reason; `open`/`onOpenChange` for `/model` and keyboard shortcuts.         | Auto routing, reasoning effort/defaults, context-window details, and conversion between a model ID and the product's selection object. |

Robin's reasoning/context pane is not replaced by this model list. Compose a
separate effort control (as the story does), or retain the current pane until
its product workflow is migrated. An Auto option is an explicit app-owned ID;
clearing a value does not automatically mean Auto.

```tsx
<ChatComposerModelSelect
  groups={modelGroups}
  value={modelId}
  allowDeselect
  onChange={(next) => (next === undefined ? onClear() : onModelChange(next))}
  open={modelMenuOpen}
  onOpenChange={setModelMenuOpen}
  footer={
    <Button
      onClick={() => {
        setModelMenuOpen(false);
        openModelSettings();
      }}
    >
      Configure models
    </Button>
  }
/>
```

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
