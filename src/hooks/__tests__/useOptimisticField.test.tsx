import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { toastModuleMock } from '@/test/toastMock';

vi.mock('@/components/app', () => toastModuleMock());

import { useOptimisticField } from '../useOptimisticField';

// This hook owns no timers, so real timers keep waitFor (which polls on real
// timers) working for the deferred-flush assertion.
afterEach(() => { vi.clearAllMocks(); });

describe('useOptimisticField', () => {
  it('optimistically updates value before the save resolves', async () => {
    let resolveSave: () => void = () => {};
    const saveFn = vi.fn(() => new Promise<void>((r) => { resolveSave = r; }));
    const { result } = renderHook(() => useOptimisticField('initial', saveFn, 'failed'));

    act(() => { result.current.save('next'); });
    expect(result.current.value).toBe('next');
    expect(saveFn).toHaveBeenCalledWith('next');

    await act(async () => { resolveSave(); });
    expect(result.current.value).toBe('next');
  });

  it('rolls back to the previous value when the save rejects', async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useOptimisticField<string>('initial', saveFn, 'failed'));

    await act(async () => { result.current.save('next'); });
    expect(result.current.value).toBe('initial');
  });

  it('skips a remote sync while a save is pending, then flushes it after the save resolves', async () => {
    let resolveSave: () => void = () => {};
    const saveFn = vi.fn(() => new Promise<void>((r) => { resolveSave = r; }));
    const { result, rerender } = renderHook(
      ({ remote }) => useOptimisticField(remote, saveFn, 'failed'),
      { initialProps: { remote: 'a' } },
    );

    // Begin a save; pendingRef is now true.
    act(() => { result.current.save('local-edit'); });
    expect(result.current.value).toBe('local-edit');

    // A concurrent remote value arrives mid-save — it must be deferred, not applied.
    rerender({ remote: 'remote-edit' });
    expect(result.current.value).toBe('local-edit');

    // Once the save resolves, the deferred remote value flushes through.
    await act(async () => { resolveSave(); });
    await waitFor(() => expect(result.current.value).toBe('remote-edit'));
  });

  it('applies a remote sync when no save is pending', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ remote }) => useOptimisticField(remote, saveFn, 'failed'),
      { initialProps: { remote: 'a' } },
    );

    rerender({ remote: 'b' });
    expect(result.current.value).toBe('b');
  });
});
