import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/renderWithProviders';
import { CharacterPlaybook } from '../CharacterPlaybook';
import type { GameSession, LoggedRoll } from '@/types';

const logRoll = vi.fn<(roll: LoggedRoll) => Promise<void>>();

const mockGame: GameSession = {
  id: 'game-1',
  name: 'The Long Road',
  createdAt: 0,
  characters: [
    { id: 'char-1', name: 'Aldric', playbook: 'heavy', level: 1 },
  ],
};

vi.mock('@/hooks/useGame', () => ({
  useGame: () => ({
    game: mockGame,
    loading: false,
    error: null,
    updateCharacterName: vi.fn(),
    updateCharacterData: vi.fn(),
    adjustCharacterStats: vi.fn(),
    updateGameName: vi.fn(),
    updateContent: vi.fn(),
    updateField: vi.fn(),
    updateSteading: vi.fn(),
    addCharacter: vi.fn(),
    removeCharacter: vi.fn(),
    logRoll,
  }),
}));

beforeEach(() => {
  logRoll.mockReset();
  logRoll.mockResolvedValue(undefined);
});

describe('CharacterPlaybook', () => {
  it('renders without crashing given a valid game document', () => {
    renderRoute(<CharacterPlaybook />, '/game/game-1/heavy', '/game/:id/:playbook');
    expect(screen.getByText('Aldric')).toBeInTheDocument();
  });

  // Switching a roll to advantage alters that roll rather than making a new one, so the shared log has
  // to edit the entry in place — which only works if both writes carry the same id.
  it('logs an advantage change under the id of the roll it changed', async () => {
    const user = userEvent.setup();
    renderRoute(<CharacterPlaybook />, '/game/game-1/heavy', '/game/:id/:playbook');

    await user.click(screen.getAllByLabelText(/^Roll \+/)[0]);
    expect(logRoll).toHaveBeenCalledTimes(1);

    await user.click(screen.getAllByRole('button', { name: 'Adv', hidden: true })[0]);
    expect(logRoll).toHaveBeenCalledTimes(2);

    const [first, second] = logRoll.mock.calls.map(([roll]) => roll);
    expect(second.id).toBe(first.id);
    expect(second.characterId).toBe('char-1');
    expect(second.mode).toBe('adv');
    // The first two dice survive the switch; only a third is added.
    expect(second.dice.slice(0, 2)).toEqual(first.dice);
    // Full-page render plus two clicks: well under the 5s default locally, but CI runners are several times slower.
  }, 20000);
});
