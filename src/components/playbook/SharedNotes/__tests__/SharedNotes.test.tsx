import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SharedNotes, type NotesActions } from '../SharedNotes';
import { NOTES_CLIENT_ID } from '@/lib/sharedNotes';
import type { NotesLock } from '@/types';

const actions = (): NotesActions => ({
  updateNotes: vi.fn(() => Promise.resolve()),
  claimNotesLock: vi.fn(() => Promise.resolve(true)),
  refreshNotesLock: vi.fn(() => Promise.resolve()),
  releaseNotesLock: vi.fn(() => Promise.resolve()),
});

const renderNotes = (props: { html?: string; lock?: NotesLock; warning?: string } = {}) =>
  render(<SharedNotes notesKey="gm" html={props.html} lock={props.lock} actions={actions()} warning={props.warning} />);

describe('SharedNotes', () => {
  it('renders the saved content in an editable, labelled textbox', async () => {
    renderNotes({ html: '<p>Remember the <strong>ferry</strong></p>' });
    const box = await screen.findByRole('textbox', { name: 'Notes' });
    expect(box).toHaveAttribute('contenteditable', 'true');
    expect(box).toHaveAttribute('aria-readonly', 'false');
    expect(box.querySelector('strong')).toHaveTextContent('ferry');
    expect(screen.queryByText('Someone is typing…')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toBeEnabled();
  });

  it('strips markup the notes schema has no place for', async () => {
    renderNotes({ html: '<p>hi</p><script>window.pwned = true</script><img src=x onerror="window.pwned = true">' });
    const box = await screen.findByRole('textbox', { name: 'Notes' });
    expect(box.querySelector('script, img')).toBeNull();
  });

  it("locks the editor and says so while another tab holds the lock", async () => {
    renderNotes({ lock: { clientId: 'other-tab', at: 1 } });
    const box = await screen.findByRole('textbox', { name: 'Notes' });
    expect(box).toHaveAttribute('contenteditable', 'false');
    expect(box).toHaveAttribute('aria-readonly', 'true');
    expect(screen.getByText('Someone is typing…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
  });

  it("stays editable under this tab's own lock", async () => {
    renderNotes({ lock: { clientId: NOTES_CLIENT_ID, at: 1 } });
    const box = await screen.findByRole('textbox', { name: 'Notes' });
    expect(box).toHaveAttribute('contenteditable', 'true');
  });

  it('shows the visibility warning when given one', async () => {
    renderNotes({ warning: 'Everyone in this game can see these notes.' });
    expect(screen.getByRole('note')).toHaveTextContent('Everyone in this game can see these notes.');
    await screen.findByRole('textbox', { name: 'Notes' });
  });

  it('exposes the toolbar as a single tab stop', async () => {
    renderNotes();
    await screen.findByRole('textbox', { name: 'Notes' });
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    const tabbable = [...toolbar.querySelectorAll('button')].filter((b) => b.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
  });
});
