import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CheckboxGroup, Input, Radio, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import type { MoveDefinition } from '../../Move';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../marshal/useCrewSave';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './RevenantInsert.module.css';

const REVENANT_MOVES: MoveDefinition[] = [
  {
    id: 'revenant-unliving',
    name: 'Unliving',
    body: 'You do not breathe. You need not eat nor drink nor sleep. You do not heal normally. You gain no benefit from magical healing, Make Camp, Recover or Convalesce.',
  },
  {
    id: 'revenant-undying',
    name: 'Undying',
    body: [
      'Neither poison nor disease do you harm. You feel little pain. When you *take damage from cutting, stabbing, or crushing*, take half damage (after armor, rounded up).',
      'When you *are reduced to 0 HP*, roll +CON: **on a 10+**, regain half your max HP and choose 1; **on a 7-9**, regain half your max HP and choose 2; **on a 6-**, either regain 1 HP and all 3 apply, or give up this insert and gain the Ghost insert instead.',
      'If *your body is completely destroyed* (burnt to ash, ground to jelly, etc.), treat it as if you were reduced to 0 HP and rolled a 6-.',
    ],
    list: [
      'Mark a consequence',
      "You're out of the action until the next sunset",
      "Your body is permanently maimed in some way of the GM's choosing",
    ],
  },
  {
    id: 'revenant-implacable',
    name: 'Implacable',
    body: 'When you *push the limits of your undead body*, lose 1d4 HP and choose 1:',
    list: [
      'Perform a feat of inhuman strength',
      'Act with uncanny speed and grace',
      'Refuse to be moved, held back, or knocked off course',
    ],
  },
];

const INSTINCT_OPTIONS = [
  { value: 'denial', label: 'DENIAL', description: 'To refuse to accept that you are dead.' },
  { value: 'obsession', label: 'OBSESSION', description: 'To pursue your Terrible Purpose no matter what.' },
  { value: 'ennui', label: 'ENNUI', description: 'To bemoan your condition, to wish for release.' },
];

const PURPOSE_OPTIONS = [
  {
    value: 'longing',
    label: 'LONGING',
    namePrompt: 'Name the person or persons you refuse to let go of.',
    namePlaceholder: 'Name the person or persons…',
    triggers: [
      'When you *spend the night watching them*, regain all your HP or clear all your debilities.',
      'When they *genuinely return your affections*, free of fear or horror, either regain all your HP and clear your debilities, or clear a consequence.',
      'When they *rebuff you or recoil from you*, mark a consequence.',
      'When they *die peacefully and pass through the Last Door*, so do you.',
      'Should they be *taken from you violently*, mark the Final Consequence.',
    ],
  },
  {
    value: 'vengeance',
    label: 'VENGEANCE',
    namePrompt: 'Name the person or persons who must pay.',
    namePlaceholder: 'Name the person or persons…',
    triggers: [
      'When you *spend the night wailing, howling, and raging in a lonely place*, regain all your HP or clear all your debilities.',
      'When you *make one of them pay and ensure that they know why*, either regain all your HP and clear your debilities, or clear a consequence.',
      'When they *defeat or escape you*, mark a consequence.',
      'When you *kill the last of them*, pass through the Last Door.',
      'Should they *die before you\'re finished with them*, mark the Final Consequence.',
    ],
  },
  {
    value: 'duty',
    label: 'DUTY',
    namePrompt: 'Name the task you refuse to leave undone.',
    namePlaceholder: 'Name the task…',
    triggers: [
      'When you *spend the night working on your task*, regain all your HP or clear all your debilities.',
      'When you *achieve a significant milestone towards your task*, either regain all your HP and clear your debilities, or clear a consequence.',
      'When you *fail to perform your task or suffer a material setback*, mark a consequence.',
      'When the *task is finally complete*, pass through the Last Door.',
      'Should the *task become impossible to perform*, mark the Final Consequence.',
    ],
  },
];

const CONSEQUENCE_LABELS: { id: string; label: string }[] = [
  {
    id: 'breakdown',
    label: '**BREAKDOWN** — You lash out in an unthinking, unfeeling rage that lasts until the next sunrise. Ask the GM what snippets you remember.',
  },
  {
    id: 'unstable',
    label: '**UNSTABLE** *(Requires Breakdown)* — You are prone to episodes of unthinking, unfeeling rage. When you *roll a 6-*, the GM can choose to have you enter such a rage.',
  },
  {
    id: 'carrion-stench',
    label: '**CARRION STENCH** — You are followed always by a horrible odor. Natural beasts will shun you; even predators will avoid you and your companions.',
  },
  {
    id: 'deathly-visage',
    label: "**DEATHLY VISAGE** — It's clear to all who look upon you that you are dead. When you *use intimidation and your sinister appearance to Persuade*, you have advantage.",
  },
  {
    id: 'home-to-vermin',
    label: '**HOME TO VERMIN** — Bugs, moths, and other vermin have taken up residence in your corpse. Treat them as followers: *group, tiny, gross, meek, stealthy*; HP 1 each; Instinct: to get distracted; Cost: genuine affection.',
  },
  {
    id: 'nightkin',
    label: '**NIGHTKIN** — You can see clearly in even absolute darkness, though you see only in black and white and red. Sunlight blinds you, and direct sunlight burns your skin.',
  },
  {
    id: 'quarry',
    label: '**QUARRY** — The Pale Hunter has caught your scent. Expect a visit, soon.',
  },
  {
    id: 'strange-appetites',
    label: '**STRANGE APPETITES** — When you *consume your special fare*, heal damage equal to half your max HP or clear a debility.',
  },
  {
    id: 'insatiable',
    label: '**INSATIABLE** *(Requires Strange Appetites)* — When you *have the opportunity to indulge your Strange Appetites*, gain advantage on your next roll if you choose to do so, or Defy Danger if you choose not to.',
  },
  {
    id: 'final-consequence',
    label: '**THE FINAL CONSEQUENCE** — Your tenuous connection to humanity is lost and you become a monster under the GM\'s control.',
  },
];

const STRANGE_APPETITES_ID = 'strange-appetites';
const STRANGE_APPETITE_PICKS = [
  { id: 'blood', label: 'still-warm blood' },
  { id: 'marrow', label: 'bone & marrow' },
  { id: 'dying-breaths', label: 'dying breaths' },
  { id: 'brains', label: 'brains' },
  { id: 'rotting-meat', label: 'rotting meat' },
  { id: 'eyes', label: 'eyes' },
];

interface RevenantInsertProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RevenantInsert = ({ data, onSave }: RevenantInsertProps) => {
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);
  const features = resolvePlaybookFeatures(data);

  const [instinct, setInstinct] = useState<string>(() => features.revenantInstinct ?? '');
  const [purpose, setPurpose] = useState<string>(() => features.revenantPurpose ?? '');
  const [purposeNames, setPurposeNames] = useState<Record<string, string>>(
    () => features.revenantPurposeName ?? {},
  );
  const [consequences, setConsequences] = useState<Record<string, boolean>>(
    () => features.revenantConsequences ?? {},
  );

  const purposeNamesRef = useRef(purposeNames);
  purposeNamesRef.current = purposeNames;

  const [instinctCollapsed, setInstinctCollapsed] = useState(false);
  const hasInitInstinctCollapse = useRef(false);
  const [purposeCollapsed, setPurposeCollapsed] = useState(false);
  const hasInitPurposeCollapse = useRef(false);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.revenantInstinct !== undefined) setInstinct(f.revenantInstinct);
    if (f.revenantPurpose !== undefined) setPurpose(f.revenantPurpose);
    if (f.revenantPurposeName !== undefined) setPurposeNames(f.revenantPurposeName);
    if (f.revenantConsequences !== undefined) setConsequences(f.revenantConsequences);
  }, [data]);

  useEffect(() => {
    if (instinct && !hasInitInstinctCollapse.current) {
      hasInitInstinctCollapse.current = true;
      setInstinctCollapsed(true);
    }
  }, [instinct]);

  useEffect(() => {
    if (purpose && !hasInitPurposeCollapse.current) {
      hasInitPurposeCollapse.current = true;
      setPurposeCollapsed(true);
    }
  }, [purpose]);

  const handleToggleInstinctCollapse = useCallback(() => setInstinctCollapsed((v) => !v), []);
  const handleTogglePurposeCollapse = useCallback(() => setPurposeCollapsed((v) => !v), []);

  const handleInstinctChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInstinct(val);
    setInstinctCollapsed(true);
    saveImmediate({ revenantInstinct: val });
  }, [saveImmediate]);

  const handlePurposeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPurpose(val);
    setPurposeCollapsed(true);
    saveImmediate({ revenantPurpose: val });
  }, [saveImmediate]);

  const handlePurposeNameChange = useCallback((purposeValue: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPurposeNames((prev) => {
      const next = { ...prev, [purposeValue]: val };
      saveDebounced({ revenantPurposeName: next });
      return next;
    });
  }, [saveDebounced]);

  const handlePurposeNameBlur = useCallback(() => {
    flushDebounce({ revenantPurposeName: purposeNamesRef.current });
  }, [flushDebounce]);

  const handleConsequenceChange = useCallback((id: string, checked: boolean) => {
    setConsequences((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ revenantConsequences: next });
      return next;
    });
  }, [saveImmediate]);

  const handleAppetitePickChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConsequences((prev) => {
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([k]) => !k.startsWith('appetite:')),
      );
      const next = { ...cleaned, [`appetite:${val}`]: true };
      saveImmediate({ revenantConsequences: next });
      return next;
    });
  }, [saveImmediate]);

  const consequenceCheckboxItems = useMemo(
    () => CONSEQUENCE_LABELS.map((c) => ({ id: c.id, label: parseInlineMarkdown(c.label) })),
    [],
  );

  const hasStrangeAppetites = consequences[STRANGE_APPETITES_ID] === true;
  const currentAppetitePick = Object.keys(consequences).find((k) => k.startsWith('appetite:'))?.replace('appetite:', '') ?? '';

  const visibleInstincts = instinctCollapsed && instinct
    ? INSTINCT_OPTIONS.filter((o) => o.value === instinct)
    : INSTINCT_OPTIONS;

  const visiblePurposes = purposeCollapsed && purpose
    ? PURPOSE_OPTIONS.filter((p) => p.value === purpose)
    : PURPOSE_OPTIONS;

  return (
    <div className={styles.root}>
      <PlaybookSection
        title="Instinct"
        choose={1}
        chooseNote="replaces playbook instinct"
        warn={!instinct}
        collapsible={!!instinct}
        isCollapsed={instinctCollapsed}
        onToggleCollapse={handleToggleInstinctCollapse}
      >
        <div className={styles.radioList}>
          {visibleInstincts.map((opt) => (
            <Radio
              key={opt.value}
              className={styles.radioRow}
              name="revenant-instinct"
              value={opt.value}
              checked={instinct === opt.value}
              onChange={handleInstinctChange}
              label={
                <span className={styles.optionLabel}>
                  <strong className={styles.optionTitle}>{opt.label}</strong>
                  <span className={styles.optionDesc}>{opt.description}</span>
                </span>
              }
            />
          ))}
        </div>
      </PlaybookSection>

      <PlaybookSection title="Moves">
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          You gain all of the following:
        </Text>
        <div className={styles.moveList}>
          {REVENANT_MOVES.map((move) => (
            <Move key={move.id} move={move} />
          ))}
        </div>
      </PlaybookSection>

      <PlaybookSection
        title="Terrible Purpose"
        choose={1}
        warn={!purpose}
        collapsible={!!purpose}
        isCollapsed={purposeCollapsed}
        onToggleCollapse={handleTogglePurposeCollapse}
      >
        <div className={styles.purposeList}>
          {visiblePurposes.map((opt) => {
            const isSelected = purpose === opt.value;
            return (
              <div key={opt.value} className={styles.purposeEntry}>
                <Radio
                  className={styles.radioRow}
                  name="revenant-purpose"
                  value={opt.value}
                  checked={isSelected}
                  onChange={handlePurposeChange}
                  label={<strong className={styles.optionTitle}>{opt.label}</strong>}
                />
                {isSelected && (
                  <div className={styles.purposeDetail}>
                    <Input
                      className={styles.purposeNameInput}
                      type="text"
                      value={purposeNames[opt.value] ?? ''}
                      placeholder={opt.namePlaceholder}
                      aria-label={opt.namePrompt}
                      onChange={handlePurposeNameChange.bind(null, opt.value)}
                      onBlur={handlePurposeNameBlur}
                    />
                    <ul className={styles.triggerList}>
                      {opt.triggers.map((t) => (
                        <li key={t} className={styles.triggerItem}>
                          <Text as="span" size="sm" color="muted">{parseInlineMarkdown(t)}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PlaybookSection>

      <PlaybookSection title="Consequences" chooseNote="choose 1 to start; more as play demands">
        <CheckboxGroup
          items={consequenceCheckboxItems}
          checked={consequences}
          onChange={handleConsequenceChange}
        />
        {hasStrangeAppetites && (
          <div className={styles.appetiteSection}>
            <Text as="p" size="sm" color="muted" className={styles.appetitePrompt}>
              Strange Appetites — Pick 1:
            </Text>
            <div className={styles.appetiteGrid}>
              {STRANGE_APPETITE_PICKS.map((pick) => (
                <Radio
                  key={pick.id}
                  name="revenant-appetite"
                  value={pick.id}
                  checked={currentAppetitePick === pick.id}
                  onChange={handleAppetitePickChange}
                  label={<Text as="span" size="sm" color="muted">{pick.label}</Text>}
                />
              ))}
            </div>
          </div>
        )}
      </PlaybookSection>
    </div>
  );
};
