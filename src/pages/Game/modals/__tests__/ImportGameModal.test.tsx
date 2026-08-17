import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ImportGameModal } from '../ImportGameModal';
import type { GameExportEnvelope, ImportSummary } from '@/lib/gameBackup';

const noop = () => {};

const envelope = (overrides: Partial<GameExportEnvelope> = {}): GameExportEnvelope => ({
  format: 'hearthfire-game-export',
  version: 1,
  exportedAt: '2026-08-17T14:30:00.000Z',
  gameId: 'long-winter',
  gameName: 'The Long Winter',
  game: { name: 'The Long Winter' },
  ...overrides,
});

const summary = (overrides: Partial<ImportSummary> = {}): ImportSummary => ({
  characters: 2,
  rolls: 3,
  hasSteading: true,
  bytes: 1024,
  ...overrides,
});

const renderModal = (props: Partial<React.ComponentProps<typeof ImportGameModal>> = {}) =>
  render(
    <ImportGameModal
      open
      gameId="long-winter"
      currentName="The Long Winter"
      envelope={envelope()}
      summary={summary()}
      onClose={noop}
      onConfirm={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );

describe('ImportGameModal', () => {
  it('identifies which backup is about to be restored', () => {
    renderModal();
    expect(screen.getByText('The Long Winter')).toBeInTheDocument();
    expect(screen.getByText('2 characters, steading data, 3 logged rolls')).toBeInTheDocument();
  });

  it('singularizes the counts so a one-character backup does not read as broken', () => {
    renderModal({ summary: summary({ characters: 1, rolls: 1 }) });
    expect(screen.getByText('1 character, steading data, 1 logged roll')).toBeInTheDocument();
  });

  it('omits steading and rolls from the summary when the backup has neither', () => {
    renderModal({ summary: summary({ characters: 4, rolls: 0, hasSteading: false }) });
    expect(screen.getByText('4 characters')).toBeInTheDocument();
  });

  it('labels an unnamed backup rather than showing a blank row', () => {
    renderModal({ envelope: envelope({ gameName: '   ' }) });
    expect(screen.getByText('Untitled game')).toBeInTheDocument();
  });

  it('says the date is unknown when the backup carries no timestamp', () => {
    renderModal({ envelope: envelope({ exportedAt: '' }) });
    expect(screen.getByText('unknown date')).toBeInTheDocument();
  });

  it('shows a hand-edited timestamp as-is instead of "Invalid Date"', () => {
    renderModal({ envelope: envelope({ exportedAt: 'last tuesday' }) });
    expect(screen.getByText('last tuesday')).toBeInTheDocument();
  });

  it('warns that the overwrite cannot be undone from the app', () => {
    renderModal();
    expect(screen.getByText(/everything in this game will be overwritten/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone from inside the app/i)).toBeInTheDocument();
  });

  it('promises the safety copy so the GM knows an undo file is coming', () => {
    renderModal();
    expect(screen.getByText(/copy of the current data will download first/i)).toBeInTheDocument();
  });

  it('flags a backup taken from a different game — the usual wrong-file mistake', () => {
    renderModal({ envelope: envelope({ gameId: 'other-game' }), gameId: 'long-winter' });
    expect(screen.getByText(/came from a different game/i)).toBeInTheDocument();
  });

  it('stays quiet about origin when the backup matches this game', () => {
    renderModal();
    expect(screen.queryByText(/came from a different game/i)).not.toBeInTheDocument();
  });

  it('does not flag a mismatch when the backup records no game id at all', () => {
    renderModal({ envelope: envelope({ gameId: '' }) });
    expect(screen.queryByText(/came from a different game/i)).not.toBeInTheDocument();
  });

  it('confirms exactly once when the GM commits to the overwrite', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderModal({ onConfirm });
    await userEvent.click(screen.getByRole('button', { name: /replace game data/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does NOT overwrite when the GM cancels — the destructive write is averted', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    renderModal({ onConfirm, onClose });
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('locks both buttons while the overwrite runs so it cannot be fired twice', async () => {
    let release: () => void = noop;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    renderModal({ onConfirm });

    await userEvent.click(screen.getByRole('button', { name: /replace game data/i }));

    const replacing = screen.getByRole('button', { name: /replacing/i });
    expect(replacing).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();

    release();
    await waitFor(() => expect(screen.getByRole('button', { name: /replace game data/i })).toBeEnabled());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('unlocks the buttons after a failed overwrite so the GM can retry', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('write failed'));
    renderModal({ onConfirm });

    await userEvent.click(screen.getByRole('button', { name: /replace game data/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /replace game data/i })).toBeEnabled());
    expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled();
  });
});
