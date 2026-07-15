import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { toastModuleMock, addToastSpy } from '@/test/toastMock';
import type { ArcanaMinorEntry, ArcanaMajorEntry } from '@/types';

vi.mock('@/components/app', () => toastModuleMock());
vi.mock('@/components/app/Toast/ToastContext', () => toastModuleMock());

// Mock the heavy datasets so the hook's dynamic import() resolves to tiny fixtures — this is
// also what proves the hook reads only id/name/weight (the fixtures carry nothing else).
vi.mock('@/lib/arcana/minor', () => ({
  MINOR_ARCANA: [{ id: 'm1', name: 'Trinket', weight: 1 }, { id: 'm2', name: 'A folktale' }],
}));
vi.mock('@/lib/arcana/major', () => ({
  MAJOR_ARCANA: [{ id: 'M1', name: 'Relic', weight: 2 }],
}));

import { useArcanaWeights } from './useArcanaWeights';

// Stable references so the hook's effect (keyed on whether arcana exist) doesn't re-fire.
const NONE_MINOR: ArcanaMinorEntry[] = [];
const NONE_MAJOR: ArcanaMajorEntry[] = [];

afterEach(() => { vi.clearAllMocks(); });

describe('useArcanaWeights', () => {
  it('resolves to empty maps immediately when the character has no arcana, without importing', () => {
    const { result } = renderHook(() => useArcanaWeights(NONE_MINOR, NONE_MAJOR));
    // Never null: the no-arcana case skips the dynamic import and starts resolved.
    expect(result.current).toEqual({ minor: {}, major: {} });
  });

  it('loads and projects id -> { name, weight } when the character has arcana', async () => {
    const minor: ArcanaMinorEntry[] = [{ id: 'm1' } as ArcanaMinorEntry];
    const { result } = renderHook(() => useArcanaWeights(minor, NONE_MAJOR));
    // Pending until the dynamic import resolves.
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current).toEqual({
      minor: { m1: { name: 'Trinket', weight: 1 }, m2: { name: 'A folktale', weight: undefined } },
      major: { M1: { name: 'Relic', weight: 2 } },
    });
  });
});

describe('useArcanaWeights when the data fails to load', () => {
  it('falls back to empty maps and shows an error toast', async () => {
    // Re-mock the imports to reject, simulating an offline/failed chunk download.
    vi.doMock('@/lib/arcana/minor', () => { throw new Error('offline'); });
    vi.doMock('@/lib/arcana/major', () => { throw new Error('offline'); });
    vi.resetModules();
    const { useArcanaWeights: freshHook } = await import('./useArcanaWeights');

    const major: ArcanaMajorEntry[] = [{ id: 'M1' } as ArcanaMajorEntry];
    const { result } = renderHook(() => freshHook([], major));
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).not.toBeNull());
    // Resolved (not stuck on the pending indicator), just with nothing to count.
    expect(result.current).toEqual({ minor: {}, major: {} });
    expect(addToastSpy).toHaveBeenCalledWith(
      'Could not load arcana weights; load total may be incomplete.',
      'error',
    );
  });
});
