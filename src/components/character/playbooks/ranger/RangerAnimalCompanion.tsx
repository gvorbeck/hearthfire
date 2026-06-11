import { useCallback } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { usePlaybookField } from '@/hooks/usePlaybookField';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { useTrackedField } from '../shared/useTrackedField';
import { ANIMAL_TYPES, TypePicksSection } from './AnimalType';
import { AnimalStats } from './AnimalStats';
import { RadioSelect } from '../../sections/RadioSelect';
import { BeastOfLegend } from './BeastOfLegend';
import { Text } from '@/components/ui';
import { LoyaltyRow } from '../shared/CrewWidgets';
import { useToast } from '@/components/app';
import type { CharacterData, PlaybookSectionProps, RadioOption } from '@/types';
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

type RangerAnimalCompanionProps = PlaybookSectionProps;

export const RangerAnimalCompanion = ({ data, onSave }: RangerAnimalCompanionProps) => {
  const { addToast } = useToast();
  const dataRef = useLatest(data);
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const init = resolvePlaybookFeatures(data);

  const { value: hp, setValue: setHp, handleChange: handleHpChange, handleBlur: handleHpBlur } =
    useTrackedField(init.animalHp ?? '', 'animalHp', saveDebounced, flushDebounce);
  const { value: armor, setValue: setArmor, handleChange: handleArmorChange, handleBlur: handleArmorBlur } =
    useTrackedField(init.animalArmor ?? '', 'animalArmor', saveDebounced, flushDebounce);
  const { value: damage, setValue: setDamage, handleChange: handleDamageChange, handleBlur: handleDamageBlur } =
    useTrackedField(init.animalDamage ?? '', 'animalDamage', saveDebounced, flushDebounce);
  const hpRef = useLatest(hp);
  const armorRef = useLatest(armor);
  const damageRef = useLatest(damage);
  const { value: name, handleChange: handleNameChange, handleBlur: handleNameBlur } =
    useTrackedField(init.animalName ?? '', 'animalName', saveDebounced, flushDebounce);
  const { value: damageTags, handleChange: handleDamageTagsChange, handleBlur: handleDamageTagsBlur } =
    useTrackedField(init.animalDamageTags ?? '', 'animalDamageTags', saveDebounced, flushDebounce);

  const { value: animalType, ref: animalTypeRef, setValue: setAnimalType } = usePlaybookField('animalType', init.animalType ?? '', saveImmediate, 'Failed to save.');
  const { value: typePicks, ref: typePicksRef, save: saveTypePicks } = usePlaybookField('animalTypePicks', init.animalTypePicks ?? {}, saveImmediate, 'Failed to save.');
  const { value: typeCustom, ref: typeCustomRef, setValue: setTypeCustom } = usePlaybookField('animalTypeCustom', init.animalTypeCustom ?? {}, saveImmediate, 'Failed to save.');
  const { value: typeCustomChecked, ref: typeCustomCheckedRef, save: saveTypeCustomChecked } = usePlaybookField('animalTypeCustomChecked', init.animalTypeCustomChecked ?? {}, saveImmediate, 'Failed to save.');
  const { value: loyalty, save: saveLoyalty } = usePlaybookField('animalLoyalty', init.animalLoyalty ?? 0, saveImmediate, 'Failed to save.');
  const { value: beastOfLegend, ref: beastOfLegendRef, save: saveBeastOfLegend } = usePlaybookField('animalBeastOfLegend', init.animalBeastOfLegend ?? {}, saveImmediate, 'Failed to save.');

  const handleTypeSave = useCallback((patch: Partial<CharacterData>) => {
    const val = patch.instinct ?? '';
    const typeConfig = ANIMAL_TYPES.find((t) => t.id === val);
    const prevType = animalTypeRef.current;
    setAnimalType(val);
    if (typeConfig) {
      const prevHp = hpRef.current; const prevArmor = armorRef.current; const prevDamage = damageRef.current;
      setHp(typeConfig.hp);
      setArmor(typeConfig.armor);
      setDamage(typeConfig.damage);
      return saveImmediate({ animalType: val, animalHp: typeConfig.hp, animalArmor: typeConfig.armor, animalDamage: typeConfig.damage })
        .catch(() => { setAnimalType(prevType); setHp(prevHp); setArmor(prevArmor); setDamage(prevDamage); addToast('Failed to save.', 'error'); });
    }
    return saveImmediate({ animalType: val }).catch(() => { setAnimalType(prevType); addToast('Failed to save.', 'error'); });
  }, [saveImmediate, animalTypeRef, hpRef, armorRef, damageRef, setHp, setArmor, setDamage, addToast, setAnimalType]);

  const handleTypePickChange = useCallback((id: string, checked: boolean) => {
    saveTypePicks({ ...typePicksRef.current, [id]: checked });
  }, [saveTypePicks]);

  const handleTypeCustomChange = useCallback((typeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...typeCustomRef.current, [typeId]: e.target.value };
    setTypeCustom(next);
    saveDebounced({ animalTypeCustom: next });
  }, [saveDebounced, setTypeCustom]);

  const handleTypeCustomBlur = useCallback((_typeId: string) => {
    flushDebounce({ animalTypeCustom: typeCustomRef.current });
  }, [flushDebounce]);

  const handleTypeCustomCheckedChange = useCallback((typeId: string, checked: boolean) => {
    saveTypeCustomChecked({ ...typeCustomCheckedRef.current, [typeId]: checked });
  }, [saveTypeCustomChecked]);

  const handleLoyaltyChange = useCallback((n: number) => {
    saveLoyalty(n);
  }, [saveLoyalty]);

  const handleBeastOfLegendChange = useCallback((id: string, checked: boolean) => {
    saveBeastOfLegend({ ...beastOfLegendRef.current, [id]: checked });
  }, [saveBeastOfLegend]);

  const handleInstinctSave = useCallback((patch: Partial<CharacterData>) => {
    return onSave(featurePatch(dataRef.current, { animalInstinct: patch.instinct, animalInstinctCustom: patch.instinctCustom }));
  }, [onSave, dataRef]);

  const handleCostSave = useCallback((patch: Partial<CharacterData>) => {
    return onSave(featurePatch(dataRef.current, { animalCost: patch.instinct, animalCostCustom: patch.instinctCustom }));
  }, [onSave, dataRef]);

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
    <LoyaltyRow
      value={loyalty}
      onChange={handleLoyaltyChange}
      label={<Text as="span" color="muted" className={styles.loyaltyLabel}>Loyalty</Text>}
    />
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
