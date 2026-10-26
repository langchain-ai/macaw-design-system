import { useState } from 'react';

import { ToastProvider, type ToastConfig } from '..';
import { act, render, screen } from '../../../test-utils';
import useToast from '../useToast';

function ToastTrigger({ config }: { config?: ToastConfig }) {
  const { createToast } = useToast();
  const [count, setCount] = useState(0);

  return (
    <button
      onClick={() => {
        setCount(count + 1);
        createToast({ title: `Saved ${count + 1}`, ...config });
      }}
    >
      {`Save ${count}`}
    </button>
  );
}

function renderToast(config?: ToastConfig) {
  return render(
    <ToastProvider>
      <ToastTrigger config={config} />
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

  const variants: ToastConfig[] = [
    {},
    { type: 'error' },
    { error: true },
    { type: 'info' },
    { type: 'warning' },
    { type: 'success' },
  ];

  it.each(variants)(
    'auto-dismisses %j after five seconds by default',
    async (config) => {
      const { user } = renderToast(config);
      await user.click(screen.getByRole('button', { name: 'Save 0' }));

      act(() => vi.advanceTimersByTime(4000));
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeVisible();
      act(() => vi.advanceTimersByTime(1000));
      expect(
        screen.queryByRole('button', { name: 'Dismiss' })
      ).not.toBeInTheDocument();
    }
  );

  it.each(variants)('supports explicit persistence for %j', async (config) => {
    const { user } = renderToast({ ...config, duration: Infinity });
    await user.click(screen.getByRole('button', { name: 'Save 0' }));

    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();
  });

  it('respects a custom error toast duration', async () => {
    const { user } = renderToast({ type: 'error', duration: 10000 });
    await user.click(screen.getByRole('button', { name: 'Save 0' }));

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeVisible();
    act(() => vi.advanceTimersByTime(5000));
    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();
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
