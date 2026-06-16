import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { firestoreMockModule, firestoreStore } from '@/test/firestoreMock';

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }));
vi.mock('firebase/firestore', () => firestoreMockModule());

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

beforeEach(() => { firestoreStore.reset(); });

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
