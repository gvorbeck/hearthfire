import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedSave } from '../useDebouncedSave';
import { DOC_TOO_LARGE_MESSAGE } from '@/lib/constants';

const addToastSpy = vi.fn();
vi.mock('@/components/app/Toast/ToastContext', () => ({
  useToastOptional: () => ({ addToast: addToastSpy }),
}));

beforeEach(() => { vi.useFakeTimers(); addToastSpy.mockClear(); });
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useDebouncedSave', () => {
  it('does not call onSave until the delay elapses', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    act(() => { result.current.onChange('hello'); });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith('hello');
  });

  it('does not fire a second call when the same value is submitted twice', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('same');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    await act(async () => {
      result.current.onChange('same');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('isPending is true while debounce is queued and false after save resolves', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    expect(result.current.isPending).toBe(false);

    act(() => { result.current.onChange('hello'); });
    expect(result.current.isPending).toBe(true);

    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(result.current.isPending).toBe(false);
  });

  it('isPending remains false when same value is queued again (no-op save)', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('same');
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.isPending).toBe(false);

    act(() => { result.current.onChange('same'); });
    expect(result.current.isPending).toBe(false);

    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(result.current.isPending).toBe(false);
  });

  it('isPending is false after onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    act(() => { result.current.onChange('hello'); });
    expect(result.current.isPending).toBe(true);

    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(result.current.isPending).toBe(false);
  });

  it('retries the same value after a failed save instead of deduping it away', async () => {
    const onSave = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('hello');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    // A flush with the same value must re-attempt — the first write never landed.
    await act(async () => { await result.current.flush('hello'); });
    expect(onSave).toHaveBeenCalledTimes(2);

    // After the successful retry, the same value dedupes again.
    await act(async () => { await result.current.flush('hello'); });
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it('flushes a queued save on unmount instead of discarding it', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() => useDebouncedSave(onSave, 1500));

    act(() => { result.current.onChange('hello'); });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => { unmount(); });
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith('hello');
  });

  it('flushes a queued save when the page is hidden', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    act(() => { result.current.onChange('hello'); });
    expect(onSave).not.toHaveBeenCalled();

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith('hello');
  });

  it('does not double-save when an identical save is already in flight', async () => {
    let resolveSave: () => void = () => {};
    const onSave = vi.fn().mockImplementation(() => new Promise<void>((resolve) => { resolveSave = resolve; }));
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('hello');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    // Blur-flush of the same value queues behind the in-flight write, then
    // dedupes once it lands — no second write.
    let flushPromise: Promise<void> = Promise.resolve();
    act(() => { flushPromise = result.current.flush('hello'); });

    await act(async () => {
      resolveSave();
      await flushPromise;
    });
    expect(onSave).toHaveBeenCalledOnce();
    expect(result.current.isPending).toBe(false);
  });

  it('runs saves one at a time so a slow write cannot finish after a newer one', async () => {
    const resolvers: Array<() => void> = [];
    const onSave = vi.fn().mockImplementation(() => new Promise<void>((resolve) => { resolvers.push(resolve); }));
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('first');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    // Second save waits for the first to settle instead of racing it.
    await act(async () => {
      result.current.onChange('second');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    await act(async () => { resolvers[0]!(); });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith('second');
    expect(result.current.isPending).toBe(true);

    await act(async () => { resolvers[1]!(); });
    expect(result.current.isPending).toBe(false);
  });

  it('automatically retries a failed save once', async () => {
    const onSave = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('hello');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    await act(async () => { vi.advanceTimersByTime(4000); });
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it('does not auto-retry the same failed value more than once', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('hello');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    await act(async () => { vi.advanceTimersByTime(4000); });
    expect(onSave).toHaveBeenCalledTimes(2);

    await act(async () => { vi.advanceTimersByTime(60000); });
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it('a newer edit cancels a scheduled retry of the older value', async () => {
    const onSave = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('old');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledOnce();

    // The user edits again before the retry fires — only the new value saves.
    await act(async () => { await result.current.flush('new'); });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith('new');

    await act(async () => { vi.advanceTimersByTime(60000); });
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it('re-saves a value another client overwrote after noteRemoteValue clears the dedupe (#254)', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    // This client saves 'X'.
    await act(async () => {
      result.current.onChange('X');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledTimes(1);

    // Another client changed the server to 'Y'; our sync layer reports the
    // divergent remote value, which must clear the dedupe for 'X'.
    act(() => { result.current.noteRemoteValue('Y'); });

    // The user types 'X' again — without the clear this would be deduped away,
    // leaving the server on 'Y'. It must now go through.
    await act(async () => {
      result.current.onChange('X');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith('X');
  });

  it('noteRemoteValue of the value we just saved leaves the dedupe intact', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('X');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledTimes(1);

    // The remote echo matches what we saved — this is our own write, so the
    // dedupe must still skip a redundant re-save of 'X'.
    act(() => { result.current.noteRemoteValue('X'); });
    await act(async () => {
      result.current.onChange('X');
      vi.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows the doc-too-large message (not the generic one) on an invalid-argument failure (#254)', async () => {
    const onSave = vi.fn().mockRejectedValue(Object.assign(new Error('too big'), { code: 'invalid-argument' }));
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500));

    await act(async () => {
      result.current.onChange('hello');
      vi.advanceTimersByTime(1500);
    });
    expect(addToastSpy).toHaveBeenCalledWith(DOC_TOO_LARGE_MESSAGE, 'error');
  });

  it('reports failures through onError instead of the default handling when provided', async () => {
    const error = new Error('network error');
    const onSave = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const { result } = renderHook(() => useDebouncedSave(onSave, 1500, onError));

    await act(async () => {
      result.current.onChange('hello');
      vi.advanceTimersByTime(1500);
    });
    expect(onError).toHaveBeenCalledWith(error);
  });
});
