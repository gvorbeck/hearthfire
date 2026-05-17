import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Checkbox } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './CharacterStats.module.css';

interface CharacterStatsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  hpMax?: number;
  damage?: string;
}

interface StatBoxProps {
  label: string;
  abbr: string;
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
}

const StatBox = ({ label, abbr, value, onChange, onBlur }: StatBoxProps) => (
  <div className={styles.statBox}>
    <span className={styles.statLabel}>{label}</span>
    <input
      className={styles.statInput}
      type="number"
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
    <span className={styles.statAbbr}>({abbr})</span>
  </div>
);

interface InfoBoxProps {
  label: string;
  value: string;
  isStatic?: boolean;
  min?: number;
  onChange?: (val: string) => void;
  onBlur?: () => void;
}

const InfoBox = ({ label, value, isStatic, min, onChange, onBlur }: InfoBoxProps) => (
  <div className={styles.infoBox}>
    {isStatic ? (
      <span className={styles.infoStatic}>{value}</span>
    ) : (
      <input
        className={styles.infoInput}
        type="number"
        value={value}
        min={min}
        aria-label={label}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur}
      />
    )}
    <span className={styles.infoLabel}>{label}</span>
  </div>
);

interface DebilityRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const DebilityRow = ({ label, checked, onChange }: DebilityRowProps) => {
  const braceCx = clsx(styles.debilityBrace, checked && styles.debilityBraceActive);
  return (
    <div className={styles.debility}>
      <div className={braceCx} />
      <Checkbox
        name={`debility-${label}`}
        value={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        label={<span className={styles.debilityLabel}>{label}</span>}
      />
    </div>
  );
};

type StatsState = {
  statStr: string; statDex: string; statInt: string; statWis: string;
  statCon: string; statCha: string; statHp: string; statArmor: string;
  statXp: string; statLevel: string;
};

type DebilitiesState = {
  debilityWeakened: boolean; debilityDazed: boolean; debilityMiserable: boolean;
};

const statsFromData = (data: CharacterData | undefined): StatsState => ({
  statStr: data?.statStr ?? '',
  statDex: data?.statDex ?? '',
  statInt: data?.statInt ?? '',
  statWis: data?.statWis ?? '',
  statCon: data?.statCon ?? '',
  statCha: data?.statCha ?? '',
  statHp: data?.statHp ?? '',
  statArmor: data?.statArmor ?? '',
  statXp: data?.statXp ?? '',
  statLevel: data?.statLevel ?? '',
});

const debilitiesFromData = (data: CharacterData | undefined): DebilitiesState => ({
  debilityWeakened: data?.debilityWeakened ?? false,
  debilityDazed: data?.debilityDazed ?? false,
  debilityMiserable: data?.debilityMiserable ?? false,
});

const STAT_GROUPS = [
  {
    fields: [
      { key: 'statStr' as const, label: 'Strength', abbr: 'STR' },
      { key: 'statDex' as const, label: 'Dexterity', abbr: 'DEX' },
    ],
    debilityKey: 'debilityWeakened' as const,
    debilityLabel: 'weakened',
  },
  {
    fields: [
      { key: 'statInt' as const, label: 'Intelligence', abbr: 'INT' },
      { key: 'statWis' as const, label: 'Wisdom', abbr: 'WIS' },
    ],
    debilityKey: 'debilityDazed' as const,
    debilityLabel: 'dazed',
  },
  {
    fields: [
      { key: 'statCon' as const, label: 'Constitution', abbr: 'CON' },
      { key: 'statCha' as const, label: 'Charisma', abbr: 'CHA' },
    ],
    debilityKey: 'debilityMiserable' as const,
    debilityLabel: 'miserable',
  },
] as const;

export const CharacterStats = ({ data, onSave, hpMax, damage = 'd6' }: CharacterStatsProps) => {
  const [stats, setStats] = useState<StatsState>(() => statsFromData(data));
  const [debilities, setDebilities] = useState<DebilitiesState>(() => debilitiesFromData(data));

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const statsRef = useRef(stats);
  const debilitiesRef = useRef(debilities);
  const lastSavedRef = useRef<string>('');
  onSaveRef.current = onSave;
  statsRef.current = stats;
  debilitiesRef.current = debilities;

  useEffect(() => {
    setStats(statsFromData(data));
    setDebilities(debilitiesFromData(data));
  }, [
    data?.statStr, data?.statDex, data?.statInt, data?.statWis, data?.statCon, data?.statCha,
    data?.statHp, data?.statArmor, data?.statXp, data?.statLevel,
    data?.debilityWeakened, data?.debilityDazed, data?.debilityMiserable,
  ]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const write = useCallback((nextStats: StatsState, nextDebilities: DebilitiesState) => {
    const payload = { ...nextStats, ...nextDebilities };
    const key = JSON.stringify(payload);
    if (key === lastSavedRef.current) return;
    lastSavedRef.current = key;
    onSaveRef.current(payload);
  }, []);

  const flush = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    write(statsRef.current, debilitiesRef.current);
  }, [write]);

  const debounced = useCallback((nextStats: StatsState, nextDebilities: DebilitiesState) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => write(nextStats, nextDebilities), 1000);
  }, [write]);

  const handleStatChange = useCallback((key: keyof StatsState, val: string) => {
    const next = { ...statsRef.current, [key]: val };
    setStats(next);
    debounced(next, debilitiesRef.current);
  }, [debounced]);

  const handleDebilityChange = useCallback((key: keyof DebilitiesState, checked: boolean) => {
    const next = { ...debilitiesRef.current, [key]: checked };
    setDebilities(next);
    write(statsRef.current, next);
  }, [write]);

  const hpLabel = hpMax !== undefined ? `HP (max ${hpMax})` : 'HP';

  return (
    <PlaybookSection title="Stats">
      <p className={styles.statsInstruction}>Assign these scores: +2, +1, +1, +0, +0, -1. When a debility is marked, you roll with disadvantage.</p>
      <div className={styles.statsSection}>
        <div className={styles.statRow}>
          {STAT_GROUPS.map((group) => (
            <div key={group.debilityKey} className={styles.statGroup}>
              <div className={styles.statPair}>
                {group.fields.map((f) => (
                  <StatBox
                    key={f.key}
                    label={f.label}
                    abbr={f.abbr}
                    value={stats[f.key]}
                    onChange={(val) => handleStatChange(f.key, val)}
                    onBlur={flush}
                  />
                ))}
              </div>
              <DebilityRow
                label={group.debilityLabel}
                checked={debilities[group.debilityKey]}
                onChange={(c) => handleDebilityChange(group.debilityKey, c)}
              />
            </div>
          ))}
        </div>
        <div className={styles.infoRow}>
          <InfoBox label="Damage" value={damage} isStatic />
          <InfoBox label={hpLabel} value={stats.statHp} onChange={(val) => handleStatChange('statHp', val)} onBlur={flush} />
          <InfoBox label="Armor" value={stats.statArmor} onChange={(val) => handleStatChange('statArmor', val)} onBlur={flush} />
          <InfoBox label="XP" value={stats.statXp} onChange={(val) => handleStatChange('statXp', val)} onBlur={flush} />
          <InfoBox label="Level" value={stats.statLevel} min={1} onChange={(val) => handleStatChange('statLevel', val)} onBlur={flush} />
        </div>
      </div>
    </PlaybookSection>
  );
};
