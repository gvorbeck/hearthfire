import { useState, useEffect, useCallback, useRef } from 'react';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { useTrackedField } from '../shared/useTrackedField';
import { ANIMAL_TYPES, AnimalType } from './AnimalType';
import { AnimalStats } from './AnimalStats';
import { AnimalInstinct } from './AnimalInstinct';
import { AnimalCost } from './AnimalCost';
import { BeastOfLegend } from './BeastOfLegend';
import type { CharacterData } from '@/types';
import styles from './RangerAnimalCompanion.module.css';

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
  const [instinct, setInstinct] = useState<string>(initialFeatures.animalInstinct ?? '');
  const [instinctCustom, setInstinctCustom] = useState<string>(initialFeatures.animalInstinctCustom ?? '');
  const [cost, setCost] = useState<string>(initialFeatures.animalCost ?? '');
  const [costCustom, setCostCustom] = useState<string>(initialFeatures.animalCostCustom ?? '');
  const typeCustomRef = useRef(typeCustom);
  typeCustomRef.current = typeCustom;
  const instinctCustomRef = useRef(instinctCustom);
  instinctCustomRef.current = instinctCustom;
  const costCustomRef = useRef(costCustom);
  costCustomRef.current = costCustom;
  const [loyalty, setLoyalty] = useState<number>(initialFeatures.animalLoyalty ?? 0);
  const [beastOfLegend, setBeastOfLegend] = useState<Record<string, boolean>>(initialFeatures.animalBeastOfLegend ?? {});

  const [typeCollapsed, setTypeCollapsed] = useState(false);
  const hasInitializedTypeCollapse = useRef(false);
  const [instinctCollapsed, setInstinctCollapsed] = useState(false);
  const hasInitializedInstinctCollapse = useRef(false);
  const [costCollapsed, setCostCollapsed] = useState(false);
  const hasInitializedCostCollapse = useRef(false);

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

  const handleToggleTypeCollapse = useCallback(() => setTypeCollapsed((v) => !v), []);
  const handleToggleInstinctCollapse = useCallback(() => setInstinctCollapsed((v) => !v), []);
  const handleToggleCostCollapse = useCallback(() => setCostCollapsed((v) => !v), []);

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
        <AnimalInstinct
          instinct={instinct}
          instinctCustom={instinctCustom}
          instinctCollapsed={instinctCollapsed}
          onInstinctChange={handleInstinctChange}
          onInstinctCustomFocus={handleInstinctCustomFocus}
          onInstinctCustomChange={handleInstinctCustomChange}
          onInstinctCustomBlur={handleInstinctCustomBlur}
          onToggleCollapse={handleToggleInstinctCollapse}
        />
        <AnimalCost
          cost={cost}
          costCustom={costCustom}
          loyalty={loyalty}
          costCollapsed={costCollapsed}
          onCostChange={handleCostChange}
          onCostCustomFocus={handleCostCustomFocus}
          onCostCustomChange={handleCostCustomChange}
          onCostCustomBlur={handleCostCustomBlur}
          onLoyaltyChange={handleLoyaltyChange}
          onToggleCollapse={handleToggleCostCollapse}
        />
      </div>
      <BeastOfLegend
        beastOfLegend={beastOfLegend}
        onBeastOfLegendChange={handleBeastOfLegendChange}
      />
    </div>
  );
};
