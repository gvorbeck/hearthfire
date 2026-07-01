import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useState } from 'react';
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

  // The parent (Game.tsx) mounts this modal only while open, so copy feedback
  // resets on each reopen via the mount lifecycle rather than a reset effect.
  // This mirrors that pattern and guards the reset behavior against regression.
  it('resets copy feedback when reopened (fresh mount, not a stale "Copied" state)', async () => {
    const Harness = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)}>toggle</button>
          {open && <GameIdModal gameId="abc123" open onClose={() => setOpen(false)} />}
        </>
      );
    };
    renderWithProviders(<Harness />);

    // Copy → "Copied" feedback appears.
    await userEvent.click(screen.getByRole('button', { name: /copy game id/i }));
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();

    // Close, then reopen.
    await userEvent.click(screen.getByRole('button', { name: /got it/i }));
    await userEvent.click(screen.getByRole('button', { name: /toggle/i }));

    // The reopened modal shows the neutral copy button, not the stale "Copied" one.
    expect(await screen.findByRole('button', { name: /copy game id/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copied/i })).not.toBeInTheDocument();
  });
});
