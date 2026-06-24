import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stats } from '../Stats';
import type { CharacterData } from '@/types';

// Renders Stats like CharacterSheet does: a `data` snapshot (the Firestore
// value) plus an onSave spy.
const setup = (initial: CharacterData) => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const Wrapper = () => {
    const [data] = useState(initial);
    return <Stats data={data} onSave={onSave} hpMax={18} />;
  };
  render(<Wrapper />);
  return { onSave };
};

const xpInput = () => screen.getByLabelText('XP') as HTMLInputElement;

beforeEach(() => { vi.useRealTimers(); });
afterEach(() => { vi.restoreAllMocks(); });

describe('Stats — XP save ownership (frozen-tab regression #xp-wipe)', () => {
  // Let queued microtasks (the debounced-save chain) settle.
  const settle = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

  it('does not replay a stale local XP after a fresher server value arrives', async () => {
    const user = userEvent.setup();
    // statHp seeded so the auto-initialization effect stays quiet — we only
    // want to observe XP writes here.
    const { onSave } = setup({ statHp: '18', statXp: '0' } as CharacterData);

    // The user touches XP on this tab — marking the field dirty — then it saves.
    await user.clear(xpInput());
    await user.type(xpInput(), '2');
    act(() => { xpInput().blur(); });
    await settle();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ statXp: '2' }));

    onSave.mockClear();

    // The tab is backgrounded for days. On iOS Safari the Firestore listener is
    // suspended, so NO fresh snapshot has arrived — local state is frozen at the
    // stale '2', even though XP has genuinely changed on the server since.
    //
    // The user comes back and edits a DIFFERENT field (HP). Because statXp is
    // still in dirtyRef from the earlier edit, pickDirty bundles the stale '2'
    // into the HP save. The combined payload differs from the last-saved value,
    // so useDebouncedSave's dedup does NOT suppress it — the stale XP is written
    // to the server, clobbering the real value.
    const hpInput = screen.getByLabelText('HP (max 18)') as HTMLInputElement;
    await user.clear(hpInput);
    await user.type(hpInput, '15');
    act(() => { hpInput.blur(); });
    await settle();

    const replayed = onSave.mock.calls.some(
      ([payload]) => (payload as Partial<CharacterData>).statXp === '2',
    );
    expect(replayed).toBe(false);
  });

  it('keeps persisting a field the user re-edits while its save is still in flight', async () => {
    const user = userEvent.setup();
    // Controllable save so we can edit again before the first write resolves.
    const resolvers: Array<() => void> = [];
    const onSave = vi.fn().mockImplementation(() => new Promise<void>((r) => { resolvers.push(r); }));
    const Wrapper = () => {
      const [data] = useState({ statHp: '18', statXp: '0' } as CharacterData);
      return <Stats data={data} onSave={onSave} hpMax={18} />;
    };
    render(<Wrapper />);

    // First edit → save begins (kept pending).
    await user.clear(xpInput());
    await user.type(xpInput(), '2');
    act(() => { xpInput().blur(); });
    await settle();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ statXp: '2' }));

    // User edits XP again before the first save resolves.
    await user.clear(xpInput());
    await user.type(xpInput(), '5');

    // First save resolves. Its onSuccess must NOT release statXp from dirty —
    // the live value is now '5', not the persisted '2'.
    await act(async () => { resolvers[0]?.(); });
    await settle();

    // Blurring flushes the newer value; '5' must win — not get reverted to '2'.
    act(() => { xpInput().blur(); });
    await act(async () => { resolvers[1]?.(); });
    await settle();

    expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ statXp: '5' }));
  });
});
