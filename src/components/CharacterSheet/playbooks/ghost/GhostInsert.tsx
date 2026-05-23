import { useState, useEffect, useCallback } from 'react';
import { CheckboxGroup, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import type { MoveDefinition } from '../../Move';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useInsertSections } from '../shared/useInsertSections';
import { useConsequenceCheckboxes } from '../shared/useConsequenceCheckboxes';
import { InsertInstinctSection, InsertPurposeSection } from '../shared/InsertSections';
import type { CharacterData } from '@/types';
import styles from './GhostInsert.module.css';

const POLTERGEIST_MOVE: MoveDefinition = {
  id: 'ghost-poltergeist-fury',
  name: 'Poltergeist — Fury',
  uses: 4,
  usesLabel: 'Fury',
  body: 'Spend Fury, 1-for-1, to:',
  list: [
    'Shatter, break, or destroy a number of small mundane objects, or one big object.',
    'Hurl an object at someone and roll +DEX: **on a 10+**, deal your damage (*forceful*); **on a 7-9**, deal your damage (*forceful*) but lose 1d4 HP.',
    'Attack someone with telekinetic force and roll +INT: **on a 10+**, fling them to a place you can see and pin them there, spending 1 HP each time they make a committed effort to break free; **on a 7-9**, as 10+, but you also lose 1d4 HP.',
  ],
};

const GHOST_MOVES: MoveDefinition[] = [
  {
    id: 'ghost-unliving',
    name: 'Unliving',
    body: 'You do not breathe. You need not eat nor drink nor sleep. You do not heal normally. You gain no benefit from magical healing, Make Camp, Recover or Convalesce.',
  },
  {
    id: 'ghost-disembodied',
    name: 'Disembodied',
    body: [
      'Your body is dead and gone, but you persist as a spirit. You can be harmed only by silver, salt, or that which harms spirits or ghosts.',
      'You normally go unseen, with the barest influence on the material world and a dim, distorted sense of reality. When you *manifest a ghostly presence in shadows or darkness*, the world becomes clear and pick 1. For each additional option you pick, lose 1d4 HP:',
      'You remain manifest for as long as you concentrate; pain or shock or direct sunlight threaten your concentration, for sure.',
    ],
    list: [
      'You appear solid and whole, much as you did in life',
      'You can speak clearly and intelligibly',
      'Your touch (or ghostly weapons) can harm the living (ignores armor)',
    ],
  },
  {
    id: 'ghost-tethered',
    name: 'Tethered',
    body: [
      'Choose something to which you are bound: your mortal remains, the place where you died, an object of personal significance, etc.',
      'When you *are reduced to 0 HP*, mark a consequence and your essence disperses until the next sunset. You reform near your tether with half your max HP. If your tether has been destroyed, mark the Final Consequence.',
    ],
  },
];

const CONSEQUENCE_LABELS: { id: string; label: string; requiresId?: string }[] = [
  {
    id: 'bodysnatcher',
    label: '**BODYSNATCHER** — When you *possess an unconscious or willing person*, lose 1d4 HP and control their actions.',
  },
  {
    id: 'breakdown',
    label: '**BREAKDOWN** — You lash out in an unthinking, unfeeling rage that lasts until the next sunrise. Ask the GM what snippets you remember.',
  },
  {
    id: 'disturbing',
    label: '**DISTURBING** — Your presence (even unseen) disturbs beasts and children. The air around you is notably cooler, especially when you manifest. When you *use intimidation and your disturbing presence to Persuade*, you have advantage.',
  },
  {
    id: 'otherworldly',
    label: '**OTHERWORLDLY** — When you *manifest a ghostly form*, strange things happen: statues weep, rocks bleed, plants wither, water pools on ceilings, etc.',
  },
  {
    id: 'poltergeist',
    label: '**POLTERGEIST** — When you *get angry*, lose 1d4 HP and hold that much Fury. Spend Fury, 1-for-1, to shatter objects, hurl things, or attack with telekinetic force.',
  },
  {
    id: 'quarry',
    label: '**QUARRY** — The Pale Hunter has caught your scent. Expect a visit, soon.',
  },
  {
    id: 'specter',
    label: '**SPECTER** — When you *terrify a living person, someone who is unconnected to your Terrible Purpose*, regain 1d8 HP or clear a debility of your choice.',
  },
  {
    id: 'unstable',
    label: '**UNSTABLE** *(Requires Breakdown)* — You are prone to episodes of unthinking, unfeeling rage (as per Breakdown). When you *roll a 6-*, the GM can choose to have you enter such a rage.',
    requiresId: 'breakdown',
  },
  {
    id: 'final-consequence',
    label: "**THE FINAL CONSEQUENCE** — Your tenuous connection to humanity is lost and you become a monster under the GM's control.",
  },
];

const POLTERGEIST_ID = 'poltergeist';
const BREAKDOWN_ID = 'breakdown';
const UNSTABLE_ID = 'unstable';

const GHOST_KEYS = {
  instinct: 'ghostInstinct',
  purpose: 'ghostPurpose',
  purposeName: 'ghostPurposeName',
} as const;

interface GhostInsertProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const GhostInsert = ({ data, onSave }: GhostInsertProps) => {
  const {
    instinct, purpose, purposeNames,
    instinctCollapsed, purposeCollapsed,
    handleToggleInstinctCollapse, handleTogglePurposeCollapse,
    handleInstinctChange, handlePurposeChange,
    handlePurposeNameChange, handlePurposeNameBlur,
    saveImmediate,
  } = useInsertSections(data, onSave, GHOST_KEYS);

  const [furyChecked, setFuryChecked] = useState<number>(
    () => resolvePlaybookFeatures(data).ghostPoltergeistFury ?? 0,
  );

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.ghostPoltergeistFury !== undefined) setFuryChecked(f.ghostPoltergeistFury);
  }, [data]);

  const isConsequenceDisabled = useCallback((id: string, checked: Record<string, boolean>) =>
    id === UNSTABLE_ID && !checked[BREAKDOWN_ID],
  []);

  const {
    checked: consequences,
    items: consequenceCheckboxItems,
    onChange: handleConsequenceChange,
  } = useConsequenceCheckboxes(
    data,
    saveImmediate,
    'ghostConsequences',
    CONSEQUENCE_LABELS,
    isConsequenceDisabled,
  );

  const handleFuryChange = useCallback((count: number) => {
    setFuryChecked(count);
    saveImmediate({ ghostPoltergeistFury: count });
  }, [saveImmediate]);

  const hasPoltergeist = consequences[POLTERGEIST_ID] === true;

  return (
    <div className={styles.root}>
      <InsertInstinctSection
        radioName="ghost-instinct"
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
          {GHOST_MOVES.map((move) => (
            <Move key={move.id} move={move} />
          ))}
        </div>
      </PlaybookSection>

      <InsertPurposeSection
        radioName="ghost-purpose"
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
          itemGap="md"
        />
        {hasPoltergeist && (
          <div className={styles.furySection}>
            <Move
              move={POLTERGEIST_MOVE}
              usesChecked={furyChecked}
              onUsesChange={handleFuryChange}
            />
          </div>
        )}
      </PlaybookSection>
    </div>
  );
};
