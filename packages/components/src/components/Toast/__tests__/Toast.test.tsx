import { useState } from 'react';

import { ToastProvider } from '..';
import { act, render, screen } from '../../../test-utils';
import useToast from '../useToast';

function ToastTrigger() {
  const { createToast } = useToast();
  const [count, setCount] = useState(0);

  return (
    <button
      onClick={() => {
        setCount(count + 1);
        createToast({ title: `Saved ${count + 1}` });
      }}
    >
      {`Save ${count}`}
    </button>
  );
}

function renderToast() {
  return render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>
  );
}

describe('ToastProvider', () => {
  const originalHasPointerCapture = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'hasPointerCapture'
  );

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // JSDOM lacks pointer capture; these clicks do not capture pointers.
    Object.defineProperty(Element.prototype, 'hasPointerCapture', {
      configurable: true,
      value: () => false,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    if (originalHasPointerCapture) {
      Object.defineProperty(
        Element.prototype,
        'hasPointerCapture',
        originalHasPointerCapture
      );
    } else {
      Reflect.deleteProperty(Element.prototype, 'hasPointerCapture');
    }
  });

  it('auto-dismisses the next toast after a focused toast is manually dismissed', async () => {
    const { user } = renderToast();

    await user.click(screen.getByRole('button', { name: 'Save 0' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save 1' }));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeVisible();

    act(() => vi.advanceTimersByTime(5000));
    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();
  });

  it('gives a replacement toast a fresh duration and preserves page state', async () => {
    const { user } = renderToast();

    await user.click(screen.getByRole('button', { name: 'Save 0' }));
    act(() => vi.advanceTimersByTime(4000));
    await user.click(screen.getByRole('button', { name: 'Save 1' }));

    expect(screen.getByRole('button', { name: 'Save 2' })).toBeVisible();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeVisible();

    act(() => vi.advanceTimersByTime(1000));
    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();
  });
});
