import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { firestoreMockModule, firestoreStore } from '@/test/firestoreMock';
import { addToastSpy, toastModuleMock } from '@/test/toastMock';
import { INVALID_WRITE_MESSAGE, SAVE_ERROR_MESSAGE } from '@/lib/constants';

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

  it('reorderCharacters appends a character concurrently added by another player (#240)', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [char('a'), char('b')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The doc gains 'c' after this client's drag started, so its stale `ids` list
    // only knows about 'a' and 'b'.
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [char('a'), char('b'), char('c')] });

    await act(async () => {
      await result.current.reorderCharacters([char('b'), char('a')]);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    expect(stored.map((c) => c.id)).toEqual(['b', 'a', 'c']);
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

  it('updateCharacterData deletes a playbookFeatures key via deleteFeatureKeys (#241)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { playbookFeatures: { followers: [{ id: 'f1' }], keep: true } } } as Partial<Character>)],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Omitting `followers` from playbookFeatures is not enough — the merge is additive
    // and would let the freshly-read doc's `followers` value survive. deleteFeatureKeys
    // is the explicit sentinel that actually removes it.
    await act(async () => {
      await result.current.updateCharacterData('a', { deleteFeatureKeys: ['followers'] } as never);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Array<{ id: string; data?: { playbookFeatures?: Record<string, unknown>; deleteFeatureKeys?: unknown } }>;
    expect(stored[0].data?.playbookFeatures).toEqual({ keep: true });
    expect(stored[0].data?.deleteFeatureKeys).toBeUndefined();
  });

  it('updateCharacterData merges typeMoves instead of clobbering sibling keys (#244)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { typeMoves: { keep: true, old: false } } } as Partial<Character>)],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // A patch built from a stale snapshot only carries the move the user toggled.
    await act(async () => {
      await result.current.updateCharacterData('a', { typeMoves: { old: true } } as never);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Array<{ id: string; data?: { typeMoves?: Record<string, unknown> } }>;
    // The concurrently-written `keep` key survives the merge.
    expect(stored[0].data?.typeMoves).toEqual({ keep: true, old: true });
  });

  it('updateCharacterData id-merges arcanaMinor so a concurrently-added entry survives (#244)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { arcanaMinor: [{ id: 'm1', requirementsChecked: {} }] } } as Partial<Character>)],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Another client concurrently adds a second entry the first client's stale
    // snapshot never saw.
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { arcanaMinor: [
        { id: 'm1', requirementsChecked: {} },
        { id: 'm2', requirementsChecked: {} },
      ] } } as Partial<Character>)],
    });

    // The first client's save only carries its own (still stale) view: an edit to m1.
    await act(async () => {
      await result.current.updateCharacterData('a', {
        arcanaMinor: [{ id: 'm1', requirementsChecked: { req1: true } }],
      } as never);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Array<{ id: string; data?: { arcanaMinor?: Array<{ id: string }> } }>;
    const ids = stored[0].data?.arcanaMinor?.map((e) => e.id);
    expect(ids).toContain('m1');
    expect(ids).toContain('m2');
  });

  it('updateCharacterData does not delete an arcanaMinor entry merely omitted from the patch (#244)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { arcanaMinor: [
        { id: 'm1', requirementsChecked: {} },
        { id: 'm2', requirementsChecked: {} },
      ] } } as Partial<Character>)],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // A patch that only names m1 is ambiguous — it could mean "m2 was removed"
    // or "this client just hasn't touched m2". Without the removal sentinel it
    // must NOT be treated as deletion.
    await act(async () => {
      await result.current.updateCharacterData('a', {
        arcanaMinor: [{ id: 'm1', requirementsChecked: { req1: true } }],
      } as never);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Array<{ id: string; data?: { arcanaMinor?: Array<{ id: string }> } }>;
    expect(stored[0].data?.arcanaMinor?.map((e) => e.id)).toContain('m2');
  });

  it('updateCharacterData removes an arcanaMinor entry via removedArcanaMinorIds (#244)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { arcanaMinor: [
        { id: 'm1', requirementsChecked: {} },
        { id: 'm2', requirementsChecked: {} },
      ] } } as Partial<Character>)],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateCharacterData('a', {
        arcanaMinor: [{ id: 'm1', requirementsChecked: {} }],
        removedArcanaMinorIds: ['m2'],
      } as never);
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Array<{ id: string; data?: { arcanaMinor?: Array<{ id: string }>; removedArcanaMinorIds?: unknown } }>;
    expect(stored[0].data?.arcanaMinor?.map((e) => e.id)).toEqual(['m1']);
    expect(stored[0].data?.removedArcanaMinorIds).toBeUndefined();
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

  it('updateCharacterData strips undefined keys that parseCharacterData fills on read (#268)', async () => {
    // parseCharacterData fills every unrecognized/absent optional CharacterData field with
    // `undefined` explicitly (see useGame.ts), so a character read back from a doc with only a
    // couple of fields set still round-trips the rest as `undefined` on write. The real Firestore
    // SDK rejects a write outright the moment any value anywhere in the payload is `undefined` —
    // this mock doesn't enforce that (see firestoreMock.ts), so assert on the written shape directly.
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0,
      characters: [char('a', { data: { statHp: '18' } as never })],
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateCharacterData('a', { statHp: '20' });
    });
    const stored = firestoreStore.get(GAME_PATH)!.characters as Character[];
    const data = stored.find((c) => c.id === 'a')?.data as Record<string, unknown>;
    expect(data.statHp).toBe('20');
    expect(Object.values(data).some((v) => v === undefined)).toBe(false);
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

  it('updateSteading id-merges residents so a concurrently-added NPC survives (#244)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0, characters: [],
      steading: { residents: [{ id: 'n1', name: 'Mara' }] },
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The GM concurrently adds a second resident the player's stale snapshot never saw.
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0, characters: [],
      steading: { residents: [{ id: 'n1', name: 'Mara' }, { id: 'n2', name: 'Boro' }] },
    });

    // The player's save only carries their own (still stale) view: a rename of n1.
    await act(async () => {
      await result.current.updateSteading({ residents: [{ id: 'n1', name: 'Mara the Wise' }] as never });
    });
    const steading = firestoreStore.get(GAME_PATH)!.steading as { residents?: Array<{ id: string; name: string }> };
    const byId = new Map(steading.residents?.map((r) => [r.id, r.name]));
    expect(byId.get('n1')).toBe('Mara the Wise');
    expect(byId.get('n2')).toBe('Boro');
  });

  it('updateSteading removes a resident via removedResidentIds (#244)', async () => {
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0, characters: [],
      steading: { residents: [{ id: 'n1', name: 'Mara' }, { id: 'n2', name: 'Boro' }] },
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSteading({
        residents: [{ id: 'n1', name: 'Mara' }] as never,
        removedResidentIds: ['n2'],
      });
    });
    const steading = firestoreStore.get(GAME_PATH)!.steading as { residents?: Array<{ id: string }> };
    expect(steading.residents?.map((r) => r.id)).toEqual(['n1']);
  });

  it('updateSteading persists removedFixedItems and reads it back (#289)', async () => {
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [], steading: {} });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSteading({ removedFixedItems: ['Village militia'] });
    });
    const steading = firestoreStore.get(GAME_PATH)!.steading as { removedFixedItems?: string[] };
    expect(steading.removedFixedItems).toEqual(['Village militia']);
    expect(result.current.game?.steading?.removedFixedItems).toEqual(['Village militia']);
  });

  it('updateSteading unions removedFixedItems so a concurrent removal from a sibling section survives (#289)', async () => {
    // Simulates the Fortifications section removing an item from its own stale local copy
    // of the shared removedFixedItems field, after the Resources section already persisted
    // its own removal — the two writes must not clobber each other.
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0, characters: [],
      steading: { removedFixedItems: ['Farming (beans, potatoes, oats, barley)'] },
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSteading({ removedFixedItems: ['Village militia'] });
    });
    const steading = firestoreStore.get(GAME_PATH)!.steading as { removedFixedItems?: string[] };
    expect(steading.removedFixedItems).toEqual(
      expect.arrayContaining(['Farming (beans, potatoes, oats, barley)', 'Village militia']),
    );
    expect(steading.removedFixedItems).toHaveLength(2);
  });

  it('updateSteading id-merges gmImprovements so a concurrently-added slot survives, and removes via removedGmImprovementIds (#244)', async () => {
    const gi1 = { id: 'g1', title: 'Wall', summary: '', requirements: '', effects: '', completed: false };
    const gi2 = { id: 'g2', title: 'Well', summary: '', requirements: '', effects: '', completed: false };
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0, characters: [],
      steading: { gmImprovements: [gi1] },
    });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The GM concurrently adds a second slot the player's stale snapshot never saw.
    firestoreStore.set(GAME_PATH, {
      name: '', createdAt: 0, characters: [],
      steading: { gmImprovements: [gi1, gi2] },
    });

    await act(async () => {
      await result.current.updateSteading({
        gmImprovements: [{ ...gi1, completed: true }] as never,
      });
    });
    let steading = firestoreStore.get(GAME_PATH)!.steading as { gmImprovements?: Array<{ id: string; completed: boolean }> };
    let byId = new Map(steading.gmImprovements?.map((g) => [g.id, g.completed]));
    expect(byId.get('g1')).toBe(true);
    expect(byId.has('g2')).toBe(true);

    await act(async () => {
      await result.current.updateSteading({
        gmImprovements: [{ ...gi1, completed: true }] as never,
        removedGmImprovementIds: ['g2'],
      });
    });
    steading = firestoreStore.get(GAME_PATH)!.steading as { gmImprovements?: Array<{ id: string; completed: boolean }> };
    byId = new Map(steading.gmImprovements?.map((g) => [g.id, g.completed]));
    expect(byId.has('g2')).toBe(false);
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

  it('surfaces the invalid-write message when a write hits invalid-argument (#254, #268)', async () => {
    firestoreStore.set(GAME_PATH, { name: 'Test', createdAt: 0, characters: [char('a')] });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    // invalid-argument covers both an over-1MiB write and a malformed value (e.g. `undefined`
    // left in the payload by a bug) — the message can't assume which one this is (see
    // INVALID_WRITE_MESSAGE), so this only asserts the code maps to that shared message.
    const { updateDoc } = await import('firebase/firestore');
    (updateDoc as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      Object.assign(new Error('maximum size'), { code: 'invalid-argument' }),
    );

    await act(async () => {
      await expect(result.current.updateGameName('New Name')).rejects.toThrow();
    });
    expect(addToastSpy).toHaveBeenCalledWith(INVALID_WRITE_MESSAGE, 'error');
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

  it('updateSteading strips undefined keys from a plain-object patch like debilities (#278)', async () => {
    // parseDebilities always fills untouched keys with `undefined` (see useGame.ts),
    // so toggling one debility on then off round-trips the others as `undefined` —
    // the real Firestore SDK rejects `undefined` field values outright.
    firestoreStore.set(GAME_PATH, { name: '', createdAt: 0, characters: [], steading: {} });
    const { result } = renderGame();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSteading({
        debilities: { diminished: false, lacking: undefined, malcontent: undefined } as never,
      });
    });
    const steading = firestoreStore.get(GAME_PATH)!.steading as { debilities?: Record<string, unknown> };
    expect(steading.debilities).toEqual({ diminished: false });
    expect('lacking' in steading.debilities!).toBe(false);
    expect('malcontent' in steading.debilities!).toBe(false);
  });
});
