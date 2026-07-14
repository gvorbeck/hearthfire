import { useState, useCallback, memo } from "react";
import { useLatest } from "@/hooks/useLatest";
import { useFirestoreSync } from "@/hooks/useFirestoreSync";
import {
  Checkbox,
  CheckboxGroup,
  Divider,
  Input,
  Text,
  UseDots,
} from "@/components/ui";
import { useToast } from "@/components/app";
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import {
  resolvePlaybookFeatures,
  featurePatch,
} from "@/lib/resolvePlaybookFeatures";
import { RadioSelect } from "../../sections/RadioSelect";
import type { RadioOption } from "@/types";
import {
  BACKGROUND_FORCED_MOVES,
  BACKGROUND_GRANTED_CREW_TAGS,
} from "@/lib/moves";
import { useCrewSave } from "../shared/useCrewSave";
import { StatBox, LoyaltyRow, CustomItemsGrid } from "../shared/CrewWidgets";
import type { CharacterData, PlaybookSectionProps } from "@/types";
import styles from "./MarshalCrew.module.css";

const CREW_HP_MAX = 6;
const CREW_DAMAGE = "d6";
const CREW_SIZE = 6;

const TAG_ITEMS = [
  { id: "archers", label: "archers" },
  { id: "athletic", label: "athletic" },
  { id: "brave", label: "brave" },
  { id: "cunning", label: "cunning" },
  { id: "devoted", label: "devoted" },
  { id: "hardy", label: "hardy" },
  { id: "intimidating", label: "intimidating" },
  { id: "observant", label: "observant" },
  { id: "patient", label: "patient" },
  { id: "respected", label: "respected" },
  { id: "stealthy", label: "stealthy" },
  { id: "warriors", label: "warriors" },
];

const INSTINCT_OPTIONS: RadioOption[] = [
  {
    value: "To bicker, infight, and hold grudges",
    label: "To bicker, infight, and hold grudges",
    description: "",
  },
  {
    value: "To hew to tradition and superstition",
    label: "To hew to tradition and superstition",
    description: "",
  },
  {
    value: "To indulge their baser instincts",
    label: "To indulge their baser instincts",
    description: "",
  },
  {
    value: "To lord over others",
    label: "To lord over others",
    description: "",
  },
  {
    value: "To take needless risks",
    label: "To take needless risks",
    description: "",
  },
  {
    value: "To take things too far",
    label: "To take things too far",
    description: "",
  },
];

const COST_OPTIONS: RadioOption[] = [
  {
    value: "Merry-making, as a group",
    label: "Merry-making, as a group",
    description: "",
  },
  {
    value: "Public recognition and respect, honor",
    label: "Public recognition and respect, honor",
    description: "",
  },
  {
    value: "Risks taken, by you, to help them",
    label: "Risks taken, by you, to help them",
    description: "",
  },
  {
    value: "Victories won against worthy foes",
    label: "Victories won against worthy foes",
    description: "",
  },
  {
    value: "Wealth gained for themselves or Stonetop",
    label: "Wealth gained for themselves or Stonetop",
    description: "",
  },
];

interface InventoryItem {
  id: string;
  label: string;
  weight?: 1 | 2;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: "hatchet", label: "**Hatchet**, iron *(hand, thrown, x piercing)*" },
  { id: "spear", label: "**Spear**, iron *(close, thrown, x piercing)*" },
  {
    id: "bow",
    label: "**Bow & iron arrows** *(near, x piercing, ○ low ammo, ○ all out)*",
  },
  {
    id: "shield",
    label: "**Shield** *(+1 armor, +1 Readiness on a 7+ to Defend)*",
    weight: 2,
  },
  { id: "hides", label: "**Thick hides** *(1 armor, warm)*", weight: 2 },
  { id: "cloak", label: "**Cloak** *(warm)*" },
  {
    id: "supplies",
    label: "**Supplies** *(4+Prosperity uses per crew member)*",
  },
];

const INDIVIDUALS_COUNT = 6;
const CUSTOM_ITEM_INDICES = [0, 1, 2, 3];
// Two fixed, in-place-edited custom-tag slots. Stable ids (not the iteration
// index) key the inputs so state never mismatches the wrong slot.
const CUSTOM_TAG_SLOT_IDS = ["custom-tag-a", "custom-tag-b"] as const;

const normalizeCustomItems = (
  raw: { checked: boolean; text: string }[] | undefined,
): { checked: boolean; text: string }[] =>
  Array.from(
    { length: CUSTOM_ITEM_INDICES.length * 2 },
    (_, i) => raw?.[i] ?? { checked: false, text: "" },
  );

interface InventoryRowProps {
  item: InventoryItem;
  checked: boolean;
  onCheckedChange: (id: string, checked: boolean) => void;
}

const InventoryRow = memo(
  ({ item, checked, onCheckedChange }: InventoryRowProps) => {
    const handleChecked = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onCheckedChange(item.id, e.target.checked),
      [item.id, onCheckedChange],
    );
    return (
      <div className={styles.inventoryItem}>
        <Checkbox
          variant="provision"
          weight={item.weight ?? 1}
          checked={checked}
          onChange={handleChecked}
          label={
            <Text as="span" className={styles.inventoryLabel}>
              {item.label}
            </Text>
          }
        />
      </div>
    );
  },
);

interface IndividualSlotProps {
  index: number;
  name: string;
  tag: string;
  traits: string;
  onChange: (
    index: number,
    field: "name" | "tag" | "traits",
    val: string,
  ) => void;
  onBlur: () => void;
}

const IndividualSlot = memo(
  ({ index, name, tag, traits, onChange, onBlur }: IndividualSlotProps) => {
    const handleName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(index, "name", e.target.value),
      [index, onChange],
    );
    const handleTag = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(index, "tag", e.target.value),
      [index, onChange],
    );
    const handleTraits = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(index, "traits", e.target.value),
      [index, onChange],
    );

    return (
      <div className={styles.individual}>
        <div className={styles.individualFields}>
          <Input
            className={styles.individualInput}
            type="text"
            value={name}
            placeholder="Name"
            aria-label={`Individual ${index + 1} name`}
            onChange={handleName}
            onBlur={onBlur}
          />
          <Input
            className={styles.individualInput}
            type="text"
            value={tag}
            placeholder="Tag"
            aria-label={`Individual ${index + 1} tag`}
            onChange={handleTag}
            onBlur={onBlur}
          />
        </div>
        <Input
          multiline
          className={styles.individualTraits}
          value={traits}
          placeholder="Traits"
          aria-label={`Individual ${index + 1} traits`}
          rows={2}
          onChange={handleTraits}
          onBlur={onBlur}
        />
      </div>
    );
  },
);

interface SuppliesMemberDotsProps {
  memberIndex: number;
  total: number;
  checked: number;
  onChange: (memberIndex: number, n: number) => void;
}

const SuppliesMemberDots = memo(
  ({ memberIndex, total, checked, onChange }: SuppliesMemberDotsProps) => {
    const handleChange = useCallback(
      (n: number) => onChange(memberIndex, n),
      [memberIndex, onChange],
    );
    return (
      <UseDots
        total={total}
        checked={checked}
        onChange={handleChange}
        ariaLabel={`Supplies, individual ${memberIndex + 1}`}
      />
    );
  },
);

type Individual = { name: string; tag: string; traits: string };

const EMPTY_INDIVIDUAL: Individual = { name: "", tag: "", traits: "" };

const defaultIndividuals = (): Individual[] =>
  Array.from({ length: INDIVIDUALS_COUNT }, () => ({ ...EMPTY_INDIVIDUAL }));

const parseIndividuals = (raw: unknown): Individual[] => {
  if (!Array.isArray(raw)) return defaultIndividuals();
  const filled = (raw as Individual[]).map((s) => ({
    name: s?.name ?? "",
    tag: s?.tag ?? "",
    traits: s?.traits ?? "",
  }));
  while (filled.length < INDIVIDUALS_COUNT)
    filled.push({ ...EMPTY_INDIVIDUAL });
  return filled.slice(0, INDIVIDUALS_COUNT);
};

interface MarshalCrewProps extends PlaybookSectionProps {
  prosperity: number;
}

export const MarshalCrew = ({ data, prosperity, onSave }: MarshalCrewProps) => {
  const { addToast } = useToast();
  const features = resolvePlaybookFeatures(data);

  const [hp, setHp] = useState<string>(
    () => features.crewHp ?? String(CREW_HP_MAX),
  );
  const [armor, setArmor] = useState<string>(() => features.crewArmor ?? "0");
  const [tags, setTags] = useState<Record<string, boolean>>(() => ({
    group: true,
    ...(features.crewTags ?? {}),
  }));
  const [tagsCustom, setTagsCustom] = useState<string[]>(() =>
    (features.crewTagsCustom ?? ["", ""]).slice(0, 2),
  );
  const [loyalty, setLoyalty] = useState<number>(
    () => features.crewLoyalty ?? 0,
  );
  const [inventoryChecked, setInventoryChecked] = useState<
    Record<string, boolean>
  >(() => features.crewInventoryChecked ?? {});
  const [customItems, setCustomItems] = useState<
    { checked: boolean; text: string }[]
  >(() => normalizeCustomItems(features.crewCustomItems));
  const [suppliesUses, setSuppliesUses] = useState<number[]>(
    () => features.crewSuppliesUses ?? Array(CREW_SIZE).fill(0),
  );
  const [individuals, setIndividuals] = useState<Individual[]>(() =>
    parseIndividuals(features.crewIndividuals),
  );

  const hpRef = useLatest(hp);
  const armorRef = useLatest(armor);
  const tagsRef = useLatest(tags);
  const tagsCustomRef = useLatest(tagsCustom);
  const loyaltyRef = useLatest(loyalty);
  const inventoryCheckedRef = useLatest(inventoryChecked);
  const suppliesUsesRef = useLatest(suppliesUses);
  const customItemsRef = useLatest(customItems);
  const individualsRef = useLatest(individuals);

  const { saveDebounced, saveImmediate, flushDebounce, dataRef, onSaveRef, pendingRef } =
    useCrewSave(data, onSave);

  // Each call independently mirrors one remote Firestore subfield into optimistic
  // local state, deferring the echo while a save from that field (or any other,
  // via the shared pendingRef) is in flight. See useFirestoreSync for the guard.
  useFirestoreSync(features.crewHp, (v) => { if (v !== undefined) setHp(v); }, pendingRef);
  useFirestoreSync(features.crewArmor, (v) => { if (v !== undefined) setArmor(v); }, pendingRef);
  useFirestoreSync(features.crewTags, (v) => { if (v !== undefined) setTags({ group: true, ...v }); }, pendingRef);
  useFirestoreSync(features.crewTagsCustom, (v) => { if (v !== undefined) setTagsCustom(v.slice(0, 2)); }, pendingRef);
  useFirestoreSync(features.crewLoyalty, (v) => { if (v !== undefined) setLoyalty(v); }, pendingRef);
  useFirestoreSync(features.crewInventoryChecked, (v) => { if (v !== undefined) setInventoryChecked(v); }, pendingRef);
  useFirestoreSync(features.crewCustomItems, (v) => { if (v !== undefined) setCustomItems(normalizeCustomItems(v)); }, pendingRef);
  useFirestoreSync(features.crewSuppliesUses, (v) => { if (v !== undefined) setSuppliesUses(v); }, pendingRef);
  useFirestoreSync(features.crewIndividuals, (v) => { if (v !== undefined) setIndividuals(parseIndividuals(v)); }, pendingRef);

  const handleHpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        setHp(raw);
        saveDebounced({ crewHp: raw }, () =>
          addToast("Failed to save.", "error"),
        );
        return;
      }
      const n = parseInt(raw, 10);
      if (!isNaN(n)) {
        const val = String(Math.max(0, Math.min(n, CREW_HP_MAX)));
        setHp(val);
        saveDebounced({ crewHp: val }, () =>
          addToast("Failed to save.", "error"),
        );
      }
    },
    [saveDebounced, addToast],
  );

  const handleHpBlur = useCallback(() => {
    flushDebounce({ crewHp: hpRef.current }).catch(() =>
      addToast("Failed to save.", "error"),
    );
  }, [flushDebounce, addToast]);

  const handleArmorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setArmor(val);
      saveDebounced({ crewArmor: val }, () =>
        addToast("Failed to save.", "error"),
      );
    },
    [saveDebounced, addToast],
  );

  const handleArmorBlur = useCallback(() => {
    flushDebounce({ crewArmor: armorRef.current }).catch(() =>
      addToast("Failed to save.", "error"),
    );
  }, [flushDebounce, addToast]);

  const handleTagChange = useCallback(
    (id: string, checked: boolean) => {
      if (id === "group") return;
      const prev = tagsRef.current;
      const next = { ...prev, [id]: checked };
      setTags(next);
      saveImmediate({ crewTags: next }).catch(() => {
        setTags(prev);
        addToast("Failed to save.", "error");
      });
    },
    [saveImmediate, addToast],
  );

  const handleTagCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const i = Number(e.currentTarget.dataset.index);
      const val = e.currentTarget.value;
      const next = [...tagsCustomRef.current];
      next[i] = val;
      setTagsCustom(next);
      saveDebounced({ crewTagsCustom: next }, () =>
        addToast("Failed to save.", "error"),
      );
    },
    [saveDebounced, addToast],
  );

  const handleTagCustomBlur = useCallback(() => {
    flushDebounce({ crewTagsCustom: tagsCustomRef.current }).catch(() =>
      addToast("Failed to save.", "error"),
    );
  }, [flushDebounce, addToast]);

  const handleLoyaltyChange = useCallback(
    (n: number) => {
      const prev = loyaltyRef.current;
      setLoyalty(n);
      saveImmediate({ crewLoyalty: n }).catch(() => {
        setLoyalty(prev);
        addToast("Failed to save.", "error");
      });
    },
    [saveImmediate, addToast],
  );

  const handleInventoryCheckedChange = useCallback(
    (id: string, val: boolean) => {
      const prev = inventoryCheckedRef.current;
      const next = { ...prev, [id]: val };
      setInventoryChecked(next);
      saveImmediate({ crewInventoryChecked: next }).catch(() => {
        setInventoryChecked(prev);
        addToast("Failed to save.", "error");
      });
    },
    [saveImmediate, addToast],
  );

  const handleCustomItemChecked = useCallback(
    (slotIndex: number, checked: boolean) => {
      const prev = customItemsRef.current;
      const next = prev.map((item, i) =>
        i === slotIndex ? { ...item, checked } : item,
      );
      setCustomItems(next);
      saveImmediate({ crewCustomItems: next }).catch(() => {
        setCustomItems(prev);
        addToast("Failed to save.", "error");
      });
    },
    [saveImmediate, addToast],
  );

  const handleCustomItemText = useCallback(
    (slotIndex: number, text: string) => {
      const next = customItemsRef.current.map((item, i) =>
        i === slotIndex ? { ...item, text, checked: text.length > 0 } : item,
      );
      setCustomItems(next);
      saveDebounced({ crewCustomItems: next }, () =>
        addToast("Failed to save.", "error"),
      );
    },
    [saveDebounced, addToast],
  );

  const handleCustomItemBlur = useCallback(() => {
    flushDebounce({ crewCustomItems: customItemsRef.current }).catch(() =>
      addToast("Failed to save.", "error"),
    );
  }, [flushDebounce, addToast]);

  const handleSuppliesUsesChange = useCallback(
    (memberIndex: number, n: number) => {
      const prev = suppliesUsesRef.current;
      const next = [...prev];
      next[memberIndex] = n;
      setSuppliesUses(next);
      saveImmediate({ crewSuppliesUses: next }).catch(() => {
        setSuppliesUses(prev);
        addToast("Failed to save.", "error");
      });
    },
    [saveImmediate, addToast],
  );

  const handleIndividualChange = useCallback(
    (index: number, field: "name" | "tag" | "traits", val: string) => {
      const next = individualsRef.current.map((ind, i) =>
        i === index ? { ...ind, [field]: val } : ind,
      );
      setIndividuals(next);
      saveDebounced({ crewIndividuals: next }, () =>
        addToast("Failed to save.", "error"),
      );
    },
    [saveDebounced, addToast],
  );

  const handleIndividualBlur = useCallback(() => {
    flushDebounce({ crewIndividuals: individualsRef.current }).catch(() =>
      addToast("Failed to save.", "error"),
    );
  }, [flushDebounce, addToast]);

  const handleCrewInstinctSave = useCallback(
    (patch: Partial<CharacterData>) => {
      return onSave(
        featurePatch(data, {
          crewInstinct: patch.instinct,
          crewInstinctCustom: patch.instinctCustom,
        }),
      );
    },
    [data, onSave],
  );

  const handleCrewCostSave = useCallback(
    (patch: Partial<CharacterData>) => {
      return onSave(
        featurePatch(data, {
          crewCost: patch.instinct,
          crewCostCustom: patch.instinctCustom,
        }),
      );
    },
    [data, onSave],
  );

  const hasHeroesToTheLast =
    data?.typeMoves?.["marshal-heroes-to-the-last"] === true;
  const isExceptional =
    data?.typeMoveCheckList?.["marshal-heroes-to-the-last"]?.[
      "marshal-httl-exceptional"
    ] === true;
  const grantedTag = data?.background
    ? BACKGROUND_GRANTED_CREW_TAGS.marshal?.[data.background]
    : undefined;
  // Veteran Crew can be background-forced without ever being written to
  // typeMoves, so check both. The checklist gate matters because deselecting a
  // move leaves its checklist state behind in Firestore.
  const backgroundForcedMoves = data?.background
    ? (BACKGROUND_FORCED_MOVES.marshal?.[data.background] ?? [])
    : [];
  const hasVeteranCrew =
    data?.typeMoves?.["marshal-veteran-crew"] === true ||
    backgroundForcedMoves.includes("marshal-veteran-crew");
  const hasVeteranTags =
    hasVeteranCrew &&
    data?.typeMoveCheckList?.["marshal-veteran-crew"]?.["marshal-vc-tags"] ===
      true;
  const maxTags = hasVeteranTags ? 4 : 2;
  const selectedTagCount = Object.entries(tags).filter(
    ([id, v]) =>
      id !== "group" && id !== "exceptional" && id !== grantedTag && v,
  ).length;
  const tagAtMax = selectedTagCount >= maxTags;
  // Possible when the limit shrinks under existing picks (e.g. the Veteran
  // Crew tags option is unchecked after 4 tags were already selected).
  const overLimitTagCount = selectedTagCount - maxTags;
  const tagItemsWithDisable = TAG_ITEMS.map((item) => ({
    ...item,
    disabled:
      item.id === "group" ||
      item.id === grantedTag ||
      (!tags[item.id] && tagAtMax),
  }));
  const tagsChecked = {
    ...tags,
    group: true,
    ...(grantedTag ? { [grantedTag]: true } : {}),
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
    [],
  );
  const handleExceptionalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.checked;
      // typeMoveCheckList lives on CharacterData directly, not in playbookFeatures, so we bypass featurePatch.
      // updateCharacterData shallow-merges the patch onto c.data, so spreading the existing sub-objects is required.
      const prev = dataRef.current?.typeMoveCheckList ?? {};
      const next = {
        ...prev,
        "marshal-heroes-to-the-last": {
          ...prev["marshal-heroes-to-the-last"],
          "marshal-httl-exceptional": val,
        },
      };
      onSaveRef.current({ typeMoveCheckList: next }).catch(() => {
        // isExceptional is derived from data prop — Firestore will revert it on the next snapshot.
        // We only need to surface the failure; no local state to roll back here.
        addToast("Failed to save.", "error");
      });
    },
    [addToast],
  );

  return (
    <div className={styles.root}>
      <PlaybookSection title="Crew">
        <Text font="serif" color="muted" leading="normal">
          Your Crew is a half-dozen strong by default. Treat them as a follower
          with the *group* tag. All starting values here are subject to change
          in play.
        </Text>
        <div className={styles.infoBoxes}>
          <StatBox
            ariaLabel="Crew HP"
            value={hp}
            inputProps={{ min: 0, max: CREW_HP_MAX }}
            onChange={handleHpChange}
            onBlur={handleHpBlur}
            onWheel={handleWheel}
            label={
              <>HP <Text as="span" size="xs" color="muted" italic>Max [{CREW_HP_MAX}]</Text></>
            }
          />
          <StatBox
            ariaLabel="Crew armor"
            value={armor}
            inputProps={{ min: 0 }}
            onChange={handleArmorChange}
            onBlur={handleArmorBlur}
            onWheel={handleWheel}
            label={
              <>Armor <Text as="span" size="xs" color="muted" italic>(starts at 0)</Text></>
            }
          />
          <StatBox
            ariaLabel="Crew damage"
            staticValue={CREW_DAMAGE}
            label={
              <>Damage <Text as="span" size="xs" color="muted" italic>(starts at d6)</Text></>
            }
          />
        </div>
      </PlaybookSection>

      <PlaybookSection title="Tags">
        <Text font="serif" color="muted" leading="normal">
          {`Your crew starts with *group*, a tag granted by your background, plus ${maxTags} more of your choice.`}
        </Text>
        {overLimitTagCount > 0 && (
          <Text role="status" size="xs" color="accent" italic leading="normal">
            {`${overLimitTagCount} too many selected — uncheck ${overLimitTagCount === 1 ? "one" : String(overLimitTagCount)}.`}
          </Text>
        )}
        <CheckboxGroup
          items={tagItemsWithDisable}
          checked={tagsChecked}
          onChange={handleTagChange}
          columns="responsive-2-4-6"
        />
        <div className={styles.customTagsRow}>
          {tagsCustom.map((val, i) => (
            <Input
              key={CUSTOM_TAG_SLOT_IDS[i]}
              data-index={i}
              className={styles.customTagInput}
              type="text"
              value={val}
              placeholder="Custom tag"
              aria-label={`Custom tag ${i + 1}`}
              onChange={handleTagCustomChange}
              onBlur={handleTagCustomBlur}
            />
          ))}
        </div>
        <div className={styles.exceptionalRow}>
          <Checkbox
            checked={isExceptional}
            disabled={!hasHeroesToTheLast}
            onChange={handleExceptionalChange}
            label={
              <>exceptional <Text as="span" size="xs" color="muted" italic>(requires Heroes to the Last)</Text></>

            }
          />
        </div>
      </PlaybookSection>

      <div className={styles.columns}>
        <RadioSelect
          playbookKey="marshal-crew"
          options={INSTINCT_OPTIONS}
          data={
            {
              instinct:
                features.crewInstinct === "custom"
                  ? "__custom__"
                  : (features.crewInstinct ?? ""),
              instinctCustom: features.crewInstinctCustom ?? "",
            } as CharacterData
          }
          onSave={handleCrewInstinctSave}
        />
        <RadioSelect
          playbookKey="marshal-crew-cost"
          title="Cost"
          options={COST_OPTIONS}
          data={
            {
              instinct:
                features.crewCost === "custom"
                  ? "__custom__"
                  : (features.crewCost ?? ""),
              instinctCustom: features.crewCostCustom ?? "",
            } as CharacterData
          }
          onSave={handleCrewCostSave}
          header={
            <LoyaltyRow
              value={loyalty}
              onChange={handleLoyaltyChange}
              label={
                <Text
                  as="span"
                  font="serif"
                  color="muted"
                  className={styles.loyaltyLabel}
                >
                  Loyalty
                </Text>
              }
            />
          }
        />
      </div>

      <PlaybookSection title="Inventory">
        <Text font="serif" color="muted" leading="normal">
          3 ◈ or fewer is a light load; 4-6 ◈ is a normal load; 7-9 ◈ is a heavy
          load.
        </Text>
        <Divider />
        <div className={styles.inventoryList}>
          {INVENTORY_ITEMS.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              checked={inventoryChecked[item.id] ?? false}
              onCheckedChange={handleInventoryCheckedChange}
            />
          ))}
          {inventoryChecked["supplies"] && (
            <div className={styles.suppliesGrid}>
              {Array.from({ length: CREW_SIZE }, (_, i) => (
                <SuppliesMemberDots
                  key={`supplies-member-slot-${i}`}
                  memberIndex={i}
                  total={4 + prosperity}
                  checked={suppliesUses[i] ?? 0}
                  onChange={handleSuppliesUsesChange}
                />
              ))}
            </div>
          )}
          <CustomItemsGrid
            singleItems={CUSTOM_ITEM_INDICES.map(
              (i) => customItems[i] ?? { checked: false, text: "" },
            )}
            doubleItems={CUSTOM_ITEM_INDICES.map(
              (i) => customItems[i + 4] ?? { checked: false, text: "" },
            )}
            doubleOffset={4}
            onCheckedChange={handleCustomItemChecked}
            onTextChange={handleCustomItemText}
            onBlur={handleCustomItemBlur}
            ariaPrefix="Custom inventory item"
          />
        </div>
      </PlaybookSection>

      <PlaybookSection title="Individuals">
        <Text size="xs" font="serif" color="muted" leading="normal">
          When one stands out, give them a name, a tag, and one or more traits.
        </Text>
        <Text font="serif" color="muted" leading="normal">
          **Names:** Aled, Culhwich, Eira, Gerat, Glaw, Harri, Lowri, Mervyn,
          Nesta
        </Text>
        <Text font="serif" color="muted" leading="normal">
          **Tags:** *animal-lover, big, bully, cynical, drunkard, eager,
          gambler, greedy, grumpy, gullible, heartthrob, honest, kind, lewd,
          little, naive, old, popular, proud, rookie, reckless, shameless,
          sharp-eyed, short-tempered*
        </Text>
        <Text font="serif" color="muted" leading="normal">
          **Traits:** __'s kid/sibling/parent/cousin/__, bald, crush on __,
          grudge against __, hates __, idolizes __, jokes, messy, missing
          eye/finger/hand/__, misses their kids, nightmares, recently married,
          religious, scars, skinny, sharp-tongued, sings, snores, tells tall
          tales, too serious, troubles at home, whistles, whittler
        </Text>
        <div className={styles.individualsGrid}>
          {individuals.map((ind, i) => (
            <IndividualSlot
              key={`crew-individual-slot-${i}`}
              index={i}
              name={ind.name}
              tag={ind.tag}
              traits={ind.traits}
              onChange={handleIndividualChange}
              onBlur={handleIndividualBlur}
            />
          ))}
        </div>
      </PlaybookSection>
    </div>
  );
};
