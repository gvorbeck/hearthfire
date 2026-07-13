import { describe, it, expect } from "vitest";
import type { MoveDefinition } from "@/types";
import {
  isMoveDefinition,
  parseConsequenceMarks,
  consequenceMarkId,
  markIdsFor,
  parseDescriptionTasks,
} from "../arcanaParsing";

describe("parseConsequenceMarks", () => {
  it("defaults to a single mark with the text untouched when no glyph prefix", () => {
    expect(parseConsequenceMarks("The dark spirit stirs.")).toEqual({
      markCount: 1,
      text: "The dark spirit stirs.",
    });
  });

  it("counts a run of leading ◻ glyphs and strips them (plus trailing space) off the text", () => {
    expect(parseConsequenceMarks("◻◻◻ The dark spirit stirs.")).toEqual({
      markCount: 3,
      text: "The dark spirit stirs.",
    });
  });

  it("counts a single glyph", () => {
    expect(parseConsequenceMarks("◻ One box.")).toEqual({
      markCount: 1,
      text: "One box.",
    });
  });

  it("only strips the leading run — a ◻ later in the prose is left alone", () => {
    expect(parseConsequenceMarks("◻◻ Mark ◻ here")).toEqual({
      markCount: 2,
      text: "Mark ◻ here",
    });
  });
});

describe("consequenceMarkId", () => {
  it("keeps the base id for box 0 so existing single-box marks stay valid", () => {
    expect(consequenceMarkId("orb-eye-1", 0)).toBe("orb-eye-1");
  });

  it("suffixes later boxes with #index", () => {
    expect(consequenceMarkId("orb-eye-1", 1)).toBe("orb-eye-1#1");
    expect(consequenceMarkId("orb-eye-1", 2)).toBe("orb-eye-1#2");
  });
});

describe("markIdsFor", () => {
  it("returns one id for a single-box consequence — the bare base id", () => {
    expect(markIdsFor("c1", "No prefix.")).toEqual(["c1"]);
  });

  it("returns one id per box derived from the glyph prefix, box 0 unsuffixed", () => {
    expect(markIdsFor("c1", "◻◻◻ Three boxes.")).toEqual([
      "c1",
      "c1#1",
      "c1#2",
    ]);
  });
});

describe("isMoveDefinition", () => {
  it("is true for a move carrying a typed body", () => {
    const move: MoveDefinition = {
      id: "m1",
      name: "Move",
      body: [{ kind: "para", text: "Do a thing." }],
    };
    expect(isMoveDefinition(move)).toBe(true);
  });

  it("is false for a legacy flat-string mystery move (no body)", () => {
    expect(isMoveDefinition({ id: "m1", name: "Legacy" })).toBe(false);
  });
});

describe("parseDescriptionTasks", () => {
  it("returns the whole description as proseBefore and no tasks when there is no task block", () => {
    expect(parseDescriptionTasks("Just some prose.\n\nMore prose.")).toEqual({
      proseBefore: "Just some prose.\n\nMore prose.",
      tasks: [],
      proseAfter: "",
    });
  });

  it("splits prose around a task block and extracts each task label", () => {
    const description = "Intro prose.\n\n[ ] First task\n[ ] Second task\n\nOutro prose.";
    expect(parseDescriptionTasks(description)).toEqual({
      proseBefore: "Intro prose.",
      tasks: ["First task", "Second task"],
      proseAfter: "Outro prose.",
    });
  });

  it("handles a leading task block (no prose before it)", () => {
    expect(parseDescriptionTasks("[ ] Only task\n\nAfter.")).toEqual({
      proseBefore: "",
      tasks: ["Only task"],
      proseAfter: "After.",
    });
  });

  it("only treats the first all-task block as tasks; a later one stays prose", () => {
    const description = "[ ] Real task\n\nMiddle.\n\n[ ] Not parsed";
    expect(parseDescriptionTasks(description)).toEqual({
      proseBefore: "",
      tasks: ["Real task"],
      proseAfter: "Middle.\n\n[ ] Not parsed",
    });
  });

  it("does not treat a mixed block (task line plus prose line) as tasks", () => {
    const description = "[ ] A task line\nbut also prose";
    expect(parseDescriptionTasks(description)).toEqual({
      proseBefore: description,
      tasks: [],
      proseAfter: "",
    });
  });
});
