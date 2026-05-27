import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Home } from '../Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/lib/game', () => ({
  createGame: vi.fn().mockResolvedValue('abc123'),
}));

describe('Home', () => {
  it('"Create Game" button calls createGame and navigates to /game/:id', async () => {
    renderWithProviders(<Home />);
    await userEvent.click(screen.getByRole('button', { name: /create game/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/game/abc123', { state: { isNew: true } });
  });

  it('submitting a game ID navigates to /game/:id', async () => {
    renderWithProviders(<Home />);
    await userEvent.type(screen.getByLabelText(/game id/i), 'xyz789');
    await userEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/game/xyz789');
  });
});
