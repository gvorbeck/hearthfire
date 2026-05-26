import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { Checkbox, Divider, Input, UseDots } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
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

const UNDEFINED_MAIN_COUNT = 3;
const UNDEFINED_SMALL_COUNT = 5;
const CUSTOM_MAIN_COUNT = 5;
const CUSTOM_SMALL_COUNT = 10;
const POSSESSION_COUNT = 5;

const normalizeCustomMain = (
  raw: { checked: boolean; text: string; weight: 1 | 2 }[] | undefined,
): { checked: boolean; text: string; weight: 1 | 2 }[] =>
  Array.from({ length: CUSTOM_MAIN_COUNT }, (_, i) => raw?.[i] ?? { checked: false, text: '', weight: 1 });

const normalizeCustomSmall = (
  raw: { checked: boolean; text: string }[] | undefined,
): { checked: boolean; text: string }[] =>
  Array.from({ length: CUSTOM_SMALL_COUNT }, (_, i) => raw?.[i] ?? { checked: false, text: '' });

const normalizePossessions = (
  raw: { checked: boolean; text: string; weight: 1 | 2 }[] | undefined,
): { checked: boolean; text: string; weight: 1 | 2 }[] =>
  Array.from({ length: POSSESSION_COUNT }, (_, i) => raw?.[i] ?? { checked: false, text: '', weight: 1 });

interface MainItemRowProps {
  item: MainItem;
  checked: boolean;
  uses: number;
  prosperity: number;
  onCheckedChange: (id: string, checked: boolean) => void;
  onUsesChange: (id: string, n: number) => void;
}

const MainItemRow = ({ item, checked, uses, prosperity, onCheckedChange, onUsesChange }: MainItemRowProps) => {
  const isSupplies = item.id.startsWith('supplies-');
  const hasUses = isSupplies || item.uses !== undefined;
  const effectiveTotal = isSupplies ? 4 + prosperity : (item.uses ?? 0);
  const rowCx = clsx(styles.mainItemRow, item.weight === 2 && styles.mainItemRowDouble);
  return (
    <div className={rowCx}>
      <Checkbox
        variant="provision"
        weight={item.weight}
        checked={checked}
        onChange={(e) => onCheckedChange(item.id, e.target.checked)}
        label={
          <span className={styles.itemLabel}>
            {parseInlineMarkdown(item.label)}
            {hasUses && checked && (
              <span className={styles.itemDots}>
                <UseDots total={effectiveTotal} checked={uses} onChange={(n) => onUsesChange(item.id, n)} />
              </span>
            )}
          </span>
        }
      />
    </div>
  );
};

interface SmallItemRowProps {
  item: SmallItem;
  checked: boolean;
  onCheckedChange: (id: string, checked: boolean) => void;
}

const SmallItemRow = ({ item, checked, onCheckedChange }: SmallItemRowProps) => (
  <div className={styles.smallItemRow}>
    <Checkbox
      checked={checked}
      onChange={(e) => onCheckedChange(item.id, e.target.checked)}
      label={<span className={styles.itemLabel}>{parseInlineMarkdown(item.label)}</span>}
    />
  </div>
);

interface CustomMainItemProps {
  index: number;
  checked: boolean;
  text: string;
  weight: 1 | 2;
  onCheckedChange: (i: number, checked: boolean) => void;
  onTextChange: (i: number, text: string) => void;
  onWeightChange: (i: number, weight: 1 | 2) => void;
  onBlur: () => void;
}

const CustomMainItem = ({ index, checked, text, weight, onCheckedChange, onTextChange, onWeightChange, onBlur }: CustomMainItemProps) => (
  <div className={styles.customMainItem}>
    <Checkbox variant="provision" weight={weight} checked={checked} onChange={(e) => onCheckedChange(index, e.target.checked)} aria-label={`Custom item ${index + 1}`} />
    <Input
      className={styles.customInput}
      type="text"
      value={text}
      placeholder="Item…"
      aria-label={`Custom item ${index + 1} name`}
      onChange={(e) => onTextChange(index, e.target.value)}
      onBlur={onBlur}
    />
    <select
      className={styles.weightSelect}
      value={weight}
      aria-label={`Custom item ${index + 1} weight`}
      onChange={(e) => onWeightChange(index, Number(e.target.value) as 1 | 2)}
    >
      <option value={1}>◇</option>
      <option value={2}>◇◇</option>
    </select>
  </div>
);

interface CustomSmallItemProps {
  index: number;
  checked: boolean;
  text: string;
  onCheckedChange: (i: number, checked: boolean) => void;
  onTextChange: (i: number, text: string) => void;
  onBlur: () => void;
}

const CustomSmallItem = ({ index, checked, text, onCheckedChange, onTextChange, onBlur }: CustomSmallItemProps) => (
  <div className={styles.customSmallItem}>
    <Checkbox checked={checked} onChange={(e) => onCheckedChange(index, e.target.checked)} aria-label={`Custom small item ${index + 1}`} />
    <Input
      className={styles.customInput}
      type="text"
      value={text}
      placeholder="Item…"
      aria-label={`Custom small item ${index + 1} name`}
      onChange={(e) => onTextChange(index, e.target.value)}
      onBlur={onBlur}
    />
  </div>
);

interface PossessionRowProps {
  index: number;
  checked: boolean;
  text: string;
  weight: 1 | 2;
  onCheckedChange: (i: number, checked: boolean) => void;
  onTextChange: (i: number, text: string) => void;
  onWeightChange: (i: number, weight: 1 | 2) => void;
  onBlur: () => void;
}

const PossessionRow = ({ index, checked, text, weight, onCheckedChange, onTextChange, onWeightChange, onBlur }: PossessionRowProps) => (
  <div className={styles.possessionRow}>
    <Checkbox variant="provision" weight={weight} checked={checked} onChange={(e) => onCheckedChange(index, e.target.checked)} aria-label={`Possession ${index + 1}`} />
    <Input
      className={styles.customInput}
      type="text"
      value={text}
      placeholder="Item…"
      aria-label={`Possession ${index + 1} name`}
      onChange={(e) => onTextChange(index, e.target.value)}
      onBlur={onBlur}
    />
    <select
      className={styles.weightSelect}
      value={weight}
      aria-label={`Possession ${index + 1} weight`}
      onChange={(e) => onWeightChange(index, Number(e.target.value) as 1 | 2)}
    >
      <option value={1}>◇</option>
      <option value={2}>◇◇</option>
    </select>
  </div>
);

interface InventoryProps {
  data: CharacterData | undefined;
  prosperity: number;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const Inventory = ({ data, prosperity, onSave }: InventoryProps) => {
  const [inventoryChecked, setInventoryChecked] = useState<Record<string, boolean>>(() => data?.inventoryChecked ?? {});
  const [inventoryUses, setInventoryUses] = useState<Record<string, number>>(() => data?.inventoryUses ?? {});
  const [customItems, setCustomItems] = useState(() => normalizeCustomMain(data?.inventoryCustomItems));
  const [smallChecked, setSmallChecked] = useState<Record<string, boolean>>(() => data?.inventorySmallChecked ?? {});
  const [smallCustom, setSmallCustom] = useState(() => normalizeCustomSmall(data?.inventorySmallCustom));
  const [undefinedMain, setUndefinedMain] = useState<number>(() => data?.inventoryUndefined ?? 0);
  const [undefinedSmall, setUndefinedSmall] = useState<number>(() => data?.inventorySmallUndefined ?? 0);
  const [otherThings, setOtherThings] = useState<string>(() => data?.inventoryOtherThings ?? '');
  const [possessions, setPossessions] = useState(() => normalizePossessions(data?.inventoryPossessions));

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const customItemsRef = useRef(customItems);
  customItemsRef.current = customItems;
  const smallCustomRef = useRef(smallCustom);
  smallCustomRef.current = smallCustom;
  const possessionsRef = useRef(possessions);
  possessionsRef.current = possessions;

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Only sync toggle/counter fields from Firestore; text-heavy fields (custom items, possessions,
  // other things) are left as local state after mount to prevent Firestore round-trips overwriting
  // in-flight keystrokes before the debounce flushes.
  useEffect(() => {
    if (data?.inventoryChecked !== undefined) setInventoryChecked(data.inventoryChecked);
    if (data?.inventoryUses !== undefined) setInventoryUses(data.inventoryUses);
    if (data?.inventorySmallChecked !== undefined) setSmallChecked(data.inventorySmallChecked);
    if (data?.inventoryUndefined !== undefined) setUndefinedMain(data.inventoryUndefined);
    if (data?.inventorySmallUndefined !== undefined) setUndefinedSmall(data.inventorySmallUndefined);
  }, [data]);

  const saveDebounced = useCallback((patch: Partial<CharacterData>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSaveRef.current(patch), 1000);
  }, []);

  const saveImmediate = useCallback((patch: Partial<CharacterData>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSaveRef.current(patch);
  }, []);

  const flushDebounce = useCallback((patch: Partial<CharacterData>) => {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
    onSaveRef.current(patch);
  }, []);

  const handleMainChecked = useCallback((id: string, val: boolean) => {
    setInventoryChecked((prev) => {
      const next = { ...prev, [id]: val };
      saveImmediate({ inventoryChecked: next });
      return next;
    });
  }, [saveImmediate]);

  const handleMainUses = useCallback((id: string, n: number) => {
    setInventoryUses((prev) => {
      const next = { ...prev, [id]: n };
      saveImmediate({ inventoryUses: next });
      return next;
    });
  }, [saveImmediate]);

  const handleUndefinedMain = useCallback((n: number) => {
    setUndefinedMain(n);
    saveImmediate({ inventoryUndefined: n });
  }, [saveImmediate]);

  const handleUndefinedSmall = useCallback((n: number) => {
    setUndefinedSmall(n);
    saveImmediate({ inventorySmallUndefined: n });
  }, [saveImmediate]);

  const handleSmallChecked = useCallback((id: string, val: boolean) => {
    setSmallChecked((prev) => {
      const next = { ...prev, [id]: val };
      saveImmediate({ inventorySmallChecked: next });
      return next;
    });
  }, [saveImmediate]);

  const handleCustomMainChecked = useCallback((i: number, val: boolean) => {
    setCustomItems((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, checked: val } : item);
      saveImmediate({ inventoryCustomItems: next });
      return next;
    });
  }, [saveImmediate]);

  const handleCustomMainText = useCallback((i: number, text: string) => {
    setCustomItems((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, text } : item);
      saveDebounced({ inventoryCustomItems: next });
      return next;
    });
  }, [saveDebounced]);

  const handleCustomMainWeight = useCallback((i: number, weight: 1 | 2) => {
    setCustomItems((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, weight } : item);
      saveImmediate({ inventoryCustomItems: next });
      return next;
    });
  }, [saveImmediate]);

  const handleCustomMainBlur = useCallback(() => {
    flushDebounce({ inventoryCustomItems: customItemsRef.current });
  }, [flushDebounce]);

  const handleSmallCustomChecked = useCallback((i: number, val: boolean) => {
    setSmallCustom((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, checked: val } : item);
      saveImmediate({ inventorySmallCustom: next });
      return next;
    });
  }, [saveImmediate]);

  const handleSmallCustomText = useCallback((i: number, text: string) => {
    setSmallCustom((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, text } : item);
      saveDebounced({ inventorySmallCustom: next });
      return next;
    });
  }, [saveDebounced]);

  const handleSmallCustomBlur = useCallback(() => {
    flushDebounce({ inventorySmallCustom: smallCustomRef.current });
  }, [flushDebounce]);

  const handleOtherThingsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setOtherThings(val);
    saveDebounced({ inventoryOtherThings: val });
  }, [saveDebounced]);

  const handleOtherThingsBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    flushDebounce({ inventoryOtherThings: e.target.value });
  }, [flushDebounce]);

  const handlePossessionChecked = useCallback((i: number, val: boolean) => {
    setPossessions((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, checked: val } : item);
      saveImmediate({ inventoryPossessions: next });
      return next;
    });
  }, [saveImmediate]);

  const handlePossessionText = useCallback((i: number, text: string) => {
    setPossessions((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, text } : item);
      saveDebounced({ inventoryPossessions: next });
      return next;
    });
  }, [saveDebounced]);

  const handlePossessionWeight = useCallback((i: number, weight: 1 | 2) => {
    setPossessions((prev) => {
      const next = prev.map((item, idx) => idx === i ? { ...item, weight } : item);
      saveImmediate({ inventoryPossessions: next });
      return next;
    });
  }, [saveImmediate]);

  const handlePossessionBlur = useCallback(() => {
    flushDebounce({ inventoryPossessions: possessionsRef.current });
  }, [flushDebounce]);

  const { totalLoad, loadLabel, loadCx } = useMemo(() => {
    const load = MAIN_ITEMS.reduce((sum, item) => inventoryChecked[item.id] ? sum + item.weight : sum, 0) +
      customItems.reduce((sum, item) => item.checked ? sum + item.weight : sum, 0) +
      possessions.reduce((sum, item) => item.checked ? sum + item.weight : sum, 0) +
      undefinedMain;
    return {
      totalLoad: load,
      loadLabel: load <= 3 ? 'light load' : load <= 6 ? 'normal load' : 'heavy load',
      loadCx: clsx(
        styles.loadBadge,
        load <= 3 && styles.loadLight,
        load > 3 && load <= 6 && styles.loadNormal,
        load > 6 && styles.loadHeavy,
      ),
    };
  }, [inventoryChecked, customItems, possessions, undefinedMain]);

  const possessionsHeadingCx = clsx(styles.prose, styles.possessionsHeading);

  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <div className={styles.mainCol}>
          <PlaybookSection title="Inventory">
            <p className={styles.prose}>
              {parseInlineMarkdown('When you **Outfit**, mark a number of ◊ below, on specific items or Undefined.')}
            </p>
            <ul className={styles.outfitList}>
              <li className={styles.prose}>{parseInlineMarkdown('For a **light load** *(quick & quiet)*, mark up to 3 ◈')}</li>
              <li className={styles.prose}>{parseInlineMarkdown('For a **normal load**, mark 4–6 ◈')}</li>
              <li className={styles.prose}>{parseInlineMarkdown('For a **heavy load** *(noisy, slow, hot, quick to tire)*, mark 7–9 ◈')}</li>
            </ul>

            <div className={styles.loadRow}>
              <span className={loadCx}>
                {parseInlineMarkdown(`${totalLoad} ◈ — ${loadLabel}`)}
              </span>
            </div>

            <Divider />

            <div className={styles.undefinedSection}>
              <div className={styles.undefinedHeader}>
                <span className={styles.undefinedLabel}>Undefined</span>
                <UseDots total={UNDEFINED_MAIN_COUNT} checked={undefinedMain} onChange={handleUndefinedMain} />
              </div>
              <p className={styles.prose}>
                {parseInlineMarkdown('When you **Have What You Need**, move ◈ from here to ◊ below.')}
              </p>
            </div>

            <Divider />

            <div className={styles.itemList}>
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
            </div>

            <Divider />

            <div className={styles.possessionsSection}>
              <p className={possessionsHeadingCx}>Possessions, items, loot</p>
              <div className={styles.possessionList}>
                {possessions.map((item, i) => (
                  <PossessionRow
                    key={`possession-${i}`}
                    index={i}
                    checked={item.checked}
                    text={item.text}
                    weight={item.weight}
                    onCheckedChange={handlePossessionChecked}
                    onTextChange={handlePossessionText}
                    onWeightChange={handlePossessionWeight}
                    onBlur={handlePossessionBlur}
                  />
                ))}
              </div>
            </div>

            <Divider />

            <div className={styles.customSection}>
              <div className={styles.customItemList}>
                {customItems.map((item, i) => (
                  <CustomMainItem
                    key={`custom-main-${i}`}
                    index={i}
                    checked={item.checked}
                    text={item.text}
                    weight={item.weight}
                    onCheckedChange={handleCustomMainChecked}
                    onTextChange={handleCustomMainText}
                    onWeightChange={handleCustomMainWeight}
                    onBlur={handleCustomMainBlur}
                  />
                ))}
              </div>
            </div>

            <Divider />

            <div className={styles.otherSection}>
              <p className={possessionsHeadingCx}>Other things <em>(animals, kits, stashed items, etc.)</em></p>
              <Input
                multiline
                value={otherThings}
                placeholder="Notes…"
                aria-label="Other things"
                rows={3}
                onChange={handleOtherThingsChange}
                onBlur={handleOtherThingsBlur}
              />
            </div>
          </PlaybookSection>
        </div>

        <div className={styles.sideCol}>
          <PlaybookSection title="Small items">
            <p className={styles.prose}>Fit in a pocket, pouch, or boot.</p>
            <p className={styles.prose}>
              {parseInlineMarkdown('When you **Outfit**, mark □ below equal to 4+Prosperity.')}
            </p>

            <Divider />

            <div className={styles.undefinedSection}>
              <div className={styles.undefinedHeader}>
                <span className={styles.undefinedLabel}>Undefined</span>
                <UseDots total={UNDEFINED_SMALL_COUNT} checked={undefinedSmall} onChange={handleUndefinedSmall} />
              </div>
              <p className={styles.prose}>
                {parseInlineMarkdown("When you **Have What You Need**, move ◈ from here to items below, or expend supplies to mark an additional □.")}
              </p>
            </div>

            <Divider />

            <div className={styles.smallItemList}>
              {SMALL_ITEMS.map((item) => (
                <SmallItemRow
                  key={item.id}
                  item={item}
                  checked={smallChecked[item.id] ?? false}
                  onCheckedChange={handleSmallChecked}
                />
              ))}
              {smallCustom.map((item, i) => (
                <CustomSmallItem
                  key={`small-custom-${i}`}
                  index={i}
                  checked={item.checked}
                  text={item.text}
                  onCheckedChange={handleSmallCustomChecked}
                  onTextChange={handleSmallCustomText}
                  onBlur={handleSmallCustomBlur}
                />
              ))}
            </div>
          </PlaybookSection>

          <PlaybookSection title="Prosperity">
            <p className={styles.prose}>
              Affects uses from Supplies, HP from Recover, and piercing on iron weapons. Set by the GM.
            </p>
            <div className={styles.prosperityList}>
              {([-1, 0, 1, 2] as const).map((val) => {
                const prosperityOptionCx = clsx(styles.prosperityOption, prosperity === val && styles.prosperitySelected);
                return (
                <div key={val} className={prosperityOptionCx}>
                  <span className={styles.prosperityValue}>{val > 0 ? `+${val}` : val}</span>
                  <span className={styles.prosperityNote}>
                    {val === -1 && 'Gear is crude'}
                    {val === 0 && 'Standard'}
                    {val === 1 && 'x = 1 piercing'}
                    {val === 2 && 'x = 2 piercing'}
                  </span>
                </div>
                );
              })}
            </div>
          </PlaybookSection>
        </div>
      </div>
    </div>
  );
};
