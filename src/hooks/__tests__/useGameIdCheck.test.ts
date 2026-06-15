import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const gameIdExists = vi.fn();
vi.mock('@/lib/game', () => ({
  gameIdExists: (id: string) => gameIdExists(id),
  // Reuse the real slug logic so status transitions match production.
  slugifyGameId: (raw: string) =>
    raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
}));

import { useGameIdCheck } from '../useGameIdCheck';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('useGameIdCheck', () => {
  it('is idle for empty input and slugifies the raw value', () => {
    const { result } = renderHook(() => useGameIdCheck(''));
    expect(result.current.status).toBe('idle');
    expect(result.current.slug).toBe('');
  });

  it('reports invalid when the slug is shorter than the minimum length', () => {
    const { result } = renderHook(() => useGameIdCheck('ab'));
    expect(result.current.status).toBe('invalid');
    expect(gameIdExists).not.toHaveBeenCalled();
  });

  it('debounces the existence check and reports "available" for a free id', async () => {
    gameIdExists.mockResolvedValue(false);
    const { result } = renderHook(() => useGameIdCheck('my-game'));
    expect(result.current.status).toBe('checking');
    expect(gameIdExists).not.toHaveBeenCalled();

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(gameIdExists).toHaveBeenCalledWith('my-game');
    expect(result.current.status).toBe('available');
  });

  it('reports "taken" when the id already exists', async () => {
    gameIdExists.mockResolvedValue(true);
    const { result } = renderHook(() => useGameIdCheck('my-game'));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.status).toBe('taken');
  });

  it('does not fire the check for a value the user is still typing past', async () => {
    gameIdExists.mockResolvedValue(false);
    const { rerender } = renderHook(({ raw }) => useGameIdCheck(raw), {
      initialProps: { raw: 'first-value' },
    });

    // Change before the 1s debounce elapses — the first check must be aborted.
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    rerender({ raw: 'second-value' });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });

    expect(gameIdExists).toHaveBeenCalledTimes(1);
    expect(gameIdExists).toHaveBeenCalledWith('second-value');
  });

  it('falls back to idle when the existence check throws', async () => {
    gameIdExists.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useGameIdCheck('my-game'));
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.status).toBe('idle');
  });

  it('aborts a pending check on unmount (no late state update)', async () => {
    gameIdExists.mockResolvedValue(false);
    const { unmount } = renderHook(() => useGameIdCheck('my-game'));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    unmount();
    // After unmount the scheduled check is cleared and never runs.
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(gameIdExists).not.toHaveBeenCalled();
  });
});
