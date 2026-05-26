import { useCallback, useEffect, useRef, useState } from 'react';
import { List, Icon, Tooltip, RepeaterField, Heading, Text, Input } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
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

interface CurrencyFieldProps {
  label: string;
  savedValue: number;
  onSave: (v: number) => void;
}

const CurrencyField = ({ label, savedValue, onSave }: CurrencyFieldProps) => {
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
      if (!isNaN(parsed) && parsed >= 0) onSaveRef.current(parsed);
    }, 600);
  }, []);

  const handleFocus = useCallback(() => { isFocusedRef.current = true; }, []);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const parsed = parseInt(local, 10);
    const clamped = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setLocal(String(clamped));
    onSaveRef.current(clamped);
  }, [local]);

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

type CurrencyKey = 'silverPurses' | 'silverHandfuls' | 'silverCoins' | 'goldPurses' | 'goldHandfuls' | 'goldCoins';

interface SteadingAssetsProps {
  assetsList: string[] | undefined;
  improvements: Record<string, boolean> | undefined;
  silverPurses: number | undefined;
  silverHandfuls: number | undefined;
  silverCoins: number | undefined;
  goldPurses: number | undefined;
  goldHandfuls: number | undefined;
  goldCoins: number | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingAssets = ({
  assetsList = [],
  improvements = {},
  silverPurses = 0,
  silverHandfuls = 0,
  silverCoins = 0,
  goldPurses = 0,
  goldHandfuls = 0,
  goldCoins = 0,
  onSave,
}: SteadingAssetsProps) => {
  const hasHerdOfHorses = !!improvements['herd-of-horses'];

  const allFixed = [
    ...(hasHerdOfHorses ? [{ id: 'herd-of-horses', label: HERD_OF_HORSES, fromImprovement: true }] : []),
    ...FIXED_ASSETS
      .filter(({ id }) => !(id === 'draft-horses' && hasHerdOfHorses))
      .map(({ id, label }) => ({ id, label, fromImprovement: false })),
  ];

  const handleSaveList = useCallback((items: string[]) => onSave({ assetsList: items }), [onSave]);
  const handleCurrencySave = useCallback((key: CurrencyKey, v: number) => onSave({ [key]: v }), [onSave]);

  const handleSilverPurses   = useCallback((v: number) => handleCurrencySave('silverPurses', v),   [handleCurrencySave]);
  const handleSilverHandfuls = useCallback((v: number) => handleCurrencySave('silverHandfuls', v), [handleCurrencySave]);
  const handleSilverCoins    = useCallback((v: number) => handleCurrencySave('silverCoins', v),    [handleCurrencySave]);
  const handleGoldPurses     = useCallback((v: number) => handleCurrencySave('goldPurses', v),     [handleCurrencySave]);
  const handleGoldHandfuls   = useCallback((v: number) => handleCurrencySave('goldHandfuls', v),   [handleCurrencySave]);
  const handleGoldCoins      = useCallback((v: number) => handleCurrencySave('goldCoins', v),      [handleCurrencySave]);

  return (
    <div className={styles.root}>
      <Text size="sm" color="muted">
        Owned by the residents of Stonetop in common. To take them on an expedition or otherwise put them at risk, you must Requisition.
      </Text>

      <List
        variant="bullet"
        items={allFixed.map(({ id, label, fromImprovement }) => (
          <span key={id} className={styles.fixedItem}>
            {parseInlineMarkdown(label)}
            {fromImprovement && (
              <Tooltip text="Added by a completed improvement" side="top">
                <Icon name="info" size="small" className={styles.infoIcon} />
              </Tooltip>
            )}
          </span>
        ))}
      />

      <RepeaterField
        items={assetsList}
        onSave={handleSaveList}
        addLabel="Add asset"
        itemLabel="Asset gained in play"
      />

      <div className={styles.currency}>
        <Heading as="h3" size="label">Silver</Heading>
        <div className={styles.currencyGrid}>
          <CurrencyField label="Purses"   savedValue={silverPurses}   onSave={handleSilverPurses}   />
          <CurrencyField label="Handfuls" savedValue={silverHandfuls} onSave={handleSilverHandfuls} />
          <CurrencyField label="Coins"    savedValue={silverCoins}    onSave={handleSilverCoins}    />
        </div>
        <Heading as="h3" size="label">Gold</Heading>
        <div className={styles.currencyGrid}>
          <CurrencyField label="Purses"   savedValue={goldPurses}   onSave={handleGoldPurses}   />
          <CurrencyField label="Handfuls" savedValue={goldHandfuls} onSave={handleGoldHandfuls} />
          <CurrencyField label="Coins"    savedValue={goldCoins}    onSave={handleGoldCoins}    />
        </div>
      </div>
    </div>
  );
};
