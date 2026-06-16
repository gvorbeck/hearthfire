import { isBoolean, isNumber, isString } from '@/lib/typeGuards';
import type { CharacterData, PlaybookFeatures } from '@/types';

// Stricter than isRecord — excludes arrays so a nested feature object can be
// told apart from a feature array below.
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

// Silently drops malformed shapes so a corrupt Firestore document cannot crash the app.
const safeFeatures = (raw: unknown): PlaybookFeatures => {
  if (!isPlainObject(raw)) return {};
  const safe: PlaybookFeatures = {};
  for (const key of Object.keys(raw) as (keyof PlaybookFeatures)[]) {
    const val = raw[key];
    if (val === undefined || val === null) continue;
    if (
      isString(val) ||
      isNumber(val) ||
      isBoolean(val) ||
      isPlainObject(val) ||
      Array.isArray(val)
    ) {
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
