import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { GameIdModal } from '../GameIdModal';

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
});

const noop = () => {};

describe('GameIdModal', () => {
  it('shows the game ID so the GM can save it', () => {
    renderWithProviders(<GameIdModal gameId="abc123" open onClose={noop} />);
    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  it('copies the game ID to the clipboard and confirms success', async () => {
    renderWithProviders(<GameIdModal gameId="abc123" open onClose={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /copy game id/i }));
    expect(writeText).toHaveBeenCalledWith('abc123');
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('shows a manual-copy fallback when the clipboard write fails', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    renderWithProviders(<GameIdModal gameId="abc123" open onClose={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /copy game id/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/copy the id manually/i);
  });

  it('closes when the GM dismisses the modal', async () => {
    const onClose = vi.fn();
    renderWithProviders(<GameIdModal gameId="abc123" open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /got it/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
