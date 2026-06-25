import type {
  ArcanaMove,
  MajorArcanaMysteryMove,
  MoveDefinition,
} from "@/types";

// A move authored in the Move-component shape (typed body blocks) rather than the legacy flat string.
export const isMoveDefinition = (
  move: ArcanaMove | MajorArcanaMysteryMove | MoveDefinition,
): move is MoveDefinition => "body" in move;

// A consequence prefixed with a run of ◻ glyphs (e.g. "◻◻◻ The dark spirit…") can be marked that
// many separate times. Split the boxes off into a mark count and return the prose without them.
const LEADING_MARK_BOXES_RE = /^(◻+)\s*/;
export const parseConsequenceMarks = (
  text: string,
): { markCount: number; text: string } => {
  const match = text.match(LEADING_MARK_BOXES_RE);
  if (!match) return { markCount: 1, text };
  return { markCount: match[1].length, text: text.slice(match[0].length) };
};

// The id for one box of a multi-mark consequence. Box 0 keeps the consequence's own id so existing
// single-box marks (and any effects keyed on that id) stay valid; later boxes get a suffix.
export const consequenceMarkId = (baseId: string, index: number): string =>
  index === 0 ? baseId : `${baseId}#${index}`;

// Every markable id a consequence contributes — one per box of a multi-mark consequence.
export const markIdsFor = (id: string, text: string): string[] =>
  Array.from({ length: parseConsequenceMarks(text).markCount }, (_, i) =>
    consequenceMarkId(id, i),
  );
