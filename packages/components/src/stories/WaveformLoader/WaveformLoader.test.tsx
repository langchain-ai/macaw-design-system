import { afterEach, describe, expect, it, vi } from 'vitest';

import { act, cleanup, render, screen } from '@testing-library/react';

import { WaveformLoader } from './WaveformLoader';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockMotion(reduced = false) {
  const preference = {
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => preference)
  );
  return preference;
}

describe('WaveformLoader PoC', () => {
  it.each([
    ['slow', 500],
    ['medium', 250],
    ['fast', 100],
  ] as const)('pulses at the %s interval and cleans up', (speed, duration) => {
    vi.useFakeTimers();
    const preference = mockMotion();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { container, unmount } = render(<WaveformLoader speed={speed} />);
    const pulse = container.querySelector('g g') as SVGGElement;
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(pulse.style.transitionDuration).toBe(`${duration}ms`);
    act(() => vi.advanceTimersByTime(duration - 1));
    expect(pulse.style.transform).toBe('scaleY(1)');
    act(() => vi.advanceTimersByTime(1));
    expect(pulse.style.transform).toBe('scaleY(0.625)');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(preference.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('responds to reduced-motion changes without leaving timers behind', () => {
    vi.useFakeTimers();
    const preference = mockMotion(true);
    render(<WaveformLoader />);
    expect(vi.getTimerCount()).toBe(0);
    const onChange = preference.addEventListener.mock.calls[0][1];
    preference.matches = false;
    act(() => onChange());
    expect(vi.getTimerCount()).toBe(1);
    preference.matches = true;
    act(() => onChange());
    expect(vi.getTimerCount()).toBe(0);
  });

  it('replaces the interval when speed changes', () => {
    vi.useFakeTimers();
    mockMotion();
    const { rerender } = render(<WaveformLoader speed="slow" />);
    rerender(<WaveformLoader speed="fast" />);
    expect(vi.getTimerCount()).toBe(1);
  });
});
