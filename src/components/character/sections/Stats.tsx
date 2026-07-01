import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';
import clsx from 'clsx';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { Checkbox, Input, Text, Stack } from '@/components/ui';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
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

const handleStatWheel = (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur();

const StatBox = ({ label, abbr, statKey, value, onChange, onBlur }: StatBoxProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') { onChange(statKey, raw); return; }
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(statKey, String(Math.min(n, 3)));
  }, [onChange, statKey]);

  return (
    <Stack gap={1} align="center">
      <label className={styles.statLabel} htmlFor={`stat-${abbr}`}>{label}</label>
      <Input
        id={`stat-${abbr}`}
        className={styles.statInput}
        type="number"
        value={value}
        max={3}
        onChange={handleChange}
        onBlur={onBlur}
        onWheel={handleStatWheel}
      />
      <Text as="span" font="serif" size="sm" color="muted">({abbr})</Text>
    </Stack>
  );
};

interface InfoBoxProps {
  label: string;
  statKey?: keyof StatsState;
  value: string;
  isStatic?: boolean;
  min?: number;
  onChange?: (key: keyof StatsState, val: string) => void;
  onBlur?: () => void;
}

const InfoBox = ({ label, statKey, value, isStatic, min, onChange, onBlur }: InfoBoxProps) => (
  <Stack gap={1} align="center">
    {isStatic ? (
      <span className={styles.infoStatic}>{value}</span>
    ) : (
      <Input
        className={styles.infoInput}
        type="number"
        value={value}
        min={min}
        aria-label={label}
        onChange={(e) => { if (statKey) onChange?.(statKey, e.target.value); }}
        onBlur={onBlur}
        onWheel={(e) => e.currentTarget.blur()}
      />
    )}
    <Text as="span" font="serif" size="sm" color="muted" className={styles.infoLabel}>{label}</Text>
  </Stack>
);

interface DebilityRowProps {
  label: string;
  debilityKey: keyof DebilitiesState;
  checked: boolean;
  // Locked by an arcana consequence (e.g. the Lidless Orb's withered eye): force-checked and not
  // editable here, since unmarking the consequence is what clears it.
  locked?: boolean;
  onChange: (key: keyof DebilitiesState, checked: boolean) => void;
}

const DebilityRow = ({ label, debilityKey, checked, locked, onChange }: DebilityRowProps) => {
  const isChecked = checked || !!locked;
  const braceCx = clsx(styles.debilityBrace, isChecked && styles.debilityBraceActive);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(debilityKey, e.target.checked), [onChange, debilityKey]);
  return (
    <div className={styles.debility}>
      <div className={braceCx} />
      <Checkbox
        name={`debility-${label}`}
        value={label}
        checked={isChecked}
        disabled={locked}
        onChange={handleChange}
        label={<Text as="span" font="serif" size="sm" color="muted" italic>{label}</Text>}
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

const statsFromData = (data: CharacterData | undefined, hpMax?: number): StatsState => ({
  statStr: data?.statStr ?? '',
  statDex: data?.statDex ?? '',
  statInt: data?.statInt ?? '',
  statWis: data?.statWis ?? '',
  statCon: data?.statCon ?? '',
  statCha: data?.statCha ?? '',
  statHp: data?.statHp ?? (hpMax !== undefined ? String(hpMax) : ''),
  statArmor: data?.statArmor ?? '0',
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
    debilityLockedKey: 'debilityWeakenedLocked' as const,
    debilityLabel: 'weakened',
  },
  {
    fields: [
      { key: 'statInt' as const, label: 'Intelligence', abbr: 'INT' },
      { key: 'statWis' as const, label: 'Wisdom', abbr: 'WIS' },
    ],
    debilityKey: 'debilityDazed' as const,
    debilityLockedKey: 'debilityDazedLocked' as const,
    debilityLabel: 'dazed',
  },
  {
    fields: [
      { key: 'statCon' as const, label: 'Constitution', abbr: 'CON' },
      { key: 'statCha' as const, label: 'Charisma', abbr: 'CHA' },
    ],
    debilityKey: 'debilityMiserable' as const,
    debilityLockedKey: 'debilityMiserableLocked' as const,
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

  const onSaveRef = useLatest(onSave);
  const statsRef = useLatest(stats);
  const debilitiesRef = useLatest(debilities);
  const hasAutoInitialized = useRef(false);
  // Fields the user has edited this session. Saves send only these, so a
  // stale value in our local state can't overwrite another device's edit to a
  // field we never touched.
  const dirtyRef = useRef(new Set<keyof StatsState | keyof DebilitiesState>());

  // Deps intentionally list the specific stat subfields, not the whole `data`
  // object, so unrelated data changes don't re-derive the stats snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncedStats = useMemo(() => statsFromData(data, hpMax), [
    data?.statStr, data?.statDex, data?.statInt, data?.statWis, data?.statCon, data?.statCha,
    data?.statHp, data?.statArmor, data?.statXp, data?.statLevel,
    hpMax,
  ]);

  // Deps intentionally list the specific debility subfields, not the whole
  // `data` object.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncedDebilities = useMemo(() => debilitiesFromData(data), [
    data?.debilityWeakened, data?.debilityDazed, data?.debilityMiserable,
  ]);

  useEffect(() => {
    if (!data || hasAutoInitialized.current) return;
    const patch: Partial<CharacterData> = {};
    if (hpMax !== undefined && !data.statHp) patch.statHp = String(hpMax);
    if (!data.statXp) patch.statXp = '0';
    if (Object.keys(patch).length > 0) {
      // Guard against re-entrancy this render cycle, but only commit it on a
      // successful write — a failed init must be retried, or statHp/statXp
      // defaults silently never persist (masked by the display fallback).
      hasAutoInitialized.current = true;
      Promise.resolve(onSaveRef.current?.(patch)).catch(() => {
        hasAutoInitialized.current = false;
      });
    }
  }, [data, hpMax]);

  const savePayload = useCallback(
    (payload: Partial<CharacterData>) => onSaveRef.current?.(payload) ?? Promise.resolve(),
    [],
  );

  // Once a field's value is persisted, drop it from the dirty set so it goes
  // back to being driven by incoming snapshots. Without this a field stays
  // "owned" forever, and a tab whose listener was suspended (e.g. backgrounded
  // mobile Safari) replays its stale value the next time any field saves.
  // Skip a field the user re-edited while the save was in flight — its current
  // value no longer matches what we just persisted.
  const handleSaveSuccess = useCallback((payload: Partial<CharacterData>) => {
    const current = { ...statsRef.current, ...debilitiesRef.current } as Record<string, string | boolean>;
    for (const key of Object.keys(payload)) {
      const k = key as keyof StatsState | keyof DebilitiesState;
      if (current[k] === (payload as Record<string, string | boolean>)[k]) {
        dirtyRef.current.delete(k);
      }
    }
  }, []);

  const { onChange: debouncedSave, flush, isPendingRef } = useDebouncedSave(
    savePayload,
    1000,
    undefined,
    handleSaveSuccess,
  );

  useFirestoreSync(syncedStats, setStats, isPendingRef);
  useFirestoreSync(syncedDebilities, setDebilities, isPendingRef);

  const pickDirty = useCallback((statsState: StatsState, debilitiesState: DebilitiesState): Partial<CharacterData> => {
    const all = { ...statsState, ...debilitiesState };
    const payload: Partial<CharacterData> = {};
    dirtyRef.current.forEach((key) => {
      (payload as Record<string, string | boolean>)[key] = all[key];
    });
    return payload;
  }, []);

  const handleStatChange = useCallback((key: keyof StatsState, val: string) => {
    const next = { ...statsRef.current, [key]: val };
    setStats(next);
    dirtyRef.current.add(key);
    debouncedSave(pickDirty(next, debilitiesRef.current));
  }, [debouncedSave, pickDirty]);

  const handleFlush = useCallback(() => {
    if (dirtyRef.current.size === 0) return;
    flush(pickDirty(statsRef.current, debilitiesRef.current));
  }, [flush, pickDirty]);

  const handleDebilityChange = useCallback((key: keyof DebilitiesState, checked: boolean) => {
    const next = { ...debilitiesRef.current, [key]: checked };
    setDebilities(next);
    dirtyRef.current.add(key);
    flush(pickDirty(statsRef.current, next));
  }, [flush, pickDirty]);

  if (!data || hpMax === undefined) return <PlaybookSection title="Stats" />;

  const warn = REQUIRED_STAT_KEYS.some((k) => stats[k] === '');
  const hpLabel = `HP (max ${hpMax})`;

  const currentXp = parseInt(stats.statXp, 10);
  const currentLevel = parseInt(stats.statLevel, 10);
  const xpToLevel = !isNaN(currentLevel) ? 6 + 2 * currentLevel : null;
  const canLevelUp = xpToLevel !== null && !isNaN(currentXp) && currentXp >= xpToLevel;
  let levelUpHint: string | null = null;
  if (xpToLevel !== null) {
    const xpDisplay = isNaN(currentXp) ? 0 : currentXp;
    if (canLevelUp) {
      levelUpHint = `Ready to level up! Spend ${xpToLevel} XP during downtime at home to reach level ${currentLevel + 1}.`;
    } else {
      levelUpHint = `Need ${xpToLevel} XP to reach level ${currentLevel + 1} (${xpDisplay}/${xpToLevel}).`;
    }
  }

  return (
    <PlaybookSection title="Stats" warn={warn} warnText="All stat fields must be filled in before play.">
      <Text color="muted" className={styles.statsInstruction}>{scoreInstruction}</Text>
      <Stack gap={4}>
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
                    onBlur={handleFlush}
                  />
                ))}
              </div>
              <DebilityRow
                label={group.debilityLabel}
                debilityKey={group.debilityKey}
                checked={debilities[group.debilityKey]}
                locked={!!data[group.debilityLockedKey]}
                onChange={handleDebilityChange}
              />
            </div>
          ))}
        </div>
        <div className={styles.infoRow}>
          <InfoBox label="Damage" value={damage} isStatic />
          <InfoBox label={hpLabel} statKey="statHp" value={stats.statHp} onChange={handleStatChange} onBlur={handleFlush} />
          <InfoBox label="Armor" statKey="statArmor" value={stats.statArmor} onChange={handleStatChange} onBlur={handleFlush} />
          <InfoBox label="XP" statKey="statXp" value={stats.statXp} onChange={handleStatChange} onBlur={handleFlush} />
          <InfoBox label="Level" statKey="statLevel" value={stats.statLevel} min={1} onChange={handleStatChange} onBlur={handleFlush} />
        </div>
        {levelUpHint && (
          <Text
            color={canLevelUp ? 'accent' : 'muted'}
            className={clsx(styles.levelUpHint, canLevelUp && styles.levelUpReady)}
          >
            {levelUpHint}
          </Text>
        )}
      </Stack>
    </PlaybookSection>
  );
};
