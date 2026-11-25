// POC - Storybook only. Not exported from the Macaw package.
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { ArticleIcon } from '@phosphor-icons/react/dist/ssr/Article';
import { CameraIcon } from '@phosphor-icons/react/dist/ssr/Camera';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { CursorClickIcon } from '@phosphor-icons/react/dist/ssr/CursorClick';
import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { HandIcon } from '@phosphor-icons/react/dist/ssr/Hand';
import { KeyboardIcon } from '@phosphor-icons/react/dist/ssr/Keyboard';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { MinusIcon } from '@phosphor-icons/react/dist/ssr/Minus';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { Button } from '../../components/Button';
import {
  ChatToolCall,
  type ChatToolCallStatus,
} from '../../components/ChatToolCall';
import { ChatToolCallCollapse } from '../../components/ChatToolCall/ChatToolCallCollapse';
import { ChatToolCallGroupContext } from '../../components/ChatToolCall/ChatToolCallGroupContext';
import { CodeLite } from '../../components/Code/CodeLite';
import { IconButton } from '../../components/IconButton';
import { Text } from '../../components/Text';
import { cn } from '../../utils/cn';

// ---------- model ----------

/**
 * Who drives the browser, plus the connection states the host reports.
 * `ended` means the agent finished. `closed` means the browser went away
 * on its own, such as an idle timeout or an expired link.
 */
export type ChatBrowserUseState =
  | 'connecting'
  | 'agent'
  | 'needs-you'
  | 'user'
  | 'reconnecting'
  | 'ended'
  | 'closed';

export type ChatBrowserUseAction =
  | 'navigate'
  | 'type'
  | 'click'
  | 'read'
  | 'screenshot'
  | 'handoff';

export interface ChatBrowserUseStep {
  id: string;
  action: ChatBrowserUseAction;
  /** Verb, already in the right tense for the status: "Clicking", "Clicked". */
  label: string;
  /** What the verb acts on: "Refundable fares only". */
  target: string;
  url: string;
  status: ChatToolCallStatus;
  error?: string;
  elapsedMs?: number;
  /** Raw code or arguments, shown one click away. */
  code?: string;
  /** The page as this step left it, for step-by-step review in the panel. */
  frame?: ReactNode;
}

export interface ChatBrowserUseSession {
  state: ChatBrowserUseState;
  url?: string;
  title?: string;
  /** Site icon, about 14px. Defaults to a globe. */
  favicon?: ReactNode;
  steps: ChatBrowserUseStep[];
  /**
   * The current page, rendered at `deviceSize` and scaled to fit. The host
   * owns the transport: an image, a canvas fed by a stream, or an iframe.
   * Leave it undefined before the first frame to show a skeleton.
   */
  frame?: ReactNode;
  /**
   * The latest screenshot. The row thumbnail and the card show it while the
   * agent works, so long chats don't hold a stream open for every session.
   * The live `frame` takes over in the panel, in the floating window, and in
   * the card once the agent asks for you. Falls back to `frame`.
   */
  snapshot?: ReactNode;
  deviceSize?: { width: number; height: number };
  /** Where the agent is pointing on the live frame, in device pixels. `key` replays the click ripple. */
  cursor?: { x: number; y: number; key?: string | number };
  /** Open tabs. The views show the active one and say how many there are. */
  tabCount?: number;
  /** Required while `state` is `needs-you`. */
  handoff?: { title: string; reason: string };
  /** Shown while `state` is `closed`. */
  closedReason?: string;
}

/** Hosts own what these do; a missing handler hides its control. */
export interface ChatBrowserUseActions {
  onTakeControl?: () => void;
  onHandBack?: () => void;
  /** The host picks the target: the bare live view or the LangSmith Sandboxes page. */
  onOpenInNewTab?: () => void;
}

const DEFAULT_DEVICE = { width: 1280, height: 800 };

// ---------- helpers ----------

function splitUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname.replace(/^www\./, ''),
      path: `${u.pathname === '/' ? '' : u.pathname}${u.search}`,
    };
  } catch {
    return { host: url, path: '' };
  }
}

/** The hostname never truncates; the path gives way first. */
function UrlText({
  url,
  showPath = true,
}: {
  url: string;
  showPath?: boolean;
}) {
  const { host, path } = splitUrl(url);
  return (
    <span className="flex min-w-0 items-baseline" title={url}>
      <span className="shrink-0 text-secondary">{host}</span>
      {showPath && path && (
        <span className="min-w-0 truncate text-quaternary">{path}</span>
      )}
    </span>
  );
}

/** The host's favicon should fill its box (`size-full`). */
function TabCount({ session }: { session: ChatBrowserUseSession }) {
  if (!session.tabCount || session.tabCount < 2) return null;
  return (
    <span className="shrink-0 pl-space-2 text-tertiary tabular-nums">
      {session.tabCount} tabs
    </span>
  );
}

function Favicon({
  session,
  size = 'sm',
}: {
  session: ChatBrowserUseSession;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center text-icon-tertiary',
        size === 'sm' ? 'size-3.5' : 'size-5'
      )}
    >
      {session.favicon ?? (
        <GlobeIcon size={size === 'sm' ? 14 : 16} aria-hidden="true" />
      )}
    </span>
  );
}

const ACTION_ICONS = {
  navigate: GlobeIcon,
  type: KeyboardIcon,
  click: CursorClickIcon,
  read: ArticleIcon,
  screenshot: CameraIcon,
  handoff: HandIcon,
} satisfies Record<ChatBrowserUseAction, unknown>;

function StepIcon({ action }: { action: ChatBrowserUseAction }) {
  const Icon = ACTION_ICONS[action];
  return <Icon size={12} weight="regular" />;
}

function currentStep(session: ChatBrowserUseSession) {
  return session.steps[session.steps.length - 1];
}

function summary(session: ChatBrowserUseSession) {
  const actions = session.steps.filter((s) => s.action !== 'handoff').length;
  const pages = new Set(session.steps.map((s) => s.url)).size;
  return `${actions} actions on ${pages} pages`;
}

function isWaiting(state: ChatBrowserUseState) {
  return state === 'needs-you' || state === 'user';
}

/**
 * Footers keep the last step while the page shows a reconnecting or closed
 * notice, so the two never say the same thing.
 */
function footerLine(session: ChatBrowserUseSession) {
  const step = currentStep(session);
  if ((session.state === 'reconnecting' || session.state === 'closed') && step)
    return `${step.label} ${step.target}`;
  return statusLine(session);
}

/** One line on what's happening now; notices and the row use it. */
function statusLine(session: ChatBrowserUseSession) {
  const step = currentStep(session);
  switch (session.state) {
    case 'connecting':
      return 'Connecting…';
    case 'needs-you':
      return 'Waiting for you';
    case 'user':
      return 'Press Esc to hand back control';
    case 'reconnecting':
      return 'Reconnecting to the browser…';
    case 'closed':
      return session.closedReason ?? 'The browser closed';
    case 'ended':
      return summary(session);
    case 'agent':
      return step ? `${step.label} ${step.target}` : 'Connecting…';
  }
}

function rowTitle(session: ChatBrowserUseSession) {
  const step = currentStep(session);
  const host = session.url ? splitUrl(session.url).host : 'the web';
  switch (session.state) {
    case 'connecting':
      return 'Starting a browser';
    case 'needs-you':
      return session.handoff?.title ?? 'The agent needs you';
    case 'user':
      return 'You’re in control of the browser';
    case 'reconnecting':
      return 'Reconnecting to the browser';
    case 'closed':
      return 'Browser closed';
    case 'ended':
      return `Browsed ${host}`;
    case 'agent':
      return step ? `${step.label} ${step.target}` : 'Starting a browser';
  }
}

/** Esc hands back while the reader drives, so the page never traps focus. */
function useEscToHandBack(
  state: ChatBrowserUseState,
  onHandBack: (() => void) | undefined,
  enabled = true
) {
  useEffect(() => {
    if (!enabled || state !== 'user' || !onHandBack) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onHandBack();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled, state, onHandBack]);
}

function borderForState(state: ChatBrowserUseState) {
  if (state === 'needs-you') return 'border-warning';
  if (state === 'user') return 'border-brand-strong';
  return 'border-subtle';
}

// ---------- status ----------

const STATUS_COPY: Record<ChatBrowserUseState, string> = {
  connecting: 'Connecting',
  agent: 'Agent browsing',
  'needs-you': 'Needs you',
  user: 'You’re in control',
  reconnecting: 'Reconnecting',
  ended: 'Session ended',
  closed: 'Browser closed',
};

/** Pills without a visible fill, so containers can pull them in by their padding. */
export function statusHasFill(state: ChatBrowserUseState) {
  return !(state === 'ended' || state === 'closed');
}

/** One place that says who drives. Icon, text and color, announced politely. */
export function ChatBrowserUseStatus({
  state,
  className,
}: {
  state: ChatBrowserUseState;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-space-1 rounded-full px-space-2 text-xxs font-medium',
        state === 'needs-you' && 'bg-warning-subtle text-warning-primary',
        state === 'user' && 'bg-brand-subtle text-brand-primary',
        (state === 'agent' ||
          state === 'connecting' ||
          state === 'reconnecting') &&
          'bg-surface-level-2 text-secondary',
        (state === 'ended' || state === 'closed') && 'text-tertiary',
        className
      )}
    >
      {state === 'agent' && (
        <span
          aria-hidden="true"
          className="size-1.5 animate-pulse rounded-full bg-success-strong motion-reduce:animate-none"
        />
      )}
      {/* Static: the message header already shows the thinking indicator. */}
      {(state === 'connecting' || state === 'reconnecting') && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full border border-current text-icon-tertiary"
        />
      )}
      {state === 'needs-you' && <HandIcon size={12} aria-hidden="true" />}
      {state === 'user' && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-brand-primary"
        />
      )}
      {state === 'closed' && <WarningCircleIcon size={12} aria-hidden="true" />}
      {STATUS_COPY[state]}
    </span>
  );
}

// ---------- viewport ----------

const RIPPLE_CSS = `
@keyframes cbu-ripple { from { transform: scale(0.3); opacity: 0.9 } to { transform: scale(1.4); opacity: 0 } }
.cbu-ripple { animation: cbu-ripple 700ms cubic-bezier(0.23,1,0.32,1) 450ms both; }
@media (prefers-reduced-motion: reduce) { .cbu-ripple { animation: none; } }
`;

function AgentCursor({
  x,
  y,
  rippleKey,
}: {
  x: number;
  y: number;
  rippleKey?: string | number;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-0 top-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <style>{RIPPLE_CSS}</style>
      <span
        key={rippleKey}
        className="cbu-ripple absolute -left-6 -top-6 size-12 rounded-full border-2"
        style={{ borderColor: '#2f6fed' }}
      />
      <svg
        width="26"
        height="30"
        viewBox="0 0 18 21"
        className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
      >
        <path
          d="M1 1l15 8.5-6.6 1.6L6 18z"
          fill="#2f6fed"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Renders a frame at its device size and scales it to the container width,
 * keeping the page's real aspect ratio. Children are overlays.
 */
export function ChatBrowserUseViewport({
  frame,
  deviceSize = DEFAULT_DEVICE,
  cursor,
  interactive = false,
  dim = false,
  label,
  className,
  children,
}: {
  frame?: ReactNode;
  deviceSize?: { width: number; height: number };
  cursor?: ChatBrowserUseSession['cursor'];
  /** Pointer events reach the frame only while the reader drives. */
  interactive?: boolean;
  dim?: boolean;
  /** Empty for decorative thumbnails. */
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / deviceSize.width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [deviceSize.width]);

  return (
    <div
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cn(
        'relative w-full overflow-hidden bg-surface-level-2',
        className
      )}
      style={{ aspectRatio: `${deviceSize.width} / ${deviceSize.height}` }}
    >
      {frame == null ? (
        <div className="absolute inset-0 animate-pulse bg-surface-level-3 motion-reduce:animate-none" />
      ) : (
        scale > 0 && (
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: deviceSize.width,
              height: deviceSize.height,
              transform: `scale(${scale})`,
              pointerEvents: interactive ? 'auto' : 'none',
            }}
          >
            {frame}
            {cursor && (
              <AgentCursor x={cursor.x} y={cursor.y} rippleKey={cursor.key} />
            )}
          </div>
        )
      )}
      {dim && <div className="absolute inset-0 bg-[rgba(0,0,0,0.35)]" />}
      {children}
    </div>
  );
}

/** Reconnecting and closed freeze the last frame under a short notice. */
function FrameNotice({ session }: { session: ChatBrowserUseSession }) {
  if (session.state !== 'reconnecting' && session.state !== 'closed')
    return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center p-space-4">
      <Text
        as="span"
        variant="xs"
        color="secondary"
        className="max-w-[320px] rounded-md bg-surface-level-1 px-space-3 py-space-2 text-center shadow-[0_8px_24px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.08)]"
      >
        {statusLine(session)}
      </Text>
    </div>
  );
}

// ---------- controls ----------

/**
 * The trailing action, by who drives. Taking over is always offered while
 * the agent works, as a quiet button; the primary style is kept for the
 * agent's ask and for handing back.
 */
function ControlAction({
  session,
  actions,
  size = 'xs',
}: {
  session: ChatBrowserUseSession;
  actions: ChatBrowserUseActions;
  size?: 'xs' | 'sm';
}) {
  if (session.state === 'needs-you' && actions.onTakeControl)
    return (
      <Button size={size} onClick={actions.onTakeControl}>
        Take control
      </Button>
    );
  if (session.state === 'user' && actions.onHandBack)
    return (
      <Button size={size} onClick={actions.onHandBack}>
        Hand back to agent
      </Button>
    );
  if (session.state === 'agent' && actions.onTakeControl)
    return (
      <Button
        size={size}
        variant="plain"
        color="secondary"
        leftDecorator={HandIcon}
        onClick={actions.onTakeControl}
        // A plain button's fill only shows on hover, so pull it out by its
        // padding: the visible label then ends 12px from the edge.
        className="-mr-space-2 shrink-0"
      >
        Take control
      </Button>
    );
  return null;
}

function StepIconSlot({ session }: { session: ChatBrowserUseSession }) {
  const step = currentStep(session);
  // No step yet, no slot: the text starts at the left edge.
  if (!step) return null;
  return (
    <span className="flex size-3 shrink-0 items-center justify-center text-icon-tertiary">
      <StepIcon action={step.action} />
    </span>
  );
}

function NewTabButton({
  session,
  onOpenInNewTab,
  size = 'sm',
  variant = 'plain',
}: {
  session: ChatBrowserUseSession;
  onOpenInNewTab?: () => void;
  size?: 'xs' | 'sm';
  variant?: 'plain' | 'outlined';
}) {
  if (!onOpenInNewTab || session.state === 'closed') return null;
  return (
    <IconButton
      icon={ArrowSquareOutIcon}
      label="Open in new tab"
      size={size}
      variant={variant}
      color="secondary"
      disabled={!session.url}
      onClick={onOpenInNewTab}
    />
  );
}

/**
 * Hover or focus reveals the new-tab action. A click on the page does
 * nothing, so nobody pauses the agent or leaves the chat by accident.
 */
function ViewActions({
  session,
  onOpenInNewTab,
}: {
  session: ChatBrowserUseSession;
  onOpenInNewTab?: () => void;
}) {
  if (!onOpenInNewTab || session.state === 'closed') return null;
  const reveal =
    'opacity-0 transition-opacity duration-fast ease-out group-hover/view:opacity-100 group-focus-within/view:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none';
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-[rgba(0,0,0,0.04)]',
          reveal
        )}
      />
      <div className={cn('absolute right-[8px] top-[8px] z-[1]', reveal)}>
        <NewTabButton
          session={session}
          onOpenInNewTab={onOpenInNewTab}
          variant="outlined"
        />
      </div>
    </>
  );
}

// ---------- steps ----------

function StepDetails({ step }: { step: ChatBrowserUseStep }) {
  return (
    <div className="flex min-w-0 flex-col gap-space-2">
      <Text as="div" variant="xs" className="min-w-0">
        <UrlText url={step.url} />
      </Text>
      {step.error && (
        <Text
          as="div"
          variant="xs"
          color="error"
          className="flex items-start gap-space-1"
        >
          <WarningCircleIcon
            size={12}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          {step.error}
        </Text>
      )}
      {step.code && (
        <CodeLite
          language="typescript"
          value={step.code}
          className="text-xxs"
          showGutter={false}
          wrapLines
        />
      )}
    </div>
  );
}

// Rows report to this instead of a group header. The status pill already
// says the agent is working, so rows drop their own 16px running indicator.
const SESSION_GROUP = { update: () => {}, remove: () => {} };

/** The session's steps, unfolded. With `onInspect`, a step shows its frame. */
export function ChatBrowserUseSteps({
  steps,
  open,
  onInspect,
}: {
  steps: ChatBrowserUseStep[];
  open: boolean;
  onInspect?: (step: ChatBrowserUseStep) => void;
}) {
  return (
    <ChatToolCallGroupContext.Provider value={SESSION_GROUP}>
      <ChatToolCallCollapse open={open} className="flex flex-col gap-0.5">
        {steps.map((step) => (
          <ChatToolCall
            key={step.id}
            toolCall={{
              id: step.id,
              name: 'browser_run',
              status: step.status,
              elapsedMs: step.elapsedMs,
              error: step.error,
            }}
            variant={onInspect ? 'simple' : 'default'}
            onInspect={onInspect ? () => onInspect(step) : undefined}
            inspectLabel={onInspect ? 'Show in browser' : undefined}
            icon={<StepIcon action={step.action} />}
            label={onInspect ? `${step.label} ${step.target}` : step.label}
            summary={step.target}
          >
            <StepDetails step={step} />
          </ChatToolCall>
        ))}
      </ChatToolCallCollapse>
    </ChatToolCallGroupContext.Provider>
  );
}

function StepsToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <IconButton
      icon={CaretRightIcon}
      label={open ? 'Hide steps' : 'Show steps'}
      aria-expanded={open}
      size="xs"
      variant="plain"
      color="secondary"
      onClick={onToggle}
      iconClassName={cn(
        'transition-transform duration-normal ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
        open && 'rotate-90'
      )}
    />
  );
}

// ---------- row ----------

export interface ChatBrowserUseRowProps extends ChatBrowserUseActions {
  session: ChatBrowserUseSession;
  /** Whether the page's home (card, panel or floating window) is showing. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the row's toggle, such as "browser panel". */
  homeLabel?: string;
  /** With a panel, steps can show the frame they left behind. */
  onInspectStep?: (step: ChatBrowserUseStep) => void;
  className?: string;
}

/**
 * The session in one line, the same in every placement. Clicking it shows
 * or hides the page's home. When the agent needs you, the status becomes
 * the ask.
 */
export function ChatBrowserUseRow({
  session,
  open,
  onOpenChange,
  homeLabel = 'browser',
  onInspectStep,
  onTakeControl,
  className,
}: ChatBrowserUseRowProps) {
  const [stepsOpen, setStepsOpen] = useState(false);
  const needsYou = session.state === 'needs-you';
  const title = rowTitle(session);

  return (
    <div
      className={cn(
        'flex min-w-0 max-w-[560px] flex-col gap-space-1',
        className
      )}
    >
      <div
        className={cn(
          // 8px from the thumbnail to the text. The right edge sits 12px
          // from what's visible: pr-space-3 to a button, or pr-space-2 plus
          // the caret button's own 4px inset.
          'relative flex min-w-0 items-center gap-space-2 rounded-lg border py-space-2 pl-space-2 transition-colors duration-fast motion-reduce:transition-none',
          needsYou ? 'pr-space-3' : 'pr-space-2',
          needsYou
            ? 'border-warning bg-warning-subtle'
            : open
              ? 'border-primary'
              : 'border-subtle hover:bg-surface-level-2'
        )}
      >
        <button
          type="button"
          aria-label={`${open ? 'Hide' : 'Show'} ${homeLabel}: ${title}`}
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
          className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
        {/* Both slots are 40px tall, so swapping them never moves the row.
            The thumbnail shows the agent working while the page is hidden;
            once the page is showing it would only repeat it. */}
        {open ? (
          <span className="pointer-events-none flex size-10 shrink-0 items-center justify-center rounded-md border border-subtle bg-surface-level-2">
            <Favicon session={session} size="md" />
          </span>
        ) : (
          <span className="pointer-events-none relative h-10 w-16 shrink-0 overflow-hidden rounded-[4px] border border-subtle">
            <ChatBrowserUseViewport
              frame={session.snapshot ?? session.frame}
              deviceSize={session.deviceSize}
              label=""
            />
          </span>
        )}
        <span className="pointer-events-none flex min-w-0 flex-1 flex-col gap-0.5">
          <Text
            as="span"
            variant="xs"
            weight="medium"
            color="secondary"
            className="truncate"
          >
            {title}
          </Text>
          <Text as="span" variant="xs" color="tertiary" className="truncate">
            {session.state === 'ended' ? (
              summary(session)
            ) : session.url ? (
              <UrlText url={session.url} />
            ) : (
              'Connecting…'
            )}
          </Text>
        </span>
        <span className="relative z-[1] ml-space-1 flex shrink-0 items-center gap-space-2">
          {needsYou && onTakeControl ? (
            <Button size="xs" onClick={onTakeControl}>
              Take control
            </Button>
          ) : (
            <>
              <ChatBrowserUseStatus state={session.state} />
              {session.steps.length > 0 && (
                <StepsToggle
                  open={stepsOpen}
                  onToggle={() => setStepsOpen(!stepsOpen)}
                />
              )}
            </>
          )}
        </span>
      </div>
      <div className="pl-space-1">
        <ChatBrowserUseSteps
          steps={session.steps}
          open={stepsOpen}
          onInspect={onInspectStep}
        />
      </div>
    </div>
  );
}

// ---------- card ----------

export interface ChatBrowserUseCardProps extends ChatBrowserUseActions {
  session: ChatBrowserUseSession;
  minimized?: boolean;
  defaultMinimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  className?: string;
}

/** The page lives inline, for hosts with no side panel and small screens. */
export function ChatBrowserUseCard({
  session,
  minimized,
  defaultMinimized = false,
  onMinimizedChange,
  className,
  ...actions
}: ChatBrowserUseCardProps) {
  const [isMinimized = false, setMinimized] = useControllableState({
    prop: minimized,
    defaultProp: defaultMinimized,
    onChange: onMinimizedChange,
  });
  const [stepsOpen, setStepsOpen] = useState(false);
  const waiting = isWaiting(session.state);
  // A handoff always shows the page, whatever size the reader left it at.
  const showRow = isMinimized && !waiting;
  // Inline, the card streams only once the agent asks for you.
  const live = waiting;
  useEscToHandBack(session.state, actions.onHandBack, !showRow);

  if (showRow) {
    return (
      <ChatBrowserUseRow
        session={session}
        open={false}
        onOpenChange={() => setMinimized(false)}
        className={className}
        onTakeControl={() => {
          setMinimized(false);
          actions.onTakeControl?.();
        }}
      />
    );
  }

  return (
    <section
      aria-label="Browser session"
      className={cn(
        'min-w-0 max-w-[560px] overflow-hidden rounded-lg border bg-surface-level-1 transition-[border-color] duration-normal',
        borderForState(session.state),
        className
      )}
    >
      <header className="flex min-w-0 items-center gap-space-2 py-space-2 pl-space-3 pr-space-2">
        <Favicon session={session} />
        <Text as="div" variant="xs" className="min-w-0 flex-1">
          {session.url ? (
            <span className="flex min-w-0 items-baseline">
              <UrlText url={session.url} showPath={false} />
              <TabCount session={session} />
            </span>
          ) : (
            <span className="text-tertiary">Starting browser…</span>
          )}
        </Text>
        <ChatBrowserUseStatus state={session.state} />
        {!waiting && (
          <IconButton
            icon={MinusIcon}
            label="Minimize browser"
            size="xs"
            variant="plain"
            color="secondary"
            onClick={() => setMinimized(true)}
          />
        )}
      </header>
      <div className="group/view relative border-y border-subtle">
        <ChatBrowserUseViewport
          frame={live ? session.frame : (session.snapshot ?? session.frame)}
          deviceSize={session.deviceSize}
          cursor={live ? session.cursor : undefined}
          interactive={session.state === 'user'}
          dim={
            session.state === 'needs-you' ||
            session.state === 'reconnecting' ||
            session.state === 'closed'
          }
          label={session.title ?? 'Browser'}
        >
          {session.state === 'needs-you' && session.handoff && (
            <div className="absolute inset-0 flex items-center justify-center p-space-4">
              <div className="flex max-w-[340px] flex-col items-start gap-space-3 rounded-lg bg-surface-level-1 p-space-4 shadow-[0_8px_24px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.08)]">
                <Text variant="sm" weight="medium">
                  {session.handoff.title}
                </Text>
                <Text variant="xs" color="secondary">
                  {session.handoff.reason}
                </Text>
                <ControlAction session={session} actions={actions} size="sm" />
              </div>
            </div>
          )}
          <FrameNotice session={session} />
          {!waiting && (
            <ViewActions
              session={session}
              onOpenInNewTab={actions.onOpenInNewTab}
            />
          )}
        </ChatBrowserUseViewport>
      </div>
      {/* Both edges sit 12px in, like the header: pl-space-2 plus the
          toggle's own px-space-1 on the left, pr-space-3 on the right. */}
      <footer className="py-space-2 pl-space-2 pr-space-3">
        <div className="flex min-w-0 items-center gap-space-2">
          {session.steps.length === 0 ? (
            // Nothing to unfold yet, so no toggle and no caret.
            <Text
              as="span"
              variant="xs"
              color="secondary"
              className="min-w-0 flex-1 truncate px-space-1"
            >
              {footerLine(session)}
            </Text>
          ) : (
            <Button
              variant="plain"
              color="secondary"
              size="xs"
              aria-label={stepsOpen ? 'Hide steps' : 'Show steps'}
              aria-expanded={stepsOpen}
              onClick={() => setStepsOpen(!stepsOpen)}
              className="min-w-0 flex-1 justify-start gap-space-2 px-space-1"
            >
              <StepIconSlot session={session} />
              {session.state === 'ended' && (
                <span className="shrink-0 font-medium text-secondary">
                  Done
                </span>
              )}
              <span
                className={cn(
                  'min-w-0 truncate',
                  session.state === 'ended' ? 'text-tertiary' : 'text-secondary'
                )}
              >
                {footerLine(session)}
              </span>
              <CaretRightIcon
                size={12}
                aria-hidden="true"
                className={cn(
                  'shrink-0 text-icon-tertiary transition-transform duration-normal ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                  stepsOpen && 'rotate-90'
                )}
              />
            </Button>
          )}
          {/* The overlay owns the ask while the agent waits for you. */}
          {session.state !== 'needs-you' && (
            <ControlAction session={session} actions={actions} />
          )}
        </div>
        <div className={cn(stepsOpen && 'pb-space-1')}>
          <ChatBrowserUseSteps steps={session.steps} open={stepsOpen} />
        </div>
      </footer>
    </section>
  );
}

// ---------- panel ----------

export interface ChatBrowserUsePanelProps extends ChatBrowserUseActions {
  session: ChatBrowserUseSession;
  /** A past step to show instead of the live page. */
  inspectedStep?: ChatBrowserUseStep | null;
  onInspectedStepChange?: (step: ChatBrowserUseStep | null) => void;
  onClose: () => void;
}

/**
 * The page lives in the host's side panel, on wide screens only. Small
 * screens use the card or the floating window instead.
 */
export function ChatBrowserUsePanel({
  session,
  inspectedStep = null,
  onInspectedStepChange,
  onClose,
  ...actions
}: ChatBrowserUsePanelProps) {
  useEscToHandBack(session.state, actions.onHandBack);
  const live = inspectedStep == null;
  const url = live ? session.url : inspectedStep.url;
  const drives = session.state === 'user';

  return (
    <section
      aria-label="Browser"
      className="flex h-full min-h-0 flex-col bg-surface-level-1"
    >
      <div className="flex min-w-0 items-center gap-space-1 border-b border-subtle py-space-2 pl-space-3 pr-space-2">
        <div
          className={cn(
            'flex h-7 min-w-0 flex-1 items-center gap-space-2 rounded-md px-space-2 text-xs',
            drives ? 'border border-input bg-input' : 'bg-surface-level-2'
          )}
        >
          <LockSimpleIcon
            size={12}
            className="shrink-0 text-icon-tertiary"
            aria-hidden="true"
          />
          {url ? (
            <UrlText url={url} />
          ) : (
            <span className="text-tertiary">about:blank</span>
          )}
          <TabCount session={session} />
        </div>
        <NewTabButton
          session={session}
          onOpenInNewTab={actions.onOpenInNewTab}
        />
        {/* You drive here, so the panel stays while you do. */}
        {!drives && (
          <IconButton
            icon={XIcon}
            label="Close browser panel"
            size="sm"
            variant="plain"
            color="secondary"
            onClick={onClose}
          />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-space-3 overflow-auto bg-surface-level-2 p-space-4">
        {!live && (
          <div className="flex items-center justify-between gap-space-2">
            <Text variant="xs" color="secondary">
              {inspectedStep.label} {inspectedStep.target}
            </Text>
            <Button
              size="xs"
              variant="outlined"
              color="secondary"
              onClick={() => onInspectedStepChange?.(null)}
            >
              Back to live
            </Button>
          </div>
        )}
        <ChatBrowserUseViewport
          frame={live ? session.frame : inspectedStep.frame}
          deviceSize={session.deviceSize}
          cursor={live ? session.cursor : undefined}
          interactive={live && drives}
          dim={
            live &&
            (session.state === 'reconnecting' || session.state === 'closed')
          }
          label={
            live
              ? 'Live browser'
              : `${inspectedStep.label} ${inspectedStep.target}`
          }
          className={cn(
            'rounded-md border shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.06)]',
            live && drives ? 'border-brand-strong' : 'border-subtle'
          )}
        >
          {live && <FrameNotice session={session} />}
        </ChatBrowserUseViewport>
      </div>
      <div
        className={cn(
          'flex min-w-0 items-center gap-space-3 border-t py-space-2 pl-space-3 pr-space-3',
          session.state === 'needs-you'
            ? 'border-warning bg-warning-subtle'
            : 'border-subtle'
        )}
      >
        {/* A pill with no visible fill (amber on the amber bar, or ended and
            closed) is pulled in by its padding, so its content sits 12px in. */}
        <ChatBrowserUseStatus
          state={session.state}
          className={cn(
            (session.state === 'needs-you' || !statusHasFill(session.state)) &&
              '-ml-space-2'
          )}
        />
        <Text variant="xs" color="secondary" className="min-w-0 flex-1">
          {session.state === 'needs-you'
            ? session.handoff?.reason
            : session.state === 'user'
              ? 'Hand back when you’re done'
              : session.state === 'ended'
                ? 'The agent closed the browser. The last frame stays here.'
                : footerLine(session)}
        </Text>
        <ControlAction session={session} actions={actions} size="sm" />
      </div>
    </section>
  );
}

// ---------- floating ----------

export interface ChatBrowserUseFloatingProps extends ChatBrowserUseActions {
  session: ChatBrowserUseSession;
  onClose: () => void;
  className?: string;
}

/**
 * The page floats over the chat at one size (400px), wide enough that a
 * handed-over page stays usable. The host positions it and keeps a 16px
 * gutter, so on small screens it fills the width.
 */
export function ChatBrowserUseFloating({
  session,
  onClose,
  className,
  ...actions
}: ChatBrowserUseFloatingProps) {
  useEscToHandBack(session.state, actions.onHandBack);
  const waiting = isWaiting(session.state);

  return (
    <section
      aria-label="Live browser"
      className={cn(
        'pointer-events-auto w-full max-w-[400px] overflow-hidden rounded-xl border bg-surface-level-1 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_12px_32px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.08)] transition-[border-color] duration-normal',
        borderForState(session.state),
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-space-2 py-space-1 pl-space-3 pr-space-1">
        <Favicon session={session} />
        <Text as="div" variant="xs" className="min-w-0 flex-1">
          {session.url ? (
            <span className="flex min-w-0 items-baseline">
              <UrlText url={session.url} showPath={false} />
              <TabCount session={session} />
            </span>
          ) : (
            <span className="text-tertiary">Starting…</span>
          )}
        </Text>
        <NewTabButton
          session={session}
          onOpenInNewTab={actions.onOpenInNewTab}
          size="xs"
        />
        {!waiting && (
          <IconButton
            icon={MinusIcon}
            label="Hide browser window"
            size="xs"
            variant="plain"
            color="secondary"
            onClick={onClose}
          />
        )}
      </div>
      <ChatBrowserUseViewport
        frame={session.frame}
        deviceSize={session.deviceSize}
        cursor={session.cursor}
        interactive={session.state === 'user'}
        dim={session.state === 'reconnecting' || session.state === 'closed'}
        label={session.title ?? 'Browser'}
        className="border-y border-subtle"
      >
        <FrameNotice session={session} />
      </ChatBrowserUseViewport>
      <div
        className={cn(
          'flex min-w-0 items-center gap-space-2 py-space-2 pl-space-3 pr-space-3',
          session.state === 'needs-you' && 'bg-warning-subtle'
        )}
      >
        <StepIconSlot session={session} />
        <Text variant="xs" color="secondary" className="min-w-0 flex-1">
          {session.state === 'needs-you'
            ? session.handoff?.reason
            : footerLine(session)}
        </Text>
        <ControlAction session={session} actions={actions} />
      </div>
    </section>
  );
}
