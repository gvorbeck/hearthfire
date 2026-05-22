import { useState, useEffect, useCallback, memo } from 'react';
import clsx from 'clsx';
import { Checkbox, CheckboxGroup, Divider, UseDots } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from './useCrewSave';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './MarshalCrew.module.css';


const CREW_HP_MAX = 6;
const CREW_DAMAGE = 'd6';
const CREW_SIZE = 6;

const TAG_ITEMS = [
  { id: 'archers', label: 'archers' },
  { id: 'athletic', label: 'athletic' },
  { id: 'brave', label: 'brave' },
  { id: 'cunning', label: 'cunning' },
  { id: 'devoted', label: 'devoted' },
  { id: 'hardy', label: 'hardy' },
  { id: 'intimidating', label: 'intimidating' },
  { id: 'observant', label: 'observant' },
  { id: 'patient', label: 'patient' },
  { id: 'respected', label: 'respected' },
  { id: 'stealthy', label: 'stealthy' },
  { id: 'warriors', label: 'warriors' },
];

const INSTINCT_OPTIONS = [
  'To bicker, infight, and hold grudges',
  'To hew to tradition and superstition',
  'To indulge their baser instincts',
  'To lord over others',
  'To take needless risks',
  'To take things too far',
];

const COST_OPTIONS = [
  'Merry-making, as a group',
  'Public recognition and respect, honor',
  'Risks taken, by you, to help them',
  'Victories won against worthy foes',
  'Wealth gained for themselves or Stonetop',
];

interface InventoryItem {
  id: string;
  label: string;
  weight?: 1 | 2;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'hatchet', label: '**Hatchet**, iron *(hand, thrown, x piercing)*' },
  { id: 'spear', label: '**Spear**, iron *(close, thrown, x piercing)*' },
  { id: 'bow', label: '**Bow & iron arrows** *(near, x piercing, ○ low ammo, ○ all out)*' },
  { id: 'shield', label: '**Shield** *(+1 armor, +1 Readiness on a 7+ to Defend)*', weight: 2 },
  { id: 'hides', label: '**Thick hides** *(1 armor, warm)*', weight: 2 },
  { id: 'cloak', label: '**Cloak** *(warm)*' },
  { id: 'supplies', label: '**Supplies** *(4+Prosperity uses per crew member)*' },
];

const INDIVIDUALS_COUNT = 6;
const CUSTOM_ITEM_INDICES = [0, 1, 2, 3];

const normalizeCustomItems = (raw: { checked: boolean; text: string }[] | undefined): { checked: boolean; text: string }[] =>
  Array.from({ length: 8 }, (_, i) => raw?.[i] ?? { checked: false, text: '' });


interface InventoryRowProps {
  item: InventoryItem;
  checked: boolean;
  onCheckedChange: (id: string, checked: boolean) => void;
}

const InventoryRow = memo(({ item, checked, onCheckedChange }: InventoryRowProps) => {
  const handleChecked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(item.id, e.target.checked), [item.id, onCheckedChange]);
  return (
    <div className={styles.inventoryItem}>
      <Checkbox
        variant="provision"
        weight={item.weight ?? 1}
        checked={checked}
        onChange={handleChecked}
        label={<span className={styles.inventoryLabel}>{parseInlineMarkdown(item.label)}</span>}
      />
    </div>
  );
});

interface IndividualSlotProps {
  index: number;
  name: string;
  tag: string;
  traits: string;
  onChange: (index: number, field: 'name' | 'tag' | 'traits', val: string) => void;
  onBlur: () => void;
}

const IndividualSlot = memo(({ index, name, tag, traits, onChange, onBlur }: IndividualSlotProps) => {
  const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'name', e.target.value), [index, onChange]);
  const handleTag = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'tag', e.target.value), [index, onChange]);
  const handleTraits = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(index, 'traits', e.target.value), [index, onChange]);

  return (
    <div className={styles.individual}>
      <div className={styles.individualFields}>
        <input
          className={styles.individualInput}
          type="text"
          value={name}
          placeholder="Name"
          aria-label={`Individual ${index + 1} name`}
          onChange={handleName}
          onBlur={onBlur}
        />
        <input
          className={styles.individualInput}
          type="text"
          value={tag}
          placeholder="Tag"
          aria-label={`Individual ${index + 1} tag`}
          onChange={handleTag}
          onBlur={onBlur}
        />
      </div>
      <textarea
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
});

interface SuppliesMemberDotsProps {
  memberIndex: number;
  total: number;
  checked: number;
  onChange: (memberIndex: number, n: number) => void;
}

const SuppliesMemberDots = memo(({ memberIndex, total, checked, onChange }: SuppliesMemberDotsProps) => {
  const handleChange = useCallback((n: number) => onChange(memberIndex, n), [memberIndex, onChange]);
  return <UseDots total={total} checked={checked} onChange={handleChange} />;
});

interface CustomInventoryItemProps {
  slotIndex: number;
  weight: 1 | 2;
  checked: boolean;
  text: string;
  onCheckedChange: (slotIndex: number, checked: boolean) => void;
  onTextChange: (slotIndex: number, text: string) => void;
  onBlur: () => void;
}

const CustomInventoryItem = memo(({ slotIndex, weight, checked, text, onCheckedChange, onTextChange, onBlur }: CustomInventoryItemProps) => {
  const handleChecked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(slotIndex, e.target.checked), [slotIndex, onCheckedChange]);
  const handleText = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onTextChange(slotIndex, e.target.value), [slotIndex, onTextChange]);
  return (
    <div className={styles.inventoryCustomItem}>
      <Checkbox variant="provision" weight={weight} checked={checked} onChange={handleChecked} aria-label={`Custom inventory item ${slotIndex + 1}`} />
      <input
        className={styles.inventoryCustomInput}
        type="text"
        value={text}
        placeholder="Item…"
        aria-label={`Custom inventory item ${slotIndex + 1} name`}
        onChange={handleText}
        onBlur={onBlur}
      />
    </div>
  );
});


type Individual = { name: string; tag: string; traits: string };

const EMPTY_INDIVIDUAL: Individual = { name: '', tag: '', traits: '' };

const defaultIndividuals = (): Individual[] =>
  Array.from({ length: INDIVIDUALS_COUNT }, () => ({ ...EMPTY_INDIVIDUAL }));

const parseIndividuals = (raw: unknown): Individual[] => {
  if (!Array.isArray(raw)) return defaultIndividuals();
  const filled = (raw as Individual[]).map((s) => ({
    name: s?.name ?? '',
    tag: s?.tag ?? '',
    traits: s?.traits ?? '',
  }));
  while (filled.length < INDIVIDUALS_COUNT) filled.push({ ...EMPTY_INDIVIDUAL });
  return filled.slice(0, INDIVIDUALS_COUNT);
};


interface MarshalCrewProps {
  data: CharacterData | undefined;
  prosperity: number;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const MarshalCrew = ({ data, prosperity, onSave }: MarshalCrewProps) => {
  const features = resolvePlaybookFeatures(data);

  const [hp, setHp] = useState<string>(() => features.crewHp ?? String(CREW_HP_MAX));
  const [armor, setArmor] = useState<string>(() => features.crewArmor ?? '0');
  const [tags, setTags] = useState<Record<string, boolean>>(() => ({ group: true, ...(features.crewTags ?? {}) }));
  const [tagsCustom, setTagsCustom] = useState<string[]>(() => (features.crewTagsCustom ?? ['', '']).slice(0, 2));
  const [instinct, setInstinct] = useState<string>(() => features.crewInstinct ?? '');
  const [instinctCustom, setInstinctCustom] = useState<string>(() => features.crewInstinctCustom ?? '');
  const [cost, setCost] = useState<string>(() => features.crewCost ?? '');
  const [costCustom, setCostCustom] = useState<string>(() => features.crewCostCustom ?? '');
  const [loyalty, setLoyalty] = useState<number>(() => features.crewLoyalty ?? 0);
  const [inventoryChecked, setInventoryChecked] = useState<Record<string, boolean>>(() => features.crewInventoryChecked ?? {});
  const [customItems, setCustomItems] = useState<{ checked: boolean; text: string }[]>(() =>
    normalizeCustomItems(features.crewCustomItems)
  );
  const [suppliesUses, setSuppliesUses] = useState<number[]>(() => features.crewSuppliesUses ?? Array(CREW_SIZE).fill(0));
  const [individuals, setIndividuals] = useState<Individual[]>(() => parseIndividuals(features.crewIndividuals));

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.crewHp !== undefined) setHp(f.crewHp);
    if (f.crewArmor !== undefined) setArmor(f.crewArmor);
    if (f.crewTags !== undefined) setTags({ group: true, ...f.crewTags });
    if (f.crewTagsCustom !== undefined) setTagsCustom(f.crewTagsCustom.slice(0, 2));
    if (f.crewInstinct !== undefined) setInstinct(f.crewInstinct);
    if (f.crewInstinctCustom !== undefined) setInstinctCustom(f.crewInstinctCustom);
    if (f.crewCost !== undefined) setCost(f.crewCost);
    if (f.crewCostCustom !== undefined) setCostCustom(f.crewCostCustom);
    if (f.crewLoyalty !== undefined) setLoyalty(f.crewLoyalty);
    if (f.crewInventoryChecked !== undefined) setInventoryChecked(f.crewInventoryChecked);
    if (f.crewCustomItems !== undefined) setCustomItems(normalizeCustomItems(f.crewCustomItems));
    if (f.crewSuppliesUses !== undefined) setSuppliesUses(f.crewSuppliesUses);
    if (f.crewIndividuals !== undefined) setIndividuals(parseIndividuals(f.crewIndividuals));
  }, [data]);

  const { saveDebounced, saveImmediate, flushDebounce, dataRef, onSaveRef } = useCrewSave(data, onSave);

  const handleHpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') { setHp(raw); saveDebounced({ crewHp: raw }); return; }
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      const val = String(Math.max(0, Math.min(n, CREW_HP_MAX)));
      setHp(val);
      saveDebounced({ crewHp: val });
    }
  }, [saveDebounced]);

  const handleHpBlur = useCallback(() => {
    setHp((prev) => { flushDebounce({ crewHp: prev }); return prev; });
  }, [flushDebounce]);

  const handleArmorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setArmor(val);
    saveDebounced({ crewArmor: val });
  }, [saveDebounced]);

  const handleArmorBlur = useCallback(() => {
    setArmor((prev) => { flushDebounce({ crewArmor: prev }); return prev; });
  }, [flushDebounce]);

  const handleTagChange = useCallback((id: string, checked: boolean) => {
    if (id === 'group') return;
    setTags((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ crewTags: next });
      return next;
    });
  }, [saveImmediate]);

  const handleTagCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const i = Number(e.currentTarget.dataset.index);
    const val = e.currentTarget.value;
    setTagsCustom((prev) => {
      const next = [...prev];
      next[i] = val;
      saveDebounced({ crewTagsCustom: next });
      return next;
    });
  }, [saveDebounced]);

  const handleTagCustomBlur = useCallback(() => {
    setTagsCustom((prev) => { flushDebounce({ crewTagsCustom: prev }); return prev; });
  }, [flushDebounce]);

  const handleInstinctChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInstinct(val);
    setInstinctCustom('');
    saveImmediate({ crewInstinct: val, crewInstinctCustom: '' });
  }, [saveImmediate]);

  const handleInstinctCustomFocus = useCallback(() => setInstinct('custom'), []);

  const handleInstinctCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInstinct('custom');
    setInstinctCustom(val);
    saveDebounced({ crewInstinct: 'custom', crewInstinctCustom: val });
  }, [saveDebounced]);

  const handleInstinctCustomBlur = useCallback(() => {
    setInstinctCustom((prev) => { flushDebounce({ crewInstinct: 'custom', crewInstinctCustom: prev }); return prev; });
  }, [flushDebounce]);

  const handleCostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCost(val);
    setCostCustom('');
    saveImmediate({ crewCost: val, crewCostCustom: '' });
  }, [saveImmediate]);

  const handleCostCustomFocus = useCallback(() => setCost('custom'), []);

  const handleCostCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCost('custom');
    setCostCustom(val);
    saveDebounced({ crewCost: 'custom', crewCostCustom: val });
  }, [saveDebounced]);

  const handleCostCustomBlur = useCallback(() => {
    setCostCustom((prev) => { flushDebounce({ crewCost: 'custom', crewCostCustom: prev }); return prev; });
  }, [flushDebounce]);

  const handleLoyaltyChange = useCallback((n: number) => {
    setLoyalty(n);
    saveImmediate({ crewLoyalty: n });
  }, [saveImmediate]);

  const handleInventoryCheckedChange = useCallback((id: string, val: boolean) => {
    setInventoryChecked((prev) => {
      const next = { ...prev, [id]: val };
      saveImmediate({ crewInventoryChecked: next });
      return next;
    });
  }, [saveImmediate]);

  const handleCustomItemChecked = useCallback((slotIndex: number, checked: boolean) => {
    setCustomItems((prev) => {
      const next = prev.map((item, i) => i === slotIndex ? { ...item, checked } : item);
      saveImmediate({ crewCustomItems: next });
      return next;
    });
  }, [saveImmediate]);

  const handleCustomItemText = useCallback((slotIndex: number, text: string) => {
    setCustomItems((prev) => {
      const next = prev.map((item, i) => i === slotIndex ? { ...item, text, checked: text.length > 0 } : item);
      saveDebounced({ crewCustomItems: next });
      return next;
    });
  }, [saveDebounced]);

  const handleCustomItemBlur = useCallback(() => {
    setCustomItems((prev) => { flushDebounce({ crewCustomItems: prev }); return prev; });
  }, [flushDebounce]);

  const handleSuppliesUsesChange = useCallback((memberIndex: number, n: number) => {
    setSuppliesUses((prev) => {
      const next = [...prev];
      next[memberIndex] = n;
      saveImmediate({ crewSuppliesUses: next });
      return next;
    });
  }, [saveImmediate]);

  const handleIndividualChange = useCallback((index: number, field: 'name' | 'tag' | 'traits', val: string) => {
    setIndividuals((prev) => {
      const next = prev.map((ind, i) => i === index ? { ...ind, [field]: val } : ind);
      saveDebounced({ crewIndividuals: next });
      return next;
    });
  }, [saveDebounced]);

  const handleIndividualBlur = useCallback(() => {
    setIndividuals((prev) => { flushDebounce({ crewIndividuals: prev }); return prev; });
  }, [flushDebounce]);

  const hasHeroesToTheLast = data?.typeMoves?.['marshal-heroes-to-the-last'] === true;
  const isExceptional = data?.typeMoveCheckList?.['marshal-heroes-to-the-last']?.['marshal-httl-exceptional'] === true;
  const selectedTagCount = Object.entries(tags).filter(([id, v]) => id !== 'group' && id !== 'exceptional' && v).length;
  const tagAtMax = selectedTagCount >= 2;
  const tagItemsWithDisable = TAG_ITEMS.map((item) => ({
    ...item,
    disabled: item.id === 'group' || (!tags[item.id] && tagAtMax),
  }));

  const handleWheel = useCallback((e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(), []);

  const handleExceptionalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    const prev = dataRef.current?.typeMoveCheckList ?? {};
    onSaveRef.current({ typeMoveCheckList: { ...prev, 'marshal-heroes-to-the-last': { ...prev['marshal-heroes-to-the-last'], 'marshal-httl-exceptional': val } } });
  }, []);

  return (
    <div className={styles.root}>
      <PlaybookSection title="Crew">
        <p className={styles.prose}>
          {parseInlineMarkdown('Your Crew is a half-dozen strong by default. Treat them as a follower with the *group* tag. All starting values here are subject to change in play.')}
        </p>
        <div className={styles.infoBoxes}>
          <div className={styles.infoBox}>
            <input
              className={styles.infoInput}
              type="number"
              value={hp}
              min={0}
              max={CREW_HP_MAX}
              aria-label="Crew HP"
              onChange={handleHpChange}
              onBlur={handleHpBlur}
              onWheel={handleWheel}
            />
            <span className={styles.infoLabel}>HP <span className={styles.statNote}>(starts at {CREW_HP_MAX})</span></span>
          </div>
          <div className={styles.infoBox}>
            <input
              className={styles.infoInput}
              type="number"
              value={armor}
              min={0}
              aria-label="Crew armor"
              onChange={handleArmorChange}
              onBlur={handleArmorBlur}
              onWheel={handleWheel}
            />
            <span className={styles.infoLabel}>Armor <span className={styles.statNote}>(starts at 0)</span></span>
          </div>
          <div className={styles.infoBox}>
            <span className={clsx(styles.infoInput, styles.infoStatic)}>{CREW_DAMAGE}</span>
            <span className={styles.infoLabel}>Damage <span className={styles.statNote}>(starts at d6)</span></span>
          </div>
        </div>
      </PlaybookSection>

      <PlaybookSection title="Tags">
        <p className={styles.prose}>
          {parseInlineMarkdown('Your crew starts with *group*, a tag granted by your background, plus 2 more of your choice.')}
        </p>
        <CheckboxGroup
          items={tagItemsWithDisable}
          checked={{ ...tags, group: true }}
          onChange={handleTagChange}
          columns="responsive-2-4-6"
        />
        <div className={styles.customTagsRow}>
          {tagsCustom.map((val, i) => (
            <input
              key={`custom-tag-${i}`}
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
            label={<>exceptional <span className={styles.statNote}>(requires Heroes to the Last)</span></>}
          />
        </div>
      </PlaybookSection>

      <div className={styles.columns}>
        <PlaybookSection title="Instinct" choose={1}>
          <div className={styles.radioList}>
            {INSTINCT_OPTIONS.map((opt) => (
              <label key={opt} className={styles.radioRow}>
                <input
                  type="radio"
                  className={styles.radioInput}
                  name="crew-instinct"
                  value={opt}
                  checked={instinct === opt}
                  onChange={handleInstinctChange}
                />
                <span className={styles.radioIndicator} />
                <span className={styles.radioLabel}>{opt}</span>
              </label>
            ))}
            <label className={styles.radioRow}>
              <input
                type="radio"
                className={styles.radioInput}
                name="crew-instinct"
                value="custom"
                checked={instinct === 'custom'}
                onChange={handleInstinctChange}
              />
              <span className={styles.radioIndicator} />
              <input
                type="text"
                className={styles.inlineTextInput}
                value={instinctCustom}
                placeholder="Custom instinct…"
                aria-label="Custom instinct"
                onFocus={handleInstinctCustomFocus}
                onChange={handleInstinctCustomChange}
                onBlur={handleInstinctCustomBlur}
              />
            </label>
          </div>
        </PlaybookSection>

        <PlaybookSection title="Cost" choose={1}>
          <div className={styles.loyaltyRow}>
            <span className={styles.loyaltyLabel}>Loyalty</span>
            <UseDots total={3} checked={loyalty} onChange={handleLoyaltyChange} />
          </div>
          <div className={styles.radioList}>
            {COST_OPTIONS.map((opt) => (
              <label key={opt} className={styles.radioRow}>
                <input
                  type="radio"
                  className={styles.radioInput}
                  name="crew-cost"
                  value={opt}
                  checked={cost === opt}
                  onChange={handleCostChange}
                />
                <span className={styles.radioIndicator} />
                <span className={styles.radioLabel}>{opt}</span>
              </label>
            ))}
            <label className={styles.radioRow}>
              <input
                type="radio"
                className={styles.radioInput}
                name="crew-cost"
                value="custom"
                checked={cost === 'custom'}
                onChange={handleCostChange}
              />
              <span className={styles.radioIndicator} />
              <input
                type="text"
                className={styles.inlineTextInput}
                value={costCustom}
                placeholder="Custom cost…"
                aria-label="Custom cost"
                onFocus={handleCostCustomFocus}
                onChange={handleCostCustomChange}
                onBlur={handleCostCustomBlur}
              />
            </label>
          </div>
        </PlaybookSection>
      </div>

      <PlaybookSection title="Inventory">
        <p className={styles.prose}>
          {parseInlineMarkdown('3 ◈ or fewer is a light load; 4-6 ◈ is a normal load; 7-9 ◈ is a heavy load.')}
        </p>
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
          {inventoryChecked['supplies'] && (
            <div className={styles.suppliesGrid}>
              {Array.from({ length: CREW_SIZE }, (_, i) => (
                <SuppliesMemberDots
                  key={`member-${i}`}
                  memberIndex={i}
                  total={4 + prosperity}
                  checked={suppliesUses[i] ?? 0}
                  onChange={handleSuppliesUsesChange}
                />
              ))}
            </div>
          )}
          <div className={styles.inventoryCustomColumns}>
            <div className={styles.inventoryCustomCol}>
              {CUSTOM_ITEM_INDICES.map((i) => (
                <CustomInventoryItem
                  key={`custom-single-${i}`}
                  slotIndex={i}
                  weight={1}
                  checked={customItems[i]?.checked ?? false}
                  text={customItems[i]?.text ?? ''}
                  onCheckedChange={handleCustomItemChecked}
                  onTextChange={handleCustomItemText}
                  onBlur={handleCustomItemBlur}
                />
              ))}
            </div>
            <div className={styles.inventoryCustomCol}>
              {CUSTOM_ITEM_INDICES.map((i) => (
                <CustomInventoryItem
                  key={`custom-double-${i}`}
                  slotIndex={i + 4}
                  weight={2}
                  checked={customItems[i + 4]?.checked ?? false}
                  text={customItems[i + 4]?.text ?? ''}
                  onCheckedChange={handleCustomItemChecked}
                  onTextChange={handleCustomItemText}
                  onBlur={handleCustomItemBlur}
                />
              ))}
            </div>
          </div>
        </div>
      </PlaybookSection>

      <PlaybookSection title="Individuals">
        <p className={styles.prose}>
          When one stands out, give them a name, a tag, and one or more traits.
        </p>
        <p className={styles.prose}>
          {parseInlineMarkdown('**Names:** Aled, Culhwich, Eira, Gerat, Glaw, Harri, Lowri, Mervyn, Nesta')}
        </p>
        <p className={styles.prose}>
          {parseInlineMarkdown('**Tags:** *animal-lover, big, bully, cynical, drunkard, eager, gambler, greedy, grumpy, gullible, heartthrob, honest, kind, lewd, little, naive, old, popular, proud, rookie, reckless, shameless, sharp-eyed, short-tempered*')}
        </p>
        <p className={styles.prose}>
          {parseInlineMarkdown("**Traits:** __'s kid/sibling/parent/cousin/__, bald, crush on __, grudge against __, hates __, idolizes __, jokes, messy, missing eye/finger/hand/__, misses their kids, nightmares, recently married, religious, scars, skinny, sharp-tongued, sings, snores, tells tall tales, too serious, troubles at home, whistles, whittler")}
        </p>
        <div className={styles.individualsGrid}>
          {individuals.map((ind, i) => (
            <IndividualSlot
              key={`individual-${i}`}
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
