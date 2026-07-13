import { describe, it, expect } from "vitest";
import { applyConsequenceActions } from "../consequenceActions";
import { MAJOR_ARCANA } from "../arcanaMajor";

const HLAD = MAJOR_ARCANA.find((m) => m.id === "hungering-maw-of-hlad")!;

describe("maxHp consequence action (Hungering Maw hlad-c3)", () => {
  it("subtracts the amount from statHp on mark", () => {
    const { dataPatch } = applyConsequenceActions(HLAD, "hlad-c3", true, {
      armor: "0",
      hp: "18",
    });
    expect(dataPatch.statHp).toBe("14");
  });

  it("adds the amount back to statHp on unmark", () => {
    const { dataPatch } = applyConsequenceActions(HLAD, "hlad-c3", false, {
      armor: "0",
      hp: "14",
    });
    expect(dataPatch.statHp).toBe("18");
  });

  it("treats a non-numeric HP as 0 rather than NaN", () => {
    const { dataPatch } = applyConsequenceActions(HLAD, "hlad-c3", true, {
      armor: "0",
      hp: "",
    });
    expect(dataPatch.statHp).toBe("-4");
  });

  it("does not touch statArmor (the sibling setInstinct persists nothing)", () => {
    const { dataPatch } = applyConsequenceActions(HLAD, "hlad-c3", true, {
      armor: "2",
      hp: "18",
    });
    expect(dataPatch.statArmor).toBeUndefined();
  });
});
