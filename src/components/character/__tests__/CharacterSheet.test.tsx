import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderRoute } from '@/test/renderWithProviders';
import { CharacterPlaybook } from '@/pages/CharacterPlaybook/CharacterPlaybook';
import type { GameSession } from '@/types';

const mockGame: GameSession = {
  id: 'game-1',
  name: 'The Long Road',
  createdAt: 0,
  characters: [
    { id: 'char-1', name: 'Sable', playbook: 'blessed', level: 1 },
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

describe('CharacterSheet — playbook-specific sections', () => {
  it('renders Blessed-specific "Sacred Pouch" section for a blessed character', () => {
    renderRoute(<CharacterPlaybook />, '/game/game-1/blessed', '/game/:id/:playbook');
    expect(screen.getByText('Sacred Pouch')).toBeInTheDocument();
  });
});
