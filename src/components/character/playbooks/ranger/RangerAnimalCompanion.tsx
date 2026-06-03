import { useState, useEffect, useCallback, useRef } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { useTrackedField } from '../shared/useTrackedField';
import { ANIMAL_TYPES, TypePicksSection } from './AnimalType';
import { AnimalStats } from './AnimalStats';
import { RadioSelect } from '../../sections/RadioSelect';
import { BeastOfLegend } from './BeastOfLegend';
import { Text, UseDots } from '@/components/ui';
import { useToast } from '@/components/app';
import type { CharacterData } from '@/types';
import type { RadioOption } from '@/types';
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
  const { addToast } = useToast();
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const init = resolvePlaybookFeatures(data);

  const { value: hp, setValue: setHp, handleChange: handleHpChange, handleBlur: handleHpBlur } =
    useTrackedField(init.animalHp ?? '', 'animalHp', saveDebounced, flushDebounce);
  const { value: armor, setValue: setArmor, handleChange: handleArmorChange, handleBlur: handleArmorBlur } =
    useTrackedField(init.animalArmor ?? '', 'animalArmor', saveDebounced, flushDebounce);
  const { value: damage, setValue: setDamage, handleChange: handleDamageChange, handleBlur: handleDamageBlur } =
    useTrackedField(init.animalDamage ?? '', 'animalDamage', saveDebounced, flushDebounce);
  const { value: name, setValue: setName, handleChange: handleNameChange, handleBlur: handleNameBlur } =
    useTrackedField(init.animalName ?? '', 'animalName', saveDebounced, flushDebounce);
  const { value: damageTags, setValue: setDamageTags, handleChange: handleDamageTagsChange, handleBlur: handleDamageTagsBlur } =
    useTrackedField(init.animalDamageTags ?? '', 'animalDamageTags', saveDebounced, flushDebounce);

  const [animalType, setAnimalType] = useState<string>(init.animalType ?? '');
  const [typePicks, setTypePicks] = useState<Record<string, boolean>>(init.animalTypePicks ?? {});
  const [typeCustom, setTypeCustom] = useState<Record<string, string>>(init.animalTypeCustom ?? {});
  const [typeCustomChecked, setTypeCustomChecked] = useState<Record<string, boolean>>(init.animalTypeCustomChecked ?? {});
  const typeCustomRef = useLatest(typeCustom);
  const [loyalty, setLoyalty] = useState<number>(init.animalLoyalty ?? 0);
  const [beastOfLegend, setBeastOfLegend] = useState<Record<string, boolean>>(init.animalBeastOfLegend ?? {});

  const lastFirestoreAnimalRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const incoming = JSON.stringify(data?.playbookFeatures);
    if (incoming === lastFirestoreAnimalRef.current) return;
    lastFirestoreAnimalRef.current = incoming;
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

  const handleTypeSave = useCallback((patch: Partial<CharacterData>) => {
    const val = patch.instinct ?? '';
    const typeConfig = ANIMAL_TYPES.find((t) => t.id === val);
    const prevType = animalType;
    setAnimalType(val);
    if (typeConfig) {
      const prevHp = hp; const prevArmor = armor; const prevDamage = damage;
      setHp(typeConfig.hp);
      setArmor(typeConfig.armor);
      setDamage(typeConfig.damage);
      return saveImmediate({ animalType: val, animalHp: typeConfig.hp, animalArmor: typeConfig.armor, animalDamage: typeConfig.damage })
        .catch(() => { setAnimalType(prevType); setHp(prevHp); setArmor(prevArmor); setDamage(prevDamage); addToast('Failed to save.', 'error'); });
    }
    return saveImmediate({ animalType: val }).catch(() => { setAnimalType(prevType); addToast('Failed to save.', 'error'); });
  }, [saveImmediate, animalType, hp, armor, damage, setHp, setArmor, setDamage, addToast]);

  const handleTypePickChange = useCallback((id: string, checked: boolean) => {
    setTypePicks((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ animalTypePicks: next }).catch(() => { setTypePicks(prev); addToast('Failed to save.', 'error'); });
      return next;
    });
  }, [saveImmediate, addToast]);

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
      saveImmediate({ animalTypeCustomChecked: next }).catch(() => { setTypeCustomChecked(prev); addToast('Failed to save.', 'error'); });
      return next;
    });
  }, [saveImmediate, addToast]);

  const handleLoyaltyChange = useCallback((n: number) => {
    setLoyalty((prev) => {
      saveImmediate({ animalLoyalty: n }).catch(() => { setLoyalty(prev); addToast('Failed to save.', 'error'); });
      return n;
    });
  }, [saveImmediate, addToast]);

  const handleBeastOfLegendChange = useCallback((id: string, checked: boolean) => {
    setBeastOfLegend((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ animalBeastOfLegend: next }).catch(() => { setBeastOfLegend(prev); addToast('Failed to save.', 'error'); });
      return next;
    });
  }, [saveImmediate, addToast]);

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

  const animalTypeOptions: RadioOption[] = ANIMAL_TYPES.map((typeConfig) => ({
    value: typeConfig.id,
    label: typeConfig.label,
    description: `${typeConfig.examples}, etc.`,
    detailAlways: true,
    detail: (
      <TypePicksSection
        typeId={typeConfig.id}
        typeConfig={typeConfig}
        isSelected={animalType === typeConfig.id}
        picks={typePicks}
        customText={typeCustom[typeConfig.id] ?? ''}
        customChecked={typeCustomChecked[typeConfig.id] ?? false}
        onPickChange={handleTypePickChange}
        onCustomChange={handleTypeCustomChange}
        onCustomBlur={handleTypeCustomBlur}
        onCustomCheckedChange={handleTypeCustomCheckedChange}
      />
    ),
  }));

  const animalTypeData = { instinct: animalType, instinctCustom: '' } as CharacterData;

  const loyaltyHeader = (
    <div className={styles.loyaltyRow}>
      <Text as="span" size="sm" color="muted" className={styles.loyaltyLabel}>Loyalty</Text>
      <UseDots total={3} checked={loyalty} onChange={handleLoyaltyChange} />
    </div>
  );

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
      <RadioSelect
        playbookKey="ranger-animal-type"
        title="Type"
        options={animalTypeOptions}
        data={animalTypeData}
        onSave={handleTypeSave}
        noCustom
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
          header={loyaltyHeader}
        />
      </div>
      <BeastOfLegend
        beastOfLegend={beastOfLegend}
        onBeastOfLegendChange={handleBeastOfLegendChange}
      />
    </div>
  );
};
