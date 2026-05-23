import { useCallback } from 'react';
import { CheckboxGroup, Radio, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import type { MoveDefinition } from '../../Move';
import { useInsertSections } from '../shared/useInsertSections';
import { useConsequenceCheckboxes } from '../shared/useConsequenceCheckboxes';
import { InsertInstinctSection, InsertPurposeSection } from '../shared/InsertSections';
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
const INSATIABLE_ID = 'insatiable';
const STRANGE_APPETITE_PICKS = [
  { id: 'blood', label: 'still-warm blood' },
  { id: 'marrow', label: 'bone & marrow' },
  { id: 'dying-breaths', label: 'dying breaths' },
  { id: 'brains', label: 'brains' },
  { id: 'rotting-meat', label: 'rotting meat' },
  { id: 'eyes', label: 'eyes' },
];

const REVENANT_KEYS = {
  instinct: 'revenantInstinct',
  purpose: 'revenantPurpose',
  purposeName: 'revenantPurposeName',
} as const;

interface RevenantInsertProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RevenantInsert = ({ data, onSave }: RevenantInsertProps) => {
  const {
    instinct, purpose, purposeNames,
    instinctCollapsed, purposeCollapsed,
    handleToggleInstinctCollapse, handleTogglePurposeCollapse,
    handleInstinctChange, handlePurposeChange,
    handlePurposeNameChange, handlePurposeNameBlur,
    saveImmediate,
  } = useInsertSections(data, onSave, REVENANT_KEYS);

  const isConsequenceDisabled = useCallback((id: string, checked: Record<string, boolean>) =>
    (id === INSATIABLE_ID && !checked[STRANGE_APPETITES_ID]) ||
    (id === 'unstable' && !checked['breakdown']),
  []);

  const {
    checked: consequences,
    items: consequenceCheckboxItems,
    onChange: handleConsequenceChange,
    updateChecked,
  } = useConsequenceCheckboxes(
    data,
    saveImmediate,
    'revenantConsequences',
    CONSEQUENCE_LABELS,
    isConsequenceDisabled,
  );

  const handleAppetitePickChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateChecked((prev) => {
      const next: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!k.startsWith('appetite:')) next[k] = v;
      }
      next[`appetite:${val}`] = true;
      return next;
    });
  }, [updateChecked]);

  const hasStrangeAppetites = consequences[STRANGE_APPETITES_ID] === true;

  const currentAppetitePick = Object.keys(consequences).find((k) => k.startsWith('appetite:'))?.replace('appetite:', '') ?? '';

  return (
    <div className={styles.root}>
      <InsertInstinctSection
        radioName="revenant-instinct"
        instinct={instinct}
        instinctCollapsed={instinctCollapsed}
        onToggleCollapse={handleToggleInstinctCollapse}
        onChange={handleInstinctChange}
      />

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

      <InsertPurposeSection
        radioName="revenant-purpose"
        purpose={purpose}
        purposeNames={purposeNames}
        purposeCollapsed={purposeCollapsed}
        onToggleCollapse={handleTogglePurposeCollapse}
        onPurposeChange={handlePurposeChange}
        onNameChange={handlePurposeNameChange}
        onNameBlur={handlePurposeNameBlur}
      />

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
