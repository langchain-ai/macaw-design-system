import { ChatState, type ChatStateStatus } from '..';
import { act, render, screen } from '../../../test-utils';
import { Button } from '../../Button';

const states: { status: ChatStateStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'streaming', label: 'Streaming' },
  { status: 'completed', label: 'Completed' },
  { status: 'failed', label: 'Failed' },
  { status: 'interrupted', label: 'Interrupted' },
  { status: 'canceled', label: 'Canceled' },
  { status: 'input-required', label: 'Needs input' },
];

describe('ChatState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each(states)('announces the $status state', ({ status, label }) => {
    render(<ChatState status={status} />, { withProviders: false });

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(label);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it.each([false, true])(
    'keeps one live region mounted across status transitions (simple: %s)',
    (simple) => {
      const variant = simple ? 'simple' : 'default';
      const { rerender } = render(
        <ChatState
          status="streaming"
          variant={variant}
          elapsedMs={2_400}
          showElapsed
        />,
        { withProviders: false }
      );
      const announcement = screen.getByRole('status');

      for (const { status, label } of states) {
        rerender(
          <ChatState
            status={status}
            variant={variant}
            elapsedMs={2_400}
            showElapsed
          />
        );
        expect(screen.getAllByRole('status')).toHaveLength(1);
        expect(screen.getByRole('status')).toBe(announcement);
        expect(announcement).toHaveTextContent(label);
        expect(announcement).toHaveAttribute('aria-live', 'polite');
        expect(announcement).not.toContainElement(screen.getByRole('timer'));
        if (simple) {
          expect(screen.getByRole('group', { name: label })).toBeVisible();
        }
      }
    }
  );

  it('keeps elapsed time outside the live status announcement', () => {
    render(<ChatState status="streaming" label="Searching" showElapsed />, {
      withProviders: false,
    });

    const status = screen.getByRole('status');
    const timer = screen.getByRole('timer', { name: 'Elapsed time' });
    expect(status).toHaveTextContent('Searching');
    expect(timer).toBeVisible();
    expect(timer).toHaveTextContent('0s');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(status).not.toContainElement(timer);
  });

  it.each(states)('labels the simple $status state', ({ status, label }) => {
    render(<ChatState status={status} variant="simple" elapsedMs={2_400} />, {
      withProviders: false,
    });

    expect(screen.getByRole('group', { name: label })).toBeVisible();
    const announcement = screen.getByRole('status');
    expect(announcement).toHaveTextContent(label);
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    const timer = screen.getByRole('timer', { name: 'Elapsed time' });
    expect(timer).toBeVisible();
    expect(timer).toHaveTextContent('2s');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(announcement).not.toContainElement(timer);
  });

  it('shows whole total seconds in simple and honors an explicitly hidden timer', () => {
    const { rerender } = render(
      <ChatState
        status="completed"
        variant="simple"
        elapsedMs={65_900}
        timerPrecision="tenths"
      />,
      { withProviders: false }
    );
    expect(screen.getByRole('timer')).toHaveTextContent('65s');

    rerender(
      <ChatState status="completed" variant="simple" showElapsed={false} />
    );
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Completed' })).toBeVisible();
  });

  it('keeps simple status out of the keyboard navigation order', async () => {
    vi.useRealTimers();
    const { user } = render(
      <>
        <ChatState
          status="streaming"
          variant="simple"
          label="Searching documents"
          elapsedMs={2_400}
        />
        <Button>Inspect trace</Button>
      </>,
      { withProviders: false }
    );

    await user.tab();

    expect(
      screen.getByRole('group', { name: 'Searching documents' })
    ).not.toHaveFocus();
    expect(screen.getByRole('button', { name: 'Inspect trace' })).toHaveFocus();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('preserves frozen elapsed time when switching presentation variants', () => {
    const { rerender } = render(
      <ChatState status="streaming" variant="simple" />,
      { withProviders: false }
    );
    vi.mocked(performance.now).mockReturnValue(2_500);
    act(() => vi.advanceTimersByTime(1_000));
    rerender(<ChatState status="failed" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    vi.mocked(performance.now).mockReturnValue(20_000);
    rerender(<ChatState status="failed" variant="simple" />);
    expect(screen.getByRole('timer')).toHaveTextContent('2s');
    expect(screen.getByRole('group', { name: 'Failed' })).toBeVisible();
  });

  const settledStatuses: ChatStateStatus[] = [
    'completed',
    'failed',
    'interrupted',
    'canceled',
    'input-required',
  ];

  it.each(settledStatuses)('freezes elapsed time when %s', (status) => {
    const { rerender } = render(<ChatState status="streaming" showElapsed />, {
      withProviders: false,
    });
    vi.mocked(performance.now).mockReturnValue(2_500);
    act(() => vi.advanceTimersByTime(1_000));
    rerender(<ChatState status={status} showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    vi.mocked(performance.now).mockReturnValue(20_000);
    act(() => vi.advanceTimersByTime(20_000));
    expect(screen.getByRole('timer')).toHaveTextContent('2s');
    rerender(<ChatState status={status} showElapsed={false} />);
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    rerender(<ChatState status={status} showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('2s');
  });

  it('excludes input pauses from elapsed time when streaming resumes', () => {
    const { rerender } = render(<ChatState status="streaming" showElapsed />, {
      withProviders: false,
    });
    vi.mocked(performance.now).mockReturnValue(2_000);
    act(() => vi.advanceTimersByTime(2_000));
    rerender(<ChatState status="input-required" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    vi.mocked(performance.now).mockReturnValue(32_000);
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole('timer')).toHaveTextContent('2s');
    rerender(<ChatState status="streaming" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    vi.mocked(performance.now).mockReturnValue(34_000);
    act(() => vi.advanceTimersByTime(2_000));
    rerender(<ChatState status="input-required" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('4s');

    vi.mocked(performance.now).mockReturnValue(64_000);
    act(() => vi.advanceTimersByTime(30_000));
    rerender(<ChatState status="streaming" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('4s');

    vi.mocked(performance.now).mockReturnValue(65_000);
    act(() => vi.advanceTimersByTime(1_000));
    rerender(<ChatState status="completed" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('5s');

    vi.mocked(performance.now).mockReturnValue(90_000);
    act(() => vi.advanceTimersByTime(25_000));
    expect(screen.getByRole('timer')).toHaveTextContent('5s');
  });

  it('keeps host-supplied duration authoritative across pauses and resumes', () => {
    const { rerender } = render(
      <ChatState status="streaming" showElapsed elapsedMs={2_000} />,
      { withProviders: false }
    );
    rerender(
      <ChatState status="input-required" showElapsed elapsedMs={2_000} />
    );
    vi.mocked(performance.now).mockReturnValue(30_000);
    act(() => vi.advanceTimersByTime(30_000));
    rerender(<ChatState status="streaming" showElapsed elapsedMs={2_000} />);
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    vi.mocked(performance.now).mockReturnValue(32_000);
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByRole('timer')).toHaveTextContent('2s');
    rerender(<ChatState status="completed" showElapsed elapsedMs={4_000} />);
    expect(screen.getByRole('timer')).toHaveTextContent('4s');
  });

  it('starts timing at streaming rather than including pending time', () => {
    const { rerender } = render(<ChatState status="pending" showElapsed />, {
      withProviders: false,
    });
    vi.mocked(performance.now).mockReturnValue(5_000);
    rerender(<ChatState status="streaming" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('0s');
    vi.mocked(performance.now).mockReturnValue(7_500);
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    rerender(<ChatState key="new-operation" status="streaming" showElapsed />);
    expect(screen.getByRole('timer')).toHaveTextContent('0s');
  });

  it('preserves hidden elapsed time and freezes it even without a visible timer', () => {
    const { rerender } = render(<ChatState status="streaming" />, {
      withProviders: false,
    });
    vi.mocked(performance.now).mockReturnValue(12_500);
    rerender(<ChatState status="failed" />);
    vi.mocked(performance.now).mockReturnValue(20_000);
    rerender(<ChatState status="failed" showElapsed timerPrecision="tenths" />);
    expect(screen.getByRole('timer')).toHaveTextContent('12.5s');
  });

  it('uses host duration without advancing it and formats the minute boundary', () => {
    const { rerender } = render(
      <ChatState
        status="completed"
        showElapsed
        elapsedMs={59_999}
        timerPrecision="tenths"
      />,
      { withProviders: false }
    );
    expect(screen.getByRole('timer')).toHaveTextContent('59.9s');
    vi.mocked(performance.now).mockReturnValue(20_000);
    act(() => vi.advanceTimersByTime(20_000));
    expect(screen.getByRole('timer')).toHaveTextContent('59.9s');

    rerender(
      <ChatState
        status="completed"
        showElapsed
        elapsedMs={60_000}
        timerPrecision="tenths"
      />
    );
    expect(screen.getByRole('timer')).toHaveTextContent('1m 0.0s');
  });

  it.each([-1, NaN, Infinity])(
    'handles an invalid host duration (%s)',
    (elapsedMs) => {
      render(
        <ChatState status="completed" showElapsed elapsedMs={elapsedMs} />,
        {
          withProviders: false,
        }
      );
      expect(screen.getByRole('timer')).toHaveTextContent('0s');
    }
  );
});
