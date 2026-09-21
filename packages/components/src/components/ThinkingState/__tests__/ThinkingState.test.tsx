import { createRef } from 'react';

import { act, render, screen } from '../../../test-utils';
import { LoadingIndicator } from '../LoadingIndicator';
import { ThinkingState } from '../ThinkingState';

describe('ThinkingState', () => {
  it('forwards public refs to the status container and decorative indicator', () => {
    const statusRef = createRef<HTMLDivElement>();
    const indicatorRef = createRef<HTMLSpanElement>();
    render(
      <>
        <ThinkingState ref={statusRef} />
        <LoadingIndicator ref={indicatorRef} />
      </>,
      { withProviders: false }
    );
    expect(statusRef.current).toContainElement(screen.getByRole('status'));
    expect(indicatorRef.current).toHaveAttribute('aria-hidden', 'true');
    expect(indicatorRef.current?.children).toHaveLength(9);
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('announces the loading label separately from the silent timer', () => {
    render(<ThinkingState showElapsed />, { withProviders: false });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Thinking');
    expect(status).toHaveAttribute('aria-live', 'polite');
    const timer = screen.getByRole('timer', { name: 'Elapsed time' });
    expect(timer).toBeVisible();
    expect(timer).toHaveTextContent('0s');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(status).not.toContainElement(timer);
  });

  it('uses actual elapsed time after delayed ticks and formats the minute boundary', () => {
    render(<ThinkingState showElapsed timerPrecision="tenths" />, {
      withProviders: false,
    });

    vi.mocked(performance.now).mockReturnValue(59_999);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByRole('timer')).toHaveTextContent('59.9s');

    vi.mocked(performance.now).mockReturnValue(60_000);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByRole('timer')).toHaveTextContent('1m 0.0s');
  });

  it('keeps timing across label changes and restarts for a new operation', () => {
    const { rerender } = render(
      <ThinkingState showElapsed label="Searching" />,
      {
        withProviders: false,
      }
    );

    vi.mocked(performance.now).mockReturnValue(2_500);
    act(() => vi.advanceTimersByTime(1_000));
    rerender(<ThinkingState showElapsed label="Summarizing" variant="orbit" />);
    expect(screen.getByRole('status')).toHaveTextContent('Summarizing');
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    rerender(<ThinkingState key="next-operation" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('0s');
  });

  it.each([undefined, 65_400])(
    'hides elapsed time by default (elapsedMs=%s)',
    (elapsedMs) => {
      render(<ThinkingState elapsedMs={elapsedMs} />, { withProviders: false });

      expect(screen.getByRole('status')).toHaveTextContent('Thinking');
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    }
  );

  it('preserves elapsed time while hidden and when changing precision', () => {
    const { rerender } = render(<ThinkingState showElapsed={false} />, {
      withProviders: false,
    });
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    vi.mocked(performance.now).mockReturnValue(12_500);
    rerender(<ThinkingState showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('12s');
    rerender(<ThinkingState showElapsed timerPrecision="tenths" />);
    expect(screen.getByRole('timer')).toHaveTextContent('12.5s');
    rerender(<ThinkingState showElapsed={false} />);
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    vi.mocked(performance.now).mockReturnValue(22_500);
    rerender(<ThinkingState showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('22s');
  });

  it('uses the supplied operation duration without advancing it internally', () => {
    const { rerender } = render(
      <ThinkingState showElapsed elapsedMs={65_400} timerPrecision="tenths" />,
      { withProviders: false }
    );
    expect(screen.getByRole('timer')).toHaveTextContent('1m 5.4s');
    vi.mocked(performance.now).mockReturnValue(20_000);
    act(() => vi.advanceTimersByTime(20_000));
    expect(screen.getByRole('timer')).toHaveTextContent('1m 5.4s');
    rerender(<ThinkingState showElapsed elapsedMs={70_000} />);
    expect(screen.getByRole('timer')).toHaveTextContent('1m 10s');
  });

  it.each([-1, NaN, Infinity])(
    'handles an invalid supplied duration (%s)',
    (elapsedMs) => {
      render(<ThinkingState showElapsed elapsedMs={elapsedMs} />, {
        withProviders: false,
      });
      expect(screen.getByRole('timer')).toHaveTextContent('0s');
    }
  );
});
