import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useFirestoreSync } from '../useFirestoreSync';

afterEach(() => { vi.restoreAllMocks(); });

// Drive the hook with a controllable firestoreValue + pending flag, recording
// every value the setter receives.
const harness = (initial: string) => {
  const setter = vi.fn();
  const { result, rerender } = renderHook(
    ({ value, pending }: { value: string; pending: boolean }) => {
      const pendingRef = useRef(pending);
      pendingRef.current = pending;
      useFirestoreSync(value, setter, pendingRef);
    },
    { initialProps: { value: initial, pending: false } },
  );
  return { setter, result, rerender };
};

describe('useFirestoreSync', () => {
  it('pushes a changed remote value to the setter when no save is pending', () => {
    const { setter, rerender } = harness('a');
    // Initial mount applies the first value.
    expect(setter).toHaveBeenLastCalledWith('a');

    act(() => { rerender({ value: 'b', pending: false }); });
    expect(setter).toHaveBeenLastCalledWith('b');
  });

  it('skips the echo of a value it already applied (same serialization)', () => {
    const { setter, rerender } = harness('a');
    setter.mockClear();

    // Re-render with the identical value — no setter call (echo-skip).
    act(() => { rerender({ value: 'a', pending: false }); });
    expect(setter).not.toHaveBeenCalled();
  });

  it('defers a remote value that arrives during a pending save, then flushes it once pending clears (#171)', () => {
    const { setter, rerender } = harness('a');
    setter.mockClear();

    // A remote value arrives while a save is in flight — it must NOT be applied
    // (that would clobber optimistic local state with our own echo) but also
    // must NOT be dropped.
    act(() => { rerender({ value: 'remote', pending: true }); });
    expect(setter).not.toHaveBeenCalled();

    // Save resolves: pending clears and a re-render flushes the deferred value.
    act(() => { rerender({ value: 'remote', pending: false }); });
    expect(setter).toHaveBeenLastCalledWith('remote');
  });

  it('does not flush a deferred value that a newer remote value has superseded', () => {
    const { setter, rerender } = harness('a');
    setter.mockClear();

    act(() => { rerender({ value: 'stale', pending: true }); });
    // A newer value arrives, still pending, replacing the deferred one.
    act(() => { rerender({ value: 'fresh', pending: true }); });
    expect(setter).not.toHaveBeenCalled();

    act(() => { rerender({ value: 'fresh', pending: false }); });
    expect(setter).toHaveBeenLastCalledWith('fresh');
    // Only the freshest value flushed; 'stale' never reached the setter.
    expect(setter).not.toHaveBeenCalledWith('stale');
  });
});
