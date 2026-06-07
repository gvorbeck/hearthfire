import { useState, useRef, useMemo, useCallback, memo } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';
import { useCharacterField } from '@/hooks/useCharacterField';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import clsx from 'clsx';
import { Checkbox, Divider, Heading, Input, List, PlaybookColumns, Stack, Text, UseDots } from '@/components/ui';
import { RepeaterField } from '@/components/fields';
import { PlaybookSection } from '../PlaybookSection';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { MINOR_ARCANA } from '@/lib/arcanaMinor';
import { MAJOR_ARCANA } from '@/lib/arcanaMajor';
import type { CharacterData, PlaybookSectionProps } from '@/types';
import styles from './Inventory.module.css';

interface MainItem {
  id: string;
  label: string;
  weight: 1 | 2;
  uses?: number;
  usesLabel?: string;
}

const MAIN_ITEMS: MainItem[] = [
  { id: 'supplies-1', label: '**Supplies** *(4+Prosperity uses ○○○○○)*', weight: 1, usesLabel: 'uses' },
  { id: 'supplies-2', label: '**More supplies** *(4+Prosperity uses ○○○○○)*', weight: 1, usesLabel: 'uses' },
  { id: 'supplies-3', label: '**Even more supplies** *(4+Prosperity uses ○○○○○)*', weight: 1, usesLabel: 'uses' },
  { id: 'mess-kit', label: '**Mess kit** *(requires fire & water; makes Supplies last longer)*', weight: 1 },
  { id: 'bedroll', label: '**Bedroll** *(recover 1d6 extra HP when you Make Camp)*', weight: 1 },
  { id: 'blanket', label: '**Blanket** *(warm)*', weight: 1 },
  { id: 'change-of-clothes', label: '**Change of clothes**', weight: 1 },
  { id: 'rope', label: '**Rope**, ~25 ft', weight: 1 },
  { id: 'shovel', label: '**Shovel**', weight: 1 },
  { id: 'sledge', label: '**Sledge/litter/travois**, roll-out', weight: 2 },
  { id: 'snow-shoes', label: '**Snow-shoes**', weight: 1 },
  { id: 'torch', label: '**Torch** *(lasts ~1 hour; reach, area, dangerous)*', weight: 1 },
  { id: 'oil-lamp', label: '**Oil lamp** *(○○○ hours, close, area, crude)*', weight: 1, uses: 3, usesLabel: 'hours' },
  { id: 'extra-oil', label: '**Extra oil** *(○○○○○ hours, for lamp/lantern, useless as a weapon)*', weight: 1, uses: 5, usesLabel: 'hours' },
  { id: 'firewood', label: '**Firewood** *(enough to last 1 full night, reach, area)*', weight: 2 },
  { id: 'hatchet', label: '**Hatchet**, iron *(hand, thrown, x piercing)*', weight: 1 },
  { id: 'mallet', label: '**Mallet**, iron and/or wood *(hand)*', weight: 1 },
  { id: 'mattock', label: '**Mattock**, iron *(close, x piercing, messy, awkward)*', weight: 1 },
  { id: 'maul', label: '**Maul**, iron *(close, forceful, awkward)*', weight: 2 },
  { id: 'staff', label: '**Staff** *(close)*', weight: 1 },
  { id: 'spear', label: '**Spear**, iron *(close, thrown, x piercing)*', weight: 1 },
  { id: 'long-spear', label: '**Long spear**, iron *(reach, x piercing)*', weight: 2 },
  { id: 'bow', label: '**Bow & iron arrows** *(near, x piercing, ○ low ammo, ○ all out)*', weight: 1, uses: 2, usesLabel: 'ammo' },
  { id: 'extra-arrows', label: '**Extra arrows** *(x piercing, ○ plenty left, ○ low ammo, ○ all out)*', weight: 1, uses: 3, usesLabel: 'ammo' },
  { id: 'javelins', label: '**Javelins**, a few, iron *(thrown, x piercing, +1 damage, ○ all out)*', weight: 1, uses: 1, usesLabel: 'ammo' },
  { id: 'shield', label: '**Shield** *(+1 armor, +1 Readiness on a 7+ to Defend)*', weight: 2 },
  { id: 'thick-hides', label: '**Thick hides** *(1 armor, warm)*', weight: 2 },
  { id: 'cloak', label: '**Cloak** *(warm)*', weight: 1 },
];

interface SmallItem {
  id: string;
  label: string;
}

const SMALL_ITEMS: SmallItem[] = [
  { id: 'knife', label: '**Knife** or dagger, iron *(hand)*' },
  { id: 'sling', label: '**Sling** *(near, reload, awkward, ○ low ammo, ○ all out)*' },
  { id: 'rushlight', label: '**Rushlight** *(lasts ~15-30 minutes, hand, crude)*' },
  { id: 'tinderbox', label: '**Tinderbox** *(slow)*' },
  { id: 'needle-thread', label: '**Needle & thread**' },
  { id: 'handful-coppers', label: '**Handful of coppers**' },
  { id: 'whisky', label: '**Whisky**, skin *(○○ uses)*' },
  { id: 'awl', label: '**Awl**' },
  { id: 'bowstring', label: '**Bowstring**' },
  { id: 'chalk', label: '**Chalk**' },
  { id: 'charcoal', label: '**Charcoal**' },
  { id: 'clay-jar', label: '**Clay jar**' },
  { id: 'cloth-rag', label: '**Cloth/rag**' },
  { id: 'comb', label: '**Comb**' },
  { id: 'cup', label: '**Cup**' },
  { id: 'extra-socks', label: '**Extra socks**' },
  { id: 'gloves', label: '**Gloves**' },
  { id: 'little-box', label: '**Little box**' },
  { id: 'sack', label: '**Sack** *(empty)*' },
  { id: 'sawdust', label: '**Sawdust**' },
  { id: 'tallow', label: '**Tallow**' },
  { id: 'twine', label: '**Twine/cord**' },
  { id: 'waterskin', label: '**Waterskin**' },
  { id: 'whetstone', label: '**Whetstone**' },
  { id: 'whistle', label: '**Whistle**' },
];

const UNDEFINED_MAIN_COUNT = 9;
const UNDEFINED_SMALL_COUNT = 6;

export const computeTotalLoad = (data: CharacterData | undefined): number => {
  const checked = data?.inventoryChecked ?? {};
  const namedLoad = MAIN_ITEMS.reduce((sum, item) => checked[item.id] ? sum + item.weight : sum, 0);
  const possessionLoad = (data?.inventoryPossessions ?? []).reduce((sum, item) => item.checked ? sum + item.weight : sum, 0);
  const arcanaMinorLoad = (data?.arcanaMinor ?? []).reduce((sum, entry) => {
    if (!entry.carried) return sum;
    const arcanum = MINOR_ARCANA.find((a) => a.id === entry.id);
    return arcanum?.weight ? sum + arcanum.weight : sum;
  }, 0);
  const arcanaMajorLoad = (data?.arcanaMajor ?? []).reduce((sum, entry) => {
    if (!entry.carried) return sum;
    const arcanum = MAJOR_ARCANA.find((a) => a.id === entry.id);
    return arcanum?.weight ? sum + arcanum.weight : sum;
  }, 0);
  return namedLoad + possessionLoad + arcanaMinorLoad + arcanaMajorLoad + (data?.inventoryUndefined ?? 0);
};

interface MainItemRowProps {
  item: MainItem;
  checked: boolean;
  uses: number;
  prosperity: number;
  onCheckedChange: (id: string, checked: boolean) => void;
  onUsesChange: (id: string, n: number) => void;
}

const MainItemRow = memo(({ item, checked, uses, prosperity, onCheckedChange, onUsesChange }: MainItemRowProps) => {
  const isSupplies = item.id.startsWith('supplies-');
  const hasUses = isSupplies || item.uses !== undefined;
  const effectiveTotal = isSupplies ? 4 + prosperity : (item.uses ?? 0);
  const handleChecked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(item.id, e.target.checked), [item.id, onCheckedChange]);
  const handleUses = useCallback((n: number) => onUsesChange(item.id, n), [item.id, onUsesChange]);
  return (
    <div className={styles.mainItemRow}>
      <Checkbox
        variant="provision"
        weight={item.weight}
        checked={checked}
        onChange={handleChecked}
        label={
          <span className={styles.itemLabel}>
            {parseInlineMarkdown(item.label)}
            {hasUses && checked && (
              <span className={styles.itemDots}>
                <UseDots total={effectiveTotal} checked={uses} onChange={handleUses} />
              </span>
            )}
          </span>
        }
      />
    </div>
  );
});

interface SmallItemRowProps {
  item: SmallItem;
  checked: boolean;
  onCheckedChange: (id: string, checked: boolean) => void;
}

const SmallItemRow = memo(({ item, checked, onCheckedChange }: SmallItemRowProps) => {
  const handleChecked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(item.id, e.target.checked), [item.id, onCheckedChange]);
  return (
    <div className={styles.smallItemRow}>
      <Checkbox
        checked={checked}
        onChange={handleChecked}
        label={<span className={styles.itemLabel}>{parseInlineMarkdown(item.label)}</span>}
      />
    </div>
  );
});

interface ArcanaItemRowProps {
  id: string;
  name: string;
  weight: 1 | 2;
  carried: boolean;
  onCarriedChange: (id: string, carried: boolean) => void;
}

const ArcanaItemRow = memo(({ id, name, weight, carried, onCarriedChange }: ArcanaItemRowProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onCarriedChange(id, e.target.checked), [id, onCarriedChange]);
  return (
    <div className={styles.mainItemRow}>
      <Checkbox
        variant="provision"
        weight={weight}
        checked={carried}
        onChange={handleChange}
        label={<span className={styles.itemLabel}>{parseInlineMarkdown(`**${name}** *(arcanum)*`)}</span>}
      />
    </div>
  );
});

interface UndefinedProvisionsProps {
  total: number;
  checked: number;
  onChange: (n: number) => void;
}

const UndefinedProvisions = memo(({ total, checked, onChange }: UndefinedProvisionsProps) => (
  <span className={styles.undefinedBoxes} role="group" aria-label={`Undefined: ${checked} of ${total}`}>
    {Array.from({ length: total }, (_, i) => (
      <UndefinedProvisionBox
        key={`undefined-${total}-${i}`}
        index={i}
        checked={checked}
        onChange={onChange}
      />
    ))}
  </span>
));

interface UndefinedProvisionBoxProps {
  index: number;
  checked: number;
  onChange: (n: number) => void;
}

const UndefinedProvisionBox = memo(({ index, checked, onChange }: UndefinedProvisionBoxProps) => {
  const isFilled = index < checked;
  const handleChange = useCallback(() => onChange(isFilled ? index : index + 1), [index, isFilled, onChange]);
  return (
    <Checkbox
      variant="provision"
      checked={isFilled}
      onChange={handleChange}
      aria-label={isFilled ? `Clear undefined item ${index + 1}` : `Mark undefined item ${index + 1}`}
    />
  );
});

interface ProsperityOptionRowProps {
  val: -1 | 0 | 1 | 2;
  selected: boolean;
}

const PROSPERITY_NOTES: Record<number, string> = { [-1]: 'Gear is crude', 0: 'Standard', 1: 'x = 1 piercing', 2: 'x = 2 piercing' };

const ProsperityOptionRow = memo(({ val, selected }: ProsperityOptionRowProps) => {
  const cx = clsx(styles.prosperityOption, selected && styles.prosperitySelected);
  return (
    <div className={cx} aria-current={selected ? true : undefined}>
      <span className={styles.prosperityValue}>{val > 0 ? `+${val}` : val}</span>
      <span className={styles.prosperityNote}>{PROSPERITY_NOTES[val]}</span>
    </div>
  );
});

interface InventoryProps extends PlaybookSectionProps {
  prosperity: number;
}

export const Inventory = ({ data, prosperity, onSave }: InventoryProps) => {
  const onSaveRef = useLatest(onSave);

  const { value: inventoryChecked, ref: inventoryCheckedRef, save: saveInventoryChecked } = useCharacterField('inventoryChecked', data?.inventoryChecked ?? {}, onSave, 'Failed to save.');
  const { value: inventoryUses, ref: inventoryUsesRef, save: saveInventoryUses } = useCharacterField('inventoryUses', data?.inventoryUses ?? {}, onSave, 'Failed to save.');
  const { value: smallChecked, ref: smallCheckedRef, save: saveSmallChecked } = useCharacterField('inventorySmallChecked', data?.inventorySmallChecked ?? {}, onSave, 'Failed to save.');
  const { value: undefinedMain, save: saveUndefinedMain } = useCharacterField('inventoryUndefined', data?.inventoryUndefined ?? 0, onSave, 'Failed to save.');
  const { value: undefinedSmall, save: saveUndefinedSmall } = useCharacterField('inventorySmallUndefined', data?.inventorySmallUndefined ?? 0, onSave, 'Failed to save.');
  const { value: arcanaMinor, ref: arcanaMinorRef, save: saveArcanaMinor } = useCharacterField('arcanaMinor', data?.arcanaMinor ?? [], onSave, 'Failed to save.');
  const { value: arcanaMajor, ref: arcanaMajorRef, save: saveArcanaMajor } = useCharacterField('arcanaMajor', data?.arcanaMajor ?? [], onSave, 'Failed to save.');
  const [otherThings, setOtherThings] = useState<string>(() => data?.inventoryOtherThings ?? '');
  const otherThingsPendingRef = useRef(false);

  const otherThingsSave = (value: Partial<CharacterData>) =>
    onSaveRef.current(value).finally(() => { otherThingsPendingRef.current = false; });
  const { onChange: otherThingsDebounced, flush: otherThingsFlush } = useDebouncedSave<Partial<CharacterData>>(otherThingsSave);

  useFirestoreSync(data?.inventoryOtherThings ?? '', setOtherThings, otherThingsPendingRef);

  const handleMainChecked = useCallback((id: string, val: boolean) => {
    saveInventoryChecked({ ...inventoryCheckedRef.current, [id]: val });
  }, [saveInventoryChecked]);

  const handleMainUses = useCallback((id: string, n: number) => {
    saveInventoryUses({ ...inventoryUsesRef.current, [id]: n });
  }, [saveInventoryUses]);

  const handleUndefinedMain = useCallback((n: number) => {
    saveUndefinedMain(n);
  }, [saveUndefinedMain]);

  const handleUndefinedSmall = useCallback((n: number) => {
    saveUndefinedSmall(n);
  }, [saveUndefinedSmall]);

  const handleSmallChecked = useCallback((id: string, val: boolean) => {
    saveSmallChecked({ ...smallCheckedRef.current, [id]: val });
  }, [saveSmallChecked]);

  const handleOtherThingsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setOtherThings(val);
    otherThingsPendingRef.current = true;
    otherThingsDebounced({ inventoryOtherThings: val });
  }, [otherThingsDebounced]);

  const handleOtherThingsBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    otherThingsFlush({ inventoryOtherThings: e.target.value })
      .finally(() => { otherThingsPendingRef.current = false; });
  }, [otherThingsFlush]);

  const handleSavePossessions = async (items: { checked: boolean; text: string; weight: 1 | 2 }[]) => {
    await onSaveRef.current({ inventoryPossessions: items });
  };

  const handleSaveSmallCustom = async (items: { checked: boolean; text: string }[]) => {
    await onSaveRef.current({ inventorySmallCustom: items });
  };

  const handleArcanaCarried = useCallback((id: string, carried: boolean) => {
    saveArcanaMinor(arcanaMinorRef.current.map((e) => e.id === id ? { ...e, carried } : e));
  }, [saveArcanaMinor]);

  const handleArcanaMajorCarried = useCallback((id: string, carried: boolean) => {
    saveArcanaMajor(arcanaMajorRef.current.map((e) => e.id === id ? { ...e, carried } : e));
  }, [saveArcanaMajor]);

  const totalLoad = useMemo(
    () => computeTotalLoad({ ...data, inventoryChecked, inventoryUndefined: undefinedMain, arcanaMinor, arcanaMajor }),
    [inventoryChecked, data, undefinedMain, arcanaMinor, arcanaMajor],
  );
  const loadLabel = totalLoad <= 3 ? 'light load' : totalLoad <= 6 ? 'normal load' : 'heavy load';
  const loadCx = clsx(
    styles.loadBadge,
    totalLoad <= 3 && styles.loadLight,
    totalLoad > 3 && totalLoad <= 6 && styles.loadNormal,
    totalLoad > 6 && styles.loadHeavy,
  );


  return (
    <PlaybookColumns
      left={
        <PlaybookSection title="Inventory">
          <Text font="serif" color="muted" leading="normal">
            {parseInlineMarkdown('When you **Outfit**, mark a number of ◊ below, on specific items or Undefined.')}
          </Text>
          <List
            variant="bullet"
            items={[
              parseInlineMarkdown('For a **light load** *(quick & quiet)*, mark up to 3 ◈'),
              parseInlineMarkdown('For a **normal load**, mark 4–6 ◈'),
              parseInlineMarkdown('For a **heavy load** *(noisy, slow, hot, quick to tire)*, mark 7–9 ◈'),
            ]}
          />

          <div className={styles.loadRow}>
            <span className={loadCx}>
              {parseInlineMarkdown(`${totalLoad} ◈ — ${loadLabel}`)}
            </span>
          </div>

          <Divider />

          <Stack gap={2}>
            <Stack direction="row" gap={3} align="center">
              <span className={styles.undefinedLabel}>Undefined</span>
              <UndefinedProvisions total={UNDEFINED_MAIN_COUNT} checked={undefinedMain} onChange={handleUndefinedMain} />
            </Stack>
            <Text font="serif" color="muted" leading="normal">
              {parseInlineMarkdown('When you **Have What You Need**, move ◈ from here to ◊ below.')}
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
                onCheckedChange={handleMainChecked}
                onUsesChange={handleMainUses}
              />
            ))}
          </Stack>

          <Divider />

          <Stack gap={2}>
            <Heading as="h4" size="sm">Possessions, items, loot</Heading>
            {arcanaMinor.map((entry) => {
              const arcanum = MINOR_ARCANA.find((a) => a.id === entry.id);
              if (!arcanum?.weight) return null;
              return (
                <ArcanaItemRow
                  key={entry.id}
                  id={entry.id}
                  name={arcanum.name}
                  weight={arcanum.weight}
                  carried={!!entry.carried}
                  onCarriedChange={handleArcanaCarried}
                />
              );
            })}
            {arcanaMajor.map((entry) => {
              const arcanum = MAJOR_ARCANA.find((a) => a.id === entry.id);
              if (!arcanum?.weight) return null;
              return (
                <ArcanaItemRow
                  key={entry.id}
                  id={entry.id}
                  name={arcanum.name}
                  weight={arcanum.weight}
                  carried={!!entry.carried}
                  onCarriedChange={handleArcanaMajorCarried}
                />
              );
            })}
            <RepeaterField
              variant="checked-weight"
              items={data?.inventoryPossessions ?? []}
              onSave={handleSavePossessions}
              addLabel="Add possession"
              itemLabel="Possession"
            />
          </Stack>

          <Divider />

          <Stack gap={2}>
            <Heading as="h4" size="sm">{parseInlineMarkdown('Other things *(animals, kits, stashed items, etc.)*')}</Heading>
            <Input
              multiline
              value={otherThings}
              placeholder="Notes…"
              aria-label="Other things"
              rows={3}
              onChange={handleOtherThingsChange}
              onBlur={handleOtherThingsBlur}
            />
          </Stack>
        </PlaybookSection>
      }
      right={<>
        <PlaybookSection title="Small items">
          <Text font="serif" color="muted" leading="normal">Fit in a pocket, pouch, or boot.</Text>
          <Text font="serif" color="muted" leading="normal">
            {parseInlineMarkdown('When you **Outfit**, mark □ below equal to 4+Prosperity.')}
          </Text>

          <Divider />

          <Stack gap={2}>
            <Stack direction="row" gap={3} align="center">
              <span className={styles.undefinedLabel}>Undefined</span>
              <UndefinedProvisions total={UNDEFINED_SMALL_COUNT} checked={undefinedSmall} onChange={handleUndefinedSmall} />
            </Stack>
            <Text font="serif" color="muted" leading="normal">
              {parseInlineMarkdown("When you **Have What You Need**, move ◈ from here to items below, or expend supplies to mark an additional □.")}
            </Text>
          </Stack>

          <Divider />

          <Stack gap={1}>
            {SMALL_ITEMS.map((item) => (
              <SmallItemRow
                key={item.id}
                item={item}
                checked={smallChecked[item.id] ?? false}
                onCheckedChange={handleSmallChecked}
              />
            ))}
            <RepeaterField
              variant="checked"
              items={data?.inventorySmallCustom ?? []}
              onSave={handleSaveSmallCustom}
              addLabel="Add small item"
              itemLabel="Small item"
            />
          </Stack>
        </PlaybookSection>

        <PlaybookSection title="Prosperity">
          <Text font="serif" color="muted" leading="normal">
            Affects uses from Supplies, HP from Recover, and piercing on iron weapons. Set by the GM.
          </Text>
          <div className={styles.prosperityList}>
            {([-1, 0, 1, 2] as const).map((val) => (
              <ProsperityOptionRow key={val} val={val} selected={prosperity === val} />
            ))}
          </div>
        </PlaybookSection>
      </>}
    />
  );
};
