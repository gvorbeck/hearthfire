import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const gameIdExists = vi.fn();
vi.mock('@/lib/game', () => ({
  gameIdExists: (id: string) => gameIdExists(id),
}));

import { useJoinIdCheck } from '../useJoinIdCheck';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('useJoinIdCheck', () => {
  it('is idle for empty (or whitespace-only) input', () => {
    const { result } = renderHook(() => useJoinIdCheck('   '));
    expect(result.current.status).toBe('idle');
    expect(gameIdExists).not.toHaveBeenCalled();
  });

  it('debounces the check and reports "found" for an existing id', async () => {
    gameIdExists.mockResolvedValue(true);
    const { result } = renderHook(() => useJoinIdCheck('xyz789'));
    expect(result.current.status).toBe('checking');
    expect(gameIdExists).not.toHaveBeenCalled();

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(gameIdExists).toHaveBeenCalledWith('xyz789');
    expect(result.current.status).toBe('found');
  });

  it('uses the pasted id verbatim — no slugifying', async () => {
    gameIdExists.mockResolvedValue(true);
    renderHook(() => useJoinIdCheck('  Mixed-Case ID  '));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(gameIdExists).toHaveBeenCalledWith('Mixed-Case ID');
  });

  it('reports "notfound" when the id does not exist', async () => {
    gameIdExists.mockResolvedValue(false);
    const { result } = renderHook(() => useJoinIdCheck('nope'));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.status).toBe('notfound');
  });

  it('reports "error" when the existence check throws', async () => {
    gameIdExists.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useJoinIdCheck('my-game'));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.status).toBe('error');
  });

  it('aborts the prior check when the value changes mid-debounce', async () => {
    gameIdExists.mockResolvedValue(true);
    const { rerender } = renderHook(({ raw }) => useJoinIdCheck(raw), {
      initialProps: { raw: 'first' },
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    rerender({ raw: 'second' });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });

    expect(gameIdExists).toHaveBeenCalledTimes(1);
    expect(gameIdExists).toHaveBeenCalledWith('second');
  });

  it('aborts a pending check on unmount (no late state update)', async () => {
    gameIdExists.mockResolvedValue(true);
    const { unmount } = renderHook(() => useJoinIdCheck('my-game'));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(gameIdExists).not.toHaveBeenCalled();
  });
});
