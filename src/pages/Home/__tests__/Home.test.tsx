import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { gameIdExists } from '@/lib/game';
import { Home } from '../Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/lib/game', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/game')>();
  return {
    ...actual,
    createGame: vi.fn().mockResolvedValue('abc123'),
    gameIdExists: vi.fn(),
  };
});

const mockGameIdExists = vi.mocked(gameIdExists);

describe('Home', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGameIdExists.mockReset();
  });

  it('"Create Game" button calls createGame and navigates to /game/:id', async () => {
    renderWithProviders(<Home />);
    await userEvent.click(screen.getByRole('button', { name: /create game/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/game/abc123', { state: { isNew: true } });
  });

  it('shows "Game found" once the live check resolves, then submitting navigates to /game/:id', async () => {
    mockGameIdExists.mockResolvedValue(true);
    renderWithProviders(<Home />);
    await userEvent.type(screen.getByLabelText(/game id/i), 'xyz789');
    expect(await screen.findByText(/game found/i, {}, { timeout: 2000 })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /join/i })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(mockGameIdExists).toHaveBeenCalledWith('xyz789');
    expect(mockNavigate).toHaveBeenCalledWith('/game/xyz789');
  });

  it('shows an inline "no game found" hint and keeps the Join button disabled for a non-existent ID', async () => {
    mockGameIdExists.mockResolvedValue(false);
    renderWithProviders(<Home />);
    await userEvent.type(screen.getByLabelText(/game id/i), 'nope');
    expect(await screen.findByText(/no game found with that id/i, {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join/i })).toBeDisabled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
