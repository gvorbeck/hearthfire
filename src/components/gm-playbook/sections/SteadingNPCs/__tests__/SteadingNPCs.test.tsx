import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toastModuleMock } from '@/test/toastMock';

// useOptimisticField (via SteadingNPCs) pulls useToast from @/components/app.
// Mock the barrel so no ToastProvider is needed (its auto-dismiss timer would
// otherwise risk hanging teardown).
vi.mock('@/components/app', () => toastModuleMock());

import { SteadingNPCs } from '../SteadingNPCs';
import type { GameSession, SteadingNPC, SteadingData } from '@/types';

type SaveFn = (patch: Partial<SteadingData>) => Promise<void>;

const game: GameSession = {
  id: 'g1',
  name: 'Test Game',
  createdAt: 0,
  characters: [],
};

const npc = (id: string, overrides: Partial<SteadingNPC> = {}): SteadingNPC => ({
  id,
  name: `NPC ${id}`,
  ...overrides,
});

// Pull the residents array out of the latest patch the section writes to Firestore.
const residentsFrom = (spy: ReturnType<typeof vi.fn<SaveFn>>): SteadingNPC[] => {
  const calls = spy.mock.calls;
  return calls[calls.length - 1][0].residents ?? [];
};

let onSave: ReturnType<typeof vi.fn<SaveFn>>;
beforeEach(() => { onSave = vi.fn<SaveFn>().mockResolvedValue(undefined); });

const renderSection = (npcs: SteadingNPC[]) =>
  render(
    <SteadingNPCs section="residents" npcs={npcs} onSave={onSave} game={game} />,
  );

describe('SteadingNPCs mutations', () => {
  it('adds a new NPC via the modal and persists it to the residents array', async () => {
    renderSection([]);

    await userEvent.click(screen.getByRole('button', { name: /add npc/i }));
    await userEvent.type(screen.getByRole('textbox', { name: /^name/i }), 'Mara');
    await userEvent.click(screen.getByRole('button', { name: /save npc/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const residents = residentsFrom(onSave);
    expect(residents).toHaveLength(1);
    expect(residents[0].name).toBe('Mara');
    expect(residents[0].id).toBeTruthy();
  });

  it('does not save an NPC with a blank name', async () => {
    renderSection([]);
    await userEvent.click(screen.getByRole('button', { name: /add npc/i }));
    // Save is disabled until a name is entered.
    expect(screen.getByRole('button', { name: /save npc/i })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('removes only the targeted NPC and preserves the rest', async () => {
    renderSection([npc('a', { name: 'Alda' }), npc('b', { name: 'Bram' })]);

    await userEvent.click(screen.getByRole('button', { name: /remove Alda/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const residents = residentsFrom(onSave);
    expect(residents.map((n) => n.name)).toEqual(['Bram']);
  });

  it('toggles an NPC dead, writing the dead flag without dropping the NPC', async () => {
    renderSection([npc('a', { name: 'Alda' })]);

    await userEvent.click(screen.getByRole('button', { name: /mark Alda as dead/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const residents = residentsFrom(onSave);
    expect(residents).toHaveLength(1);
    expect(residents[0].dead).toBe(true);
  });

  it('edits an existing NPC in place, keeping its id', async () => {
    renderSection([npc('a', { name: 'Alda' })]);

    await userEvent.click(screen.getByRole('button', { name: /edit Alda/i }));
    const dialog = screen.getByRole('dialog');
    const nameInput = within(dialog).getByRole('textbox', { name: /^name/i });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Aldara');
    await userEvent.click(within(dialog).getByRole('button', { name: /save npc/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const residents = residentsFrom(onSave);
    expect(residents).toHaveLength(1);
    expect(residents[0].id).toBe('a');
    expect(residents[0].name).toBe('Aldara');
  });
});
