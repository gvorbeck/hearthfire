import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addToastSpy, toastModuleMock } from '@/test/toastMock';

// The modal's only context dependency is useToast; mock it so no ToastProvider
// is needed (and its auto-dismiss timer can't hang teardown).
vi.mock('@/components/app', () => toastModuleMock());

import { AddCharacterModal } from '../AddCharacterModal';
import type { Character } from '@/types';

beforeEach(() => { addToastSpy.mockClear(); });

const noop = () => {};

describe('AddCharacterModal', () => {
  it('builds a level-1 character for the chosen playbook and passes it to onAdd', async () => {
    let added: Character | undefined;
    const onAdd = vi.fn(async (c: Character) => { added = c; });
    render(
      <AddCharacterModal open onClose={noop} existingPlaybooks={[]} onAdd={onAdd} />,
    );

    await userEvent.selectOptions(screen.getByLabelText(/playbook/i), 'heavy');
    await userEvent.click(screen.getByRole('button', { name: /add character/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(added?.playbook).toBe('heavy');
    expect(added?.level).toBe(1);
    expect(added?.id).toBeTruthy();
  });

  it('hides playbooks already in the party so the same one cannot be added twice', () => {
    render(
      <AddCharacterModal open onClose={noop} existingPlaybooks={['heavy']} onAdd={vi.fn()} />,
    );
    const select = screen.getByLabelText(/playbook/i) as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).not.toContain('heavy');
    expect(values).toContain('fox');
  });

  it('does not call onAdd when no playbook is selected', async () => {
    const onAdd = vi.fn();
    render(
      <AddCharacterModal open onClose={noop} existingPlaybooks={[]} onAdd={onAdd} />,
    );
    // The Add button is disabled until a playbook is picked.
    expect(screen.getByRole('button', { name: /add character/i })).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('closes the modal after a successful add', async () => {
    const onClose = vi.fn();
    render(
      <AddCharacterModal open onClose={onClose} existingPlaybooks={[]} onAdd={vi.fn().mockResolvedValue(undefined)} />,
    );
    await userEvent.selectOptions(screen.getByLabelText(/playbook/i), 'fox');
    await userEvent.click(screen.getByRole('button', { name: /add character/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('surfaces an error toast and stays open when onAdd rejects', async () => {
    const onClose = vi.fn();
    const onAdd = vi.fn().mockRejectedValue(new Error('write failed'));
    render(
      <AddCharacterModal open onClose={onClose} existingPlaybooks={[]} onAdd={onAdd} />,
    );
    await userEvent.selectOptions(screen.getByLabelText(/playbook/i), 'fox');
    await userEvent.click(screen.getByRole('button', { name: /add character/i }));

    await waitFor(() =>
      expect(addToastSpy).toHaveBeenCalledWith('Failed to add character. Please try again.', 'error'),
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
