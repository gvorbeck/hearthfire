import { useState, useEffect, useCallback, useRef } from 'react';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { useTrackedField } from '../shared/useTrackedField';
import { ANIMAL_TYPES, AnimalType } from './AnimalType';
import { AnimalStats } from './AnimalStats';
import { RadioSelect } from '../../sections/RadioSelect';
import { BeastOfLegend } from './BeastOfLegend';
import { Text, UseDots } from '@/components/primitives';
import type { CharacterData } from '@/types';
import type { RadioOption } from '@/lib/radioOptions';
import styles from './RangerAnimalCompanion.module.css';

const ANIMAL_INSTINCT_OPTIONS: RadioOption[] = [
  { value: 'To bully and threaten', label: 'To bully and threaten', description: '' },
  { value: 'To fill its belly', label: 'To fill its belly', description: '' },
  { value: 'To get distracted', label: 'To get distracted', description: '' },
  { value: 'To give chase', label: 'To give chase', description: '' },
  { value: 'To make mischief', label: 'To make mischief', description: '' },
  { value: 'To startle and panic', label: 'To startle and panic', description: '' },
  { value: 'To run rampant', label: 'To run rampant', description: '' },
];

const ANIMAL_COST_OPTIONS: RadioOption[] = [
  { value: 'Play, grooming, training, affection', label: 'Play, grooming, training, affection', description: '' },
  { value: 'Time off on its own, free to roam', label: 'Time off on its own, free to roam', description: '' },
  { value: 'Cozy quarters, comfort, ample food', label: 'Cozy quarters, comfort, ample food', description: '' },
];

// Old Firestore records stored 'custom'; RadioSelect requires '__custom__'.
const toInstinctSentinel = (v: string | undefined) => v === 'custom' ? '__custom__' : (v ?? '');

interface RangerAnimalCompanionProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RangerAnimalCompanion = ({ data, onSave }: RangerAnimalCompanionProps) => {
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const initialFeatures = resolvePlaybookFeatures(data);

  const { value: hp, setValue: setHp, handleChange: handleHpChange, handleBlur: handleHpBlur } =
    useTrackedField(initialFeatures.animalHp ?? '', 'animalHp', saveDebounced, flushDebounce);
  const { value: armor, setValue: setArmor, handleChange: handleArmorChange, handleBlur: handleArmorBlur } =
    useTrackedField(initialFeatures.animalArmor ?? '', 'animalArmor', saveDebounced, flushDebounce);
  const { value: damage, setValue: setDamage, handleChange: handleDamageChange, handleBlur: handleDamageBlur } =
    useTrackedField(initialFeatures.animalDamage ?? '', 'animalDamage', saveDebounced, flushDebounce);
  const { value: name, setValue: setName, handleChange: handleNameChange, handleBlur: handleNameBlur } =
    useTrackedField(initialFeatures.animalName ?? '', 'animalName', saveDebounced, flushDebounce);
  const { value: damageTags, setValue: setDamageTags, handleChange: handleDamageTagsChange, handleBlur: handleDamageTagsBlur } =
    useTrackedField(initialFeatures.animalDamageTags ?? '', 'animalDamageTags', saveDebounced, flushDebounce);

  const [animalType, setAnimalType] = useState<string>(initialFeatures.animalType ?? '');
  const [typePicks, setTypePicks] = useState<Record<string, boolean>>(initialFeatures.animalTypePicks ?? {});
  const [typeCustom, setTypeCustom] = useState<Record<string, string>>(initialFeatures.animalTypeCustom ?? {});
  const [typeCustomChecked, setTypeCustomChecked] = useState<Record<string, boolean>>(initialFeatures.animalTypeCustomChecked ?? {});
  const typeCustomRef = useRef(typeCustom);
  typeCustomRef.current = typeCustom;
  const [loyalty, setLoyalty] = useState<number>(initialFeatures.animalLoyalty ?? 0);
  const [beastOfLegend, setBeastOfLegend] = useState<Record<string, boolean>>(initialFeatures.animalBeastOfLegend ?? {});

  const [typeCollapsed, setTypeCollapsed] = useState(false);
  const hasInitializedTypeCollapse = useRef(false);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.animalHp !== undefined) setHp(f.animalHp);
    if (f.animalArmor !== undefined) setArmor(f.animalArmor);
    if (f.animalDamage !== undefined) setDamage(f.animalDamage);
    if (f.animalName !== undefined) setName(f.animalName);
    if (f.animalDamageTags !== undefined) setDamageTags(f.animalDamageTags);
    if (f.animalType !== undefined) setAnimalType(f.animalType);
    if (f.animalTypePicks !== undefined) setTypePicks(f.animalTypePicks);
    if (f.animalTypeCustomChecked !== undefined) setTypeCustomChecked(f.animalTypeCustomChecked);
    if (f.animalLoyalty !== undefined) setLoyalty(f.animalLoyalty);
    if (f.animalBeastOfLegend !== undefined) setBeastOfLegend(f.animalBeastOfLegend);
  }, [data]);

  useEffect(() => {
    if (animalType && !hasInitializedTypeCollapse.current) {
      hasInitializedTypeCollapse.current = true;
      setTypeCollapsed(true);
    }
  }, [animalType]);

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

  const handleToggleTypeCollapse = useCallback(() => setTypeCollapsed((v) => !v), []);

  const handleInstinctSave = useCallback((patch: Partial<CharacterData>) => {
    return onSave(featurePatch(data, { animalInstinct: patch.instinct, animalInstinctCustom: patch.instinctCustom }));
  }, [data, onSave]);

  const handleCostSave = useCallback((patch: Partial<CharacterData>) => {
    return onSave(featurePatch(data, { animalCost: patch.instinct, animalCostCustom: patch.instinctCustom }));
  }, [data, onSave]);

  const features = resolvePlaybookFeatures(data);

  const instinctData = {
    instinct: toInstinctSentinel(features.animalInstinct),
    instinctCustom: features.animalInstinctCustom ?? '',
  } as CharacterData;

  const costData = {
    instinct: toInstinctSentinel(features.animalCost),
    instinctCustom: features.animalCostCustom ?? '',
  } as CharacterData;

  const selectedTypeConfig = ANIMAL_TYPES.find((t) => t.id === animalType);

  return (
    <div className={styles.root}>
      <AnimalStats
        hp={hp}
        armor={armor}
        damage={damage}
        name={name}
        damageTags={damageTags}
        selectedTypeHp={selectedTypeConfig?.hp}
        onHpChange={handleHpChange}
        onHpBlur={handleHpBlur}
        onArmorChange={handleArmorChange}
        onArmorBlur={handleArmorBlur}
        onDamageChange={handleDamageChange}
        onDamageBlur={handleDamageBlur}
        onNameChange={handleNameChange}
        onNameBlur={handleNameBlur}
        onDamageTagsChange={handleDamageTagsChange}
        onDamageTagsBlur={handleDamageTagsBlur}
      />
      <AnimalType
        animalType={animalType}
        typePicks={typePicks}
        typeCustom={typeCustom}
        typeCustomChecked={typeCustomChecked}
        typeCollapsed={typeCollapsed}
        onTypeChange={handleTypeChange}
        onTypePickChange={handleTypePickChange}
        onTypeCustomChange={handleTypeCustomChange}
        onTypeCustomBlur={handleTypeCustomBlur}
        onTypeCustomCheckedChange={handleTypeCustomCheckedChange}
        onToggleCollapse={handleToggleTypeCollapse}
      />
      <div className={styles.columns}>
        <RadioSelect
          playbookKey="ranger-animal"
          options={ANIMAL_INSTINCT_OPTIONS}
          data={instinctData}
          onSave={handleInstinctSave}
        />
        <RadioSelect
          playbookKey="ranger-animal-cost"
          title="Cost"
          options={ANIMAL_COST_OPTIONS}
          data={costData}
          onSave={handleCostSave}
          header={
            <div className={styles.loyaltyRow}>
              <Text as="span" size="sm" color="muted" className={styles.loyaltyLabel}>Loyalty</Text>
              <UseDots total={3} checked={loyalty} onChange={handleLoyaltyChange} />
            </div>
          }
        />
      </div>
      <BeastOfLegend
        beastOfLegend={beastOfLegend}
        onBeastOfLegendChange={handleBeastOfLegendChange}
      />
    </div>
  );
};
