import { useState } from 'react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { Textarea } from '../../index';
import { act, render, screen } from '../../test-utils';
import { useDebouncedCommit } from '../useDebouncedCommit';

afterEach(() => vi.useRealTimers());

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function Editor({
  save,
  show = true,
}: {
  save: (value: string) => void | Promise<unknown>;
  show?: boolean;
}) {
  const [draft, setDraft] = useState('abc');
  const [error, setError] = useState('');
  const { schedule } = useDebouncedCommit({
    onCommit: save,
    onError: (error) => setError(String(error)),
    delay: 300,
  });

  return (
    <>
      {show && (
        <Textarea
          label="Description"
          value={draft}
          onChange={(next) => {
            setDraft(next);
            schedule(next);
          }}
        />
      )}
      <output aria-label="Draft">{draft}</output>
      {error && <div role="alert">{error}</div>}
    </>
  );
}

describe('useDebouncedCommit', () => {
  it('preserves the owner draft when an older save completes during debounce', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const first = deferred();
    let persisted = 'abc';
    const save = vi.fn(async (value: string) => {
      if (value === 'abcd') await first.promise;
      persisted = value;
    });
    const { user } = render(<Editor save={save} />);

    await user.type(screen.getByRole('textbox'), 'd');
    await act(() => vi.advanceTimersByTimeAsync(300));
    await user.type(screen.getByRole('textbox'), 'e');
    await act(async () => {
      first.resolve();
      await first.promise;
    });
    expect(persisted).toBe('abcd');
    expect(save).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status', { name: 'Draft' })).toHaveTextContent(
      /^abcde$/
    );
    expect(screen.getByRole('textbox')).toHaveValue('abcde');

    await user.type(screen.getByRole('textbox'), 'f');
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(save.mock.calls.map(([value]) => value)).toEqual(['abcd', 'abcdef']);
    expect(persisted).toBe('abcdef');
  });

  it('orders backend writes across closing and reopening the editor', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const first = deferred();
    const second = deferred();
    let persisted = 'abc';
    // Model a backend that applies each write when that request finishes.
    const save = vi.fn(async (value: string) => {
      await (value === 'abcd' ? first : second).promise;
      persisted = value;
    });
    const { user, rerender } = render(<Editor save={save} />);

    await user.type(screen.getByRole('textbox'), 'd');
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(save).toHaveBeenCalledExactlyOnceWith('abcd');

    await user.type(screen.getByRole('textbox'), 'e');
    expect(screen.getByRole('status', { name: 'Draft' })).toHaveTextContent(
      /^abcde$/
    );
    await act(() => vi.advanceTimersByTimeAsync(300));
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(persisted).toBe('abc');

    rerender(<Editor save={save} show={false} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Draft' })).toHaveTextContent(
      /^abcde$/
    );
    rerender(<Editor save={save} />);
    expect(screen.getByRole('textbox')).toHaveValue('abcde');

    await act(async () => {
      first.resolve();
      await first.promise;
    });
    expect(save.mock.calls.map(([value]) => value)).toEqual(['abcd', 'abcde']);
    expect(persisted).toBe('abcde');
    expect(screen.getByRole('textbox')).toHaveValue('abcde');
  });

  it('retains the final draft and flushes it after owner unmount without overlapping writes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const first = deferred();
    let persisted = 'abc';
    const save = vi.fn(async (value: string) => {
      if (value === 'abcd') await first.promise;
      persisted = value;
    });
    const { user, unmount } = render(<Editor save={save} />);

    await user.type(screen.getByRole('textbox'), 'd');
    await act(() => vi.advanceTimersByTimeAsync(300));
    await user.type(screen.getByRole('textbox'), 'e');
    expect(screen.getByRole('status', { name: 'Draft' })).toHaveTextContent(
      /^abcde$/
    );
    unmount();
    expect(save).toHaveBeenCalledExactlyOnceWith('abcd');

    await act(async () => {
      first.resolve();
      await first.promise;
    });
    expect(save).toHaveBeenLastCalledWith('abcde');
    expect(persisted).toBe('abcde');
  });

  it.each(['throws', 'rejects'])(
    'reports a save that %s and still commits the latest edit',
    async (failure) => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const first = deferred();
      let persisted = 'abc';
      const save = (value: string) => {
        if (value === 'abcd') {
          if (failure === 'throws') throw new Error('Save failed');
          return first.promise;
        }
        persisted = value;
      };
      const { user, unmount } = render(<Editor save={save} />);

      await user.type(screen.getByRole('textbox'), 'd');
      await act(() => vi.advanceTimersByTimeAsync(300));
      await user.type(screen.getByRole('textbox'), 'e');
      if (failure === 'rejects') {
        await act(async () => {
          first.reject(new Error('Save failed'));
          await expect(first.promise).rejects.toThrow('Save failed');
        });
      }
      expect(screen.getByRole('alert')).toHaveTextContent('Save failed');
      expect(screen.getByRole('textbox')).toHaveValue('abcde');
      await act(async () => {
        unmount();
        await Promise.resolve();
      });
      expect(persisted).toBe('abcde');
    }
  );

  it('keeps the destination captured when an edit is scheduled', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const firstDestination = vi.fn();
    const secondDestination = vi.fn();
    const onError = vi.fn();
    const { result, rerender } = renderHook(
      ({ onCommit }) => useDebouncedCommit({ onCommit, onError, delay: 300 }),
      { initialProps: { onCommit: firstDestination } }
    );
    result.current.schedule('accepted draft');
    rerender({ onCommit: secondDestination });
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(firstDestination).toHaveBeenCalledExactlyOnceWith('accepted draft');
    expect(secondDestination).not.toHaveBeenCalled();
  });
});
