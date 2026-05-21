import type { CharacterData, PlaybookFeatures } from '@/types';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

// Validates that playbookFeatures from Firestore is a plain object and that
// each present value is a primitive or plain object. Silently drops malformed
// shapes so a corrupt document cannot crash the app.
const safeFeatures = (raw: unknown): PlaybookFeatures => {
  if (!isPlainObject(raw)) return {};
  const safe: PlaybookFeatures = {};
  for (const key of Object.keys(raw) as (keyof PlaybookFeatures)[]) {
    const val = raw[key];
    if (val === undefined || val === null) continue;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || isPlainObject(val)) {
      (safe as Record<string, unknown>)[key] = val;
    }
  }
  return safe;
};

export const resolvePlaybookFeatures = (data: CharacterData | undefined): PlaybookFeatures =>
  safeFeatures(data?.playbookFeatures);

export const featurePatch = (
  data: CharacterData | undefined,
  patch: Partial<PlaybookFeatures>,
): Partial<CharacterData> => ({
  playbookFeatures: { ...resolvePlaybookFeatures(data), ...patch },
});
