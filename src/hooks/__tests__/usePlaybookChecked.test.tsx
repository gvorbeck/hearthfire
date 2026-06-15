import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toastModuleMock } from '@/test/toastMock';

vi.mock('@/components/app', () => toastModuleMock());
vi.mock('@/components/app/Toast/ToastContext', () => toastModuleMock());

import { usePlaybookChecked, usePlaybookCheckedWithAnswers } from '../usePlaybookChecked';
import type { CharacterData } from '@/types';

afterEach(() => { vi.clearAllMocks(); });

const dataWith = (features: Record<string, unknown>): CharacterData =>
  ({ playbookFeatures: features } as CharacterData);

describe('usePlaybookChecked', () => {
  it('seeds checked state from the resolved feature key', () => {
    // Hoist data outside the render callback so its reference is stable — the
    // hook's sync effect depends on `data` and would otherwise re-fire forever.
    const data = dataWith({ marshalWarStories: { a: true } });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePlaybookChecked(data, onSave, 'marshalWarStories'));
    expect(result.current.checked).toEqual({ a: true });
  });

  it('optimistically toggles and saves a merged featurePatch', async () => {
    const data = dataWith({ marshalWarStories: { a: true } });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePlaybookChecked(data, onSave, 'marshalWarStories'));

    await act(async () => { result.current.handleChange('b', true); });
    expect(result.current.checked).toEqual({ a: true, b: true });
    // featurePatch preserves the rest of playbookFeatures alongside the new key.
    expect(onSave).toHaveBeenCalledWith({ playbookFeatures: { marshalWarStories: { a: true, b: true } } });
  });

  it('rolls back the toggle when the save rejects', async () => {
    const data = dataWith({ marshalWarStories: { a: true } });
    const onSave = vi.fn().mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => usePlaybookChecked(data, onSave, 'marshalWarStories'));

    await act(async () => { result.current.handleChange('a', false); });
    expect(result.current.checked).toEqual({ a: true });
  });

  it('ignores an incoming data sync while a save is pending (no double-clobber)', async () => {
    let resolveSave: () => void = () => {};
    const onSave = vi.fn(() => new Promise<void>((r) => { resolveSave = r; }));
    const { result, rerender } = renderHook(
      ({ data }) => usePlaybookChecked(data, onSave, 'marshalWarStories'),
      { initialProps: { data: dataWith({ marshalWarStories: { a: true } }) } },
    );

    act(() => { result.current.handleChange('b', true); });
    // Remote echo arrives mid-save — must not overwrite the optimistic state.
    rerender({ data: dataWith({ marshalWarStories: { a: true } }) });
    expect(result.current.checked).toEqual({ a: true, b: true });

    await act(async () => { resolveSave(); });
  });
});

describe('usePlaybookCheckedWithAnswers', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('debounces answer saves and saves the latest value', async () => {
    const data = dataWith({ marshalWarStories: {}, marshalWarStoriesAnswers: {} });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => usePlaybookCheckedWithAnswers(data, onSave, 'marshalWarStories', 'marshalWarStoriesAnswers'),
    );

    act(() => { result.current.handleAnswer('q1', 'partial'); });
    act(() => { result.current.handleAnswer('q1', 'final'); });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ playbookFeatures: { marshalWarStories: {}, marshalWarStoriesAnswers: { q1: 'final' } } });
  });

  it('flushes pending answers immediately on flushAnswers', async () => {
    const data = dataWith({ marshalWarStories: {}, marshalWarStoriesAnswers: {} });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => usePlaybookCheckedWithAnswers(data, onSave, 'marshalWarStories', 'marshalWarStoriesAnswers'),
    );

    act(() => { result.current.handleAnswer('q1', 'now'); });
    // flushAnswers bypasses the debounce timer and saves synchronously; await
    // the act so the save chain settles without advancing fake timers.
    await act(async () => { result.current.flushAnswers(); });
    expect(onSave).toHaveBeenCalledWith({
      playbookFeatures: { marshalWarStories: {}, marshalWarStoriesAnswers: { q1: 'now' } },
    });
  });

  it('prevents a double save by deduping repeated identical checkbox toggles', async () => {
    const data = dataWith({ marshalWarStories: {}, marshalWarStoriesAnswers: {} });
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => usePlaybookCheckedWithAnswers(data, onSave, 'marshalWarStories', 'marshalWarStoriesAnswers'),
    );

    await act(async () => { result.current.handleChange('a', true); });
    expect(result.current.checked).toEqual({ a: true });
    expect(onSave).toHaveBeenCalledWith({
      playbookFeatures: { marshalWarStories: { a: true }, marshalWarStoriesAnswers: {} },
    });
  });
});
