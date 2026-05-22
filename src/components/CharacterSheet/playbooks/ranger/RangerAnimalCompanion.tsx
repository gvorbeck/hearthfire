import { useState, useEffect, useCallback, memo } from 'react';
import { CheckboxGroup, UseDots } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../marshal/useCrewSave';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
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
  label: parseInlineMarkdown(opt.label),
}));

interface TypePicksSectionProps {
  typeConfig: AnimalTypeConfig;
  picks: Record<string, boolean>;
  customText: string;
  onPickChange: (id: string, checked: boolean) => void;
  onCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomBlur: () => void;
}

const TypePicksSection = memo(({ typeConfig, picks, customText, onPickChange, onCustomBlur, onCustomChange }: TypePicksSectionProps) => {
  const selectedCount = typeConfig.picks.filter((p) => !p.defaultChecked && picks[`${typeConfig.id}:${p.id}`]).length;
  const atMax = selectedCount >= typeConfig.pickCount;

  const items = typeConfig.picks.map((p) => {
    const key = `${typeConfig.id}:${p.id}`;
    const isDefault = !!p.defaultChecked;
    return {
      id: key,
      label: parseInlineMarkdown(p.label),
      disabled: isDefault || (!picks[key] && atMax),
    };
  });

  const checkedMap: Record<string, boolean> = {};
  for (const p of typeConfig.picks) {
    const key = `${typeConfig.id}:${p.id}`;
    checkedMap[key] = p.defaultChecked ? true : (picks[key] ?? false);
  }

  return (
    <div className={styles.typePicksSection}>
      <p className={styles.typePicksNote}>
        {parseInlineMarkdown(`**HP** ${typeConfig.hp} **Armor** ${typeConfig.armor} (size) **Damage** ${typeConfig.damage} *(hand)*`)}
      </p>
      <p className={styles.typePicksNote}>
        Pick {typeConfig.pickCount} more:
      </p>
      <CheckboxGroup
        items={items}
        checked={checkedMap}
        onChange={onPickChange}
        columns="responsive-2-4-6"
      />
      <div className={styles.typeCustomRow}>
        <input
          className={styles.typeCustomInput}
          type="text"
          value={customText}
          placeholder="Custom pick…"
          aria-label={`${typeConfig.label} custom pick`}
          onChange={onCustomChange}
          onBlur={onCustomBlur}
        />
      </div>
    </div>
  );
});

interface RangerAnimalCompanionProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RangerAnimalCompanion = ({ data, onSave }: RangerAnimalCompanionProps) => {
  const features = resolvePlaybookFeatures(data);

  const [hp, setHp] = useState<string>(() => features.animalHp ?? '');
  const [armor, setArmor] = useState<string>(() => features.animalArmor ?? '');
  const [damage, setDamage] = useState<string>(() => features.animalDamage ?? '');
  const [name, setName] = useState<string>(() => features.animalName ?? '');
  const [damageTags, setDamageTags] = useState<string>(() => features.animalDamageTags ?? '');
  const [animalType, setAnimalType] = useState<string>(() => features.animalType ?? '');
  const [typePicks, setTypePicks] = useState<Record<string, boolean>>(() => features.animalTypePicks ?? {});
  const [typeCustom, setTypeCustom] = useState<string>(() => features.animalTypeCustom ?? '');
  const [instinct, setInstinct] = useState<string>(() => features.animalInstinct ?? '');
  const [instinctCustom, setInstinctCustom] = useState<string>(() => features.animalInstinctCustom ?? '');
  const [cost, setCost] = useState<string>(() => features.animalCost ?? '');
  const [costCustom, setCostCustom] = useState<string>(() => features.animalCostCustom ?? '');
  const [loyalty, setLoyalty] = useState<number>(() => features.animalLoyalty ?? 0);
  const [beastOfLegend, setBeastOfLegend] = useState<Record<string, boolean>>(() => features.animalBeastOfLegend ?? {});

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.animalHp !== undefined) setHp(f.animalHp);
    if (f.animalArmor !== undefined) setArmor(f.animalArmor);
    if (f.animalDamage !== undefined) setDamage(f.animalDamage);
    if (f.animalName !== undefined) setName(f.animalName);
    if (f.animalDamageTags !== undefined) setDamageTags(f.animalDamageTags);
    if (f.animalType !== undefined) setAnimalType(f.animalType);
    if (f.animalTypePicks !== undefined) setTypePicks(f.animalTypePicks);
    if (f.animalTypeCustom !== undefined) setTypeCustom(f.animalTypeCustom);
    if (f.animalInstinct !== undefined) setInstinct(f.animalInstinct);
    if (f.animalInstinctCustom !== undefined) setInstinctCustom(f.animalInstinctCustom);
    if (f.animalCost !== undefined) setCost(f.animalCost);
    if (f.animalCostCustom !== undefined) setCostCustom(f.animalCostCustom);
    if (f.animalLoyalty !== undefined) setLoyalty(f.animalLoyalty);
    if (f.animalBeastOfLegend !== undefined) setBeastOfLegend(f.animalBeastOfLegend);
  }, [data]);

  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(), []);

  const handleHpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHp(val);
    saveDebounced({ animalHp: val });
  }, [saveDebounced]);

  const handleHpBlur = useCallback(() => {
    setHp((prev) => { flushDebounce({ animalHp: prev }); return prev; });
  }, [flushDebounce]);

  const handleArmorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setArmor(val);
    saveDebounced({ animalArmor: val });
  }, [saveDebounced]);

  const handleArmorBlur = useCallback(() => {
    setArmor((prev) => { flushDebounce({ animalArmor: prev }); return prev; });
  }, [flushDebounce]);

  const handleDamageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDamage(val);
    saveDebounced({ animalDamage: val });
  }, [saveDebounced]);

  const handleDamageBlur = useCallback(() => {
    setDamage((prev) => { flushDebounce({ animalDamage: prev }); return prev; });
  }, [flushDebounce]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    saveDebounced({ animalName: val });
  }, [saveDebounced]);

  const handleNameBlur = useCallback(() => {
    setName((prev) => { flushDebounce({ animalName: prev }); return prev; });
  }, [flushDebounce]);

  const handleDamageTagsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDamageTags(val);
    saveDebounced({ animalDamageTags: val });
  }, [saveDebounced]);

  const handleDamageTagsBlur = useCallback(() => {
    setDamageTags((prev) => { flushDebounce({ animalDamageTags: prev }); return prev; });
  }, [flushDebounce]);

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
  }, [saveImmediate]);

  const handleTypePickChange = useCallback((id: string, checked: boolean) => {
    setTypePicks((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ animalTypePicks: next });
      return next;
    });
  }, [saveImmediate]);

  const handleTypeCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypeCustom(val);
    saveDebounced({ animalTypeCustom: val });
  }, [saveDebounced]);

  const handleTypeCustomBlur = useCallback(() => {
    setTypeCustom((prev) => { flushDebounce({ animalTypeCustom: prev }); return prev; });
  }, [flushDebounce]);

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
    setInstinctCustom((prev) => { flushDebounce({ animalInstinct: 'custom', animalInstinctCustom: prev }); return prev; });
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
    setCostCustom((prev) => { flushDebounce({ animalCost: 'custom', animalCostCustom: prev }); return prev; });
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
        <p className={styles.prose}>
          {parseInlineMarkdown('You are accompanied by a beast, with whom you have bonded deeply and communicate without words. Treat it as a follower.')}
        </p>
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
            <label className={styles.fieldLabel}>Name</label>
            <input
              className={styles.nameInput}
              type="text"
              value={name}
              placeholder="…"
              aria-label="Animal Companion name"
              onChange={handleNameChange}
              onBlur={handleNameBlur}
            />
            <label className={styles.fieldLabel}>Damage tags</label>
            <input
              className={styles.tagsInput}
              type="text"
              value={damageTags}
              placeholder="…"
              aria-label="Animal Companion damage tags"
              onChange={handleDamageTagsChange}
              onBlur={handleDamageTagsBlur}
            />
          </div>
        </div>
      </PlaybookSection>

      <PlaybookSection title="Type" choose={1} warn={!animalType}>
        <div className={styles.typeList}>
          {ANIMAL_TYPES.map((typeConfig) => {
            const isSelected = animalType === typeConfig.id;
            return (
              <div key={typeConfig.id} className={styles.typeEntry}>
                <label className={styles.typeRow}>
                  <input
                    type="radio"
                    className={styles.radioInput}
                    name="animal-type"
                    value={typeConfig.id}
                    checked={isSelected}
                    onChange={handleTypeChange}
                  />
                  <span className={styles.radioIndicator} />
                  <span className={styles.typeLabel}>
                    <strong>{typeConfig.label}</strong>
                    <span className={styles.typeExamples}> ({typeConfig.examples}, etc.)</span>
                  </span>
                </label>
                <TypePicksSection
                  typeConfig={typeConfig}
                  picks={typePicks}
                  customText={typeCustom}
                  onPickChange={handleTypePickChange}
                  onCustomChange={handleTypeCustomChange}
                  onCustomBlur={handleTypeCustomBlur}
                />
              </div>
            );
          })}
        </div>
      </PlaybookSection>

      <div className={styles.columns}>
        <PlaybookSection title="Instinct" choose={1} warn={!instinct}>
          <div className={styles.radioList}>
            {INSTINCT_OPTIONS.map((opt) => (
              <label key={opt} className={styles.radioRow}>
                <input
                  type="radio"
                  className={styles.radioInput}
                  name="animal-instinct"
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
                name="animal-instinct"
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

        <PlaybookSection title="Cost" choose={1} warn={!cost}>
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
                  name="animal-cost"
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
                name="animal-cost"
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

      <PlaybookSection title="Beast of Legend">
        <p className={styles.prose}>
          Each time you take Beast of Legend, pick 1:
        </p>
        <CheckboxGroup
          items={BEAST_OF_LEGEND_ITEMS}
          checked={beastOfLegend}
          onChange={handleBeastOfLegendChange}
        />
      </PlaybookSection>
    </div>
  );
};
