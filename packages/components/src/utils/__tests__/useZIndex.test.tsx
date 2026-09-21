import type { ReactNode } from 'react';

import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useZIndex } from '../useZIndex';
import { ZIndexProvider } from '../ZIndexContext';
import zIndices from '../zIndices';

describe('useZIndex', () => {
  it('returns default z-index when no parent context', () => {
    const { result } = renderHook(() => useZIndex(zIndices.popover));

    // No parent context, so should return max(1300, 10+1) = 1300
    expect(result.current).toBe(zIndices.popover);
  });

  it('increments parent z-index when inside context', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ZIndexProvider value={3000}>{children}</ZIndexProvider>
    );

    const { result } = renderHook(() => useZIndex(zIndices.popover), {
      wrapper,
    });

    // Inside modal (3000), popover should be 3001
    expect(result.current).toBe(3001);
  });

  it('uses semantic default when parent is lower', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ZIndexProvider value={20}>{children}</ZIndexProvider>
    );

    const { result } = renderHook(() => useZIndex(zIndices.popover), {
      wrapper,
    });

    // Popover default (1300) > parent (20) + 1, so use 1300
    expect(result.current).toBe(zIndices.popover);
  });

  it('handles nested contexts correctly', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ZIndexProvider value={30}>
        <ZIndexProvider value={31}>
          <ZIndexProvider value={32}>{children}</ZIndexProvider>
        </ZIndexProvider>
      </ZIndexProvider>
    );

    const { result } = renderHook(() => useZIndex(zIndices.popover), {
      wrapper,
    });

    // Innermost context is 32, so popover should be max(1300, 33) = 1300
    expect(result.current).toBe(zIndices.popover);
  });

  it('handles dialog inside pane correctly', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ZIndexProvider value={30}>{children}</ZIndexProvider>
    );

    const { result } = renderHook(() => useZIndex(zIndices.dialogContent), {
      wrapper,
    });

    // Dialog has high default (3000) > pane (30), so use 3000
    expect(result.current).toBe(zIndices.dialogContent);
  });

  it('handles dropdown inside dialog correctly', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ZIndexProvider value={3000}>{children}</ZIndexProvider>
    );

    const { result } = renderHook(() => useZIndex(zIndices.popover), {
      wrapper,
    });

    // Dropdown inside dialog (3000) should be 3001
    expect(result.current).toBe(3001);
  });
});
