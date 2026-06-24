import type { MajorArcanum, ArcanaMajorEntry } from "@/types";

// Some arcana consequences rewrite the character's Instinct when marked (e.g. the Blood-quenched
// Sword's "Paranoia"). Unlike creature effects — which recompute from a constant book seed — the
// Instinct has no seed: it's the player's own text. So when an override is first applied we stash the
// prior Instinct on the entry, and restore it when the box is unmarked. These helpers keep that
// capture/restore in one place so the panel handler stays declarative.

// The instinct-altering child consequence for a given child id, if any.
const findInstinctChild = (arcanum: MajorArcanum, childId: string) => {
  for (const c of arcanum.mystery.consequences) {
    const child = c.children?.find((ch) => ch.id === childId);
    if (child?.setsInstinct) return child;
  }
  return undefined;
};

// True when the toggled consequence id alters the Instinct — callers skip the rest otherwise.
export const isInstinctConsequence = (
  arcanum: MajorArcanum,
  consequenceId: string,
): boolean => !!findInstinctChild(arcanum, consequenceId);

export interface InstinctOverrideResult {
  // The instinct to write to the character, or undefined when nothing should change.
  instinct: string | undefined;
  // The entry with its captured-prior-instinct bookkeeping updated.
  entry: ArcanaMajorEntry;
}

// Compute the effective Instinct and the entry's capture bookkeeping for marking/unmarking an
// instinct-altering consequence. Marking stashes the current Instinct and returns the override text;
// unmarking returns the stashed Instinct (or undefined to leave it alone if nothing was captured).
export const applyInstinctOverride = (
  arcanum: MajorArcanum,
  entry: ArcanaMajorEntry,
  consequenceId: string,
  checked: boolean,
  currentInstinct: string,
): InstinctOverrideResult => {
  const child = findInstinctChild(arcanum, consequenceId);
  if (!child?.setsInstinct) return { instinct: undefined, entry };

  const captured = entry.instinctBeforeConsequence ?? {};

  if (checked) {
    return {
      instinct: child.setsInstinct,
      entry: {
        ...entry,
        instinctBeforeConsequence: { ...captured, [consequenceId]: currentInstinct },
      },
    };
  }

  // Unmark: restore what we stashed, and drop the capture so a later re-mark stashes fresh. If nothing
  // was captured (e.g. corrupt data), leave the Instinct untouched rather than wiping the player's text.
  const { [consequenceId]: prior, ...rest } = captured;
  return {
    instinct: prior,
    entry: { ...entry, instinctBeforeConsequence: rest },
  };
};
