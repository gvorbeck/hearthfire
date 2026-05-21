import { useState, useEffect, useRef, useCallback, memo } from 'react';
import clsx from 'clsx';
import { Checkbox } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './Stats.module.css';

interface StatBoxProps {
  label: string;
  abbr: string;
  statKey: keyof StatsState;
  value: string;
  onChange: (key: keyof StatsState, val: string) => void;
  onBlur: () => void;
}

const StatBox = memo(({ label, abbr, statKey, value, onChange, onBlur }: StatBoxProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') { onChange(statKey, raw); return; }
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(statKey, String(Math.min(n, 3)));
  }, [onChange, statKey]);
  return (
    <div className={styles.statBox}>
      <label className={styles.statLabel} htmlFor={`stat-${abbr}`}>{label}</label>
      <input
        id={`stat-${abbr}`}
        className={styles.statInput}
        type="number"
        value={value}
        max={3}
        onChange={handleChange}
        onBlur={onBlur}
        onWheel={(e) => e.currentTarget.blur()}
      />
      <span className={styles.statAbbr}>({abbr})</span>
    </div>
  );
});

interface InfoBoxProps {
  label: string;
  statKey?: keyof StatsState;
  value: string;
  isStatic?: boolean;
  min?: number;
  onChange?: (key: keyof StatsState, val: string) => void;
  onBlur?: () => void;
}

const InfoBox = memo(({ label, statKey, value, isStatic, min, onChange, onBlur }: InfoBoxProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (statKey) onChange?.(statKey, e.target.value);
  }, [onChange, statKey]);
  return (
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
          onChange={handleChange}
          onBlur={onBlur}
          onWheel={(e) => e.currentTarget.blur()}
        />
      )}
      <span className={styles.infoLabel}>{label}</span>
    </div>
  );
});

interface DebilityRowProps {
  label: string;
  debilityKey: keyof DebilitiesState;
  checked: boolean;
  onChange: (key: keyof DebilitiesState, checked: boolean) => void;
}

const DebilityRow = memo(({ label, debilityKey, checked, onChange }: DebilityRowProps) => {
  const braceCx = clsx(styles.debilityBrace, checked && styles.debilityBraceActive);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(debilityKey, e.target.checked), [onChange, debilityKey]);
  return (
    <div className={styles.debility}>
      <div className={braceCx} />
      <Checkbox
        name={`debility-${label}`}
        value={label}
        checked={checked}
        onChange={handleChange}
        label={<span className={styles.debilityLabel}>{label}</span>}
      />
    </div>
  );
});

type StatsState = {
  statStr: string; statDex: string; statInt: string; statWis: string;
  statCon: string; statCha: string; statHp: string; statArmor: string;
  statXp: string; statLevel: string;
};

type DebilitiesState = {
  debilityWeakened: boolean; debilityDazed: boolean; debilityMiserable: boolean;
};

const statsFromData = (data: CharacterData | undefined, hpMax?: number): StatsState => ({
  statStr: data?.statStr ?? '',
  statDex: data?.statDex ?? '',
  statInt: data?.statInt ?? '',
  statWis: data?.statWis ?? '',
  statCon: data?.statCon ?? '',
  statCha: data?.statCha ?? '',
  statHp: data?.statHp ?? (hpMax !== undefined ? String(hpMax) : ''),
  statArmor: data?.statArmor ?? '',
  statXp: data?.statXp ?? '0',
  statLevel: data?.statLevel || '1',
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

const DEFAULT_SCORE_INSTRUCTION = 'Assign these scores: 2, 1, 1, 0, 0, -1. When a debility is marked, you roll with disadvantage.';

const REQUIRED_STAT_KEYS: (keyof StatsState)[] = ['statStr', 'statDex', 'statInt', 'statWis', 'statCon', 'statCha', 'statHp', 'statArmor', 'statXp'];

interface StatsProps {
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
  hpMax?: number;
  damage?: string;
  scoreInstruction?: string;
}

export const Stats = ({ data, onSave, hpMax, damage = 'd6', scoreInstruction = DEFAULT_SCORE_INSTRUCTION }: StatsProps = {}) => {
  const [stats, setStats] = useState<StatsState>(() => statsFromData(data, hpMax));
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
    setStats(statsFromData(data, hpMax));
    setDebilities(debilitiesFromData(data));
    if (!data) return;
    const patch: Partial<CharacterData> = {};
    if (hpMax !== undefined && !data.statHp) patch.statHp = String(hpMax);
    if (!data.statXp) patch.statXp = '0';
    if (Object.keys(patch).length > 0) onSaveRef.current?.(patch);
  }, [
    data?.statStr, data?.statDex, data?.statInt, data?.statWis, data?.statCon, data?.statCha,
    data?.statHp, data?.statArmor, data?.statXp, data?.statLevel,
    data?.debilityWeakened, data?.debilityDazed, data?.debilityMiserable,
    hpMax,
  ]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const write = useCallback((nextStats: StatsState, nextDebilities: DebilitiesState) => {
    const payload = { ...nextStats, ...nextDebilities };
    const key = JSON.stringify(payload);
    if (key === lastSavedRef.current) return;
    lastSavedRef.current = key;
    onSaveRef.current?.(payload);
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

  if (!data || hpMax === undefined) return <PlaybookSection title="Stats" />;

  const warn = REQUIRED_STAT_KEYS.some((k) => stats[k] === '');
  const hpLabel = `HP (max ${hpMax})`;

  return (
    <PlaybookSection title="Stats" warn={warn} warnText="All stat fields must be filled in before play.">
      <p className={styles.statsInstruction}>{scoreInstruction}</p>
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
                    statKey={f.key}
                    value={stats[f.key]}
                    onChange={handleStatChange}
                    onBlur={flush}
                  />
                ))}
              </div>
              <DebilityRow
                label={group.debilityLabel}
                debilityKey={group.debilityKey}
                checked={debilities[group.debilityKey]}
                onChange={handleDebilityChange}
              />
            </div>
          ))}
        </div>
        <div className={styles.infoRow}>
          <InfoBox label="Damage" value={damage} isStatic />
          <InfoBox label={hpLabel} statKey="statHp" value={stats.statHp} onChange={handleStatChange} onBlur={flush} />
          <InfoBox label="Armor" statKey="statArmor" value={stats.statArmor} onChange={handleStatChange} onBlur={flush} />
          <InfoBox label="XP" statKey="statXp" value={stats.statXp} onChange={handleStatChange} onBlur={flush} />
          <InfoBox label="Level" statKey="statLevel" value={stats.statLevel} min={1} onChange={handleStatChange} onBlur={flush} />
        </div>
      </div>
    </PlaybookSection>
  );
};
