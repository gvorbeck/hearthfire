import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoFollowers } from '../useAutoFollowers';
import type { CharacterData } from '@/types';

afterEach(() => { vi.clearAllMocks(); });

type Possessions = CharacterData['specialPossessions'];

describe('useAutoFollowers', () => {
  it('auto-adds the Followers insert when a dog possession is checked', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useAutoFollowers({ 'good-dog': true } as Possessions, [], onSave));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ inserts: ['Followers'] }));
  });

  it('does nothing when no dog possession is checked', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useAutoFollowers({ sword: true } as Possessions, [], onSave));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does nothing when an unchecked dog possession is present', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useAutoFollowers({ mastiffs: false } as Possessions, [], onSave));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not add Followers again when it is already present', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useAutoFollowers({ hounds: true } as Possessions, ['Followers'], onSave));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('preserves existing inserts when appending Followers', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useAutoFollowers({ hounds: true } as Possessions, ['Arcana'], onSave));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ inserts: ['Arcana', 'Followers'] }));
  });

  it('only auto-adds once across re-renders', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ inserts }) => useAutoFollowers({ 'good-dog': true } as Possessions, inserts, onSave),
      { initialProps: { inserts: [] as string[] } },
    );
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    // Re-render before the parent reflects the new insert — must not fire twice.
    rerender({ inserts: [] });
    await act(async () => {});
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('re-arms after a failed save so the insert is not lost', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ inserts }) => useAutoFollowers({ 'good-dog': true } as Possessions, inserts, onSave),
      { initialProps: { inserts: [] as string[] } },
    );
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    // The first attempt rejected; a subsequent render retries.
    rerender({ inserts: [] });
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
  });
});
