import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { useToast } from '@/components/app';
import { Input, Radio, RadioGroup, Text, CheckboxGroup } from '@/components/ui';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import { StatBox, LoyaltyRow } from '../shared/CrewWidgets';
import type { PlaybookSectionProps } from '@/types';
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

const EMPTY_PICKS: Record<string, string> = {};

interface InitiateSectionProps {
  config: InitiateConfig;
  hp: string;
  loyalty: number;
  picks: Record<string, string>;
  rites: string;
  onHpChange: (value: string) => void;
  onHpBlur: () => void;
  onLoyaltyChange: (n: number) => void;
  onPickChange: (lineKey: string, option: string) => void;
  onRitesChange: (value: string) => void;
}

const InitiateSection = memo(({
  config, hp, loyalty, picks, rites,
  onHpChange, onHpBlur, onLoyaltyChange, onPickChange, onRitesChange,
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
        <StatBox
          className={styles.hpBox}
          ariaLabel={`${config.name} current HP`}
          value={hp}
          inputProps={{ min: 0, max: config.hpMax }}
          onChange={handleHpChange}
          onBlur={onHpBlur}
          onWheel={handleHpWheel}
          label={`HP (max ${config.hpMax})`}
        />
        <Text font="serif" color="muted" italic className={styles.tags}>{config.tags}</Text>
        <Text font="serif" color="muted" className={styles.stat}>{`**HP** ${config.hpMax} **Armor** ${config.armor}`}</Text>
        <Text font="serif" color="muted" className={styles.stat}>{`**Damage** ${config.damage}`}</Text>
        <Text font="serif" color="muted" className={styles.stat}>{`**Instinct** ${config.instinct}`}</Text>
        <ul className={styles.moves}>
          {config.moves.map((m) => (
            <Text as="li" key={m}>{m}</Text>
          ))}
        </ul>
        <Text font="serif" color="muted" className={styles.stat}>{`**Cost** ${config.cost}`}</Text>
        <LoyaltyRow
          value={loyalty}
          onChange={onLoyaltyChange}
          label={<Text font="serif" color="muted" className={styles.stat}>**Loyalty**</Text>}
        />
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
                  label={<Text as="span" font="serif">{opt}</Text>}
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
            <Text as="span" className={styles.stat}>**rites of…**</Text>
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
  onHpBlur: () => void;
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
  onHpChange, onHpBlur, onLoyaltyChange, onPickChange, onRitesChange,
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
      onHpBlur={onHpBlur}
      onLoyaltyChange={handleLoyalty}
      onPickChange={handlePick}
      onRitesChange={handleRites}
    />
  );
};

type BlessedInitiatesOfDanuProps = PlaybookSectionProps;

export const BlessedInitiatesOfDanu = ({ data, onSave }: BlessedInitiatesOfDanuProps) => {
  const features = resolvePlaybookFeatures(data);
  const { addToast } = useToast();

  const [hp, setHp] = useState<Record<string, string>>(() => features.initiateHp ?? {});
  const [loyalty, setLoyalty] = useState<Record<string, number>>(() => features.initiateLoyalty ?? {});
  const [picks, setPicks] = useState<Record<string, Record<string, string>>>(() => features.initiatePicks ?? {});
  const [rites, setRites] = useState<Record<string, string>>(() => features.initiateRites ?? {});

  const hpRef = useLatest(hp);
  const loyaltyRef = useLatest(loyalty);
  const picksRef = useLatest(picks);
  const ritesRef = useLatest(rites);

  const lastFirestoreRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const incoming = JSON.stringify(data?.playbookFeatures);
    if (incoming === lastFirestoreRef.current) return;
    lastFirestoreRef.current = incoming;
    const f = resolvePlaybookFeatures(data);
    if (f.initiateHp !== undefined) setHp(f.initiateHp);
    if (f.initiateLoyalty !== undefined) setLoyalty(f.initiateLoyalty);
    if (f.initiatePicks !== undefined) setPicks(f.initiatePicks);
    if (f.initiateRites !== undefined) setRites(f.initiateRites);
  }, [data?.playbookFeatures]);

  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const handleHpChange = useCallback((initiateValue: string, value: string) => {
    const next = { ...hpRef.current, [initiateValue]: value };
    setHp(next);
    saveDebounced({ initiateHp: next }, () => addToast('Failed to save.', 'error'));
  }, [saveDebounced, addToast]);

  const handleHpBlur = useCallback(() => {
    flushDebounce({ initiateHp: hpRef.current }).catch(() => addToast('Failed to save.', 'error'));
  }, [flushDebounce, addToast]);

  const handleLoyaltyChange = useCallback((initiateValue: string, n: number) => {
    const prev = loyaltyRef.current;
    const next = { ...prev, [initiateValue]: n };
    setLoyalty(next);
    saveImmediate({ initiateLoyalty: next }).catch(() => { setLoyalty(prev); addToast('Failed to save.', 'error'); });
  }, [saveImmediate, addToast]);

  const handlePickChange = useCallback((initiateValue: string, lineKey: string, option: string) => {
    const prev = picksRef.current;
    const next = { ...prev, [initiateValue]: { ...(prev[initiateValue] ?? {}), [lineKey]: option } };
    setPicks(next);
    saveImmediate({ initiatePicks: next }).catch(() => { setPicks(prev); addToast('Failed to save.', 'error'); });
  }, [saveImmediate, addToast]);

  const handleRitesChange = useCallback((initiateValue: string, value: string) => {
    const prev = ritesRef.current;
    const next = { ...prev, [initiateValue]: value };
    setRites(next);
    saveImmediate({ initiateRites: next }).catch(() => { setRites(prev); addToast('Failed to save.', 'error'); });
  }, [saveImmediate, addToast]);

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
          picks={picks[config.value] ?? EMPTY_PICKS}
          rites={rites[config.value] ?? ''}
          onHpChange={handleHpChange}
          onHpBlur={handleHpBlur}
          onLoyaltyChange={handleLoyaltyChange}
          onPickChange={handlePickChange}
          onRitesChange={handleRitesChange}
        />
      ))}
    </div>
  );
};
