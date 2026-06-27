import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
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

  it('submitting an existing game ID navigates to /game/:id', async () => {
    mockGameIdExists.mockResolvedValue(true);
    renderWithProviders(<Home />);
    await userEvent.type(screen.getByLabelText(/game id/i), 'xyz789');
    await userEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(mockGameIdExists).toHaveBeenCalledWith('xyz789');
    expect(mockNavigate).toHaveBeenCalledWith('/game/xyz789');
  });

  it('submitting a non-existent game ID shows an inline error and does not navigate', async () => {
    mockGameIdExists.mockResolvedValue(false);
    renderWithProviders(<Home />);
    await userEvent.type(screen.getByLabelText(/game id/i), 'nope');
    await userEvent.click(screen.getByRole('button', { name: /join/i }));
    expect(await screen.findByText(/no game found with that id/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
