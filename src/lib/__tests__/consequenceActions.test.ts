import { describe, it, expect } from "vitest";
import { applyConsequenceActions } from "../consequenceActions";
import { MAJOR_ARCANA } from "../arcanaMajor";

const HLAD = MAJOR_ARCANA.find((m) => m.id === "hungering-maw-of-hlad")!;
const CODEX = MAJOR_ARCANA.find((m) => m.id === "hectumel-codex")!;
const ORB = MAJOR_ARCANA.find((m) => m.id === "staff-of-the-lidless-orb")!;

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
