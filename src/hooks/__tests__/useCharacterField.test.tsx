import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toastModuleMock } from '@/test/toastMock';

vi.mock('@/components/app', () => toastModuleMock());

import { useCharacterField } from '../useCharacterField';
import { usePlaybookField } from '../usePlaybookField';

afterEach(() => { vi.clearAllMocks(); });

describe('useCharacterField', () => {
  it('wraps the value into a single-key CharacterData patch on save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => useCharacterField('appearanceCustom', 'old', onSave, 'failed'),
      undefined,
    );

    await act(async () => { result.current.save('new'); });
    expect(result.current.value).toBe('new');
    expect(onSave).toHaveBeenCalledWith({ appearanceCustom: 'new' });
  });
});

describe('usePlaybookField', () => {
  it('wraps the value into a single-key PlaybookFeatures patch on save', async () => {
    const saveImmediate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => usePlaybookField('sacredPouchTrait', 'iron', saveImmediate, 'failed'),
      undefined,
    );

    await act(async () => { result.current.save('silver'); });
    expect(result.current.value).toBe('silver');
    expect(saveImmediate).toHaveBeenCalledWith({ sacredPouchTrait: 'silver' });
  });
});
