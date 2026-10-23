import { createRef } from 'react';

import { ChatConversation, type ChatConversationHandle } from '..';
import { act, fireEvent, render, screen } from '../../../test-utils';
import { ChatMessage } from '../../ChatMessage';

describe('ChatConversation', () => {
  let resize: () => void;
  let frame: FrameRequestCallback | undefined;

  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = () => callback([], this);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frame = callback;
        return 1;
      })
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function history() {
    return ['first', 'latest'].map((id) => (
      <ChatMessage
        key={id}
        message={{
          id,
          role: 'assistant',
          status: 'completed',
          content: [{ id, type: 'text', text: id }],
        }}
      />
    ));
  }

  function scrollUp() {
    const viewport = screen.getByRole('log');
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 200 },
    });
    fireEvent.scroll(viewport, { target: { scrollTop: 800 } });
    fireEvent.scroll(viewport, { target: { scrollTop: 100 } });
    return viewport;
  }

  it('pauses following while reading history and focuses the latest message when jumping', async () => {
    const { user } = render(<ChatConversation>{history()}</ChatConversation>);
    const viewport = scrollUp();

    act(() => {
      resize();
      resize();
      frame?.(0);
    });
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(viewport.scrollTop).toBe(100);

    await user.click(screen.getByRole('button', { name: 'Jump to latest' }));
    expect(viewport.scrollTop).toBe(1000);
    expect(
      screen.getByText('latest').closest('[data-message-id]')
    ).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Jump to latest' })
    ).not.toBeInTheDocument();
  });

  it('resumes following through the public ref without moving focus out of the composer', () => {
    const ref = createRef<ChatConversationHandle>();
    render(
      <ChatConversation ref={ref} footer={<input aria-label="Draft" />}>
        {history()}
      </ChatConversation>
    );
    const viewport = scrollUp();
    const input = screen.getByRole('textbox', { name: 'Draft' });
    input.focus();

    act(() => {
      ref.current?.scrollToLatest();
    });
    expect(input).toHaveFocus();
    Object.defineProperty(viewport, 'scrollHeight', {
      configurable: true,
      value: 1400,
    });
    // The browser can deliver the programmatic scroll after content grows.
    fireEvent.scroll(viewport);
    act(() => {
      resize();
      frame?.(0);
    });
    expect(viewport.scrollTop).toBe(1400);
  });
});
