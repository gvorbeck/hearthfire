import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotesLock } from '../useNotesLock';
import { NOTES_CLIENT_ID, NOTES_HEARTBEAT_MS, NOTES_IDLE_MS, NOTES_STALE_MS } from '@/lib/sharedNotes';
import type { NotesLock } from '@/types';

// Settle pending promise callbacks (claim/release resolution) without advancing timers.
const flush = () => act(async () => {});

const setup = (initialLock?: NotesLock) => {
  let html = '<p>draft</p>';
  const claim = vi.fn(() => Promise.resolve(true));
  const refresh = vi.fn(() => Promise.resolve());
  const release = vi.fn((_html: string) => Promise.resolve());
  const save = vi.fn((_html: string) => Promise.resolve());
  const onClaimRejected = vi.fn();
  const hook = renderHook(
    ({ lock }: { lock: NotesLock | undefined }) =>
      useNotesLock({ lock, getHtml: () => html, claim, refresh, release, save, onClaimRejected }),
    { initialProps: { lock: initialLock } },
  );
  return {
    ...hook,
    claim, refresh, release, save, onClaimRejected,
    setHtml: (next: string) => { html = next; },
  };
};

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('useNotesLock', () => {
  it('claims the lock on the first change only', async () => {
    const { result, claim } = setup();
    act(() => { result.current.noteChange(); });
    await flush();
    act(() => { result.current.noteChange(); });
    await flush();
    expect(claim).toHaveBeenCalledTimes(1);
  });

  it('heartbeats at most once per NOTES_HEARTBEAT_MS while held', async () => {
    const { result, refresh } = setup();
    act(() => { result.current.noteChange(); });
    await flush();

    act(() => { vi.advanceTimersByTime(NOTES_HEARTBEAT_MS - 1); result.current.noteChange(); });
    expect(refresh).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); result.current.noteChange(); });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('saves and releases NOTES_IDLE_MS after the last change, with the content at that moment', async () => {
    const { result, release, setHtml } = setup();
    act(() => { result.current.noteChange(); });
    await flush();

    act(() => { vi.advanceTimersByTime(NOTES_IDLE_MS - 1); result.current.noteChange(); });
    act(() => { vi.advanceTimersByTime(NOTES_IDLE_MS - 1); });
    expect(release).not.toHaveBeenCalled();

    setHtml('<p>final</p>');
    act(() => { vi.advanceTimersByTime(1); });
    expect(release).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledWith('<p>final</p>');

    await flush();
    expect(result.current.isBusy()).toBe(false);
  });

  it('claims again on the next change after a release', async () => {
    const { result, claim } = setup();
    act(() => { result.current.noteChange(); });
    await flush();
    act(() => { vi.advanceTimersByTime(NOTES_IDLE_MS); });
    await flush();

    act(() => { result.current.noteChange(); });
    expect(claim).toHaveBeenCalledTimes(2);
  });

  it('saves on blur without releasing, and only when there are unsaved changes', async () => {
    const { result, save, release } = setup();
    act(() => { result.current.noteBlur(); });
    expect(save).not.toHaveBeenCalled();

    act(() => { result.current.noteChange(); });
    await flush();
    act(() => { result.current.noteBlur(); });
    expect(save).toHaveBeenCalledWith('<p>draft</p>');
    expect(release).not.toHaveBeenCalled();

    // A second blur with nothing new typed doesn't write again.
    act(() => { result.current.noteBlur(); });
    expect(save).toHaveBeenCalledTimes(1);

    // The lock is still released on the idle timer.
    act(() => { vi.advanceTimersByTime(NOTES_IDLE_MS); });
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('discards the edit and never releases when another tab won the claim', async () => {
    const { result, claim, release, onClaimRejected } = setup();
    claim.mockResolvedValueOnce(false);
    act(() => { result.current.noteChange(); });
    await flush();

    expect(onClaimRejected).toHaveBeenCalledTimes(1);
    expect(result.current.isBusy()).toBe(false);
    act(() => { vi.advanceTimersByTime(NOTES_IDLE_MS); });
    expect(release).not.toHaveBeenCalled();
  });

  it('treats a failed claim like a rejected one', async () => {
    const { result, claim, onClaimRejected } = setup();
    claim.mockRejectedValueOnce(new Error('offline'));
    act(() => { result.current.noteChange(); });
    await flush();
    expect(onClaimRejected).toHaveBeenCalledTimes(1);
    expect(result.current.isBusy()).toBe(false);
  });

  it('releases as soon as a slow claim lands if the idle timer already fired', async () => {
    const { result, claim, release } = setup();
    let resolveClaim: (v: boolean) => void = () => {};
    claim.mockReturnValueOnce(new Promise<boolean>((r) => { resolveClaim = r; }));
    act(() => { result.current.noteChange(); });
    act(() => { vi.advanceTimersByTime(NOTES_IDLE_MS); });
    expect(release).not.toHaveBeenCalled();

    resolveClaim(true);
    await flush();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('stays busy after a failed release so remote content cannot overwrite the unsaved text', async () => {
    const { result, release } = setup();
    release.mockRejectedValueOnce(new Error('offline'));
    act(() => { result.current.noteChange(); });
    await flush();
    act(() => { vi.advanceTimersByTime(NOTES_IDLE_MS); });
    await flush();
    expect(result.current.isBusy()).toBe(true);
  });

  it('is busy while holding the lock', async () => {
    const { result } = setup();
    expect(result.current.isBusy()).toBe(false);
    act(() => { result.current.noteChange(); });
    expect(result.current.isBusy()).toBe(true);
  });

  it('releases on unmount while holding the lock', async () => {
    const { result, release, unmount } = setup();
    act(() => { result.current.noteChange(); });
    await flush();
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('releases when the page is hidden', async () => {
    const { result, release } = setup();
    act(() => { result.current.noteChange(); });
    await flush();
    act(() => { window.dispatchEvent(new Event('pagehide')); });
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("reports another tab's lock as typing until it goes NOTES_STALE_MS without changing", () => {
    const { result, rerender } = setup({ clientId: 'other-tab', at: 1 });
    expect(result.current.othersTyping).toBe(true);

    act(() => { vi.advanceTimersByTime(NOTES_STALE_MS - 1); });
    // A heartbeat re-stamps the lock and restarts the window.
    rerender({ lock: { clientId: 'other-tab', at: 2 } });
    act(() => { vi.advanceTimersByTime(NOTES_STALE_MS - 1); });
    expect(result.current.othersTyping).toBe(true);

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current.othersTyping).toBe(false);

    // Released by the holder.
    rerender({ lock: { clientId: 'other-tab', at: 3 } });
    expect(result.current.othersTyping).toBe(true);
    rerender({ lock: undefined });
    expect(result.current.othersTyping).toBe(false);
  });

  it("never reports this tab's own lock as someone else typing", () => {
    const { result } = setup({ clientId: NOTES_CLIENT_ID, at: 1 });
    expect(result.current.othersTyping).toBe(false);
  });
});
