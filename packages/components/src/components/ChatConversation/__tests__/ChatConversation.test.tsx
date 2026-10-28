import { createRef } from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { ChatConversation } from '../ChatConversation';

let resizeCallbacks: ResizeObserverCallback[] = [];
const OriginalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  resizeCallbacks = [];
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      resizeCallbacks.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

function setLayout(
  viewport: HTMLElement,
  { scrollHeight, clientHeight }: { scrollHeight: number; clientHeight: number }
) {
  Object.defineProperty(viewport, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(viewport, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
}

function resize() {
  act(() => {
    for (const callback of resizeCallbacks) {
      callback([], {} as ResizeObserver);
    }
  });
}

function scrollTo(viewport: HTMLElement, scrollTop: number) {
  viewport.scrollTop = scrollTop;
  fireEvent.scroll(viewport);
}

function renderConversation() {
  render(
    <ChatConversation>
      <p>Hello</p>
    </ChatConversation>
  );
  const viewport = screen.getByRole('log', { name: 'Conversation messages' });
  setLayout(viewport, { scrollHeight: 1000, clientHeight: 400 });
  resize();
  return viewport;
}

describe('ChatConversation', () => {
  it('labels the region and the message log', () => {
    render(
      <ChatConversation label="Support chat">
        <p>Hello</p>
      </ChatConversation>
    );
    expect(
      screen.getByRole('region', { name: 'Support chat' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('log', { name: 'Support chat messages' })
    ).toHaveTextContent('Hello');
  });

  it('renders header and footer slots outside the scrolling log', () => {
    render(
      <ChatConversation header={<h2>Thread</h2>} footer={<p>Composer</p>}>
        <p>Hello</p>
      </ChatConversation>
    );
    const log = screen.getByRole('log');
    expect(screen.getByRole('heading', { name: 'Thread' })).toBeVisible();
    expect(log).not.toContainElement(screen.getByText('Thread'));
    expect(log).not.toContainElement(screen.getByText('Composer'));
  });

  it('starts at the bottom and follows content that grows', () => {
    const viewport = renderConversation();
    expect(viewport.scrollTop).toBe(1000);

    setLayout(viewport, { scrollHeight: 1400, clientHeight: 400 });
    resize();
    expect(viewport.scrollTop).toBe(1400);
    expect(
      screen.queryByRole('button', { name: 'Jump to latest' })
    ).not.toBeInTheDocument();
  });

  it('stays in place and offers a jump once the reader scrolls up', () => {
    const viewport = renderConversation();
    scrollTo(viewport, 200);

    setLayout(viewport, { scrollHeight: 1400, clientHeight: 400 });
    resize();
    expect(viewport.scrollTop).toBe(200);
    expect(
      screen.getByRole('button', { name: 'Jump to latest' })
    ).toBeVisible();
  });

  it('keeps following while the reader is within the bottom threshold', () => {
    const viewport = renderConversation();
    scrollTo(viewport, 560);

    setLayout(viewport, { scrollHeight: 1200, clientHeight: 400 });
    resize();
    expect(viewport.scrollTop).toBe(1200);
  });

  it('jumps to the latest output, resumes following, and keeps focus in the log', () => {
    const viewport = renderConversation();
    scrollTo(viewport, 0);

    fireEvent.click(screen.getByRole('button', { name: 'Jump to latest' }));
    expect(viewport.scrollTop).toBe(1000);
    expect(viewport).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Jump to latest' })
    ).not.toBeInTheDocument();

    setLayout(viewport, { scrollHeight: 1300, clientHeight: 400 });
    resize();
    expect(viewport.scrollTop).toBe(1300);
  });

  it('starts at the bottom again when remounted with a new key', () => {
    const { rerender } = render(
      <ChatConversation key="a">
        <p>First</p>
      </ChatConversation>
    );
    let viewport = screen.getByRole('log');
    setLayout(viewport, { scrollHeight: 1000, clientHeight: 400 });
    resize();
    scrollTo(viewport, 0);
    expect(
      screen.getByRole('button', { name: 'Jump to latest' })
    ).toBeVisible();

    resizeCallbacks = [];
    rerender(
      <ChatConversation key="b">
        <p>Second</p>
      </ChatConversation>
    );
    viewport = screen.getByRole('log');
    setLayout(viewport, { scrollHeight: 800, clientHeight: 400 });
    resize();
    expect(viewport.scrollTop).toBe(800);
    expect(
      screen.queryByRole('button', { name: 'Jump to latest' })
    ).not.toBeInTheDocument();
  });

  it('makes the log keyboard-focusable', () => {
    renderConversation();
    expect(screen.getByRole('log')).toHaveAttribute('tabindex', '0');
  });

  it('exposes the scrolling element through viewportRef', () => {
    const viewportRef = createRef<HTMLDivElement>();
    render(
      <ChatConversation viewportRef={viewportRef}>
        <p>Hello</p>
      </ChatConversation>
    );
    expect(viewportRef.current).toBe(screen.getByRole('log'));
  });
});
