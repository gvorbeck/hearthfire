import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { Checkbox, CheckboxGroup, Divider, Input, Radio, Text, UseDots } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData, PlaybookFeatures } from '@/types';
import styles from './RangerAnimalCompanion.module.css';

interface AnimalTypeConfig {
  id: string;
  label: string;
  examples: string;
  hp: string;
  armor: string;
  damage: string;
  pickCount: number;
  picks: { id: string; label: string; defaultChecked?: boolean }[];
}

const ANIMAL_TYPES: AnimalTypeConfig[] = [
  {
    id: 'bird',
    label: 'Bird',
    examples: 'falcon, eagle, owl, buzzard, magpie',
    hp: '5',
    armor: '1',
    damage: 'd4',
    pickCount: 4,
    picks: [
      { id: 'improved-damage', label: 'Improved damage die (d6)' },
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (agility)' },
      { id: 'attack-bird', label: '*attack-bird*' },
      { id: 'cautious', label: '*cautious*' },
      { id: 'clever', label: '*clever*' },
      { id: 'fast', label: '*fast*' },
      { id: 'mimic', label: '*mimic*' },
      { id: 'sharp-eyed', label: '*sharp-eyed*' },
      { id: 'stealthy', label: '*stealthy*' },
      { id: 'thieving', label: '*thieving*' },
      { id: 'tiny', label: '*tiny*', defaultChecked: true },
      { id: 'tireless', label: '*tireless*' },
    ],
  },
  {
    id: 'critter',
    label: 'Critter',
    examples: 'cat, fox, possum, raccoon, weasel',
    hp: '5',
    armor: '1',
    damage: 'd4',
    pickCount: 5,
    picks: [
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (agility)' },
      { id: 'agile', label: '*agile*' },
      { id: 'adorable', label: '*adorable*' },
      { id: 'annoying', label: '*annoying*' },
      { id: 'burrowing', label: '*burrowing*' },
      { id: 'cautious', label: '*cautious*' },
      { id: 'clever', label: '*clever*' },
      { id: 'climber', label: '*climber*' },
      { id: 'dextrous', label: '*dextrous*' },
      { id: 'keen-eared', label: '*keen-eared*' },
      { id: 'keen-eyed', label: '*keen-eyed*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'quick', label: '*quick*' },
      { id: 'stealthy', label: '*stealthy*' },
      { id: 'stinky', label: '*stinky*' },
      { id: 'tiny', label: '*tiny*', defaultChecked: true },
      { id: 'thieving', label: '*thieving*' },
    ],
  },
  {
    id: 'brute',
    label: 'Brute',
    examples: 'bear, boar, wolverine, aurochs, drake',
    hp: '12',
    armor: '0',
    damage: 'd6',
    pickCount: 3,
    picks: [
      { id: 'armor-plus1', label: '+1 armor (hide, scales, etc.)' },
      { id: 'damage-plus2-forceful', label: 'Damage is +2 damage, *forceful*' },
      { id: 'damage-messy-piercing', label: 'Damage is *messy*, 1 piercing' },
      { id: 'large', label: '*large* (+4 HP, +1 damage, +*close*)' },
      { id: 'easy-going', label: '*easy-going*' },
      { id: 'fearless', label: '*fearless*' },
      { id: 'gluttonous', label: '*gluttonous*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'powerful', label: '*powerful*' },
      { id: 'protective', label: '*protective*' },
      { id: 'quick', label: '*quick*' },
      { id: 'terrifying', label: '*terrifying*' },
      { id: 'tough', label: '*tough*', defaultChecked: true },
    ],
  },
  {
    id: 'predator',
    label: 'Predator',
    examples: 'hound, wolf, cougar, drake',
    hp: '8',
    armor: '0',
    damage: 'd8',
    pickCount: 3,
    picks: [
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (hide)' },
      { id: 'damage-messy-piercing', label: 'Damage is *messy*, 1 piercing' },
      { id: 'agile', label: '*agile*' },
      { id: 'climber', label: '*climber*' },
      { id: 'clever', label: '*clever*' },
      { id: 'enduring', label: '*enduring*' },
      { id: 'fast', label: '*fast*' },
      { id: 'fierce', label: '*fierce*', defaultChecked: true },
      { id: 'keen-eared', label: '*keen-eared*' },
      { id: 'keen-eyed', label: '*keen-eyed*' },
      { id: 'pack-hunter', label: '*pack-hunter*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'patient', label: '*patient*' },
      { id: 'powerful', label: '*powerful*' },
      { id: 'stealthy', label: '*stealthy*' },
      { id: 'terrifying', label: '*terrifying*' },
    ],
  },
  {
    id: 'steed',
    label: 'Steed',
    examples: 'horse, mule',
    hp: '12',
    armor: '0',
    damage: 'd6+1',
    pickCount: 4,
    picks: [
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (hide)' },
      { id: 'damage-plus2-forceful', label: 'Damage is +2 damage, *forceful*' },
      { id: 'aggressive', label: '*aggressive*' },
      { id: 'agile', label: '*agile*' },
      { id: 'beautiful', label: '*beautiful*' },
      { id: 'calm', label: '*calm*' },
      { id: 'clever', label: '*clever*' },
      { id: 'hardy', label: '*hardy*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'large', label: '*large*', defaultChecked: true },
      { id: 'powerful', label: '*powerful*' },
      { id: 'swift', label: '*swift*' },
    ],
  },
];

const INSTINCT_OPTIONS = [
  'To bully and threaten',
  'To fill its belly',
  'To get distracted',
  'To give chase',
  'To make mischief',
  'To startle and panic',
  'To run rampant',
];

const COST_OPTIONS = [
  'Play, grooming, training, affection',
  'Time off on its own, free to roam',
  'Cozy quarters, comfort, ample food',
];

const BEAST_OF_LEGEND_OPTIONS = [
  { id: 'bol-exceptional', label: 'They are *exceptional* (see Order Followers below)' },
  { id: 'bol-hp-armor', label: 'They get +4 HP and +1 armor' },
  { id: 'bol-unique', label: 'They develop a unique ability or trait' },
];

const BEAST_OF_LEGEND_ITEMS = BEAST_OF_LEGEND_OPTIONS.map((opt) => ({
  id: opt.id,
  label: <span>{parseInlineMarkdown(opt.label)}</span>,
}));

interface TypePicksSectionProps {
  typeId: string;
  typeConfig: AnimalTypeConfig;
  isSelected: boolean;
  picks: Record<string, boolean>;
  customText: string;
  customChecked: boolean;
  onPickChange: (id: string, checked: boolean) => void;
  onCustomChange: (typeId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomBlur: (typeId: string) => void;
  onCustomCheckedChange: (typeId: string, checked: boolean) => void;
}

const TypePicksSection = memo(({
  typeId,
  typeConfig,
  isSelected,
  picks,
  customText,
  customChecked,
  onPickChange,
  onCustomChange,
  onCustomBlur,
  onCustomCheckedChange,
}: TypePicksSectionProps) => {
  const selectedCount = typeConfig.picks.filter((p) => !p.defaultChecked && picks[`${typeConfig.id}:${p.id}`]).length;
  const atMax = selectedCount + (customChecked ? 1 : 0) >= typeConfig.pickCount;

  const items = useMemo(() => typeConfig.picks.map((p) => {
    const key = `${typeConfig.id}:${p.id}`;
    const isDefault = !!p.defaultChecked;
    return {
      id: key,
      label: <span>{parseInlineMarkdown(p.label)}</span>,
      disabled: !isSelected || isDefault || (!picks[key] && atMax),
    };
  }), [typeConfig, isSelected, picks, atMax]);

  const checkedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const p of typeConfig.picks) {
      const key = `${typeConfig.id}:${p.id}`;
      map[key] = p.defaultChecked ? true : (picks[key] ?? false);
    }
    return map;
  }, [typeConfig, picks]);

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCustomChange(typeId, e),
    [typeId, onCustomChange],
  );
  const handleCustomBlur = useCallback(() => onCustomBlur(typeId), [typeId, onCustomBlur]);
  const handleCustomCheckedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCustomCheckedChange(typeId, e.target.checked),
    [typeId, onCustomCheckedChange],
  );

  return (
    <div className={styles.typePicksSection}>
      <Text size="md" color="muted">
        {parseInlineMarkdown(`**HP** ${typeConfig.hp} **Armor** ${typeConfig.armor} (size) **Damage** ${typeConfig.damage} *(hand)*`)}
      </Text>
      <Text size="md" color="muted">
        Pick {typeConfig.pickCount} more:
      </Text>
      <CheckboxGroup
        items={items}
        checked={checkedMap}
        onChange={onPickChange}
        columns={2}
      />
      <div className={styles.typeCustomRow}>
        <Checkbox
          checked={customChecked}
          disabled={!isSelected || (!customChecked && atMax) || !customText}
          onChange={handleCustomCheckedChange}
          aria-label={`Mark custom pick for ${typeConfig.label} as active`}
        />
        <Input
          className={styles.typeCustomInput}
          type="text"
          value={customText}
          placeholder="Custom pick…"
          aria-label={`${typeConfig.label} custom pick`}
          disabled={!isSelected}
          onChange={handleCustomChange}
          onBlur={handleCustomBlur}
        />
      </div>
    </div>
  );
});

const useTrackedField = (
  initialValue: string,
  fieldKey: keyof PlaybookFeatures,
  saveDebounced: (patch: Partial<PlaybookFeatures>) => void,
  flushDebounce: (patch: Partial<PlaybookFeatures>) => void,
) => {
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(value);
  valueRef.current = value;
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    saveDebounced({ [fieldKey]: val });
  }, [fieldKey, saveDebounced]);
  const handleBlur = useCallback(() => {
    flushDebounce({ [fieldKey]: valueRef.current });
  }, [fieldKey, flushDebounce]);
  return { value, setValue, handleChange, handleBlur };
};

interface RangerAnimalCompanionProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RangerAnimalCompanion = ({ data, onSave }: RangerAnimalCompanionProps) => {
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const { value: hp, setValue: setHp, handleChange: handleHpChange, handleBlur: handleHpBlur } =
    useTrackedField(resolvePlaybookFeatures(data).animalHp ?? '', 'animalHp', saveDebounced, flushDebounce);
  const { value: armor, setValue: setArmor, handleChange: handleArmorChange, handleBlur: handleArmorBlur } =
    useTrackedField(resolvePlaybookFeatures(data).animalArmor ?? '', 'animalArmor', saveDebounced, flushDebounce);
  const { value: damage, setValue: setDamage, handleChange: handleDamageChange, handleBlur: handleDamageBlur } =
    useTrackedField(resolvePlaybookFeatures(data).animalDamage ?? '', 'animalDamage', saveDebounced, flushDebounce);
  const { value: name, handleChange: handleNameChange, handleBlur: handleNameBlur } =
    useTrackedField(resolvePlaybookFeatures(data).animalName ?? '', 'animalName', saveDebounced, flushDebounce);
  const { value: damageTags, handleChange: handleDamageTagsChange, handleBlur: handleDamageTagsBlur } =
    useTrackedField(resolvePlaybookFeatures(data).animalDamageTags ?? '', 'animalDamageTags', saveDebounced, flushDebounce);

  const [animalType, setAnimalType] = useState<string>(() => resolvePlaybookFeatures(data).animalType ?? '');
  const [typePicks, setTypePicks] = useState<Record<string, boolean>>(() => resolvePlaybookFeatures(data).animalTypePicks ?? {});
  const [typeCustom, setTypeCustom] = useState<Record<string, string>>(() => resolvePlaybookFeatures(data).animalTypeCustom ?? {});
  const [typeCustomChecked, setTypeCustomChecked] = useState<Record<string, boolean>>(() => resolvePlaybookFeatures(data).animalTypeCustomChecked ?? {});
  const [instinct, setInstinct] = useState<string>(() => resolvePlaybookFeatures(data).animalInstinct ?? '');
  const [instinctCustom, setInstinctCustom] = useState<string>(() => resolvePlaybookFeatures(data).animalInstinctCustom ?? '');
  const [cost, setCost] = useState<string>(() => resolvePlaybookFeatures(data).animalCost ?? '');
  const [costCustom, setCostCustom] = useState<string>(() => resolvePlaybookFeatures(data).animalCostCustom ?? '');
  const typeCustomRef = useRef(typeCustom);
  typeCustomRef.current = typeCustom;
  const instinctCustomRef = useRef(instinctCustom);
  instinctCustomRef.current = instinctCustom;
  const costCustomRef = useRef(costCustom);
  costCustomRef.current = costCustom;
  const [loyalty, setLoyalty] = useState<number>(() => resolvePlaybookFeatures(data).animalLoyalty ?? 0);
  const [beastOfLegend, setBeastOfLegend] = useState<Record<string, boolean>>(() => resolvePlaybookFeatures(data).animalBeastOfLegend ?? {});
  const [typeCollapsed, setTypeCollapsed] = useState(false);
  const hasInitializedTypeCollapse = useRef(false);
  const [instinctCollapsed, setInstinctCollapsed] = useState(false);
  const hasInitializedInstinctCollapse = useRef(false);
  const [costCollapsed, setCostCollapsed] = useState(false);
  const hasInitializedCostCollapse = useRef(false);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.animalType !== undefined) setAnimalType(f.animalType);
    if (f.animalTypePicks !== undefined) setTypePicks(f.animalTypePicks);
    if (f.animalTypeCustomChecked !== undefined) setTypeCustomChecked(f.animalTypeCustomChecked);
    if (f.animalInstinct !== undefined) setInstinct(f.animalInstinct);
    if (f.animalCost !== undefined) setCost(f.animalCost);
    if (f.animalLoyalty !== undefined) setLoyalty(f.animalLoyalty);
    if (f.animalBeastOfLegend !== undefined) setBeastOfLegend(f.animalBeastOfLegend);
  }, [data]);

  useEffect(() => {
    if (animalType && !hasInitializedTypeCollapse.current) {
      hasInitializedTypeCollapse.current = true;
      setTypeCollapsed(true);
    }
  }, [animalType]);

  useEffect(() => {
    if (instinct && !hasInitializedInstinctCollapse.current) {
      hasInitializedInstinctCollapse.current = true;
      setInstinctCollapsed(true);
    }
  }, [instinct]);

  useEffect(() => {
    if (cost && !hasInitializedCostCollapse.current) {
      hasInitializedCostCollapse.current = true;
      setCostCollapsed(true);
    }
  }, [cost]);

  const handleToggleTypeCollapse = useCallback(() => setTypeCollapsed((v) => !v), []);
  const handleToggleInstinctCollapse = useCallback(() => setInstinctCollapsed((v) => !v), []);
  const handleToggleCostCollapse = useCallback(() => setCostCollapsed((v) => !v), []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(), []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const typeConfig = ANIMAL_TYPES.find((t) => t.id === val);
    setAnimalType(val);
    if (typeConfig) {
      setHp(typeConfig.hp);
      setArmor(typeConfig.armor);
      setDamage(typeConfig.damage);
      saveImmediate({ animalType: val, animalHp: typeConfig.hp, animalArmor: typeConfig.armor, animalDamage: typeConfig.damage });
    } else {
      saveImmediate({ animalType: val });
    }
  }, [saveImmediate, setHp, setArmor, setDamage]);

  const handleTypePickChange = useCallback((id: string, checked: boolean) => {
    setTypePicks((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ animalTypePicks: next });
      return next;
    });
  }, [saveImmediate]);

  const handleTypeCustomChange = useCallback((typeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypeCustom((prev) => {
      const next = { ...prev, [typeId]: val };
      saveDebounced({ animalTypeCustom: next });
      return next;
    });
  }, [saveDebounced]);

  const handleTypeCustomBlur = useCallback((_typeId: string) => {
    flushDebounce({ animalTypeCustom: typeCustomRef.current });
  }, [flushDebounce]);

  const handleTypeCustomCheckedChange = useCallback((typeId: string, checked: boolean) => {
    setTypeCustomChecked((prev) => {
      const next = { ...prev, [typeId]: checked };
      saveImmediate({ animalTypeCustomChecked: next });
      return next;
    });
  }, [saveImmediate]);

  const handleInstinctChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInstinct(val);
    setInstinctCustom('');
    saveImmediate({ animalInstinct: val, animalInstinctCustom: '' });
  }, [saveImmediate]);

  const handleInstinctCustomFocus = useCallback(() => setInstinct('custom'), []);

  const handleInstinctCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInstinct('custom');
    setInstinctCustom(val);
    saveDebounced({ animalInstinct: 'custom', animalInstinctCustom: val });
  }, [saveDebounced]);

  const handleInstinctCustomBlur = useCallback(() => {
    flushDebounce({ animalInstinct: 'custom', animalInstinctCustom: instinctCustomRef.current });
  }, [flushDebounce]);

  const handleCostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCost(val);
    setCostCustom('');
    saveImmediate({ animalCost: val, animalCostCustom: '' });
  }, [saveImmediate]);

  const handleCostCustomFocus = useCallback(() => setCost('custom'), []);

  const handleCostCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCost('custom');
    setCostCustom(val);
    saveDebounced({ animalCost: 'custom', animalCostCustom: val });
  }, [saveDebounced]);

  const handleCostCustomBlur = useCallback(() => {
    flushDebounce({ animalCost: 'custom', animalCostCustom: costCustomRef.current });
  }, [flushDebounce]);

  const handleLoyaltyChange = useCallback((n: number) => {
    setLoyalty(n);
    saveImmediate({ animalLoyalty: n });
  }, [saveImmediate]);

  const handleBeastOfLegendChange = useCallback((id: string, checked: boolean) => {
    setBeastOfLegend((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ animalBeastOfLegend: next });
      return next;
    });
  }, [saveImmediate]);

  const selectedTypeConfig = ANIMAL_TYPES.find((t) => t.id === animalType);

  return (
    <div className={styles.root}>
      <PlaybookSection title="Stats">
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          {parseInlineMarkdown('You are accompanied by a beast, with whom you have bonded deeply and communicate without words. Treat it as a follower.')}
        </Text>
        <div className={styles.headerRow}>
          <div className={styles.statsRow}>
            <div className={styles.infoBox}>
              <input
                className={styles.infoInput}
                type="number"
                value={hp}
                min={0}
                aria-label="Animal Companion HP"
                onChange={handleHpChange}
                onBlur={handleHpBlur}
                onWheel={handleWheel}
              />
              <span className={styles.infoLabel}>HP <span className={styles.statNote}>Max [{selectedTypeConfig?.hp ?? ' '}]</span></span>
            </div>
            <div className={styles.infoBox}>
              <input
                className={styles.infoInput}
                type="number"
                value={armor}
                min={0}
                aria-label="Animal Companion armor"
                onChange={handleArmorChange}
                onBlur={handleArmorBlur}
                onWheel={handleWheel}
              />
              <span className={styles.infoLabel}>Armor <span className={styles.statNote}>See Type</span></span>
            </div>
            <div className={styles.infoBox}>
              <input
                className={styles.infoInput}
                type="text"
                value={damage}
                placeholder="—"
                aria-label="Animal Companion damage"
                onChange={handleDamageChange}
                onBlur={handleDamageBlur}
              />
              <span className={styles.infoLabel}>Damage <span className={styles.statNote}>See Type</span></span>
            </div>
          </div>
          <div className={styles.nameBlock}>
            <Input
              label="Name"
              className={styles.nameInput}
              type="text"
              value={name}
              placeholder="…"
              onChange={handleNameChange}
              onBlur={handleNameBlur}
            />
            <Input
              label="Damage tags"
              className={styles.tagsInput}
              type="text"
              value={damageTags}
              placeholder="…"
              onChange={handleDamageTagsChange}
              onBlur={handleDamageTagsBlur}
            />
          </div>
        </div>
      </PlaybookSection>

      <PlaybookSection
        title="Type"
        choose={1}
        warn={!animalType}
        collapsible={!!animalType}
        isCollapsed={typeCollapsed}
        onToggleCollapse={handleToggleTypeCollapse}
      >
        <div className={styles.typeList}>
          {(typeCollapsed ? ANIMAL_TYPES.filter((t) => t.id === animalType) : ANIMAL_TYPES).map((typeConfig) => {
            const isSelected = animalType === typeConfig.id;
            const globalIndex = ANIMAL_TYPES.indexOf(typeConfig);
            return (
              <div key={typeConfig.id} className={styles.typeEntry}>
                {!typeCollapsed && globalIndex > 0 && <Divider />}
                <Radio
                  className={styles.typeRow}
                  name="animal-type"
                  value={typeConfig.id}
                  checked={isSelected}
                  onChange={handleTypeChange}
                  label={
                    <span className={styles.typeLabel}>
                      <strong>{typeConfig.label}</strong>
                      <span className={styles.typeExamples}> ({typeConfig.examples}, etc.)</span>
                    </span>
                  }
                />
                <TypePicksSection
                  typeId={typeConfig.id}
                  typeConfig={typeConfig}
                  isSelected={isSelected}
                  picks={typePicks}
                  customText={typeCustom[typeConfig.id] ?? ''}
                  customChecked={typeCustomChecked[typeConfig.id] ?? false}
                  onPickChange={handleTypePickChange}
                  onCustomChange={handleTypeCustomChange}
                  onCustomBlur={handleTypeCustomBlur}
                  onCustomCheckedChange={handleTypeCustomCheckedChange}
                />
              </div>
            );
          })}
        </div>
      </PlaybookSection>

      <div className={styles.columns}>
        <PlaybookSection
          title="Instinct"
          choose={1}
          warn={!instinct}
          collapsible={!!instinct}
          isCollapsed={instinctCollapsed}
          onToggleCollapse={handleToggleInstinctCollapse}
        >
          <div className={styles.radioList}>
            {INSTINCT_OPTIONS.map((opt) => (
              <Radio
                key={opt}
                className={styles.radioRow}
                name="animal-instinct"
                value={opt}
                checked={instinct === opt}
                onChange={handleInstinctChange}
                label={<Text as="span" size="md" color="muted">{opt}</Text>}
              />
            ))}
            <Radio
              className={styles.radioRow}
              name="animal-instinct"
              value="custom"
              checked={instinct === 'custom'}
              onChange={handleInstinctChange}
              label={
                <Input
                  className={styles.inlineTextInput}
                  type="text"
                  value={instinctCustom}
                  placeholder="Custom instinct…"
                  aria-label="Custom instinct"
                  onFocus={handleInstinctCustomFocus}
                  onChange={handleInstinctCustomChange}
                  onBlur={handleInstinctCustomBlur}
                />
              }
            />
          </div>
        </PlaybookSection>

        <PlaybookSection
          title="Cost"
          choose={1}
          warn={!cost}
          collapsible={!!cost}
          isCollapsed={costCollapsed}
          onToggleCollapse={handleToggleCostCollapse}
        >
          <div className={styles.loyaltyRow}>
            <Text as="span" size="md" color="muted" className={styles.loyaltyLabel}>Loyalty</Text>
            <UseDots total={3} checked={loyalty} onChange={handleLoyaltyChange} />
          </div>
          <div className={styles.radioList}>
            {COST_OPTIONS.map((opt) => (
              <Radio
                key={opt}
                className={styles.radioRow}
                name="animal-cost"
                value={opt}
                checked={cost === opt}
                onChange={handleCostChange}
                label={<Text as="span" size="md" color="muted">{opt}</Text>}
              />
            ))}
            <Radio
              className={styles.radioRow}
              name="animal-cost"
              value="custom"
              checked={cost === 'custom'}
              onChange={handleCostChange}
              label={
                <Input
                  className={styles.inlineTextInput}
                  type="text"
                  value={costCustom}
                  placeholder="Custom cost…"
                  aria-label="Custom cost"
                  onFocus={handleCostCustomFocus}
                  onChange={handleCostCustomChange}
                  onBlur={handleCostCustomBlur}
                />
              }
            />
          </div>
        </PlaybookSection>
      </div>

      <PlaybookSection title="Beast of Legend">
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          Each time you take Beast of Legend, pick 1:
        </Text>
        <CheckboxGroup
          items={BEAST_OF_LEGEND_ITEMS}
          checked={beastOfLegend}
          onChange={handleBeastOfLegendChange}
        />
      </PlaybookSection>
    </div>
  );
};
