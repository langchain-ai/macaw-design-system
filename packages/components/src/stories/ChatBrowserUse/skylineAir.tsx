// POC fixture - a scripted browser session on a fictional airline site.
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { ChatToolCallStatus } from '../../components/ChatToolCall';
import type {
  ChatBrowserUseAction,
  ChatBrowserUseActions,
  ChatBrowserUseSession,
  ChatBrowserUseState,
  ChatBrowserUseStep,
} from './ChatBrowserUse';

const PAGE_W = 1280;
const PAGE_H = 800;

type PageId =
  | 'home'
  | 'home-filled'
  | 'results'
  | 'results-refundable'
  | 'signin'
  | 'signin-done'
  | 'held';

interface StepDef {
  id: string;
  action: ChatBrowserUseAction;
  verb: string;
  verbIng: string;
  target: string;
  url: string;
  page: PageId;
  title: string;
  /** Click target in 1280x800 page pixels. */
  cursor?: { x: number; y: number };
  ms: number;
  error?: string;
  code: string;
  reason?: string;
}

const HOME = 'https://www.skylineair.com/en-us';
const RESULTS =
  'https://www.skylineair.com/en-us/fsr/choose-flights?f=JFK&t=SFO&d=2026-12-18&tt=1&sc=7&px=1&taxng=1&clm=7&st=bestmatches&fareWheel=False';
const SIGNIN =
  'https://accounts.skylineair.com/login?return_to=%2Fen-us%2Fbook%2Freview%3Fflight%3DSK1824%26fare%3DREF-MAIN';
const HOLD =
  'https://www.skylineair.com/en-us/book/hold/confirmation?pnr=QX7K2M&exp=2026-12-19T07%3A05';

const STEPS: StepDef[] = [
  {
    id: 's1',
    action: 'navigate',
    verb: 'Opened',
    verbIng: 'Opening',
    target: 'skylineair.com',
    url: HOME,
    page: 'home',
    title: 'Skyline Air - Book flights, hotels and cars',
    ms: 1400,
    code: `await page.goto("${HOME}")`,
  },
  {
    id: 's2',
    action: 'type',
    verb: 'Filled',
    verbIng: 'Filling',
    target: 'JFK to SFO, Thu Dec 18',
    url: HOME,
    page: 'home-filled',
    title: 'Skyline Air - Book flights, hotels and cars',
    cursor: { x: 470, y: 392 },
    ms: 1600,
    code: `await page.getByLabel("From").fill("JFK")\nawait page.getByLabel("To").fill("SFO")\nawait page.getByLabel("Depart").fill("12/18/2026")`,
  },
  {
    id: 's3',
    action: 'click',
    verb: 'Clicked',
    verbIng: 'Clicking',
    target: 'Find flights',
    url: RESULTS,
    page: 'results',
    title:
      'Choose flights: New York (JFK) to San Francisco (SFO) | Skyline Air',
    cursor: { x: 1086, y: 392 },
    ms: 1500,
    code: `await page.getByRole("button", { name: "Find flights" }).click()`,
  },
  {
    id: 's4',
    action: 'click',
    verb: 'Clicked',
    verbIng: 'Clicking',
    target: 'Refundable',
    url: RESULTS,
    page: 'results',
    title:
      'Choose flights: New York (JFK) to San Francisco (SFO) | Skyline Air',
    cursor: { x: 150, y: 312 },
    ms: 1900,
    error:
      'Timed out after 5,000ms waiting for locator("[data-test=fare-filter-refundable]")',
    code: `await page.locator("[data-test=fare-filter-refundable]").click()`,
  },
  {
    id: 's5',
    action: 'read',
    verb: 'Read',
    verbIng: 'Reading',
    target: 'the results page',
    url: RESULTS,
    page: 'results',
    title:
      'Choose flights: New York (JFK) to San Francisco (SFO) | Skyline Air',
    ms: 1100,
    code: `await browser.snapshot({ includeIframes: false })`,
  },
  {
    id: 's6',
    action: 'click',
    verb: 'Clicked',
    verbIng: 'Clicking',
    target: 'Refundable fares only',
    url: RESULTS,
    page: 'results-refundable',
    title:
      'Choose flights: New York (JFK) to San Francisco (SFO) | Skyline Air',
    cursor: { x: 66, y: 296 },
    ms: 1300,
    code: `await page.getByRole("checkbox", { name: "Refundable fares only" }).check()`,
  },
  {
    id: 's7',
    action: 'screenshot',
    verb: 'Captured',
    verbIng: 'Capturing',
    target: '3 refundable flights',
    url: RESULTS,
    page: 'results-refundable',
    title:
      'Choose flights: New York (JFK) to San Francisco (SFO) | Skyline Air',
    ms: 700,
    code: `await browser.screenshot({ type: "png" })`,
  },
  {
    id: 's8',
    action: 'click',
    verb: 'Selected',
    verbIng: 'Selecting',
    target: 'SK 1824, 7:05 AM, $368',
    url: SIGNIN,
    page: 'signin',
    title: 'Sign in to Skyline Air',
    cursor: { x: 1150, y: 300 },
    ms: 1300,
    code: `await page.getByRole("row", { name: /SK 1824/ }).getByRole("button", { name: "Select" }).click()`,
  },
  {
    id: 's9',
    action: 'handoff',
    verb: 'You signed in',
    verbIng: 'Waiting for you to sign in',
    target: 'to Skyline Air',
    url: SIGNIN,
    page: 'signin',
    title: 'Sign in to Skyline Air',
    ms: 0,
    reason:
      'Skyline Air needs your password and the code it texts to your phone. I can’t enter those for you.',
    code: `await browser.handoff({ reason: "Sign in to Skyline Air" })`,
  },
  {
    id: 's10',
    action: 'click',
    verb: 'Clicked',
    verbIng: 'Clicking',
    target: 'Hold this fare for 24 hours',
    url: HOLD,
    page: 'held',
    title: 'Fare on hold - QX7K2M | Skyline Air',
    cursor: { x: 640, y: 560 },
    ms: 1500,
    code: `await page.getByRole("button", { name: "Hold this fare for 24 hours" }).click()`,
  },
  {
    id: 's11',
    action: 'screenshot',
    verb: 'Captured',
    verbIng: 'Capturing',
    target: 'the hold confirmation',
    url: HOLD,
    page: 'held',
    title: 'Fare on hold - QX7K2M | Skyline Air',
    ms: 700,
    code: `await browser.screenshot({ type: "png" })`,
  },
];

export const QUESTION =
  'Find me a refundable nonstop from JFK to SFO on Dec 18, morning, under $400, and hold it. I’m flying Skyline so use my account.';
export const INTRO =
  'I’ll search Skyline Air for refundable morning nonstops on Thursday, December 18.';
export const ANSWER = [
  'Held SK 1824, JFK 7:05 AM to SFO 10:32 AM, refundable Main for $368. The hold expires Friday, December 19 at 7:05 AM; confirmation QX7K2M.',
  'Two other refundable nonstops were cheaper but leave after noon. Want me to book it now, or keep watching for a lower fare until the hold expires?',
];

/** Where a story starts. `live` plays the script; the rest hold one state. */
export type Stage =
  | 'live'
  | 'connecting'
  | 'agent'
  | 'needs-you'
  | 'user'
  | 'handed-back'
  | 'reconnecting'
  | 'closed'
  | 'ended';

type Phase =
  | 'connecting'
  | 'running'
  | 'handoff'
  | 'user'
  | 'reconnecting'
  | 'closed'
  | 'done';

const CONNECT_MS = 900;
const HANDOFF = STEPS.findIndex((step) => step.action === 'handoff');
const FROZEN_HANDOFF_MS = 72_000;

function initial(stage: Stage): {
  active: number;
  phase: Phase;
  handoffMs?: number;
} {
  switch (stage) {
    case 'live':
    case 'connecting':
      return { active: -1, phase: 'connecting' };
    // Past the failed step, so the frozen frame shows the retry too.
    case 'agent':
      return { active: HANDOFF - 2, phase: 'running' };
    case 'reconnecting':
      return { active: HANDOFF - 2, phase: 'reconnecting' };
    case 'closed':
      return { active: HANDOFF - 2, phase: 'closed' };
    case 'needs-you':
      return { active: HANDOFF, phase: 'handoff' };
    case 'user':
      return { active: HANDOFF, phase: 'user' };
    case 'handed-back':
      return {
        active: HANDOFF + 1,
        phase: 'running',
        handoffMs: FROZEN_HANDOFF_MS,
      };
    case 'ended':
      return {
        active: STEPS.length - 1,
        phase: 'done',
        handoffMs: FROZEN_HANDOFF_MS,
      };
  }
}

const STATE_BY_PHASE: Record<Phase, ChatBrowserUseState> = {
  connecting: 'connecting',
  running: 'agent',
  handoff: 'needs-you',
  user: 'user',
  reconnecting: 'reconnecting',
  closed: 'closed',
  done: 'ended',
};

function SkylineFavicon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-full items-center justify-center rounded-[3px] text-[60%] font-bold leading-none text-white"
      style={{ background: '#0f5c4d' }}
    >
      S
    </span>
  );
}

/**
 * Drives a `ChatBrowserUseSession` through the script, like a host would.
 * `labels: 'none'` mimics a host that only knows the tool calls: no labels
 * or targets, and no action for `browser_run`, whose clicks, typing and
 * navigation all look alike. Snapshot, screenshot and handoff are their own
 * tools, so their actions stay.
 */
export function useSkylineSession(
  stage: Stage = 'live',
  { labels = 'full' }: { labels?: 'full' | 'none' } = {}
): ChatBrowserUseActions & { session: ChatBrowserUseSession } {
  const [start] = useState(() => initial(stage));
  const [active, setActive] = useState(start.active);
  const [phase, setPhase] = useState<Phase>(start.phase);
  const [signedIn, setSignedIn] = useState(false);
  const [handoffMs, setHandoffMs] = useState(start.handoffMs);
  // A held stage stays put until the reader acts, then plays on from there.
  const [playing, setPlaying] = useState(stage === 'live');
  const userStart = useRef(0);

  useEffect(() => {
    if (!playing) return;
    if (phase === 'connecting') {
      const t = window.setTimeout(() => {
        setActive(0);
        setPhase('running');
      }, CONNECT_MS);
      return () => window.clearTimeout(t);
    }
    if (phase !== 'running') return;
    const t = window.setTimeout(() => {
      const next = active + 1;
      if (next >= STEPS.length) {
        setPhase('done');
        return;
      }
      setActive(next);
      if (STEPS[next].action === 'handoff') setPhase('handoff');
    }, STEPS[active].ms);
    return () => window.clearTimeout(t);
  }, [playing, phase, active]);

  const onTakeControl = useCallback(() => {
    userStart.current = Date.now();
    setPhase('user');
  }, []);

  // A requested handoff completes on hand back. An early takeover only
  // pauses the current step, which then starts over.
  const onHandBack = useCallback(() => {
    if (STEPS[active]?.action === 'handoff') {
      setHandoffMs(Date.now() - userStart.current);
      setActive(active + 1);
    }
    setPhase('running');
    setPlaying(true);
  }, [active]);

  const steps: ChatBrowserUseStep[] = STEPS.slice(0, active + 1).map(
    (step, index) => {
      let status: ChatToolCallStatus =
        index < active || phase === 'done'
          ? step.error
            ? 'failed'
            : 'succeeded'
          : 'running';
      if (index === active && phase !== 'done') {
        if (phase === 'handoff') status = 'input-required';
        else if (phase === 'user')
          status = step.action === 'handoff' ? 'input-required' : 'pending';
        else if (phase !== 'running') status = 'pending';
      }
      const bare = labels === 'none';
      const ownTool =
        step.action === 'read' ||
        step.action === 'screenshot' ||
        step.action === 'handoff';
      return {
        id: step.id,
        action: bare && !ownTool ? undefined : step.action,
        label: bare
          ? undefined
          : status === 'running' || status === 'input-required'
            ? step.verbIng
            : step.verb,
        target: bare ? undefined : step.target,
        url: step.url,
        status,
        error: step.error,
        code: step.code,
        elapsedMs:
          step.action === 'handoff'
            ? handoffMs
            : status === 'succeeded' || status === 'failed'
              ? step.ms
              : undefined,
        frame: <FakePage page={step.page} />,
      };
    }
  );

  const current = active >= 0 ? STEPS[active] : null;
  let page: PageId | null = current?.page ?? null;
  if (phase === 'user' && signedIn) page = 'signin-done';
  const handoff = STEPS[HANDOFF];

  return {
    session: {
      state: STATE_BY_PHASE[phase],
      url: current?.url,
      title: current?.title,
      favicon: current ? <SkylineFavicon /> : undefined,
      steps,
      frame: page ? (
        <FakePage
          page={page}
          interactive={phase === 'user'}
          onSignIn={() => setSignedIn(true)}
          signedIn={signedIn}
        />
      ) : undefined,
      // Screenshots come after each finished step, so the still lags the
      // live page by one step.
      snapshot:
        phase === 'done' ? (
          <FakePage page={STEPS[active].page} />
        ) : active > 0 ? (
          <FakePage page={STEPS[active - 1].page} />
        ) : undefined,
      deviceSize: { width: PAGE_W, height: PAGE_H },
      // The sign-in opens in a second tab.
      tabCount: active >= HANDOFF - 1 ? 2 : 1,
      cursor:
        phase === 'running' && current?.cursor
          ? { ...current.cursor, key: current.id }
          : undefined,
      handoff: {
        title: 'The agent needs you to sign in',
        reason: handoff.reason ?? '',
      },
      closedReason: 'The browser closed after 10 minutes without activity.',
    },
    onTakeControl:
      phase === 'running' || phase === 'handoff' ? onTakeControl : undefined,
    onHandBack: phase === 'user' ? onHandBack : undefined,
  };
}

// Fake website (fixed light palette: it's a screenshot, not UI)

const C = {
  brand: '#0f5c4d',
  brandDark: '#0a3f35',
  ink: '#16201d',
  muted: '#5b6b66',
  line: '#e3e8e6',
  bg: '#f5f7f6',
  accent: '#f2b33d',
};

const field: CSSProperties = {
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: '10px 14px',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1,
};

function SiteHeader({ signedIn }: { signedIn?: boolean }) {
  return (
    <div
      style={{
        height: 64,
        background: C.brand,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        gap: 36,
        fontSize: 15,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: -0.4 }}>
        Skyline Air
      </span>
      <span>Book</span>
      <span>My trips</span>
      <span>Travel info</span>
      <span>SkyMiles</span>
      <span style={{ marginLeft: 'auto', opacity: 0.9 }}>
        {signedIn ? 'Hi, Alex · 48,210 mi' : 'Sign in'}
      </span>
    </div>
  );
}

function Home({ filled }: { filled: boolean }) {
  const v = (a: string, b: string) => (filled ? a : b);
  return (
    <>
      <div
        style={{
          height: 300,
          background: `linear-gradient(180deg, ${C.brandDark}, ${C.brand})`,
          color: '#fff',
          padding: '64px 40px 0',
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          Where to next?
        </div>
        <div style={{ fontSize: 18, opacity: 0.85, marginTop: 8 }}>
          Refundable Main fares on every route this winter.
        </div>
      </div>
      <div
        style={{
          margin: '-60px 40px 0',
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          gap: 12,
          alignItems: 'stretch',
        }}
      >
        {[
          ['From', v('New York (JFK)', 'City or airport')],
          ['To', v('San Francisco (SFO)', 'City or airport')],
          ['Depart', v('Thu, Dec 18', 'Add date')],
          ['Travelers', '1 adult'],
        ].map(([k, val]) => (
          <div key={k} style={field}>
            <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
            <span
              style={{
                fontSize: 17,
                color:
                  val.includes('City') || val === 'Add date'
                    ? '#9aa6a2'
                    : C.ink,
              }}
            >
              {val}
            </span>
          </div>
        ))}
        <div
          style={{
            background: C.accent,
            color: C.ink,
            fontWeight: 700,
            borderRadius: 8,
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            fontSize: 17,
          }}
        >
          Find flights
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, padding: '40px 40px 0' }}>
        {[
          'Hawaii from $289',
          'Ski season deals',
          'Earn 2x miles in December',
        ].map((t) => (
          <div
            key={t}
            style={{
              flex: 1,
              height: 200,
              borderRadius: 12,
              background: C.bg,
              border: `1px solid ${C.line}`,
              padding: 20,
              fontSize: 18,
              fontWeight: 600,
              color: C.ink,
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </>
  );
}

const FLIGHTS = [
  {
    no: 'SK 1824',
    dep: '7:05 AM',
    arr: '10:32 AM',
    price: 368,
    refundable: true,
  },
  {
    no: 'SK 602',
    dep: '8:40 AM',
    arr: '12:15 PM',
    price: 312,
    refundable: false,
  },
  {
    no: 'SK 1130',
    dep: '11:55 AM',
    arr: '3:20 PM',
    price: 341,
    refundable: true,
  },
  {
    no: 'SK 418',
    dep: '1:10 PM',
    arr: '4:41 PM',
    price: 329,
    refundable: true,
  },
  {
    no: 'SK 90',
    dep: '6:00 AM',
    arr: '9:31 AM',
    price: 289,
    refundable: false,
  },
];

function Results({ refundableOnly }: { refundableOnly: boolean }) {
  const rows = FLIGHTS.filter((f) => !refundableOnly || f.refundable);
  return (
    <div style={{ display: 'flex', gap: 28, padding: '28px 40px' }}>
      <div style={{ width: 230, flexShrink: 0, fontSize: 14, color: C.ink }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
          Filters
        </div>
        <div style={{ color: C.muted, marginBottom: 8 }}>Stops</div>
        <div style={{ marginBottom: 18 }}>☑ Nonstop</div>
        <div style={{ color: C.muted, marginBottom: 8 }}>Fare</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: `1.5px solid ${refundableOnly ? C.brand : '#9aa6a2'}`,
              background: refundableOnly ? C.brand : '#fff',
              color: '#fff',
              fontSize: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {refundableOnly ? '✓' : ''}
          </span>
          Refundable fares only
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: '1.5px solid #9aa6a2',
            }}
          />
          Basic Economy
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>
          New York (JFK) to San Francisco (SFO)
        </div>
        <div style={{ fontSize: 14, color: C.muted, margin: '6px 0 18px' }}>
          Thu, Dec 18 · 1 adult · {rows.length} nonstop flights
        </div>
        {rows.map((f) => (
          <div
            key={f.no}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 10,
              background: '#fff',
            }}
          >
            <div style={{ width: 170 }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>
                {f.dep} – {f.arr}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {f.no} · Nonstop · 6h 27m
              </div>
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 13,
                color: f.refundable ? C.brand : C.muted,
              }}
            >
              {f.refundable ? 'Refundable Main' : 'Basic Economy · no changes'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
              ${f.price}
            </div>
            <div
              style={{
                background: C.brand,
                color: '#fff',
                borderRadius: 8,
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Select
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const signInStyle: CSSProperties = {
  width: '100%',
  border: 0,
  background: C.brand,
  color: '#fff',
  borderRadius: 8,
  padding: '14px 0',
  fontWeight: 700,
  fontSize: 16,
  textAlign: 'center',
  cursor: 'pointer',
};

function SignIn({
  done,
  interactive,
  onSignIn,
}: {
  done: boolean;
  interactive: boolean;
  onSignIn?: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 70 }}>
      <div
        style={{
          width: 420,
          background: '#fff',
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 36,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          color: C.ink,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700 }}>
          {done ? 'You’re signed in' : 'Sign in'}
        </div>
        <div style={{ fontSize: 14, color: C.muted, margin: '8px 0 24px' }}>
          {done
            ? 'Returning you to your booking…'
            : 'Sign in to continue booking SK 1824.'}
        </div>
        {!done && (
          <>
            <div style={{ ...field, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>
                SkyMiles number or email
              </span>
              <span style={{ fontSize: 16 }}>
                {interactive ? 'alex.rivera@fastmail.com' : '•••••••'}
              </span>
            </div>
            <div style={{ ...field, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Password</span>
              <span style={{ fontSize: 16, letterSpacing: 3 }}>
                {interactive ? '••••••••••••' : ''}
              </span>
            </div>
            <div style={{ ...field, marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: C.muted }}>
                6-digit code sent to •••• 0142
              </span>
              <span style={{ fontSize: 16, letterSpacing: 6 }}>
                {interactive ? '418 0' : ''}
              </span>
            </div>
            {interactive ? (
              <button type="button" onClick={onSignIn} style={signInStyle}>
                Sign in
              </button>
            ) : (
              <div style={signInStyle}>Sign in</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Held() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 56,
        color: C.ink,
      }}
    >
      <div
        style={{
          width: 640,
          background: '#fff',
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 40,
        }}
      >
        <div style={{ fontSize: 14, color: C.brand, fontWeight: 700 }}>
          FARE ON HOLD
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, margin: '8px 0 6px' }}>
          Your fare is held until Fri, Dec 19, 7:05 AM
        </div>
        <div style={{ fontSize: 15, color: C.muted }}>
          Confirmation QX7K2M · Nothing is charged until you book.
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: 20,
            margin: '28px 0',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              7:05 AM – 10:32 AM
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              SK 1824 · JFK → SFO · Nonstop
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>$368</div>
        </div>
        <div
          style={{
            background: C.accent,
            borderRadius: 8,
            padding: '14px 0',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          Book now
        </div>
      </div>
    </div>
  );
}

function FakePage({
  page,
  interactive = false,
  onSignIn,
  signedIn,
}: {
  page: PageId;
  interactive?: boolean;
  onSignIn?: () => void;
  signedIn?: boolean;
}) {
  return (
    <div
      style={{
        width: PAGE_W,
        height: PAGE_H,
        background:
          page === 'signin' || page === 'signin-done' || page === 'held'
            ? C.bg
            : '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      <SiteHeader
        signedIn={page === 'held' || page === 'signin-done' || signedIn}
      />
      {page === 'home' && <Home filled={false} />}
      {page === 'home-filled' && <Home filled />}
      {page === 'results' && <Results refundableOnly={false} />}
      {page === 'results-refundable' && <Results refundableOnly />}
      {(page === 'signin' || page === 'signin-done') && (
        <SignIn
          done={page === 'signin-done'}
          interactive={interactive}
          onSignIn={onSignIn}
        />
      )}
      {page === 'held' && <Held />}
    </div>
  );
}
