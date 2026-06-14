import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heading, Text, Input } from '@/components/ui';
import { useOptimisticSteadingField } from '@/hooks/useOptimisticSteadingField';
import { ImprovementList } from './ImprovementList';
import type { SteadingData } from '@/types';
import styles from './SteadingAssets.module.css';

const DRAFT_HORSES = 'A pair of hardy draft horses, followers (*large*, *powerful*, *keen-nosed*, *hardy*): HP 10 each; Damage d6+3 (*hand*, *close*, *forceful*); Instinct: to panic; Cost: care & grooming.';
const HERD_OF_HORSES = 'A herd of horses';

const FIXED_ASSETS: { id: string; label: string }[] = [
  { id: 'draft-horses', label: DRAFT_HORSES },
  { id: 'plows', label: 'A pair of horse-drawn plows, iron' },
  { id: 'carts', label: 'A pair of carts (plus horse harness)' },
  { id: 'wagon', label: 'A wagon (plus horse harness)' },
];

type CurrencyKey = 'silverPurses' | 'silverHandfuls' | 'silverCoins' | 'goldPurses' | 'goldHandfuls' | 'goldCoins';

interface CurrencyFieldProps {
  label: string;
  fieldKey: CurrencyKey;
  savedValue: number;
  onSave: (key: CurrencyKey, v: number) => void;
}

const CurrencyField = ({ label, fieldKey, savedValue, onSave }: CurrencyFieldProps) => {
  const [local, setLocal] = useState(String(savedValue));
  const isFocusedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!isFocusedRef.current) setLocal(String(savedValue));
  }, [savedValue]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocal(raw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) onSaveRef.current(fieldKey, parsed);
    }, 600);
  }, [fieldKey]);

  const handleFocus = useCallback(() => { isFocusedRef.current = true; }, []);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const parsed = parseInt(local, 10);
    const clamped = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setLocal(String(clamped));
    onSaveRef.current(fieldKey, clamped);
  }, [local, fieldKey]);

  return (
    <div className={styles.denomination}>
      <Input
        label={label}
        type="number"
        min={0}
        value={local}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={styles.currencyInput}
      />
    </div>
  );
};

interface SteadingAssetsProps {
  steading: Pick<SteadingData, 'assetsList' | 'improvements' | 'gmImprovements' | CurrencyKey>;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingAssets = ({ steading, onSave }: SteadingAssetsProps) => {
  const {
    assetsList = [],
    improvements = {},
    gmImprovements = [],
    silverPurses = 0,
    silverHandfuls = 0,
    silverCoins = 0,
    goldPurses = 0,
    goldHandfuls = 0,
    goldCoins = 0,
  } = steading;

  const { value: localAssetsList, save: saveAssetsList } = useOptimisticSteadingField(
    assetsList,
    (next: string[]) => onSave({ assetsList: next }),
  );

  const firestoreCurrency = useMemo<Record<CurrencyKey, number>>(
    () => ({ silverPurses, silverHandfuls, silverCoins, goldPurses, goldHandfuls, goldCoins }),
    [silverPurses, silverHandfuls, silverCoins, goldPurses, goldHandfuls, goldCoins],
  );
  const { value: localCurrency, save: saveCurrency } = useOptimisticSteadingField<Record<CurrencyKey, number>, [key: CurrencyKey]>(
    firestoreCurrency,
    // Persist only the changed denomination so a concurrent edit to another isn't clobbered.
    (next, key) => onSave({ [key]: next[key] }),
  );

  const hasHerdOfHorses = !!improvements['herd-of-horses'];

  const fixedItems = useMemo(() => [
    ...FIXED_ASSETS
      .filter(({ id }) => !(id === 'draft-horses' && hasHerdOfHorses))
      .map(({ label }) => label),
  ], [hasHerdOfHorses]);

  const improvementItems = useMemo(() => [
    ...(hasHerdOfHorses ? [{ id: 'herd-of-horses', label: HERD_OF_HORSES }] : []),
    ...gmImprovements
      .filter((g) => g.completed && g.category === 'asset' && g.title)
      .map((g) => ({ id: g.id, label: g.title })),
  ], [hasHerdOfHorses, gmImprovements]);

  const assetImprovements = useMemo(() => {
    const record: Record<string, boolean> = {};
    improvementItems.forEach(({ id }) => { record[id] = true; });
    return record;
  }, [improvementItems]);

  const handleSaveList = useCallback((items: string[]) => saveAssetsList(() => items), [saveAssetsList]);
  const handleCurrencySave = useCallback((key: CurrencyKey, v: number) => {
    saveCurrency((c) => ({ ...c, [key]: v }), key);
  }, [saveCurrency]);

  return (
    <div className={styles.root}>
      <Text size="xs" color="muted" className={styles.description}>
        Owned by the residents of Stonetop in common. To take them on an expedition or otherwise put them at risk, you must Requisition.
      </Text>

      <ImprovementList
        fixedItems={fixedItems}
        improvementItems={improvementItems}
        customItems={localAssetsList}
        improvements={assetImprovements}
        onSave={handleSaveList}
        addLabel="Add asset"
        itemLabel="Asset gained in play"
      />

      <div className={styles.currency}>
        <Heading as="h3" size="label">Silver</Heading>
        <div className={styles.currencyGrid}>
          <CurrencyField label="Purses"   fieldKey="silverPurses"   savedValue={localCurrency.silverPurses}   onSave={handleCurrencySave} />
          <CurrencyField label="Handfuls" fieldKey="silverHandfuls" savedValue={localCurrency.silverHandfuls} onSave={handleCurrencySave} />
          <CurrencyField label="Coins"    fieldKey="silverCoins"    savedValue={localCurrency.silverCoins}    onSave={handleCurrencySave} />
        </div>
        <Heading as="h3" size="label">Gold</Heading>
        <div className={styles.currencyGrid}>
          <CurrencyField label="Purses"   fieldKey="goldPurses"   savedValue={localCurrency.goldPurses}   onSave={handleCurrencySave} />
          <CurrencyField label="Handfuls" fieldKey="goldHandfuls" savedValue={localCurrency.goldHandfuls} onSave={handleCurrencySave} />
          <CurrencyField label="Coins"    fieldKey="goldCoins"    savedValue={localCurrency.goldCoins}    onSave={handleCurrencySave} />
        </div>
      </div>
    </div>
  );
};
