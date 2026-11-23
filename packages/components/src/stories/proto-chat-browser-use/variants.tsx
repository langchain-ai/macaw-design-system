// PROTOTYPE - throwaway. Nothing in production imports this folder.
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { ArrowsInSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsInSimple';
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { BrowserIcon } from '@phosphor-icons/react/dist/ssr/Browser';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { HandIcon } from '@phosphor-icons/react/dist/ssr/Hand';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { MinusIcon } from '@phosphor-icons/react/dist/ssr/Minus';
import { SidebarSimpleIcon } from '@phosphor-icons/react/dist/ssr/SidebarSimple';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { Button } from '../../components/Button';
import { ChatState } from '../../components/ChatState';
import { ChatToolCall, ChatToolCallGroup } from '../../components/ChatToolCall';
import { ChatToolCallCollapse } from '../../components/ChatToolCall/ChatToolCallCollapse';
import { CodeLite } from '../../components/Code/CodeLite';
import { IconButton } from '../../components/IconButton';
import { Text } from '../../components/Text';
import { cn } from '../../utils/cn';
import {
  type Controller,
  Favicon,
  formatClock,
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
      {controller === 'connecting' && (
        <ChatState
          variant="simple"
          status="streaming"
          showElapsed={false}
          announce={false}
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
  return `${pages} pages · ${actions} actions`;
}

// ---------- 1. Rows: extend ChatToolCall, no new surface ----------

export function VariantRows({ session, display }: VariantProps): VariantParts {
  useEscToHandBack(session);
  const handoffIndex = session.steps.findIndex((s) => s.action === 'handoff');
  const before =
    handoffIndex === -1 ? session.steps : session.steps.slice(0, handoffIndex);
  const handoff = handoffIndex === -1 ? null : session.steps[handoffIndex];
  const after =
    handoffIndex === -1 ? [] : session.steps.slice(handoffIndex + 1);
  const waiting =
    session.controller === 'needs-you' || session.controller === 'user';

  const group = (steps: StepState[], key: string, running: boolean) =>
    steps.length > 0 && (
      <ChatToolCallGroup
        key={key}
        label={`Browsed skylineair.com · ${steps.length} ${steps.length === 1 ? 'action' : 'actions'}`}
        defaultExpanded={display === 'expanded'}
        running={running}
      >
        {steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            showFrame={step.action === 'screenshot'}
          />
        ))}
      </ChatToolCallGroup>
    );

  return {
    inline: (
      <div className="flex min-w-0 flex-col gap-space-2">
        {group(before, 'before', !handoff && !session.done)}
        {handoff && (
          <ChatToolCall
            toolCall={{
              id: handoff.id,
              name: 'browser_handoff',
              status: handoff.status,
              elapsedMs: handoff.elapsedMs,
            }}
            icon={<HandIcon size={12} />}
            label={stepLabel(handoff)}
            summary={waiting ? null : handoff.target}
            meta={
              !waiting && handoff.elapsedMs
                ? formatClock(handoff.elapsedMs)
                : undefined
            }
            // The ask stays open while it waits; a resolved record follows the size.
            defaultExpanded={waiting || display === 'expanded'}
          >
            <div className="flex min-w-0 flex-col gap-space-3">
              <Text variant="xs" color="secondary">
                {waiting ? handoffCopy(session) : handoff.reason}
              </Text>
              {waiting && (
                <>
                  <Viewport
                    page={session.page}
                    interactive={session.controller === 'user'}
                    onSignIn={session.signIn}
                    label="Live browser"
                    className={cn(
                      'max-w-[520px] rounded-md border',
                      session.controller === 'user'
                        ? 'border-brand-strong'
                        : 'border-subtle'
                    )}
                  />
                  <div className="flex items-center gap-space-3">
                    <HandoffActions session={session} />
                    {session.controller === 'user' && (
                      <Text variant="xs" color="quaternary">
                        Esc also hands back
                      </Text>
                    )}
                  </div>
                </>
              )}
            </div>
          </ChatToolCall>
        )}
        {group(after, 'after', !session.done)}
      </div>
    ),
  };
}

// ---------- 2. Card: one session card, live viewport inline ----------

export function VariantCard({ session, display }: VariantProps): VariantParts {
  useEscToHandBack(session);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(display === 'minimized');
  const current = session.steps[session.steps.length - 1];
  const waiting =
    session.controller === 'needs-you' || session.controller === 'user';
  // A handoff always shows the page, whatever size the reader left the card at.
  const showViewport = !collapsed || waiting;

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
        <header className="flex min-w-0 items-center gap-space-2 px-space-3 py-space-2">
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
              icon={collapsed ? CaretDownIcon : CaretUpIcon}
              label={collapsed ? 'Show browser' : 'Hide browser'}
              aria-expanded={!collapsed}
              size="xs"
              variant="plain"
              color="secondary"
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
        </header>
        <div
          className={cn(
            'relative border-y border-subtle',
            !showViewport && 'hidden'
          )}
        >
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
          </Viewport>
        </div>
        <footer>
          <div className="flex min-w-0 items-center gap-space-2 px-space-3 py-space-2">
            <Button
              variant="plain"
              color="secondary"
              size="xs"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="min-w-0 flex-1 justify-start gap-space-2 px-space-1"
            >
              <span className="flex size-3 shrink-0 items-center text-icon-tertiary">
                {current && <StepIcon action={current.action} />}
              </span>
              <span className="min-w-0 truncate text-secondary">
                {session.done
                  ? `Done · ${sessionSummary(session)}`
                  : waiting
                    ? session.controller === 'user'
                      ? 'You’re driving. Esc hands back.'
                      : 'Paused until you sign in'
                    : current
                      ? `${stepLabel(current)} ${current.target}`
                      : 'Connecting…'}
              </span>
              <CaretRightIcon
                size={12}
                className={cn(
                  'shrink-0 text-icon-tertiary transition-transform duration-normal',
                  open && 'rotate-90'
                )}
                aria-hidden="true"
              />
            </Button>
            {session.controller === 'user' && (
              <HandoffActions session={session} size="xs" />
            )}
            {!waiting && (
              <Text
                variant="xs"
                color="quaternary"
                className="shrink-0 tabular-nums"
              >
                {session.steps.length > 0
                  ? `${session.steps.length} steps`
                  : ''}
              </Text>
            )}
          </div>
          <ChatToolCallCollapse
            open={open}
            className="flex flex-col gap-0.5 px-space-2 pb-space-2"
          >
            {session.steps.map((step) => (
              <StepRow key={step.id} step={step} />
            ))}
          </ChatToolCallCollapse>
        </footer>
      </section>
    ),
  };
}

// ---------- 3. Filmstrip: replay first, scrub frames by step ----------

export function VariantFilmstrip({
  session,
  display,
}: VariantProps): VariantParts {
  useEscToHandBack(session);
  const [selected, setSelected] = useState<number | null>(null); // null = live
  const [collapsed, setCollapsed] = useState(display === 'minimized');
  const stripRef = useRef<HTMLDivElement>(null);
  const steps = session.steps;
  const live = selected == null;
  const shown = live ? steps[steps.length - 1] : steps[selected];
  const waiting =
    session.controller === 'needs-you' || session.controller === 'user';

  useEffect(() => {
    if (!live) return;
    const strip = stripRef.current;
    strip?.scrollTo({ left: strip.scrollWidth, behavior: 'smooth' });
  }, [steps.length, live]);

  const move = (delta: number) => {
    const from = selected ?? steps.length - 1;
    const next = Math.min(steps.length - 1, Math.max(0, from + delta));
    setSelected(next === steps.length - 1 ? null : next);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      move(e.key === 'ArrowLeft' ? -1 : 1);
    }
  };

  return {
    inline: (
      <section
        aria-label="Browser session"
        className="flex min-w-0 max-w-[600px] flex-col gap-space-2"
      >
        <div className="flex min-w-0 items-center gap-space-2 px-space-1">
          <BrowserIcon
            size={12}
            className="shrink-0 text-icon-tertiary"
            aria-hidden="true"
          />
          <Text
            variant="xs"
            color="tertiary"
            className="min-w-0 flex-1 truncate"
          >
            {session.done
              ? `Browsed skylineair.com · ${sessionSummary(session)}`
              : 'Browsing skylineair.com'}
          </Text>
          <ControlPill controller={session.controller} />
          {!waiting && (
            <IconButton
              icon={collapsed ? CaretDownIcon : CaretUpIcon}
              label={collapsed ? 'Show frames' : 'Hide frames'}
              aria-expanded={!collapsed}
              size="xs"
              variant="plain"
              color="secondary"
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
        </div>
        <div className="overflow-hidden rounded-lg border border-subtle">
          <Viewport
            className={cn(collapsed && !waiting && 'hidden')}
            page={live ? session.page : (shown?.page ?? null)}
            cursor={live ? session.cursor : null}
            clickKey={session.clickKey}
            interactive={live && session.controller === 'user'}
            onSignIn={session.signIn}
            label={shown ? `${stepLabel(shown)} ${shown.target}` : 'Browser'}
          />
          <div className="flex min-w-0 items-center gap-space-2 border-t border-subtle px-space-3 py-space-2">
            {shown && (
              <span className="flex size-3 shrink-0 items-center text-icon-tertiary">
                <StepIcon action={shown.action} />
              </span>
            )}
            <Text as="div" variant="xs" className="min-w-0 flex-1">
              {shown ? (
                <span className="flex min-w-0 items-baseline gap-space-2">
                  <span
                    className={cn(
                      'shrink-0',
                      shown.error ? 'text-error-primary' : 'text-secondary'
                    )}
                  >
                    {stepLabel(shown)} {shown.target}
                  </span>
                  {shown.error && (
                    <span className="min-w-0 truncate text-error-secondary">
                      {shown.error}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-tertiary">Connecting…</span>
              )}
            </Text>
            {waiting && live ? (
              <HandoffActions session={session} size="xs" />
            ) : (
              !live && (
                <Button
                  size="xs"
                  variant="outlined"
                  color="secondary"
                  onClick={() => setSelected(null)}
                >
                  Back to live
                </Button>
              )
            )}
          </div>
        </div>
        {waiting && live && (
          <Text variant="xs" color="secondary" className="px-space-1">
            {handoffCopy(session)}
          </Text>
        )}
        <div
          className={cn(
            'flex min-w-0 items-center gap-space-1',
            collapsed && !waiting && 'hidden'
          )}
        >
          <IconButton
            icon={CaretLeftIcon}
            label="Previous step"
            size="sm"
            variant="plain"
            color="secondary"
            onClick={() => move(-1)}
            disabled={steps.length === 0 || selected === 0}
          />
          <div
            ref={stripRef}
            role="listbox"
            aria-label="Steps"
            aria-orientation="horizontal"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="flex min-w-0 flex-1 snap-x gap-space-2 overflow-x-auto scroll-smooth rounded-md p-0.5 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {steps.map((step, index) => {
              const isShown = live
                ? index === steps.length - 1
                : index === selected;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="option"
                  aria-selected={isShown}
                  tabIndex={-1}
                  onClick={() =>
                    setSelected(index === steps.length - 1 ? null : index)
                  }
                  title={`${stepLabel(step)} ${step.target}`}
                  className={cn(
                    'relative w-[88px] shrink-0 snap-start overflow-hidden rounded-md border text-left transition-[border-color,opacity] duration-fast active:scale-[0.97]',
                    isShown
                      ? 'border-primary'
                      : 'border-subtle opacity-70 hover:opacity-100',
                    step.status === 'input-required' && 'border-warning',
                    step.status === 'failed' && 'border-error'
                  )}
                >
                  <Viewport page={step.page} label="" />
                  <span className="flex items-center gap-space-1 px-space-1 py-0.5 text-xxs text-tertiary">
                    <span className="tabular-nums">{index + 1}</span>
                    <span className="flex size-3 items-center">
                      {step.status === 'failed' ? (
                        <WarningCircleIcon
                          size={11}
                          className="text-icon-error"
                        />
                      ) : (
                        <StepIcon action={step.action} size={11} />
                      )}
                    </span>
                    {index === steps.length - 1 && !session.done && (
                      <span
                        className="proto-live ml-auto size-1.5 rounded-full bg-success-strong"
                        aria-label="Live"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <IconButton
            icon={CaretRightIcon}
            label="Next step"
            size="sm"
            variant="plain"
            color="secondary"
            onClick={() => move(1)}
            disabled={live}
          />
        </div>
      </section>
    ),
  };
}

// ---------- 4. Panel: compact rows in chat, browser docked beside ----------

export function VariantPanel({ session, display }: VariantProps): VariantParts {
  useEscToHandBack(session);
  const [inspected, setInspected] = useState<string | null>(null);
  const [panelState, setPanelOpen] = useState(display === 'expanded');
  const step = inspected ? session.steps.find((s) => s.id === inspected) : null;
  const live = step == null;
  const url = live ? session.url : step.url;
  const waiting =
    session.controller === 'needs-you' || session.controller === 'user';
  const drives = session.controller === 'user';
  // Driving happens in the panel, so it stays open while the reader is in control.
  const panelOpen = panelState || drives;

  return {
    inline: (
      <div className="flex min-w-0 flex-col gap-space-2">
        <ChatToolCallGroup
          label={
            session.done
              ? `Browsed skylineair.com · ${sessionSummary(session)}`
              : 'Browsing skylineair.com'
          }
          defaultExpanded
          running={!session.done && !waiting}
        >
          {session.steps.map((s) => (
            <StepRow
              key={s.id}
              step={s}
              variant="simple"
              inspectLabel="Show in browser"
              onInspect={() => {
                setPanelOpen(true);
                setInspected(
                  s.id === session.steps[session.steps.length - 1]?.id
                    ? null
                    : s.id
                );
              }}
            />
          ))}
        </ChatToolCallGroup>
        {/* With the panel closed, the ask still lands in the transcript. */}
        {!panelOpen && session.controller === 'needs-you' ? (
          <div className="flex min-w-0 max-w-[560px] items-center gap-space-3 rounded-md border border-warning bg-warning-subtle px-space-3 py-space-2">
            <HandIcon
              size={14}
              className="shrink-0 text-icon-warning"
              aria-hidden="true"
            />
            <Text variant="xs" color="secondary" className="min-w-0 flex-1">
              {handoffCopy(session)}
            </Text>
            <Button
              size="xs"
              onClick={() => {
                setPanelOpen(true);
                session.takeControl();
              }}
            >
              Take control
            </Button>
          </div>
        ) : (
          !panelOpen && (
            <Button
              size="xs"
              variant="outlined"
              color="secondary"
              className="self-start"
              leftDecorator={SidebarSimpleIcon}
              onClick={() => setPanelOpen(true)}
            >
              Show browser
            </Button>
          )
        )}
      </div>
    ),
    aside: panelOpen && (
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
          <IconButton
            icon={ArrowSquareOutIcon}
            label="Open in new tab"
            size="sm"
            variant="plain"
            color="secondary"
            disabled={!session.url}
          />
          {!drives && (
            <IconButton
              icon={XIcon}
              label="Close browser panel"
              size="sm"
              variant="plain"
              color="secondary"
              onClick={() => setPanelOpen(false)}
            />
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-space-3 overflow-auto bg-surface-level-2 p-space-4">
          {!live && (
            <div className="flex items-center justify-between gap-space-2">
              <Text variant="xs" color="secondary">
                Step {step.index + 1}: {stepLabel(step)} {step.target}
              </Text>
              <Button
                size="xs"
                variant="outlined"
                color="secondary"
                onClick={() => setInspected(null)}
              >
                Back to live
              </Button>
            </div>
          )}
          <Viewport
            page={live ? session.page : step.page}
            cursor={live ? session.cursor : null}
            clickKey={session.clickKey}
            interactive={live && drives}
            onSignIn={session.signIn}
            label={live ? 'Live browser' : `Step ${step.index + 1}`}
            className={cn(
              'rounded-md border shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.06)]',
              live && drives ? 'border-brand-strong' : 'border-subtle'
            )}
          />
        </div>
        <div
          className={cn(
            'flex min-w-0 items-center gap-space-3 border-t px-space-3 py-space-3',
            session.controller === 'needs-you'
              ? 'border-warning bg-warning-subtle'
              : 'border-subtle'
          )}
        >
          <ControlPill controller={session.controller} />
          <Text variant="xs" color="secondary" className="min-w-0 flex-1">
            {waiting
              ? handoffCopy(session)
              : session.done
                ? 'The agent closed the browser. The last frame stays here.'
                : 'You can take over at any time.'}
          </Text>
          {waiting ? (
            <HandoffActions session={session} />
          ) : (
            !session.done && (
              <Button
                size="sm"
                variant="outlined"
                color="secondary"
                onClick={session.takeControl}
                disabled={session.controller === 'connecting'}
              >
                Take control
              </Button>
            )
          )}
        </div>
      </section>
    ),
  };
}

// ---------- 5. Ambient: status line in chat, floating mini viewport ----------

export function VariantAmbient({
  session,
  display,
}: VariantProps): VariantParts {
  useEscToHandBack(session);
  const [minimized, setMinimized] = useState(display === 'minimized');
  const [expanded, setExpanded] = useState(display === 'expanded');
  const waiting =
    session.controller === 'needs-you' || session.controller === 'user';
  const current = session.steps[session.steps.length - 1];
  const big = waiting || expanded;
  const showFloat = !session.done && (!minimized || waiting);

  return {
    inline: (
      <div className="flex min-w-0 flex-col gap-space-2">
        <button
          type="button"
          onClick={() => {
            setMinimized(false);
            setExpanded(true);
          }}
          className="group flex min-w-0 max-w-[560px] items-center gap-space-3 rounded-md px-space-1 py-space-1 text-left transition-colors duration-fast hover:bg-surface-level-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <span className="w-16 shrink-0 overflow-hidden rounded-[4px] border border-subtle">
            <Viewport page={session.page} label="" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Text
              as="span"
              variant="xs"
              weight="medium"
              color="secondary"
              className="truncate"
            >
              {session.done
                ? 'Browsed skylineair.com'
                : waiting
                  ? 'Waiting for you in the browser'
                  : current
                    ? `${stepLabel(current)} ${current.target}`
                    : 'Starting a browser'}
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
          <ControlPill controller={session.controller} />
        </button>
        {session.done && (
          <div className="flex gap-space-2 pl-space-1">
            {session.steps
              .filter((s) => s.action === 'screenshot')
              .map((s) => (
                <figure
                  key={s.id}
                  className="m-0 w-[180px] overflow-hidden rounded-md border border-subtle"
                >
                  <Viewport page={s.page} label={`Screenshot: ${s.target}`} />
                  <figcaption className="px-space-2 py-space-1 text-xxs text-tertiary">
                    {s.target}
                  </figcaption>
                </figure>
              ))}
          </div>
        )}
      </div>
    ),
    overlay: showFloat ? (
      <section
        aria-label="Live browser"
        className={cn(
          'pointer-events-auto overflow-hidden rounded-xl border bg-surface-level-1 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_12px_32px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.08)] transition-[width,border-color] duration-slow ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
          big ? 'w-[min(520px,calc(100vw-48px))]' : 'w-[280px]',
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
              <UrlText url={session.url} showPath={big} />
            ) : (
              <span className="text-tertiary">Starting…</span>
            )}
          </Text>
          {!waiting && (
            <>
              <IconButton
                icon={expanded ? ArrowsInSimpleIcon : ArrowsOutSimpleIcon}
                label={expanded ? 'Shrink' : 'Enlarge'}
                size="xs"
                variant="plain"
                color="secondary"
                onClick={() => setExpanded(!expanded)}
              />
              <IconButton
                icon={MinusIcon}
                label="Minimize to chat"
                size="xs"
                variant="plain"
                color="secondary"
                onClick={() => {
                  setMinimized(true);
                  setExpanded(false);
                }}
              />
            </>
          )}
        </div>
        <Viewport
          page={session.page}
          cursor={session.cursor}
          clickKey={session.clickKey}
          interactive={session.controller === 'user'}
          onSignIn={session.signIn}
          label={session.title ?? 'Browser'}
          className="border-t border-subtle"
        />
        {waiting && (
          <div className="flex flex-col gap-space-3 border-t border-subtle p-space-3">
            <div className="flex items-start gap-space-2">
              <HandIcon
                size={14}
                className="mt-0.5 shrink-0 text-icon-warning"
                aria-hidden="true"
              />
              <Text variant="xs" color="secondary">
                {handoffCopy(session)}
              </Text>
            </div>
            <div className="flex items-center justify-end gap-space-3">
              {session.controller === 'user' && (
                <Text variant="xs" color="quaternary">
                  Esc hands back
                </Text>
              )}
              <HandoffActions session={session} />
            </div>
          </div>
        )}
      </section>
    ) : null,
  };
}
