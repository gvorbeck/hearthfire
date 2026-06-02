import { useCallback, useMemo } from 'react';
import { InsertLayout } from '../shared/InsertLayout';
import { RadioSelect } from '../../sections/RadioSelect';
import type { MoveDefinition, CharacterData } from '@/types';

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
  { value: 'blood', label: 'still-warm blood' },
  { value: 'marrow', label: 'bone & marrow' },
  { value: 'dying-breaths', label: 'dying breaths' },
  { value: 'brains', label: 'brains' },
  { value: 'rotting-meat', label: 'rotting meat' },
  { value: 'eyes', label: 'eyes' },
];

const REVENANT_KEYS = {
  instinct: 'revenantInstinct',
  purpose: 'revenantPurpose',
  purposeName: 'revenantPurposeName',
} as const;

const isConsequenceDisabled = (id: string, checked: Record<string, boolean>) =>
  (id === INSATIABLE_ID && !checked[STRANGE_APPETITES_ID]) ||
  (id === 'unstable' && !checked['breakdown']);

interface StrangeAppetitesPickerProps {
  consequences: Record<string, boolean>;
  updateChecked: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}

const StrangeAppetitesPicker = ({ consequences, updateChecked }: StrangeAppetitesPickerProps) => {
  const currentPick = Object.keys(consequences)
    .find((k) => k.startsWith('appetite:'))
    ?.replace('appetite:', '') ?? '';

  const handleSave = useCallback(
    (patch: Partial<CharacterData>) => {
      const val = patch.instinct ?? '';
      updateChecked((prev) => {
        const next: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (!k.startsWith('appetite:')) next[k] = v;
        }
        if (val) next[`appetite:${val}`] = true;
        return next;
      });
      return Promise.resolve();
    },
    [updateChecked],
  );

  const radioData = useMemo(() => ({ instinct: currentPick, instinctCustom: '' } as CharacterData), [currentPick]);

  return (
    <RadioSelect
      playbookKey="revenant-appetite"
      title="Strange Appetites — Pick 1"
      options={STRANGE_APPETITE_PICKS}
      data={radioData}
      onSave={handleSave}
      noCustom
    />
  );
};

interface RevenantInsertProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RevenantInsert = ({ data, onSave }: RevenantInsertProps) => {
  const consequenceAddon = useCallback(({
    consequences,
    updateChecked,
  }: Parameters<NonNullable<React.ComponentProps<typeof InsertLayout>['consequenceAddon']>>[0]) => {
    if (!consequences[STRANGE_APPETITES_ID]) return null;
    return <StrangeAppetitesPicker consequences={consequences} updateChecked={updateChecked} />;
  }, []);

  return (
    <InsertLayout
      playbookName="revenant"
      data={data}
      onSave={onSave}
      sectionKeys={REVENANT_KEYS}
      moves={REVENANT_MOVES}
      consequenceKey="revenantConsequences"
      consequenceLabels={CONSEQUENCE_LABELS}
      isConsequenceDisabled={isConsequenceDisabled}
      consequenceAddon={consequenceAddon}
    />
  );
};
