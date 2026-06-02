import type { PlaybookFeatures } from '@/types';

export const computeInvocationBadge = (
  playbook: string,
  level: number,
  features: PlaybookFeatures,
): boolean => {
  const knownInvocations = Object.values(features.lightbearerInvocations ?? {}).filter(Boolean).length;
  const invocationsAllowed = 2 + Math.floor(level / 2);
  const dismissedAt = features.lightbearerInvocationsBadgeDismissedAt ?? 0;
  return (
    playbook === 'lightbearer' &&
    level > 0 && level % 2 === 0 &&
    knownInvocations < invocationsAllowed &&
    dismissedAt !== level
  );
};
