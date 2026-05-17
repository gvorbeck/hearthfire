import { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { Checkbox, Input } from '@/components/primitives';
import { UseDots } from '@/components/CharacterSheet/Move';
import { parseInlineMarkdown } from '@/lib/parseInlineMarkdown';
import { PlaybookSection } from '../../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './BlessedSpecialPossessions.module.css';

interface Possession {
  id: string;
  name: string;
  uses?: number;
  isCustom?: boolean;
  label: string;
}

const POSSESSIONS: Possession[] = [
  {
    id: 'apiary',
    name: 'Apiary',
    label: '**Apiary**: beeswax, candles (*close*, *area*, lasts ~1 hr), honey, ◇ bee smokers, ◇ hat & veils, etc.',
  },
  {
    id: 'collected-offerings',
    name: 'Collected offerings',
    uses: 3,
    label: '**Collected offerings**: Expend a use to produce something valuable to a spirit of the wild. Restore 1 use each season.',
  },
  {
    id: 'goat-herd',
    name: 'Goat herd',
    label: '**Goat herd**: milk, cheese, pelts, meat, blood, horn, wool, etc. Each season, 1 in 4 chance of having a bezoar (swallow it to cure poison).',
  },
  {
    id: 'herb-garden',
    name: 'Herb garden',
    label: '**Herb garden**: shears, mortars & pestles, herbs, seeds, remedies, mild poisons, ◇ spades, etc. Each spring, d4 uses of bendis root (*reach*, *area*, burns ~1 hr, fumes repel perversions of nature).',
  },
  {
    id: 'mastiffs',
    name: 'Mastiffs',
    label: '**Mastiffs**, 2–3 followers (*alert*, *keen-nosed*, *fierce*, *overprotective*); HP 6; Damage d6 (*hand*, *grabby*); Instinct: to bark & threaten; Cost: affection.',
  },
  {
    id: 'custom',
    name: 'Custom (discuss with GM)',
    isCustom: true,
    label: '(discuss with GM)',
  },
];

const PICK_COUNT = 2;

const stockCapacity = (level: number) => 3 + Math.floor(level / 2);

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

interface BlessedSpecialPossessionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  sacredPouchStock?: number;
  onStockChange?: (stock: number) => void;
  level: number;
}

export const BlessedSpecialPossessions = ({
  data,
  onSave,
  sacredPouchStock = 0,
  onStockChange,
  level,
}: BlessedSpecialPossessionsProps) => {


  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => data?.specialPossessions ?? {}
  );
  const [uses, setUses] = useState<Record<string, number>>(
    () => data?.specialPossessionUses ?? {}
  );
  const [customText, setCustomText] = useState<string>(
    () => data?.specialPossessionCustom ?? ''
  );

  const customTextRef = useRef(customText);
  customTextRef.current = customText;
  const customDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelected(data?.specialPossessions ?? {});
    setUses(data?.specialPossessionUses ?? {});
    if (data?.specialPossessionCustom !== undefined) setCustomText(data.specialPossessionCustom);
  }, [data?.specialPossessions, data?.specialPossessionUses, data?.specialPossessionCustom]);

  useEffect(() => () => { if (customDebounceRef.current) clearTimeout(customDebounceRef.current); }, []);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const atMax = selectedCount >= PICK_COUNT;

  const handleToggle = useCallback(
    (id: string, checked: boolean) => {
      const prev = selected;
      const next = { ...selected, [id]: checked };
      setSelected(next);
      onSave({ specialPossessions: next }).catch(() => setSelected(prev));
    },
    [selected, onSave]
  );

  const handleUses = useCallback(
    (id: string, count: number) => {
      const prev = uses;
      const next = { ...uses, [id]: count };
      setUses(next);
      onSave({ specialPossessionUses: next }).catch(() => setUses(prev));
    },
    [uses, onSave]
  );

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomText(value);
    if (customDebounceRef.current) clearTimeout(customDebounceRef.current);
    customDebounceRef.current = setTimeout(() => {
      onSave({ specialPossessionCustom: customTextRef.current });
    }, 1000);
  }, [onSave]);

  const handleCustomBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (customDebounceRef.current) clearTimeout(customDebounceRef.current);
    onSave({ specialPossessionCustom: e.target.value });
  }, [onSave]);

  const capacity = stockCapacity(level);

  const renderLabel = (p: Possession, checked: boolean, usesChecked: number): React.ReactNode => {
    const parsed = p.isCustom
      ? <span className={styles.customPlaceholder}>{p.label}</span>
      : <span className={styles.labelText}>{parseInlineMarkdown(p.label)}</span>;
    if (p.uses !== undefined) {
      return (
        <span className={styles.labelWithUses}>
          {parsed}
          <UseDots
            total={p.uses}
            checked={usesChecked}
            onChange={(n) => handleUses(p.id, n)}
            disabled={!checked}
          />
        </span>
      );
    }
    return parsed;
  };

  return (
    <PlaybookSection title="Special Possessions" choose={PICK_COUNT} chooseNote="in addition to your sacred pouch">
      <div className={styles.list}>
        <Checkbox
          aria-label="Sacred pouch"
          checked
          aria-disabled="true"
          readOnly
          className={styles.checkbox}
          label={
            <span className={styles.labelBody}>
              <span className={styles.labelText}>{parseInlineMarkdown('**Sacred pouch** (*magical*): see Sacred Pouch section.')}</span>
              <span className={styles.stockRow}>
                <span className={styles.stockLabel}>Stock:</span>
                {Array.from({ length: capacity }, (_, i) => {
                  const filled = i < sacredPouchStock;
                  const dotCx = clsx(styles.dot, filled && styles.dotFilled);
                  return (
                    <button
                      key={`stock-${i}`}
                      type="button"
                      className={dotCx}
                      aria-label={filled ? `Clear stock ${i + 1}` : `Mark stock ${i + 1}`}
                      onClick={() => onStockChange?.(filled ? i : i + 1)}
                    />
                  );
                })}
              </span>
            </span>
          }
        />

        {POSSESSIONS.map((p) => {
          const checked = selected[p.id] ?? false;
          const usesChecked = uses[p.id] ?? 0;
          return (
            <div key={p.id} className={styles.possessionRow}>
              <Checkbox
                aria-label={p.name}
                checked={checked}
                disabled={!checked && atMax}
                onChange={(e) => handleToggle(p.id, e.target.checked)}
                className={styles.checkbox}
                label={renderLabel(p, checked, usesChecked)}
              />
              {p.isCustom && checked && (
                <div className={styles.customInputWrapper}>
                  <Input
                    aria-label="Custom possession name"
                    value={customText}
                    placeholder="Describe possession…"
                    onChange={handleCustomChange}
                    onBlur={handleCustomBlur}
                    onClick={stopPropagation}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PlaybookSection>
  );
};
