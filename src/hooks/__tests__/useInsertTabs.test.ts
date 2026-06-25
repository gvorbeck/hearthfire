import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/components/app', () => toastModuleMock());
vi.mock('@/components/app/Toast/ToastContext', () => toastModuleMock());

import { toastModuleMock, addToastSpy } from '@/test/toastMock';
import { useInsertTabs } from '../useInsertTabs';
import type { Character, CharacterData } from '@/types';

afterEach(() => { vi.clearAllMocks(); });

// Three fixed tabs precede the playbook tabs in handleAddInsert's math.
const PLAYBOOK_TAB_COUNT = 2;

const makeCharacter = (data?: CharacterData): Character => ({
  id: 'char-1',
  name: 'Test',
  playbook: 'blessed',
  level: 1,
  data,
});

const setup = (data?: CharacterData, onSave = vi.fn().mockResolvedValue(undefined)) => {
  const setActiveIndex = vi.fn();
  const getPlaybookTabCount = vi.fn().mockReturnValue(PLAYBOOK_TAB_COUNT);
  const character = makeCharacter(data);
  const hook = renderHook(() =>
    useInsertTabs(character, onSave, getPlaybookTabCount, setActiveIndex),
  );
  return { hook, onSave, setActiveIndex, getPlaybookTabCount };
};

describe('useInsertTabs — add/remove modal state', () => {
  it('opens and closes the add-tab modal', () => {
    const { hook } = setup();
    expect(hook.result.current.addTabOpen).toBe(false);

    act(() => hook.result.current.handleOpenAddTab());
    expect(hook.result.current.addTabOpen).toBe(true);

    act(() => hook.result.current.handleCloseAddTab());
    expect(hook.result.current.addTabOpen).toBe(false);
  });

  it('requests and clears the insert pending removal', () => {
    const { hook } = setup();
    expect(hook.result.current.removeInsert).toBeNull();

    act(() => hook.result.current.handleRequestRemoveInsert('Ghost'));
    expect(hook.result.current.removeInsert).toBe('Ghost');

    act(() => hook.result.current.handleCloseRemoveInsert());
    expect(hook.result.current.removeInsert).toBeNull();
  });

  it('exposes a per-option remove handler for every insert option', () => {
    const { hook } = setup();
    act(() => hook.result.current.removeInsertHandlers.Thrall());
    expect(hook.result.current.removeInsert).toBe('Thrall');
  });
});

describe('useInsertTabs — handleAddInsert', () => {
  it('appends a new insert and sets the active index past the fixed + playbook tabs', async () => {
    const { hook, onSave, setActiveIndex } = setup({ inserts: ['Ghost'] });

    await act(async () => { await hook.result.current.handleAddInsert('Thrall'); });

    expect(onSave).toHaveBeenCalledWith({ inserts: ['Ghost', 'Thrall'] });
    // 3 fixed + 2 playbook = 5 tabs precede the inserts; next has 2 inserts → last index 6.
    expect(setActiveIndex).toHaveBeenCalledWith(6);
    expect(hook.result.current.addTabOpen).toBe(false);
  });

  it('treats an absent inserts array as empty', async () => {
    const { hook, onSave, setActiveIndex } = setup(undefined);

    await act(async () => { await hook.result.current.handleAddInsert('Revenant'); });

    expect(onSave).toHaveBeenCalledWith({ inserts: ['Revenant'] });
    // 3 fixed + 2 playbook = 5; one insert → last index 5.
    expect(setActiveIndex).toHaveBeenCalledWith(5);
  });

  it('does not save when the insert already exists, but still closes the modal', async () => {
    const { hook, onSave, setActiveIndex } = setup({ inserts: ['Followers'] });
    act(() => hook.result.current.handleOpenAddTab());

    await act(async () => { await hook.result.current.handleAddInsert('Followers'); });

    expect(onSave).not.toHaveBeenCalled();
    expect(setActiveIndex).not.toHaveBeenCalled();
    expect(hook.result.current.addTabOpen).toBe(false);
  });

  it('keeps the modal open and toasts on save failure', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network'));
    const { hook, setActiveIndex } = setup({ inserts: [] }, onSave);
    act(() => hook.result.current.handleOpenAddTab());

    await act(async () => { await hook.result.current.handleAddInsert('Ghost'); });

    expect(setActiveIndex).not.toHaveBeenCalled();
    expect(hook.result.current.addTabOpen).toBe(true);
    expect(addToastSpy).toHaveBeenCalledWith('Failed to add insert. Try again.', 'error');
  });
});

describe('useInsertTabs — handleConfirmRemoveInsert', () => {
  it('does nothing when no insert is pending removal', async () => {
    const { hook, onSave } = setup({ inserts: ['Ghost'] });

    await act(async () => { await hook.result.current.handleConfirmRemoveInsert(); });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('removes a non-Followers insert and preserves the followers feature', async () => {
    const data: CharacterData = {
      inserts: ['Ghost', 'Thrall'],
      playbookFeatures: { followers: [{ id: 'f1', name: 'Ada' }] },
    };
    const { hook, onSave, setActiveIndex } = setup(data);

    act(() => hook.result.current.handleRequestRemoveInsert('Ghost'));
    await act(async () => { await hook.result.current.handleConfirmRemoveInsert(); });

    expect(onSave).toHaveBeenCalledWith({
      inserts: ['Thrall'],
      playbookFeatures: { followers: [{ id: 'f1', name: 'Ada' }] },
    });
    expect(setActiveIndex).toHaveBeenCalledWith(0);
    expect(hook.result.current.removeInsert).toBeNull();
  });

  it('strips the followers feature when removing the Followers insert', async () => {
    const data: CharacterData = {
      inserts: ['Followers', 'Ghost'],
      playbookFeatures: {
        followers: [{ id: 'f1', name: 'Ada' }],
        revenantInstinct: 'kept',
      },
    };
    const { hook, onSave } = setup(data);

    act(() => hook.result.current.handleRequestRemoveInsert('Followers'));
    await act(async () => { await hook.result.current.handleConfirmRemoveInsert(); });

    const saved = onSave.mock.calls[0][0];
    expect(saved.inserts).toEqual(['Ghost']);
    expect(saved.playbookFeatures).not.toHaveProperty('followers');
    expect(saved.playbookFeatures).toEqual({ revenantInstinct: 'kept' });
  });

  it('toasts and clears the pending insert on save failure', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network'));
    const { hook, setActiveIndex } = setup({ inserts: ['Ghost'] }, onSave);

    act(() => hook.result.current.handleRequestRemoveInsert('Ghost'));
    await act(async () => { await hook.result.current.handleConfirmRemoveInsert(); });

    expect(setActiveIndex).not.toHaveBeenCalled();
    expect(hook.result.current.removeInsert).toBeNull();
    expect(addToastSpy).toHaveBeenCalledWith('Failed to remove insert. Try again.', 'error');
  });
});
