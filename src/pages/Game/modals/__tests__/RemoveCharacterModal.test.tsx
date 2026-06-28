import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addToastSpy, toastModuleMock } from '@/test/toastMock';

// The modal's only context dependency is useToast; mock it so no ToastProvider
// is needed (and its auto-dismiss timer can't hang teardown).
vi.mock('@/components/app', () => toastModuleMock());

import { RemoveCharacterModal } from '../RemoveCharacterModal';
import type { Character } from '@/types';

beforeEach(() => { addToastSpy.mockClear(); });

const char: Character = { id: 'c1', name: 'Brgenwose', playbook: 'heavy', level: 1 };
const noop = () => {};

describe('RemoveCharacterModal', () => {
  it('names the character and playbook being removed so the GM confirms the right one', () => {
    render(
      <RemoveCharacterModal open character={char} onClose={noop} onConfirm={vi.fn()} />,
    );
    // The warning copy interpolates the character name and resolved playbook
    // label inside a bold span; the rest of the sentence is a sibling node.
    expect(
      screen.getByText('Brgenwose (The Heavy Playbook)', { selector: 'strong' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/will be permanently removed/i)).toBeInTheDocument();
  });

  it('calls onConfirm exactly once when the GM confirms removal', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <RemoveCharacterModal open character={char} onClose={noop} onConfirm={onConfirm} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /remove character/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes the modal after a successful removal', async () => {
    const onClose = vi.fn();
    render(
      <RemoveCharacterModal open character={char} onClose={onClose} onConfirm={vi.fn().mockResolvedValue(undefined)} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /remove character/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('does NOT confirm removal when the GM cancels — destructive write is averted', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <RemoveCharacterModal open character={char} onClose={onClose} onConfirm={onConfirm} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('surfaces an error toast and stays open when the delete write fails', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockRejectedValue(new Error('delete failed'));
    render(
      <RemoveCharacterModal open character={char} onClose={onClose} onConfirm={onConfirm} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /remove character/i }));

    await waitFor(() =>
      expect(addToastSpy).toHaveBeenCalledWith('Failed to remove character. Please try again.', 'error'),
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
