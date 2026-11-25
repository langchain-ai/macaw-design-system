// PROTOTYPE - throwaway. Nothing in production imports this folder.
import { type ReactNode, useEffect, useState } from 'react';

import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { HandIcon } from '@phosphor-icons/react/dist/ssr/Hand';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { MinusIcon } from '@phosphor-icons/react/dist/ssr/Minus';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { Button } from '../../components/Button';
import { ChatToolCall } from '../../components/ChatToolCall';
import { ChatToolCallCollapse } from '../../components/ChatToolCall/ChatToolCallCollapse';
import { ChatToolCallGroupContext } from '../../components/ChatToolCall/ChatToolCallGroupContext';
import { CodeLite } from '../../components/Code/CodeLite';
import { IconButton } from '../../components/IconButton';
import { Text } from '../../components/Text';
import { cn } from '../../utils/cn';
import {
  type Controller,
  Favicon,
  type Session,
  type StepState,
  StepIcon,
  stepLabel,
  UrlText,
  Viewport,
} from './shared';

/** Harness-level size: the variant's own collapsed or open presentation. */
export type Display = 'minimized' | 'expanded';

interface VariantProps {
  session: Session;
  display: Display;
}

export interface VariantParts {
  inline: ReactNode;
  aside?: ReactNode;
  overlay?: ReactNode;
}

// ---------- shared pieces ----------

const CONTROL_COPY: Record<Controller, string> = {
  connecting: 'Connecting',
  agent: 'Agent browsing',
  'needs-you': 'Needs you',
  user: 'You’re in control',
  ended: 'Session ended',
};

/** One place that says who drives. Icon + text + color, announced politely. */
function ControlPill({
  controller,
  className,
}: {
  controller: Controller;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-space-1 rounded-full px-space-2 text-xxs font-medium',
        controller === 'needs-you' && 'bg-warning-subtle text-warning-primary',
        controller === 'user' && 'bg-brand-subtle text-brand-primary',
        (controller === 'agent' || controller === 'connecting') &&
          'bg-surface-level-2 text-secondary',
        controller === 'ended' && 'text-tertiary',
        className
      )}
    >
      {controller === 'agent' && (
        <span
          aria-hidden="true"
          className="proto-live size-1.5 rounded-full bg-success-strong"
        />
      )}
      {/* Static: the message header already shows the thinking indicator. */}
      {controller === 'connecting' && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full border border-current text-icon-tertiary"
        />
      )}
      {controller === 'needs-you' && <HandIcon size={12} aria-hidden="true" />}
      {controller === 'user' && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-brand-primary"
        />
      )}
      {CONTROL_COPY[controller]}
    </span>
  );
}

function StepDetails({
  step,
  showFrame = false,
}: {
  step: StepState;
  showFrame?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-space-2">
      <Text
        as="div"
        variant="xs"
        className="flex min-w-0 items-center gap-space-2"
      >
        <Favicon />
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
      {showFrame && (
        <Viewport
          page={step.page}
          label={`Screenshot after: ${step.verb} ${step.target}`}
          className="max-w-[360px] rounded-md border border-subtle"
        />
      )}
      <CodeLite
        language="typescript"
        value={step.code}
        className="text-xxs"
        showGutter={false}
        wrapLines
      />
    </div>
  );
}

function StepRow({
  step,
  variant = 'default',
  onInspect,
  inspectLabel,
  showFrame,
}: {
  step: StepState;
  variant?: 'default' | 'simple';
  onInspect?: () => void;
  inspectLabel?: string;
  showFrame?: boolean;
}) {
  return (
    <ChatToolCall
      toolCall={{
        id: step.id,
        name: 'browser_run',
        status: step.status,
        elapsedMs: step.elapsedMs,
        error: step.error,
      }}
      variant={variant}
      onInspect={onInspect}
      inspectLabel={inspectLabel}
      icon={<StepIcon action={step.action} />}
      label={
        variant === 'simple'
          ? `${stepLabel(step)} ${step.target}`
          : stepLabel(step)
      }
      summary={step.target}
    >
      <StepDetails step={step} showFrame={showFrame} />
    </ChatToolCall>
  );
}

function HandoffActions({
  session,
  size = 'sm',
}: {
  session: Session;
  size?: 'xs' | 'sm';
}) {
  if (session.controller === 'needs-you') {
    return (
      <Button size={size} onClick={session.takeControl}>
        Take control
      </Button>
    );
  }
  if (session.controller === 'user') {
    return (
      <Button size={size} onClick={session.handBack}>
        Hand back to agent
      </Button>
    );
  }
  return null;
}

/** Esc hands back while the user drives, so the viewport never traps focus. */
function useEscToHandBack(session: Session) {
  useEffect(() => {
    if (session.controller !== 'user') return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') session.handBack();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [session]);
}

function handoffCopy(session: Session) {
  const step = session.steps.find((s) => s.action === 'handoff');
  if (session.controller === 'user') {
    return session.signedIn
      ? 'Signed in. Hand back and I’ll hold the fare.'
      : 'Sign in on the page. The agent waits until you hand back.';
  }
  return step?.reason ?? '';
}

function sessionSummary(session: Session) {
  const actions = session.steps.filter((s) => s.action !== 'handoff').length;
  const pages = new Set(session.steps.map((s) => s.url)).size;
  return `${actions} actions on ${pages} pages`;
}

function isWaiting(session: Session) {
  return session.controller === 'needs-you' || session.controller === 'user';
}

function rowTitle(session: Session) {
  const current = session.steps[session.steps.length - 1];
  if (session.done) return 'Browsed skylineair.com';
  if (session.controller === 'needs-you')
    return 'The agent needs you to sign in';
  if (session.controller === 'user') return 'You’re driving the browser';
  if (current) return `${stepLabel(current)} ${current.target}`;
  return 'Starting a browser';
}

// ---------- session row: the one minimized view every placement shares ----------

/**
 * Live thumbnail + current step + URL + who drives. The thumbnail and the
 * live dot are what tell a reader the agent is working, which plain tool
 * rows did not (round 1, Rows). The whole row is one stretched button;
 * trailing actions sit above it so they stay separately clickable.
 */
function SessionRow({
  session,
  onOpen,
  openLabel,
  selected = false,
  expanded,
  actions,
}: {
  session: Session;
  onOpen: () => void;
  openLabel: string;
  selected?: boolean;
  /** Whether the live view this row opens is showing. */
  expanded?: boolean;
  actions?: ReactNode;
}) {
  const needsYou = session.controller === 'needs-you';
  return (
    <div
      className={cn(
        // 8px from the thumbnail to the text. The right edge sits 12px from
        // what's visible: pr-space-3 to a button, or pr-space-2 plus the
        // caret button's own 4px inset.
        'relative flex min-w-0 max-w-[560px] items-center gap-space-2 rounded-lg border py-space-2 pl-space-2 transition-colors duration-fast',
        needsYou ? 'pr-space-3' : 'pr-space-2',
        needsYou
          ? 'border-warning bg-warning-subtle'
          : selected
            ? 'border-primary'
            : 'border-subtle hover:bg-surface-level-2'
      )}
    >
      <button
        type="button"
        aria-label={`${openLabel}: ${rowTitle(session)}`}
        aria-expanded={expanded}
        onClick={onOpen}
        className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      />
      {/* Both slots are 40px tall so swapping them never moves the row.
          The thumbnail shows the agent working while the page is hidden.
          Once the page is showing elsewhere it would only repeat it, so the
          row keeps just the site's identity. */}
      {selected ? (
        <span className="pointer-events-none flex size-10 shrink-0 items-center justify-center rounded-md border border-subtle bg-surface-level-2">
          {session.url ? (
            <Favicon className="size-5 rounded-[4px] text-[11px]" />
          ) : (
            <GlobeIcon
              size={16}
              className="text-icon-tertiary"
              aria-hidden="true"
            />
          )}
        </span>
      ) : (
        <span className="pointer-events-none relative h-10 w-16 shrink-0 overflow-hidden rounded-[4px] border border-subtle">
          <Viewport page={session.page} label="" />
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
          {rowTitle(session)}
        </Text>
        <Text as="span" variant="xs" color="tertiary" className="truncate">
          {session.done ? (
            sessionSummary(session)
          ) : session.url ? (
            <UrlText url={session.url} />
          ) : (
            'Connecting…'
          )}
        </Text>
      </span>
      {actions ? (
        <span className="relative z-[1] ml-space-1 flex shrink-0 items-center gap-space-2">
          {actions}
        </span>
      ) : (
        <ControlPill
          controller={session.controller}
          className="pointer-events-none"
        />
      )}
    </div>
  );
}

/** Expandable list of steps; shared by Card's footer and Panel's row. */
const SESSION_GROUP = { update: () => {}, remove: () => {} };

function StepList({
  session,
  open,
  onInspect,
}: {
  session: Session;
  open: boolean;
  onInspect?: (step: StepState) => void;
}) {
  // The session's control pill already says the agent is working, the way a
  // group header does, so rows drop their own 16px running indicator.
  return (
    <ChatToolCallGroupContext.Provider value={SESSION_GROUP}>
      <ChatToolCallCollapse open={open} className="flex flex-col gap-0.5">
        {session.steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            variant={onInspect ? 'simple' : 'default'}
            inspectLabel={onInspect ? 'Show in browser' : undefined}
            onInspect={onInspect ? () => onInspect(step) : undefined}
          />
        ))}
      </ChatToolCallCollapse>
    </ChatToolCallGroupContext.Provider>
  );
}

function StepsToggle({
  session,
  open,
  onToggle,
}: {
  session: Session;
  open: boolean;
  onToggle: () => void;
}) {
  if (session.steps.length === 0) return null;
  // Caret only: the count didn't help anyone decide anything.
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

// ---------- consumer-owned options ----------

/**
 * Where the live page lives. Hosts pick one, because some can't add a panel.
 * The page has exactly one home, and each home is either showing or hidden.
 */
export type Placement = 'card' | 'panel' | 'floating';

/**
 * Stands in for the host's new-tab target (the bare live view or the
 * LangSmith Sandboxes page). The host decides, so the button only renders
 * when the host passes a handler.
 */
function openInNewTab(session: Session) {
  const tab = window.open('', '_blank');
  if (!tab) return;
  tab.document.title = 'LangSmith sandbox browser';
  const note = tab.document.createElement('p');
  note.textContent = `Prototype placeholder. The host opens its chosen live view for ${session.url ?? 'this session'} here.`;
  note.style.cssText =
    'font: 14px -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; color: #333';
  tab.document.body.append(note);
}

// ---------- shared controls ----------

/**
 * Always available while the agent works, so it stays quiet. The loud
 * version is reserved for when the agent asks for you.
 */
function TakeControlButton({
  session,
  size = 'xs',
}: {
  session: Session;
  size?: 'xs' | 'sm';
}) {
  return (
    <Button
      size={size}
      variant="plain"
      color="secondary"
      leftDecorator={HandIcon}
      onClick={session.takeControl}
      // A plain button's fill only shows on hover, so pull it out by its own
      // padding: the visible icon and label then end 12px from the edge,
      // like the content on the left.
      className="-mr-space-2 shrink-0"
    >
      Take control
    </Button>
  );
}

/** Trailing action for any footer or control bar, by who drives. */
function ControlAction({
  session,
  size = 'xs',
}: {
  session: Session;
  size?: 'xs' | 'sm';
}) {
  if (isWaiting(session))
    return <HandoffActions session={session} size={size} />;
  if (session.controller === 'agent')
    return <TakeControlButton session={session} size={size} />;
  return null;
}

function footerCopy(session: Session) {
  const current = session.steps[session.steps.length - 1];
  if (session.controller === 'user') return 'Press Esc to hand back control';
  if (session.controller === 'needs-you') return 'Paused until you sign in';
  if (current) return `${stepLabel(current)} ${current.target}`;
  return 'Connecting…';
}

/**
 * Hover or focus reveals the host's new-tab action. A click on the page does
 * nothing, so nobody pauses the agent or leaves the chat by accident.
 */
function ViewActions({
  session,
  onOpenInNewTab,
}: {
  session: Session;
  onOpenInNewTab?: () => void;
}) {
  if (!onOpenInNewTab) return null;
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
        <IconButton
          icon={ArrowSquareOutIcon}
          label="Open in new tab"
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={!session.url}
          onClick={onOpenInNewTab}
        />
      </div>
    </>
  );
}

function StepIconSlot({ session }: { session: Session }) {
  const current = session.steps[session.steps.length - 1];
  // No step yet, no slot: the text starts at the left edge instead of after
  // an empty 12px gap.
  if (!current) return null;
  return (
    <span className="flex size-3 shrink-0 items-center justify-center text-icon-tertiary">
      <StepIcon action={current.action} />
    </span>
  );
}

// ---------- the page's homes beside the chat ----------

function BrowserPanel({
  session,
  inspected,
  onInspect,
  onClose,
  onOpenInNewTab,
}: {
  session: Session;
  inspected: StepState | null;
  onInspect: (step: StepState | null) => void;
  onClose: () => void;
  onOpenInNewTab?: () => void;
}) {
  const live = inspected == null;
  const url = live ? session.url : inspected.url;
  const drives = session.controller === 'user';
  return (
    <section
      aria-label="Browser"
      className="flex h-full min-h-0 flex-col bg-surface-level-1"
    >
      <div className="flex min-w-0 items-center gap-space-1 border-b border-subtle px-space-2 py-space-2">
        <IconButton
          icon={ArrowLeftIcon}
          label="Back"
          size="sm"
          variant="plain"
          color="secondary"
          disabled={!drives}
        />
        <IconButton
          icon={ArrowRightIcon}
          label="Forward"
          size="sm"
          variant="plain"
          color="secondary"
          disabled={!drives}
        />
        <IconButton
          icon={ArrowClockwiseIcon}
          label="Reload"
          size="sm"
          variant="plain"
          color="secondary"
          disabled={!drives}
        />
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
        </div>
        {onOpenInNewTab && (
          <IconButton
            icon={ArrowSquareOutIcon}
            label="Open in new tab"
            size="sm"
            variant="plain"
            color="secondary"
            disabled={!session.url}
            onClick={onOpenInNewTab}
          />
        )}
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
              Step {inspected.index + 1}: {stepLabel(inspected)}{' '}
              {inspected.target}
            </Text>
            <Button
              size="xs"
              variant="outlined"
              color="secondary"
              onClick={() => onInspect(null)}
            >
              Back to live
            </Button>
          </div>
        )}
        <Viewport
          page={live ? session.page : inspected.page}
          cursor={live ? session.cursor : null}
          clickKey={session.clickKey}
          interactive={live && drives}
          onSignIn={session.signIn}
          label={live ? 'Live browser' : `Step ${inspected.index + 1}`}
          className={cn(
            'rounded-md border shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.06)]',
            live && drives ? 'border-brand-strong' : 'border-subtle'
          )}
        />
      </div>
      <div
        className={cn(
          'flex min-w-0 items-center gap-space-3 border-t py-space-2 pl-space-3 pr-space-3',
          session.controller === 'needs-you'
            ? 'border-warning bg-warning-subtle'
            : 'border-subtle'
        )}
      >
        {/* When the pill has no visible fill (it matches the amber bar, or
            ended has none), pull it in by its own padding so its icon sits
            12px in, mirroring the button on the right. */}
        <ControlPill
          controller={session.controller}
          className={cn(
            (session.controller === 'needs-you' ||
              session.controller === 'ended') &&
              '-ml-space-2'
          )}
        />
        <Text variant="xs" color="secondary" className="min-w-0 flex-1">
          {isWaiting(session)
            ? handoffCopy(session)
            : session.done
              ? 'The agent closed the browser. The last frame stays here.'
              : footerCopy(session)}
        </Text>
        <ControlAction session={session} size="sm" />
      </div>
    </section>
  );
}

/** One size, wide enough that a handed-over page stays usable. */
const FLOAT_WIDTH = 'w-[min(400px,calc(100vw-48px))]';

function BrowserFloating({
  session,
  onMinimize,
  onOpenInNewTab,
}: {
  session: Session;
  onMinimize: () => void;
  onOpenInNewTab?: () => void;
}) {
  const waiting = isWaiting(session);
  return (
    <section
      aria-label="Live browser"
      className={cn(
        'pointer-events-auto overflow-hidden rounded-xl border bg-surface-level-1 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_12px_32px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.08)] transition-[border-color] duration-normal',
        FLOAT_WIDTH,
        session.controller === 'needs-you'
          ? 'border-warning'
          : session.controller === 'user'
            ? 'border-brand-strong'
            : 'border-subtle'
      )}
    >
      <div className="flex min-w-0 items-center gap-space-2 py-space-1 pl-space-3 pr-space-1">
        <Favicon />
        <Text as="div" variant="xs" className="min-w-0 flex-1">
          {session.url ? (
            <UrlText url={session.url} showPath={false} />
          ) : (
            <span className="text-tertiary">Starting…</span>
          )}
        </Text>
        {onOpenInNewTab && (
          <IconButton
            icon={ArrowSquareOutIcon}
            label="Open in new tab"
            size="xs"
            variant="plain"
            color="secondary"
            disabled={!session.url}
            onClick={onOpenInNewTab}
          />
        )}
        {!waiting && (
          <IconButton
            icon={MinusIcon}
            label="Hide browser window"
            size="xs"
            variant="plain"
            color="secondary"
            onClick={onMinimize}
          />
        )}
      </div>
      <Viewport
        page={session.page}
        cursor={session.cursor}
        clickKey={session.clickKey}
        interactive={session.controller === 'user'}
        onSignIn={session.signIn}
        label={session.title ?? 'Browser'}
        className="border-y border-subtle"
      />
      <div
        className={cn(
          'flex min-w-0 items-center gap-space-2 py-space-2 pl-space-3 pr-space-3',
          session.controller === 'needs-you' && 'bg-warning-subtle'
        )}
      >
        <StepIconSlot session={session} />
        <Text variant="xs" color="secondary" className="min-w-0 flex-1">
          {session.controller === 'needs-you'
            ? handoffCopy(session)
            : footerCopy(session)}
        </Text>
        <ControlAction session={session} />
      </div>
    </section>
  );
}

/**
 * The row plus its step list. Clicking the row shows or hides the page's
 * home. When the agent needs you, the pill becomes the ask.
 */
function SessionBlock({
  session,
  open,
  openLabel,
  onToggleOpen,
  onTakeControl,
  onInspect,
}: {
  session: Session;
  open: boolean;
  openLabel: string;
  onToggleOpen: () => void;
  onTakeControl: () => void;
  onInspect?: (step: StepState) => void;
}) {
  const [stepsOpen, setStepsOpen] = useState(false);
  return (
    <div className="flex min-w-0 max-w-[560px] flex-col gap-space-1">
      <SessionRow
        session={session}
        openLabel={openLabel}
        selected={open}
        expanded={open}
        onOpen={onToggleOpen}
        actions={
          session.controller === 'needs-you' ? (
            <Button size="xs" onClick={onTakeControl}>
              Take control
            </Button>
          ) : (
            <>
              <ControlPill controller={session.controller} />
              <StepsToggle
                session={session}
                open={stepsOpen}
                onToggle={() => setStepsOpen(!stepsOpen)}
              />
            </>
          )
        }
      />
      <div className="pl-space-1">
        <StepList session={session} open={stepsOpen} onInspect={onInspect} />
      </div>
    </div>
  );
}

// ---------- 1. Card: the page lives inline ----------

export function VariantCard({ session, display }: VariantProps): VariantParts {
  useEscToHandBack(session);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(display === 'minimized');
  const waiting = isWaiting(session);
  const newTab = () => openInNewTab(session);

  // A handoff always shows the page, whatever size the reader left it at.
  if (collapsed && !waiting) {
    return {
      inline: (
        <SessionBlock
          session={session}
          open={false}
          openLabel="Show browser"
          onToggleOpen={() => setCollapsed(false)}
          onTakeControl={() => {
            setCollapsed(false);
            session.takeControl();
          }}
        />
      ),
    };
  }

  return {
    inline: (
      <section
        aria-label="Browser session"
        className={cn(
          'min-w-0 max-w-[560px] overflow-hidden rounded-lg border bg-surface-level-1 transition-[border-color] duration-normal',
          session.controller === 'needs-you'
            ? 'border-warning'
            : session.controller === 'user'
              ? 'border-brand-strong'
              : 'border-subtle'
        )}
      >
        <header className="flex min-w-0 items-center gap-space-2 py-space-2 pl-space-3 pr-space-2">
          <Favicon />
          <Text as="div" variant="xs" className="min-w-0 flex-1">
            {session.url ? (
              <UrlText url={session.url} showPath={false} />
            ) : (
              <span className="text-tertiary">Starting browser…</span>
            )}
          </Text>
          <ControlPill controller={session.controller} />
          {!waiting && (
            <IconButton
              icon={MinusIcon}
              label="Minimize browser"
              size="xs"
              variant="plain"
              color="secondary"
              onClick={() => setCollapsed(true)}
            />
          )}
        </header>
        <div className="group/view relative border-y border-subtle">
          <Viewport
            page={session.page}
            cursor={session.cursor}
            clickKey={session.clickKey}
            interactive={session.controller === 'user'}
            onSignIn={session.signIn}
            dim={session.controller === 'needs-you'}
            label={session.title ?? 'Browser'}
          >
            {session.controller === 'needs-you' && (
              <div className="absolute inset-0 flex items-center justify-center p-space-4">
                <div className="flex max-w-[340px] flex-col items-start gap-space-3 rounded-lg bg-surface-level-1 p-space-4 shadow-[0_8px_24px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.08)]">
                  <Text variant="sm" weight="medium">
                    The agent needs you to sign in
                  </Text>
                  <Text variant="xs" color="secondary">
                    {handoffCopy(session)}
                  </Text>
                  <HandoffActions session={session} />
                </div>
              </div>
            )}
            {!waiting && (
              <ViewActions session={session} onOpenInNewTab={newTab} />
            )}
          </Viewport>
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
                {footerCopy(session)}
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
                {session.done && (
                  <span className="shrink-0 font-medium text-secondary">
                    Done
                  </span>
                )}
                <span
                  className={cn(
                    'min-w-0 truncate',
                    session.done ? 'text-tertiary' : 'text-secondary'
                  )}
                >
                  {session.done ? sessionSummary(session) : footerCopy(session)}
                </span>
                <CaretRightIcon
                  size={12}
                  className={cn(
                    'shrink-0 text-icon-tertiary transition-transform duration-normal ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                    stepsOpen && 'rotate-90'
                  )}
                  aria-hidden="true"
                />
              </Button>
            )}
            {/* The overlay owns the ask while the agent waits for you. */}
            {session.controller !== 'needs-you' && (
              <ControlAction session={session} />
            )}
          </div>
          <div className={cn(stepsOpen && 'pb-space-1')}>
            <StepList session={session} open={stepsOpen} />
          </div>
        </footer>
      </section>
    ),
  };
}

// ---------- 2 and 3. Panel and Floating: the page lives beside the chat ----------

export function VariantDocked({
  session,
  display,
  placement,
}: VariantProps & { placement: 'panel' | 'floating' }): VariantParts {
  useEscToHandBack(session);
  const [open, setOpen] = useState(display === 'expanded');
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const inspected =
    session.steps.find((step) => step.id === inspectedId) ?? null;
  const drives = session.controller === 'user';
  // You drive in the page's home, so it can't be hidden while you do.
  const shown = open || drives;
  const newTab = () => openInNewTab(session);
  const where = placement === 'panel' ? 'browser panel' : 'browser window';

  return {
    inline: (
      <SessionBlock
        session={session}
        open={shown}
        openLabel={shown ? `Hide ${where}` : `Show ${where}`}
        onToggleOpen={() => {
          if (drives) return;
          setInspectedId(null);
          setOpen(!shown);
        }}
        onTakeControl={() => {
          setOpen(true);
          session.takeControl();
        }}
        onInspect={
          placement === 'panel'
            ? (step) => {
                setOpen(true);
                setInspectedId(
                  step.id === session.steps[session.steps.length - 1]?.id
                    ? null
                    : step.id
                );
              }
            : undefined
        }
      />
    ),
    aside:
      placement === 'panel' && shown ? (
        <BrowserPanel
          session={session}
          inspected={inspected}
          onInspect={(step) => setInspectedId(step?.id ?? null)}
          onClose={() => setOpen(false)}
          onOpenInNewTab={newTab}
        />
      ) : undefined,
    overlay:
      placement === 'floating' && shown ? (
        <BrowserFloating
          session={session}
          onMinimize={() => setOpen(false)}
          onOpenInNewTab={newTab}
        />
      ) : undefined,
  };
}
