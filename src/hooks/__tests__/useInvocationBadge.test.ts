import { describe, it, expect } from 'vitest';
import { computeInvocationBadge } from '../useInvocationBadge';
import type { PlaybookFeatures } from '@/types';

const features = (overrides: Partial<PlaybookFeatures> = {}): PlaybookFeatures => ({
  lightbearerInvocations: {},
  ...overrides,
});

describe('computeInvocationBadge', () => {
  it('is false for non-lightbearer playbooks', () => {
    expect(computeInvocationBadge('heavy', 2, features())).toBe(false);
  });

  it('is false at odd levels (no new invocation unlocked)', () => {
    expect(computeInvocationBadge('lightbearer', 3, features())).toBe(false);
  });

  it('is false at level 0', () => {
    expect(computeInvocationBadge('lightbearer', 0, features())).toBe(false);
  });

  it('shows at an even level when fewer invocations are known than allowed', () => {
    // Level 2 allows 2 + floor(2/2) = 3; none known -> badge shows.
    expect(computeInvocationBadge('lightbearer', 2, features())).toBe(true);
  });

  it('hides once the allowed number of invocations are known', () => {
    // Level 2 allows 3; mark 3 as known.
    const known = { a: true, b: true, c: true };
    expect(computeInvocationBadge('lightbearer', 2, features({ lightbearerInvocations: known }))).toBe(false);
  });

  it('stays hidden when dismissed at the current level', () => {
    expect(computeInvocationBadge('lightbearer', 4, features({
      lightbearerInvocationsBadgeDismissedAt: 4,
    }))).toBe(false);
  });

  it('reappears at a later even level even if dismissed at an earlier one', () => {
    expect(computeInvocationBadge('lightbearer', 6, features({
      lightbearerInvocationsBadgeDismissedAt: 4,
    }))).toBe(true);
  });
});
