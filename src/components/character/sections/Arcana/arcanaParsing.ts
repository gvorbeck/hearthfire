import type { MoveDefinition } from "@/types";

// A back section entry authored in the Move-component shape (typed body blocks) rather than as a
// consequence or follower entry. Consequences carry `value`; followers carry `follower`.
export const isMoveDefinition = (
  entry: MoveDefinition | { value: string } | { follower: unknown },
): entry is MoveDefinition => "body" in entry;

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

// A line authored as a task checkbox in description prose: "[ ] Impale a foul spirit…". The bracket
// marker is the author's signal that this line is an interactive mark, not a paragraph.
const TASK_LINE_RE = /^\[\s?\]\s+(.*)$/;

// Splits an arcanum's description around its block of task-checkbox lines. The task list is authored
// as one paragraph of "[ ] …" lines somewhere in the prose (the player tracks tasks right where the
// text introduces them), with prose that may come before and after it. `proseBefore`/`proseAfter` are
// the surrounding text (either may be empty); `tasks` is each task's label, in order. When no task
// block is found, the whole description is `proseBefore` and `tasks` is empty.
// Only the first all-"[ ]" block is treated as tasks; a second such block would render as literal
// "[ ]" prose. Today's data has one task list per arcanum, so this is fine — revisit if that changes.
export const parseDescriptionTasks = (
  description: string,
): { proseBefore: string; tasks: string[]; proseAfter: string } => {
  const blocks = description.trim().split(/\n\n+/);
  const taskBlockIndex = blocks.findIndex((block) => {
    const lines = block.split("\n");
    return lines.length > 0 && lines.every((l) => TASK_LINE_RE.test(l));
  });
  if (taskBlockIndex === -1) {
    return { proseBefore: description, tasks: [], proseAfter: "" };
  }
  return {
    proseBefore: blocks.slice(0, taskBlockIndex).join("\n\n"),
    tasks: blocks[taskBlockIndex]
      .split("\n")
      .map((l) => l.replace(TASK_LINE_RE, "$1")),
    proseAfter: blocks.slice(taskBlockIndex + 1).join("\n\n"),
  };
};
