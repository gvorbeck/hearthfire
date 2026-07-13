import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { firestoreMockModule, firestoreStore } from '@/test/firestoreMock';
import { addToastSpy, toastModuleMock } from '@/test/toastMock';
import { DOC_TOO_LARGE_MESSAGE, SAVE_ERROR_MESSAGE } from '@/lib/constants';

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }));
vi.mock('firebase/firestore', () => firestoreMockModule());
vi.mock('@/components/app/Toast/ToastContext', () => toastModuleMock());

import { useGame } from '../useGame';
import type { Character } from '@/types';

const GAME_PATH = 'games/g1';

const char = (id: string, overrides: Partial<Character> = {}): Character => ({
  id,
  name: `Char ${id}`,
  playbook: 'heavy',
  level: 1,
  ...overrides,
});

beforeEach(() => { firestoreStore.reset(); addToastSpy.mockClear(); });

const renderGame = () => renderHook(() => useGame('g1'));

describe('useGame mutations', () => {
  it('loads and parses the seeded game', async () => {
    firestoreStore.set(GAME_PATH, { name: 'Test', createdAt: 5, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.game?.name).toBe('Test');
    expect(result.current.game?.characters).toHaveLength(1);
  });

  it('parseGameSession defaults a missing name to empty string rather than failing the parse (#171)', async () => {
    // A legacy/corrupt doc with no `name` must still load with its characters intact.
    firestoreStore.set(GAME_PATH, { createdAt: 5, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.game?.name).toBe('');
    expect(result.current.game?.characters).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('reports the game as null (not an error) when the doc does not exist', async () => {
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.game).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('addCharacter appends without dropping existing characters', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.addCharacter(char('b')); });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    expect(stored.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('addCharacter does not duplicate a character on a repeat add (#186)', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // A double-tap or post-network-blip retry adds the same id twice.
    await act(async () => { await result.current.addCharacter(char('a')); });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    expect(stored.map((c) => c.id)).toEqual(['a']);
  });

  it('removeCharacter deletes only the target and preserves the rest', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [char('a'), char('b'), char('c')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.removeCharacter('b'); });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    expect(stored.map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('reorderCharacters reorders with no lost or duplicated characters', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [char('a'), char('b'), char('c')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.reorderCharacters([char('c'), char('a'), char('b')]);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    expect(stored.map((c) => c.id)).toEqual(['c', 'a', 'b']);
    expect(stored).toHaveLength(3);
  });

  it('reorderCharacters drops ids that no longer exist rather than inserting undefined', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [char('a'), char('b')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // A stale client reorders against a character that was concurrently removed.
    await act(async () => {
      await result.current.reorderCharacters([char('b'), char('ghost'), char('a')]);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    expect(stored.map((c) => c.id)).toEqual(['b', 'a']);
    expect(stored.every(Boolean)).toBe(true);
  });

  it('updateCharacterData merges playbookFeatures instead of clobbering sibling keys (#171)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { playbookFeatures: { keep: true, old: 1 } } } as Partial<Character>)],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // A patch built from a stale snapshot only carries the key the user changed.
    await act(async () => {
      await result.current.updateCharacterData('a', { playbookFeatures: { old: 2 } as never });
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Array<{ id: string; data?: { playbookFeatures?: Record<string, unknown> } }>;
    // The concurrently-written `keep` key survives the merge.
    expect(stored[0].data?.playbookFeatures).toEqual({ keep: true, old: 2 });
  });

  it('updateCharacterData leaves other characters untouched', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a'), char('b', { name: 'Keep Me' })],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateCharacterData('a', { notes: 'hi' } as never);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    expect(stored.find((c) => c.id === 'b')?.name).toBe('Keep Me');
  });

  it('updateSteading writes dotted improvement keys and never writes undefined array fields', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [], steading: {} });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSteading({
        improvements: { wall: true },
        // NPC array with an optional undefined field — must be stripped before write.
        residents: [{ id: 'n1', name: 'Mara', pronouns: undefined }] as never,
      });
    });
    const steading = firestoreStore.get(GAME_PATH)!.steading as {
      improvements?: Record<string, boolean>;
      residents?: Array<Record<string, unknown>>;
    };
    expect(steading.improvements).toEqual({ wall: true });
    expect(steading.residents?.[0]).toEqual({ id: 'n1', name: 'Mara' });
    expect('pronouns' in (steading.residents![0])).toBe(false);
  });

  it('shows the error toast and rethrows when a write fails (#210)', async () => {
    firestoreStore.set(GAME_PATH, { name: 'Test', createdAt: 0, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The doc vanishes (e.g. concurrent delete) so the next write throws.
    firestoreStore.delete(GAME_PATH);

    await act(async () => {
      // Direct save paths only have .finally(); reportSave must surface the
      // failure itself so it isn't silent. It also rethrows, so callers that
      // retry (the debounce hook) still see the rejection.
      await expect(result.current.updateGameName('New Name')).rejects.toThrow();
    });

    expect(addToastSpy).toHaveBeenCalledWith(SAVE_ERROR_MESSAGE, 'error');
  });

  it('withCharacters throws (not silently no-ops) when the game doc is gone (#254)', async () => {
    firestoreStore.set(GAME_PATH, { name: 'Test', createdAt: 0, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The doc is deleted mid-session; a transaction-backed write must fail loud
    // rather than resolve, so reportSave doesn't flag "Saved." for a no-op.
    firestoreStore.delete(GAME_PATH);

    await act(async () => {
      await expect(result.current.updateCharacterName('a', 'Renamed')).rejects.toThrow();
    });
    expect(addToastSpy).toHaveBeenCalledWith(SAVE_ERROR_MESSAGE, 'error');
  });

  it('surfaces the doc-size-limit message when a write hits invalid-argument (#254)', async () => {
    firestoreStore.set(GAME_PATH, { name: 'Test', createdAt: 0, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Simulate Firestore rejecting an over-1MiB write with invalid-argument.
    const { updateDoc } = await import('firebase/firestore');
    (updateDoc as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      Object.assign(new Error('maximum size'), { code: 'invalid-argument' }),
    );

    await act(async () => {
      await expect(result.current.updateGameName('New Name')).rejects.toThrow();
    });
    expect(addToastSpy).toHaveBeenCalledWith(DOC_TOO_LARGE_MESSAGE, 'error');
  });

  it('updateSteading validates debility booleans pass through as written', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [], steading: {} });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSteading({ defenses: 3 });
    });
    expect((firestoreStore.get(GAME_PATH)!.steading as { defenses?: number }).defenses).toBe(3);
  });
});
