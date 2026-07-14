// Narrow type guards shared by the Firestore parsers in useGame.ts, where the
// raw doc shape is `unknown` and every field needs a typeof check before use.

export const isString = (v: unknown): v is string => typeof v === 'string';
export const isNumber = (v: unknown): v is number => typeof v === 'number';
export const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';

// True for plain objects (and arrays) — the precondition for casting to a
// Record<string, unknown> before reading fields off a raw Firestore value.
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

// True for plain objects only (excludes arrays) — used to tell a per-key
// mergeable Record field (e.g. typeMoves) apart from an array field (e.g.
// arcanaMinor), which needs id-keyed merging instead of a shallow spread.
export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  isRecord(v) && !Array.isArray(v);

// Keep only the array elements matching a guard. Returns undefined for
// non-arrays so callers can leave the field off entirely.
export const filterByType = <T>(v: unknown, guard: (x: unknown) => x is T): T[] | undefined =>
  Array.isArray(v) ? v.filter(guard) : undefined;
