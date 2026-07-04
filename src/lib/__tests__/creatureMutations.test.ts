import { describe, it, expect } from "vitest";
import {
  addTag,
  removeTag,
  replaceTag,
  addMove,
  replaceQuality,
  applyEffects,
  projectCreature,
} from "../creatureMutations";
import type { Creature, MajorArcanaMysteryConsequence } from "@/types";

const servant = (): Creature => ({
  id: "the-mighty-servant",
  tags: "large, construct, meek, slow, strong",
  hp: "20",
  armor: "4",
  loyalty: 2,
  qualities: [
    { label: "Damage", value: "stone fists d10+1" },
    { label: "Cost", value: "wonder, excitement, joy" },
    { label: "Instinct", value: "To misunderstand" },
  ],
  moves: ["Perform a mighty feat of strength"],
});

describe("tag helpers", () => {
  it("addTag appends and is idempotent", () => {
    expect(addTag(servant(), "devious").tags).toBe(
      "large, construct, meek, slow, strong, devious",
    );
    const once = addTag(servant(), "devious");
    expect(addTag(once, "devious")).toEqual(once);
  });

  it("removeTag drops the tag", () => {
    expect(removeTag(servant(), "meek").tags).toBe(
      "large, construct, slow, strong",
    );
  });

  it("replaceTag swaps in place and no-ops when absent", () => {
    expect(replaceTag(servant(), "slow", "warrior").tags).toBe(
      "large, construct, meek, warrior, strong",
    );
    expect(replaceTag(servant(), "nope", "warrior")).toEqual(servant());
  });
});

describe("addMove", () => {
  it("appends and is idempotent", () => {
    const next = addMove(servant(), "Reveal an earlier deception or half-truth");
    expect(next.moves).toEqual([
      "Perform a mighty feat of strength",
      "Reveal an earlier deception or half-truth",
    ]);
    expect(addMove(next, "Reveal an earlier deception or half-truth")).toEqual(
      next,
    );
  });
});

describe("replaceQuality", () => {
  it("replaces the matching label's value, leaving others untouched", () => {
    const next = replaceQuality(servant(), "Cost", "To punish");
    expect(next.qualities).toEqual([
      { label: "Damage", value: "stone fists d10+1" },
      { label: "Cost", value: "To punish" },
      { label: "Instinct", value: "To misunderstand" },
    ]);
  });

  it("no-ops when no quality matches", () => {
    expect(replaceQuality(servant(), "Missing", "x")).toEqual(servant());
  });
});

describe("applyEffects", () => {
  it("folds effects in order", () => {
    const next = applyEffects(servant(), [
      { type: "removeTag", tag: "meek" },
      { type: "replaceTag", from: "slow", to: "warrior" },
      { type: "addMove", move: "Carry on" },
      { type: "replaceQuality", label: "Damage", value: "1d10+5" },
    ]);
    expect(next.tags).toBe("large, construct, warrior, strong");
    expect(next.moves).toContain("Carry on");
    expect(next.qualities?.[0]).toEqual({ label: "Damage", value: "1d10+5" });
  });

  it("does not mutate the input", () => {
    const base = servant();
    applyEffects(base, [{ type: "removeTag", tag: "meek" }]);
    expect(base.tags).toBe("large, construct, meek, slow, strong");
  });
});

const consequences: MajorArcanaMysteryConsequence[] = [
  { id: "c3", text: "", effects: [{ type: "removeTag", tag: "meek" }] },
  {
    id: "c4",
    text: "",
    effects: [{ type: "replaceTag", from: "slow", to: "warrior" }],
    children: [
      { id: "c4a", text: "", effects: [{ type: "addTag", tag: "area" }] },
    ],
  },
  {
    id: "c5",
    text: "",
    table: {
      columnHeaders: ["1d4", "Purpose", "Cost"],
      rows: [
        {
          id: "c5-1",
          roll: "1",
          cells: ["To punish", "Victory"],
          effect: { type: "replaceQuality", label: "Cost", value: "Victory" },
        },
      ],
    },
    children: [
      {
        id: "c6",
        text: "",
        effects: [
          { type: "replaceQuality", label: "Instinct", value: "To pursue its purpose" },
        ],
      },
    ],
  },
];

describe("projectCreature", () => {
  it("with nothing marked returns the seed's book data", () => {
    const next = projectCreature(servant(), undefined, consequences, {}, {});
    expect(next.tags).toBe(servant().tags);
  });

  it("applies marked parent and child effects plus a picked table row", () => {
    const next = projectCreature(
      servant(),
      undefined,
      consequences,
      { c3: true, c4: true, c4a: true, c5: true, c6: true },
      { c5: "c5-1" },
    );
    expect(next.tags).toBe("large, construct, warrior, strong, area");
    expect(next.qualities).toContainEqual({ label: "Cost", value: "Victory" });
    expect(next.qualities).toContainEqual({
      label: "Instinct",
      value: "To pursue its purpose",
    });
  });

  it("ignores a table pick while its consequence is unmarked, and reverts on unmark", () => {
    const unmarked = projectCreature(servant(), undefined, consequences, {}, { c5: "c5-1" });
    expect(unmarked.qualities).toContainEqual({
      label: "Cost",
      value: "wonder, excitement, joy",
    });
    const marked = projectCreature(servant(), undefined, consequences, { c5: true }, { c5: "c5-1" });
    expect(marked.qualities).toContainEqual({ label: "Cost", value: "Victory" });
  });

  it("unmarking a consequence reverts its effect on the next projection", () => {
    const marked = projectCreature(servant(), undefined, consequences, { c3: true }, {});
    expect(marked.tags).not.toContain("meek");
    const unmarked = projectCreature(servant(), undefined, consequences, {}, {});
    expect(unmarked.tags).toContain("meek");
  });

  it("ignores a table choice that no longer matches a row", () => {
    const next = projectCreature(servant(), undefined, consequences, {}, { c5: "gone" });
    expect(next.qualities).toContainEqual({
      label: "Cost",
      value: "wonder, excitement, joy",
    });
  });

  it("starts HP at hpMax when nothing is saved", () => {
    const seed: Creature = { ...servant(), hp: undefined, hpMax: "24" };
    const next = projectCreature(seed, undefined, consequences, {}, {});
    expect(next.hp).toBe("24");
  });

  it("falls back to hpMax when a saved creature has no HP", () => {
    const seed: Creature = { ...servant(), hpMax: "24" };
    const saved: Creature = { ...servant(), hp: undefined, hpMax: "24" };
    const next = projectCreature(seed, saved, consequences, {}, {});
    expect(next.hp).toBe("24");
  });

  it("preserves the player's HP, armor, and loyalty over projected book data", () => {
    const saved: Creature = { ...servant(), hp: "7", armor: "1", loyalty: 0 };
    const next = projectCreature(servant(), saved, consequences, { c3: true }, {});
    expect(next.hp).toBe("7");
    expect(next.armor).toBe("1");
    expect(next.loyalty).toBe(0);
    expect(next.tags).not.toContain("meek");
  });
});
