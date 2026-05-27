import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderRoute } from '@/test/renderWithProviders';
import { CharacterPlaybook } from '../CharacterPlaybook';
import type { GameSession } from '@/types';

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
    updateGameName: vi.fn(),
    updateContent: vi.fn(),
    updateField: vi.fn(),
    updateSteading: vi.fn(),
    addCharacter: vi.fn(),
    removeCharacter: vi.fn(),
  }),
}));

describe('CharacterPlaybook', () => {
  it('renders without crashing given a valid game document', () => {
    renderRoute(<CharacterPlaybook />, '/game/game-1/heavy', '/game/:id/:playbook');
    expect(screen.getByText('Aldric')).toBeInTheDocument();
  });
});
