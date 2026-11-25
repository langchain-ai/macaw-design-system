// PROTOTYPE - throwaway. Nothing in production imports this folder.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '../../components/Button';
import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerToolbar,
} from '../../components/ChatComposer';
import { ChatConversation } from '../../components/ChatConversation';
import {
  ChatMessage,
  type ChatMessageModel,
} from '../../components/ChatMessage';
import { Text } from '../../components/Text';
import {
  ANSWER,
  INTRO,
  PROTO_CSS,
  QUESTION,
  type Session,
  type Stage,
  STAGES,
  useBrowserSession,
} from './shared';
import {
  type Display,
  VariantCard,
  VariantDocked,
  type VariantParts,
} from './variants';

// Each option is where the live page lives. The host picks one.
const VARIANTS: {
  name: string;
  render: (props: { session: Session; display: Display }) => VariantParts;
}[] = [
  { name: 'Card', render: VariantCard },
  {
    name: 'Panel',
    render: (props) => VariantDocked({ ...props, placement: 'panel' }),
  },
  {
    name: 'Floating',
    render: (props) => VariantDocked({ ...props, placement: 'floating' }),
  },
];

const STORAGE_KEY = 'proto-chat-browser-use';

function readVariant(): number {
  let raw: string | null = null;
  try {
    raw =
      new URLSearchParams(window.location.search).get('v') ??
      window.localStorage.getItem(`${STORAGE_KEY}:v`);
  } catch (error) {
    console.warn('[proto] could not read the saved variant', error);
  }
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= VARIANTS.length
    ? parsed - 1
    : 0;
}

function persistVariant(index: number) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:v`, String(index + 1));
    const url = new URL(window.location.href);
    url.searchParams.set('v', String(index + 1));
    window.history.replaceState(null, '', url);
  } catch (error) {
    console.warn('[proto] could not save the variant', error);
  }
}

function readParam<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(window.location.search).get(key);
  } catch (error) {
    console.warn(`[proto] could not read ${key}`, error);
  }
  return allowed.includes(raw as T) ? (raw as T) : fallback;
}

function persistParam(key: string, value: string) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState(null, '', url);
  } catch (error) {
    console.warn(`[proto] could not save ${key}`, error);
  }
}

const DISPLAYS: { value: Display; label: string }[] = [
  { value: 'expanded', label: 'Expanded' },
  { value: 'minimized', label: 'Minimized' },
];

// ---------- picker (verbatim spec) ----------

const PICKER_CSS = `
.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}
.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  will-change: transform;
}
.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}
@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
}
.proto-picker-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease-out;
}
.proto-picker-item:hover { color: rgba(255, 255, 255, 0.85); }
.proto-picker-item:active { transform: scale(0.97); }
.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}
.proto-picker-item[data-active] { color: #fff; }
.proto-picker-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.12);
}
.proto-picker[data-position="top"] {
  bottom: auto;
  top: 24px;
}
.proto-picker-replay {
  padding: 0 10px;
  font-size: 14px;
}
.proto-states {
  position: fixed;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 12px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
  max-width: calc(100vw - 32px);
  overflow-x: auto;
  scrollbar-width: none;
}
.proto-states .proto-picker-item { height: 24px; padding: 0 10px; white-space: nowrap; }
.proto-states .proto-picker-item[data-active] { background: rgba(255, 255, 255, 0.12); }
`;

function Picker({
  current,
  onSelect,
  onReplay,
}: {
  current: number;
  onSelect: (index: number) => void;
  onReplay: () => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const move = () => {
      const el = itemRefs.current[current];
      const highlight = highlightRef.current;
      if (!el || !highlight) return;
      highlight.style.width = `${el.offsetWidth}px`;
      highlight.style.transform = `translateX(${el.offsetLeft}px)`;
    };
    move();
    window.addEventListener('resize', move);
    return () => window.removeEventListener('resize', move);
  }, [current]);

  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() =>
        navRef.current?.setAttribute('data-ready', '')
      );
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
        target.isContentEditable
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) onSelect(num - 1);
      else if (e.key === 'ArrowRight')
        onSelect((current + 1) % VARIANTS.length);
      else if (e.key === 'ArrowLeft')
        onSelect((current - 1 + VARIANTS.length) % VARIANTS.length);
      else if (e.key === 'r' || e.key === 'R') onReplay();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [current, onSelect, onReplay]);

  return (
    <nav
      ref={navRef}
      className="proto-picker"
      data-position="top"
      aria-label="Prototype variants"
    >
      <span
        ref={highlightRef}
        className="proto-picker-highlight"
        aria-hidden="true"
      />
      {VARIANTS.map((variant, index) => (
        <button
          key={variant.name}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
          className="proto-picker-item"
          data-active={index === current ? '' : undefined}
          aria-current={index === current ? 'true' : undefined}
          onClick={() => onSelect(index)}
        >
          {variant.name}
        </button>
      ))}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button
        type="button"
        className="proto-picker-item proto-picker-replay"
        aria-label="Replay session (R)"
        onClick={onReplay}
      >
        ↻
      </button>
    </nav>
  );
}

function Segments<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-[2px]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="proto-picker-item"
          data-active={option.value === value ? '' : undefined}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ---------- chat ----------

function Run({
  index,
  stage,
  display,
}: {
  index: number;
  stage: Stage;
  display: Display;
}) {
  const session = useBrowserSession(stage);
  const parts = VARIANTS[index].render({ session, display });
  const [draft, setDraft] = useState('');

  const messages: ChatMessageModel[] = [
    {
      id: 'sent',
      role: 'user',
      status: 'completed',
      content: [
        { id: 'sent-text', type: 'text', appearance: 'bubble', text: QUESTION },
      ],
    },
    {
      id: 'reply',
      role: 'assistant',
      status: session.done ? 'completed' : 'streaming',
      content: [
        { id: 'intro', type: 'text', text: INTRO },
        { id: 'browser', type: 'custom', content: parts.inline },
        ...(session.done
          ? ANSWER.map((text, i) => ({
              id: `answer-${i}`,
              type: 'text' as const,
              text,
            }))
          : []),
      ],
    },
  ];

  return (
    <div className="flex h-screen min-h-0">
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatConversation
          label="Travel agent"
          className="min-h-0 flex-1"
          header={
            // Top padding clears the two prototype bars pinned above the chat.
            <div className="flex items-center justify-between gap-space-3 border-b border-primary px-space-4 pb-space-3 pt-[100px]">
              <Text variant="h3">Travel agent</Text>
              <Text variant="xs" color="quaternary">
                {VARIANTS[index].name} prototype
              </Text>
            </div>
          }
          footer={
            <ChatComposer
              aria-label="Message the agent"
              submitDisabled={!draft.trim()}
              onSubmit={(event) => {
                event.preventDefault();
                setDraft('');
              }}
            >
              <ChatComposerInput
                value={draft}
                onChange={setDraft}
                placeholder="Ask a follow-up"
                aria-label="Message"
              />
              <ChatComposerToolbar
                actions={
                  <Button type="submit" size="sm" disabled={!draft.trim()}>
                    Send
                  </Button>
                }
              />
            </ChatComposer>
          }
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </ChatConversation>
        {parts.overlay && (
          <div
            className="pointer-events-none absolute z-10"
            style={{ right: 24, bottom: 132 }}
          >
            {parts.overlay}
          </div>
        )}
      </div>
      {parts.aside && (
        <aside className="hidden h-full w-[min(48%,680px)] shrink-0 border-l border-primary lg:block">
          {parts.aside}
        </aside>
      )}
    </div>
  );
}

export function Harness() {
  const [current, setCurrent] = useState(readVariant);
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState<Stage>(() =>
    readParam(
      'state',
      STAGES.map((s) => s.value),
      'live'
    )
  );
  const [display, setDisplay] = useState<Display>(() =>
    readParam(
      'size',
      DISPLAYS.map((d) => d.value),
      'expanded'
    )
  );

  const select = (index: number) => {
    if (index < 0 || index >= VARIANTS.length) return;
    setCurrent(index);
    persistVariant(index);
  };
  const replay = () => setRun((r) => r + 1);

  return (
    <div className="bg-surface-level-1 font-sans antialiased">
      <style>{PICKER_CSS + PROTO_CSS}</style>
      {/* keyed so switching or replaying restarts the session */}
      <Run
        key={`${current}-${run}-${stage}-${display}`}
        index={current}
        stage={stage}
        display={display}
      />
      <Picker current={current} onSelect={select} onReplay={replay} />
      <div className="proto-states" aria-label="Prototype states">
        <Segments
          label="State"
          options={STAGES}
          value={stage}
          onChange={(next) => {
            setStage(next);
            persistParam('state', next);
          }}
        />
        <span className="proto-picker-divider" aria-hidden="true" />
        <Segments
          label="Size"
          options={DISPLAYS}
          value={display}
          onChange={(next) => {
            setDisplay(next);
            persistParam('size', next);
          }}
        />
      </div>
    </div>
  );
}
