import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedSave } from '../useDebouncedSave';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

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
});
