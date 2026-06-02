import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { Input, Radio, RadioGroup, Text, UseDots, CheckboxGroup } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './BlessedInitiatesOfDanu.module.css';

interface PickLine {
  key: string;
  label: string;
  options: string[];
}

interface InitiateConfig {
  value: string;
  name: string;
  tags: string;
  hpMax: number;
  armor: string;
  damage: string;
  instinct: string;
  moves: string[];
  cost: string;
  pickLines: PickLine[];
  rites: string[];
}

const INITIATES: InitiateConfig[] = [
  {
    value: 'enfys',
    name: 'Enfys, the acolyte',
    tags: 'Bird-wise, innocent, magical, well-informed',
    hpMax: 6,
    armor: '0',
    damage: 'bronze knife d4 (hand)',
    instinct: 'to get distracted',
    moves: ['Speak with birds', 'Ask a difficult question', 'Wander off'],
    cost: 'knowledge, secret lore',
    pickLines: [
      { key: 'pronoun', label: 'Pronoun', options: ['he', 'she', 'they', '___'] },
      { key: 'age', label: 'Age', options: ['just a child', 'on the cusp', 'a young adult'] },
      { key: 'origin', label: 'Origin', options: ['carefully chosen', 'marked by Danu', 'orphaned'] },
      { key: 'trait', label: 'Trait', options: ['carefree', 'curious', 'moody', 'secretive'] },
    ],
    rites: ['blood', 'fire', 'sacred union'],
  },
  {
    value: 'afon',
    name: 'Afon, a fellow initiate',
    tags: 'Fae-wise, devious, magical, self-sufficient, stealthy',
    hpMax: 8,
    armor: '2 (0 vs. iron)',
    damage: 'bronze hatchet d6 (hand)',
    instinct: 'to act impulsively',
    moves: ['Weave a minor glamor', 'Appear or disappear unexpectedly', 'Speak an uncomfortable truth'],
    cost: 'wonder, joy',
    pickLines: [
      { key: 'pronoun', label: 'Pronoun', options: ['he', 'she', 'they', '___'] },
      { key: 'location', label: 'Location', options: ['comes and goes', 'in the Wood', 'a hut near town'] },
      { key: 'trait', label: 'Trait', options: ['aloof', 'bawdy and lewd', 'unnerving'] },
    ],
    rites: ['ecstasy', 'intoxication', 'moonlight'],
  },
  {
    value: 'gwendyl',
    name: 'Gwendyl, your mentor',
    tags: 'Herb-wise, gossipy, tireless, healer, magical',
    hpMax: 6,
    armor: '0',
    damage: 'iron knife d6 (hand)',
    instinct: 'to take offense',
    moves: ['Tend to the sick, injured, women in labor', 'Weave a talisman of fertility or good luck', 'Point out a flaw in a person or plan'],
    cost: 'consideration, affection',
    pickLines: [
      { key: 'pronoun', label: 'Pronoun', options: ['he', 'she', 'they', '___'] },
      { key: 'home', label: 'Home', options: ['a big family', 'has taken you in', 'lives alone'] },
      { key: 'trait', label: 'Trait', options: ['blunt', 'demanding', 'put upon', 'suffers no fools'] },
    ],
    rites: ['earth & soil', 'mourning', 'petition'],
  },
  {
    value: 'olwin',
    name: 'Olwin, your anointed lover',
    tags: 'Fates-wise, beautiful, passionate, magical',
    hpMax: 6,
    armor: '1 (shield)',
    damage: 'iron spear d6 (close, thrown)',
    instinct: 'to lack discretion',
    moves: ['Perform a divination', 'Speak a (dire) prophecy', 'Make a big deal about something'],
    cost: 'tenderness, respect',
    pickLines: [
      { key: 'pronoun', label: 'Pronoun', options: ['he', 'she', 'they', '___'] },
      { key: 'relationship', label: 'Relationship', options: ['betrothed', 'true love', 'ceremonial', 'complicated'] },
      { key: 'trait', label: 'Trait', options: ['contrary', 'dramatic', 'passionate', 'tormented'] },
    ],
    rites: ['blood', 'fire', 'sacred union'],
  },
  {
    value: 'seren',
    name: 'Seren the Eldest',
    tags: 'Exceptional, story-wise, insightful, frail, magical',
    hpMax: 3,
    armor: '0',
    damage: 'walking stick d4 (close)',
    instinct: 'to hew to tradition',
    moves: ['Consult the spirits, or abjure them', 'Spin a tale to make a point', 'Use shame and guilt as leverage'],
    cost: 'deference, good sense shown',
    pickLines: [
      { key: 'pronoun', label: 'Pronoun', options: ['he', 'she', 'they', '___'] },
      { key: 'standing', label: 'Standing', options: ['dismissed', 'pitied', 'feared', 'venerated'] },
      { key: 'trait', label: 'Trait', options: ['cagey', 'friendly but firm', 'imperious'] },
    ],
    rites: ['iron', 'secret naming', 'winter'],
  },
];

const RITES_ITEMS: Record<string, { id: string; label: string }[]> = Object.fromEntries(
  INITIATES.map((i) => [i.value, i.rites.map((r) => ({ id: r, label: r }))])
);

interface InitiateSectionProps {
  config: InitiateConfig;
  hp: string;
  loyalty: number;
  picks: Record<string, string>;
  rites: string;
  onHpChange: (value: string) => void;
  onLoyaltyChange: (n: number) => void;
  onPickChange: (lineKey: string, option: string) => void;
  onRitesChange: (value: string) => void;
}

const InitiateSection = memo(({
  config, hp, loyalty, picks, rites,
  onHpChange, onLoyaltyChange, onPickChange, onRitesChange,
}: InitiateSectionProps) => {
  const ritesChecked = Object.fromEntries(config.rites.map((r) => [r, rites === r]));

  const handleHpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onHpChange(e.target.value), [onHpChange]);
  const handleHpWheel = useCallback((e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(), []);

  const handlePickChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    onPickChange(e.currentTarget.dataset.lineKey!, e.currentTarget.value), [onPickChange]);

  const handleRitesChange = useCallback((id: string, checked: boolean) => onRitesChange(checked ? id : ''), [onRitesChange]);

  const handlePronounTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onPickChange('pronoun', '___');
    onPickChange('pronoun_text', e.target.value);
  }, [onPickChange]);

  const handlePronounFocus = useCallback(() => onPickChange('pronoun', '___'), [onPickChange]);

  return (
    <PlaybookSection title={config.name}>
      <div className={styles.bodyTop}>
        <div className={styles.hpBox}>
          <Input
            className={styles.hpInput}
            type="number"
            value={hp}
            min={0}
            max={config.hpMax}
            aria-label={`${config.name} current HP`}
            onChange={handleHpChange}
            onWheel={handleHpWheel}
          />
          <span className={styles.hpLabel}>HP (max {config.hpMax})</span>
        </div>
        <Text font="serif" color="muted" italic className={styles.tags}>{config.tags}</Text>
        <Text font="serif" color="muted" className={styles.stat}><strong>HP</strong> {config.hpMax} <strong>Armor</strong> {config.armor}</Text>
        <Text font="serif" color="muted" className={styles.stat}>
          <strong>Damage</strong> {config.damage}
        </Text>
        <Text font="serif" color="muted" className={styles.stat}>
          <strong>Instinct</strong> {config.instinct}
        </Text>
        <ul className={styles.moves}>
          {config.moves.map((m) => (
            <li key={m}>{parseInlineMarkdown(m)}</li>
          ))}
        </ul>
        <Text font="serif" color="muted" className={styles.stat}><strong>Cost</strong> {config.cost}</Text>
        <div className={styles.loyaltyRow}>
          <Text font="serif" color="muted" className={styles.stat}><strong>Loyalty</strong></Text>
          <UseDots total={3} checked={loyalty} onChange={onLoyaltyChange} />
        </div>
      </div>
      <div className={styles.rows}>
        <Text font="serif" color="muted" italic className={styles.pickInstruction}>Pick 1 on each line:</Text>
        {config.pickLines.map((line) => (
          <div key={line.key} className={styles.row}>
            <RadioGroup legend={line.label} legendHidden className={styles.options}>
              {line.options.filter((opt) => !(line.key === 'pronoun' && opt === '___')).map((opt) => (
                <Radio
                  key={opt}
                  name={`initiate-${config.value}-${line.key}`}
                  value={opt}
                  data-line-key={line.key}
                  checked={picks[line.key] === opt}
                  onChange={handlePickChange}
                  label={<span className={styles.pickLabel}>{opt}</span>}
                />
              ))}
            </RadioGroup>
            {line.key === 'pronoun' && (
              <Input
                className={styles.pronounInput}
                type="text"
                value={picks['pronoun_text'] ?? ''}
                onChange={handlePronounTextChange}
                onFocus={handlePronounFocus}
                aria-label="Custom pronoun"
                placeholder="___"
              />
            )}
          </div>
        ))}
        <div className={styles.row}>
          <div className={styles.options}>
            <span className={styles.stat}><strong>rites of…</strong></span>
            <CheckboxGroup
              items={RITES_ITEMS[config.value]}
              checked={ritesChecked}
              onChange={handleRitesChange}
              max={1}
            />
          </div>
        </div>
      </div>
    </PlaybookSection>
  );
});

type ParentHandlers = {
  onHpChange: (initiateValue: string, value: string) => void;
  onLoyaltyChange: (initiateValue: string, n: number) => void;
  onPickChange: (initiateValue: string, lineKey: string, option: string) => void;
  onRitesChange: (initiateValue: string, value: string) => void;
};

interface InitiateAdapterProps extends ParentHandlers {
  config: InitiateConfig;
  hp: string;
  loyalty: number;
  picks: Record<string, string>;
  rites: string;
}

const InitiateAdapter = ({
  config, hp, loyalty, picks, rites,
  onHpChange, onLoyaltyChange, onPickChange, onRitesChange,
}: InitiateAdapterProps) => {
  const { value } = config;
  const handleHp = useCallback((v: string) => onHpChange(value, v), [value, onHpChange]);
  const handleLoyalty = useCallback((n: number) => onLoyaltyChange(value, n), [value, onLoyaltyChange]);
  const handlePick = useCallback((lineKey: string, opt: string) => onPickChange(value, lineKey, opt), [value, onPickChange]);
  const handleRites = useCallback((v: string) => onRitesChange(value, v), [value, onRitesChange]);

  return (
    <InitiateSection
      config={config}
      hp={hp}
      loyalty={loyalty}
      picks={picks}
      rites={rites}
      onHpChange={handleHp}
      onLoyaltyChange={handleLoyalty}
      onPickChange={handlePick}
      onRitesChange={handleRites}
    />
  );
};

interface BlessedInitiatesOfDanuProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const BlessedInitiatesOfDanu = ({ data, onSave }: BlessedInitiatesOfDanuProps) => {
  const features = resolvePlaybookFeatures(data);
  const [hp, setHp] = useState<Record<string, string>>(() => features.initiateHp ?? {});
  const [loyalty, setLoyalty] = useState<Record<string, number>>(() => features.initiateLoyalty ?? {});
  const [picks, setPicks] = useState<Record<string, Record<string, string>>>(() => features.initiatePicks ?? {});
  const [rites, setRites] = useState<Record<string, string>>(() => features.initiateRites ?? {});

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.initiateHp !== undefined) setHp(f.initiateHp);
    if (f.initiateLoyalty !== undefined) setLoyalty(f.initiateLoyalty);
    if (f.initiatePicks !== undefined) setPicks(f.initiatePicks);
    if (f.initiateRites !== undefined) setRites(f.initiateRites);
  }, [data?.playbookFeatures]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useLatest(onSave);
  const dataRef = useLatest(data);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleHpChange = useCallback((initiateValue: string, value: string) => {
    setHp((prev) => {
      const next = { ...prev, [initiateValue]: value };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSaveRef.current(featurePatch(dataRef.current, { initiateHp: next })), 1000);
      return next;
    });
  }, []);

  const handleLoyaltyChange = useCallback((initiateValue: string, n: number) => {
    setLoyalty((prev) => {
      const next = { ...prev, [initiateValue]: n };
      onSaveRef.current(featurePatch(dataRef.current, { initiateLoyalty: next })).catch(() => {});
      return next;
    });
  }, []);

  const handlePickChange = useCallback((initiateValue: string, lineKey: string, option: string) => {
    setPicks((prev) => {
      const next = { ...prev, [initiateValue]: { ...(prev[initiateValue] ?? {}), [lineKey]: option } };
      onSaveRef.current(featurePatch(dataRef.current, { initiatePicks: next })).catch(() => {});
      return next;
    });
  }, []);

  const handleRitesChange = useCallback((initiateValue: string, value: string) => {
    setRites((prev) => {
      const next = { ...prev, [initiateValue]: value };
      onSaveRef.current(featurePatch(dataRef.current, { initiateRites: next })).catch(() => {});
      return next;
    });
  }, []);

  const chosen = data?.backgroundChoices ?? [];
  const visibleInitiates = INITIATES.filter((i) => chosen.includes(i.value));

  return (
    <div className={styles.grid}>
      {visibleInitiates.map((config) => (
        <InitiateAdapter
          key={config.value}
          config={config}
          hp={hp[config.value] ?? String(config.hpMax)}
          loyalty={loyalty[config.value] ?? 0}
          picks={picks[config.value] ?? {}}
          rites={rites[config.value] ?? ''}
          onHpChange={handleHpChange}
          onLoyaltyChange={handleLoyaltyChange}
          onPickChange={handlePickChange}
          onRitesChange={handleRitesChange}
        />
      ))}
    </div>
  );
};
