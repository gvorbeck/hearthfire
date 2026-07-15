import { useCallback, memo } from "react";
import clsx from "clsx";
import {
  Checkbox,
  Divider,
  Heading,
  Icon,
  List,
  Stack,
  Text,
  UseDots,
} from "@/components/ui";
import { RepeaterField } from "@/components/fields";
import type { ArcanaMinorEntry, ArcanaMajorEntry } from "@/types";
import {
  MAIN_ITEMS,
  UNDEFINED_MAIN_COUNT,
  type MainItem,
} from "./inventoryData";
import type { ArcanaWeights } from "./useArcanaWeights";
import { UndefinedProvisions } from "./UndefinedProvisions";
import shared from "./inventoryItem.module.css";
import styles from "./MainInventorySection.module.css";

interface MainItemRowProps {
  item: MainItem;
  checked: boolean;
  uses: number;
  prosperity: number;
  weightOverride?: 1 | 2;
  onCheckedChange: (id: string, checked: boolean) => void;
  onUsesChange: (id: string, n: number) => void;
}

const MainItemRow = memo(
  ({
    item,
    checked,
    uses,
    prosperity,
    weightOverride,
    onCheckedChange,
    onUsesChange,
  }: MainItemRowProps) => {
    const isSupplies = item.id.startsWith("supplies-");
    const hasUses = isSupplies || item.uses !== undefined;
    const effectiveTotal = isSupplies ? 4 + prosperity : (item.uses ?? 0);
    const handleChecked = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onCheckedChange(item.id, e.target.checked),
      [item.id, onCheckedChange],
    );
    const handleUses = useCallback(
      (n: number) => onUsesChange(item.id, n),
      [item.id, onUsesChange],
    );
    return (
      <div className={styles.mainItemRow}>
        {/* Dots render as a sibling of the checkbox, never inside its <label>: interactive
            buttons nested in a <label> are invalid HTML and garble the accessible name. */}
        <Checkbox
          variant="provision"
          weight={weightOverride ?? item.weight}
          checked={checked}
          onChange={handleChecked}
          label={
            <span className={shared.itemLabel}>
              <Text as="span">{item.label}</Text>
            </span>
          }
        />
        {hasUses && checked && (
          <div className={styles.itemDots}>
            <UseDots total={effectiveTotal} checked={uses} onChange={handleUses} ariaLabel={item.label} />
          </div>
        )}
      </div>
    );
  },
);

interface ArcanaItemRowProps {
  id: string;
  name: string;
  weight: 1 | 2;
  carried: boolean;
  onCarriedChange: (id: string, carried: boolean) => void;
}

const ArcanaItemRow = memo(
  ({ id, name, weight, carried, onCarriedChange }: ArcanaItemRowProps) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onCarriedChange(id, e.target.checked),
      [id, onCarriedChange],
    );
    return (
      <div className={styles.mainItemRow}>
        <Checkbox
          variant="provision"
          weight={weight}
          checked={carried}
          onChange={handleChange}
          label={
            <Text
              as="span"
              className={shared.itemLabel}
            >{`**${name}** *(arcanum)*`}</Text>
          }
        />
      </div>
    );
  },
);

interface MainInventorySectionProps {
  // null while the lazily-loaded arcana weights are still in flight (see useArcanaWeights).
  totalLoad: number | null;
  prosperity: number;
  shieldWeight: 1 | 2;
  inventoryChecked: Record<string, boolean>;
  inventoryUses: Record<string, number>;
  undefinedMain: number;
  arcanaMinor: ArcanaMinorEntry[];
  arcanaMajor: ArcanaMajorEntry[];
  // null while loading; the arcana rows render once the weight maps arrive.
  arcanaWeights: { minor: ArcanaWeights; major: ArcanaWeights } | null;
  possessions: { checked: boolean; text: string; weight: 1 | 2 }[];
  onMainChecked: (id: string, checked: boolean) => void;
  onMainUses: (id: string, n: number) => void;
  onUndefinedChange: (n: number) => void;
  onArcanaMinorCarried: (id: string, carried: boolean) => void;
  onArcanaMajorCarried: (id: string, carried: boolean) => void;
  onSavePossessions: (
    items: { checked: boolean; text: string; weight: 1 | 2 }[],
  ) => Promise<void>;
}

export const MainInventorySection = ({
  totalLoad,
  prosperity,
  shieldWeight,
  inventoryChecked,
  inventoryUses,
  undefinedMain,
  arcanaMinor,
  arcanaMajor,
  arcanaWeights,
  possessions,
  onMainChecked,
  onMainUses,
  onUndefinedChange,
  onArcanaMinorCarried,
  onArcanaMajorCarried,
  onSavePossessions,
}: MainInventorySectionProps) => {
  // totalLoad is null until the lazily-loaded arcana weights arrive; show a neutral pending
  // badge meanwhile so we never flash a total that omits a carried arcanum's weight.
  const isLoading = totalLoad === null;
  const loadLabel = isLoading
    ? "calculating load…"
    : totalLoad <= 3
      ? "light load"
      : totalLoad <= 6
        ? "normal load"
        : "heavy load";
  const loadCx = clsx(
    styles.loadBadge,
    !isLoading && totalLoad <= 3 && styles.loadLight,
    !isLoading && totalLoad > 3 && totalLoad <= 6 && styles.loadNormal,
    !isLoading && totalLoad > 6 && styles.loadHeavy,
  );

  return (
    <>
      <Text font="serif" color="muted" leading="normal">
        When you **Outfit**, mark a number of ◊ below, on specific items or
        Undefined.
      </Text>
      <List
        variant="bullet"
        items={[
          "For a **light load** *(quick & quiet)*, mark up to 3 ◈",
          "For a **normal load**, mark 4–6 ◈",
          "For a **heavy load** *(noisy, slow, hot, quick to tire)*, mark 7–9 ◈",
        ]}
      />

      <div className={styles.loadRow}>
        <Text
          as="span"
          className={loadCx}
          aria-live="polite"
          aria-label={isLoading ? "Calculating load" : `${totalLoad} load — ${loadLabel}`}
        >
          {isLoading ? (
            <>
              <Icon name="hourglass" size="small" className={styles.loadIcon} />
              {loadLabel}
            </>
          ) : (
            <>
              {totalLoad}
              <Icon name="filled-provisions" size="small" />
              {`— ${loadLabel}`}
            </>
          )}
        </Text>
      </div>

      <Divider />

      <Stack gap={2}>
        <Stack direction="row" gap={3} align="center">
          <Text as="span" font="serif" weight="semibold">
            Undefined
          </Text>
          <UndefinedProvisions
            total={UNDEFINED_MAIN_COUNT}
            checked={undefinedMain}
            onChange={onUndefinedChange}
          />
        </Stack>
        <Text font="serif" color="muted" leading="normal">
          When you **Have What You Need**, move ◈ from here to ◊ below.
        </Text>
      </Stack>

      <Divider />

      <Stack gap={2}>
        {MAIN_ITEMS.map((item) => (
          <MainItemRow
            key={item.id}
            item={item}
            checked={inventoryChecked[item.id] ?? false}
            uses={inventoryUses[item.id] ?? 0}
            prosperity={prosperity}
            weightOverride={item.id === "shield" ? shieldWeight : undefined}
            onCheckedChange={onMainChecked}
            onUsesChange={onMainUses}
          />
        ))}
      </Stack>

      <Divider />

      <Stack gap={2}>
        <Heading as="h4" size="sm">
          Possessions, items, loot
        </Heading>
        {arcanaMinor.map((entry) => {
          const arcanum = arcanaWeights?.minor[entry.id];
          if (!arcanum?.weight) return null;
          return (
            <ArcanaItemRow
              key={entry.id}
              id={entry.id}
              name={arcanum.name}
              weight={arcanum.weight}
              carried={!!entry.carried}
              onCarriedChange={onArcanaMinorCarried}
            />
          );
        })}
        {arcanaMajor.map((entry) => {
          const arcanum = arcanaWeights?.major[entry.id];
          if (!arcanum?.weight) return null;
          return (
            <ArcanaItemRow
              key={entry.id}
              id={entry.id}
              name={arcanum.name}
              weight={arcanum.weight}
              carried={!!entry.carried}
              onCarriedChange={onArcanaMajorCarried}
            />
          );
        })}
        <RepeaterField
          variant="checked-weight"
          items={possessions}
          onSave={onSavePossessions}
          addLabel="Add possession"
          itemLabel="Possession"
        />
      </Stack>
    </>
  );
};
