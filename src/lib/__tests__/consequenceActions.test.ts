import { describe, it, expect } from "vitest";
import type { ArcanaMajorEntry, CharacterData } from "@/types";
import {
  applyConsequenceActions,
  getMarkedInstinctOverride,
  getMarkedFollowerCost,
} from "../consequenceActions";
import { MAJOR_ARCANA } from "../arcana/major";

const HLAD = MAJOR_ARCANA.find((m) => m.id === "hungering-maw-of-hlad")!;
const CODEX = MAJOR_ARCANA.find((m) => m.id === "hectumel-codex")!;
const ORB = MAJOR_ARCANA.find((m) => m.id === "staff-of-the-lidless-orb")!;
const RING = MAJOR_ARCANA.find((m) => m.id === "ring-of-daagon")!;

// A minimal CharacterData carrying a single Major Arcana entry with the given marked map — enough for
// getMarkedInstinctOverride, which only reads `arcanaMajor`.
const dataWithOrbMarks = (
  consequencesMarked: Record<string, boolean>,
): CharacterData => {
  const entry: ArcanaMajorEntry = {
    id: "staff-of-the-lidless-orb",
    marksValue: 0,
    mysteryMovesChecked: {},
    consequencesMarked,
  };
  return { arcanaMajor: [entry] } as CharacterData;
};

describe("maxHp consequence action (Hungering Maw hlad-c3)", () => {
  it("returns a negative HP delta on mark", () => {
    const { statDeltas } = applyConsequenceActions(HLAD, "hlad-c3", true, {});
    expect(statDeltas.statHp).toBe(-4);
  });

  it("returns a positive HP delta on unmark", () => {
    const { statDeltas } = applyConsequenceActions(HLAD, "hlad-c3", false, {
      "hlad-c3": true,
    });
    expect(statDeltas.statHp).toBe(4);
  });

  it("does not touch statArmor (the sibling setInstinct persists nothing)", () => {
    const { statDeltas } = applyConsequenceActions(HLAD, "hlad-c3", true, {});
    expect(statDeltas.statArmor).toBeUndefined();
  });
});

describe("armor consequence action reversal (Codex codex-c1 → codex-c1a)", () => {
  it("does not reverse the child's armor when the child was never marked", () => {
    // The parent codex-c1 carries no armor action; only its child codex-c1a does. Unchecking the
    // parent while the child is unmarked must not subtract armor the player never gained.
    const { statDeltas } = applyConsequenceActions(CODEX, "codex-c1", false, {
      "codex-c1": true,
    });
    expect(statDeltas.statArmor).toBeUndefined();
  });

  it("reverses the child's armor only when the child is actually marked", () => {
    const { statDeltas } = applyConsequenceActions(CODEX, "codex-c1", false, {
      "codex-c1": true,
      "codex-c1a": true,
    });
    expect(statDeltas.statArmor).toBe(-1);
  });

  it("adds the child's armor on its own mark", () => {
    const { statDeltas } = applyConsequenceActions(CODEX, "codex-c1a", true, {
      "codex-c1": true,
    });
    expect(statDeltas.statArmor).toBe(1);
  });
});

describe("debility consequence action reversal (Lidless Orb orb-eye-1 → orb-eye-1a)", () => {
  it("does not clear the debility when the child was never marked", () => {
    // Unchecking the parent while its miserable-debility child is unmarked must leave the debility
    // fields alone — the player may have marked that debility by hand.
    const { dataPatch } = applyConsequenceActions(ORB, "orb-eye-1", false, {
      "orb-eye-1": true,
    });
    expect(dataPatch.debilityMiserable).toBeUndefined();
    expect(dataPatch.debilityMiserableLocked).toBeUndefined();
  });

  it("clears the debility when its child is actually marked", () => {
    const { dataPatch } = applyConsequenceActions(ORB, "orb-eye-1", false, {
      "orb-eye-1": true,
      "orb-eye-1a": true,
    });
    expect(dataPatch.debilityMiserable).toBe(false);
    expect(dataPatch.debilityMiserableLocked).toBe(false);
  });

  it("reports every descendant id as cleared so the mark boxes collapse", () => {
    const { clearedConsequenceIds } = applyConsequenceActions(ORB, "orb-eye-1", false, {
      "orb-eye-1": true,
    });
    expect(clearedConsequenceIds).toContain("orb-eye-1a");
  });
});

describe("getMarkedInstinctOverride (Lidless Orb orb-beauty-a)", () => {
  it("returns undefined when no instinct-replacing consequence is marked", () => {
    expect(getMarkedInstinctOverride(dataWithOrbMarks({}))).toBeUndefined();
  });

  it("returns the override text once the instinct-replacing consequence is marked", () => {
    // Deriving the override read-only from marked state — the setInstinct action's text surfaces without
    // any write to the player's own instinct fields.
    expect(getMarkedInstinctOverride(dataWithOrbMarks({ "orb-beauty-a": true }))).toBe(
      "Disgust: To marvel at things horrific and grotesque.",
    );
  });

  it("does not surface the override for a marked but non-instinct consequence", () => {
    // orb-beauty (the parent) carries no setInstinct; only its child orb-beauty-a does.
    expect(getMarkedInstinctOverride(dataWithOrbMarks({ "orb-beauty": true }))).toBeUndefined();
  });

  it("returns undefined for undefined character data", () => {
    expect(getMarkedInstinctOverride(undefined)).toBeUndefined();
  });
});

describe("getMarkedFollowerCost (Ring of Daagon daagon-c4)", () => {
  it("returns undefined when the cost-replacing consequence is unmarked", () => {
    expect(getMarkedFollowerCost(RING, {}, "ring-follower")).toBeUndefined();
  });

  it("returns the replacement cost for the targeted follower once marked", () => {
    expect(getMarkedFollowerCost(RING, { "daagon-c4": true }, "ring-follower")).toBe(
      "Living, helpless, intelligent sacrifices",
    );
  });

  it("does not apply the cost to a different follower id", () => {
    expect(
      getMarkedFollowerCost(RING, { "daagon-c4": true }, "some-other-follower"),
    ).toBeUndefined();
  });
});
