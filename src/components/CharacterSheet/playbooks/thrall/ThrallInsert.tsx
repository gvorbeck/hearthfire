import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Button, Input, Text, useToast } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import type { MoveDefinition } from '../../Move';
import { RadioSelect } from '../../sections/RadioSelect';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { useTrackedField } from '../shared/useTrackedField';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './ThrallInsert.module.css';

const THRALL_INSTINCT_OPTIONS = [
  { value: 'fascination', label: 'FASCINATION', description: 'To explore your powers, your master, your new existence.' },
  { value: 'resistance', label: 'RESISTANCE', description: 'To struggle against your master and cling to your humanity.' },
  { value: 'shame', label: 'SHAME', description: 'To hide and deny your true nature.' },
];

const FAVOR_MOVE: MoveDefinition = {
  id: 'thrall-favor',
  name: 'Favor',
  uses: 3,
  usesLabel: 'Favor',
  body: [
    'Your Favor starts at 0 and can go no higher than 3. When you ***have 3 Favor and would gain another***, reduce your Favor to 0 and choose 1:',
  ],
  list: [
    'Ask a question of your master and gain advantage on your next roll to act on the answer.',
    "Gain a new Mark of your choice. Then ask the GM to choose a Mark that you don't have, and cross it off—you can never gain it.",
  ],
};

const URGES_MOVE: MoveDefinition = {
  id: 'thrall-urges',
  name: 'Urges',
  body: [
    'When ***the GM compels you to act on your impulse***, gain 1 Favor if you act as bidden. If you resist, roll +WIS: **on a 10+**, your actions are your own; **on a 7-9**, choose 1:',
  ],
  list: [
    'Struggle for control until someone or something snaps you out of it',
    'Start acting as compelled, putting yourself or an ally in a spot before you regain control',
    'Harm yourself (d6 damage, ignores armor) to regain control',
  ],
  footer: [
    'On a 6-, you come to your senses later, having done gods-know-what.',
    'When you ***act on your impulse without being compelled to do so***, and your actions cause you or your allies trouble, gain 1 Favor.',
  ],
};

const DARK_SUCCOR_MOVE: MoveDefinition = {
  id: 'thrall-dark-succor',
  name: 'Dark Succor',
  body: [
    "When you ***are dying or killed outright***, your master intercedes on your behalf. You will recover, here and now or at a time and place of the GM's choosing. Then, roll +Favor: **on a 10+**, choose 1; **on a 7-9**, choose 2; **on a 6-**, all 3 apply.",
  ],
  list: [
    "Gain a new Mark of the GM's choice",
    "Cross off a Mark that you don't have—you can never gain it",
    'Your master gives you a task; until you complete it, your Favor stays at 0.',
  ],
  footer: 'Regardless, reset your Favor to 0.',
};

const UNHOLY_VESSEL_MOVE: MoveDefinition = {
  id: 'thrall-unholy-vessel',
  name: 'Unholy Vessel',
  body: "When you ***would gain a Mark but there are none left to gain***, your humanity is utterly lost. You become a threat in the GM's control. Make a new character.",
};

const THRALL_MOVES: MoveDefinition[] = [
  FAVOR_MOVE,
  URGES_MOVE,
  DARK_SUCCOR_MOVE,
  UNHOLY_VESSEL_MOVE,
];

const IMPULSE_OPTIONS = [
  { value: 'impulse-conflict', label: 'Stoke conflict, confusion, distrust' },
  { value: 'impulse-erode', label: 'Erode hope/faith/honor/self-image' },
  { value: 'impulse-hide', label: 'Hide/bury/smother things or ideas' },
  { value: 'impulse-deprive', label: 'Deprive others of what they need' },
  { value: 'impulse-harm', label: 'Inflict harm, cruelly and unnecessarily' },
  { value: 'impulse-desecrate', label: 'Desecrate/mutilate/ruin things of value' },
  { value: 'impulse-shock', label: 'Shock/terrify/horrify others' },
];

const MARK_DEFINITIONS: MoveDefinition[] = [
  {
    id: 'festering-rot',
    name: 'A Festering Rot',
    selectable: true,
    body: [
      'You are unharmed by poison, disease, caustic substances, and vermin bites. Things in your presence rot, crack, corrode, and spoil.',
      'When you *roll doubles*, something on your person is ruined. The GM will tell you what, and how.',
    ],
  },
  {
    id: 'child-of-the-deeps',
    name: 'Child of the Deeps',
    selectable: true,
    body: [
      'Reduce your max HP by 2.',
      'You can breathe water and suffer no harm from cold or pressure. Your skin becomes squamous. When you *go a day without bathing*, mark a debility.',
      'While near a body of water, you can spend 1 Favor to call forth a slimy tentacle to do your bidding. Treat it as a follower: *stealthy, relentless*; HP 6; Damage d10 (*reach, forceful, grabby*); Instinct: to squeeze the life from things; Cost: lives drowned.',
    ],
  },
  {
    id: 'death-mask',
    name: 'Death Mask',
    selectable: true,
    body: [
      'You find or craft a horrid mask. When you *do not wear your mask*, you have disadvantage on all rolls.',
      'When you *wear your mask*, undead treat as one of their own.',
      'When you *wear your mask*, you can spend 1 Favor to fill any living thing that sees you with dread. They must choose: flee, cower, or stand fast. If they stand fast, you have advantage on your first roll against them.',
    ],
  },
  {
    id: 'quicksilver-dreams',
    name: 'Quicksilver Dreams',
    selectable: true,
    body: [
      'Reduce your max HP by 2.',
      'When you *Make Camp*, everyone with you suffers nightmares and has disadvantage on their next roll.',
      'You can spend 1 Favor to inflict false sensations upon someone, as long as you can see them.',
    ],
  },
  {
    id: 'ravenous',
    name: 'Ravenous',
    selectable: true,
    body: [
      'You are filled with unending hunger. Gain an extra impulse: "Wantonly devour flesh."',
      'When you *Make Camp*, consume an extra 1d4 provisions or uses of supplies.',
      'You can spend 1 Favor to:',
    ],
    list: [
      'Touch something. For as long as you hold it, everyone who sees it desires it.',
      'Gain a horrid, iron-rending maw (*hand*, 3 piercing, *messy*) for as long as you wish, and with it the ability to eat and digest anything.',
    ],
  },
  {
    id: 'red-wrath',
    name: 'Red Wrath',
    selectable: true,
    body: [
      'Reduce your max HP by 2. When *the GM compels you to violence*, you have disadvantage to resist.',
      'When you *let your fury fly and lash out at someone* (*hand, close*), spend 1-3 Favor and roll +Favor spent: **on a 10+**, deal 2d8 damage (*messy, forceful*) and shock, terrify, or impress any onlookers; **on a 7-9**, as a 10+ but you keep attacking your victim (or their corpse) in an unthinking rage, heedless of other danger.',
    ],
  },
  {
    id: 'shadows-cold-embrace',
    name: "Shadow's Cold Embrace",
    selectable: true,
    body: [
      'Reduce your max HP by 2. You cast no shadow and no reflection.',
      'When you *are exposed to sunlight or holy light*, you cannot spend Favor (for any reason).',
      'Otherwise you can spend 1 Favor to:',
    ],
    list: [
      'Remain unnoticed, even when under scrutiny or after doing something to draw attention.',
      'Leave no trace of your comings or goings',
      'Pass off a lie as an obvious, evident truth',
    ],
  },
  {
    id: 'speak-truth-whisper-secrets',
    name: 'Speak Truth, Whisper Secrets',
    selectable: true,
    body: [
      'Reduce your max HP by 2. Your tongue grows unusually long and your teeth become stained and jagged.',
      'You can spend 1 Favor to look someone in the eye and learn (pick 1):',
    ],
    list: [
      'What do they desire above all else?',
      'What secret shame do they bear?',
      'What is their greatest fear?',
      'What is their worst memory?',
    ],
    footer: ['When you *use the answer against them*, you have advantage.'],
  },
  {
    id: 'torments-blessing',
    name: "Torment's Blessing",
    selectable: true,
    body: [
      'Your wounds are slow to heal. When you *recover HP*, recover only half the amount that you should. But, you never need to Defy Danger due to pain, blood loss, and weakness due to wounds.',
      'When you *speak a word of torment*, name someone nearby, spend 1-3 Favor, and roll +Favor spent: **on a 10+**, they take 2d4 damage and are wracked with pain—lesser victims are incapacitated, and mighty foes are momentarily stunned; **on a 7-9**, they take 1d6 damage (ignores armor) and lesser victims are momentarily stunned.',
    ],
  },
];

interface MarkEntryProps {
  mark: MoveDefinition;
  gained: boolean;
  crossedOff: boolean;
  onGainedChange: (id: string, val: boolean) => void;
  onCrossedOffChange: (id: string) => void;
}

const MarkEntry = ({ mark, gained, crossedOff, onGainedChange, onCrossedOffChange }: MarkEntryProps) => {
  const handleSelectChange = useCallback((val: boolean) => onGainedChange(mark.id, val), [mark.id, onGainedChange]);
  const handleCrossOff = useCallback(() => onCrossedOffChange(mark.id), [mark.id, onCrossedOffChange]);
  const markCx = clsx(styles.markEntry, crossedOff && styles.markCrossedOff);
  const crossOffCx = clsx(styles.crossOffBtn, crossedOff && styles.crossOffBtnActive);
  return (
    <div className={markCx}>
      <Move
        move={mark}
        selection={{ selected: gained, onChange: handleSelectChange, readOnly: crossedOff }}
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            icon="close"
            className={crossOffCx}
            onClick={handleCrossOff}
            aria-pressed={crossedOff}
            aria-label={crossedOff ? `Restore mark: ${mark.name}` : `Cross off mark (can never gain): ${mark.name}`}
          />
        }
      />
    </div>
  );
};

interface ThrallInsertProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const ThrallInsert = ({ data, onSave }: ThrallInsertProps) => {
  const { addToast } = useToast();
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const init = resolvePlaybookFeatures(data);
  const { value: master, setValue: setMaster, handleChange: handleMasterChange, handleBlur: handleMasterBlur } =
    useTrackedField(init.thrallMaster ?? '', 'thrallMaster', saveDebounced, flushDebounce);
  const [favor, setFavor] = useState<number>(init.thrallFavor ?? 0);
  const [marksGained, setMarksGained] = useState<Record<string, boolean>>(init.thrallMarksGained ?? {});
  const [marksCrossedOff, setMarksCrossedOff] = useState<Record<string, boolean>>(init.thrallMarksCrossedOff ?? {});
  const [thrallInstinct, setThrallInstinct] = useState<string>(init.thrallInstinct ?? '');
  const [thrallImpulse, setThrallImpulse] = useState<string>(init.thrallImpulse ?? '');
  const [thrallImpulseCustom, setThrallImpulseCustom] = useState<string>(init.thrallImpulseCustom ?? '');

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.thrallMaster !== undefined) setMaster(f.thrallMaster);
    if (f.thrallFavor !== undefined) setFavor(f.thrallFavor);
    if (f.thrallMarksGained !== undefined) setMarksGained(f.thrallMarksGained);
    if (f.thrallMarksCrossedOff !== undefined) setMarksCrossedOff(f.thrallMarksCrossedOff);
    if (f.thrallInstinct !== undefined) setThrallInstinct(f.thrallInstinct);
    if (f.thrallImpulse !== undefined) setThrallImpulse(f.thrallImpulse);
    if (f.thrallImpulseCustom !== undefined) setThrallImpulseCustom(f.thrallImpulseCustom);
  }, [data, setMaster]);

  // RadioSelect writes to patch.instinct; remap to thrall-specific Firestore fields.
  const handleInstinctSave = useCallback(
    (patch: Partial<CharacterData>) => {
      const prev = thrallInstinct;
      setThrallInstinct(patch.instinct ?? '');
      return saveImmediate({ thrallInstinct: patch.instinct ?? '' }).catch(() => { setThrallInstinct(prev); addToast('Failed to save.'); });
    },
    [saveImmediate, thrallInstinct, addToast],
  );

  const handleImpulseSave = useCallback(
    (patch: Partial<CharacterData>) => {
      const prevImpulse = thrallImpulse; const prevCustom = thrallImpulseCustom;
      setThrallImpulse(patch.instinct ?? '');
      setThrallImpulseCustom(patch.instinctCustom ?? '');
      return saveImmediate({ thrallImpulse: patch.instinct ?? '', thrallImpulseCustom: patch.instinctCustom ?? '' })
        .catch(() => { setThrallImpulse(prevImpulse); setThrallImpulseCustom(prevCustom); addToast('Failed to save.'); });
    },
    [saveImmediate, thrallImpulse, thrallImpulseCustom, addToast],
  );

  const handleFavorChange = useCallback((count: number) => {
    setFavor((prev) => {
      saveImmediate({ thrallFavor: count }).catch(() => { setFavor(prev); addToast('Failed to save.'); });
      return count;
    });
  }, [saveImmediate, addToast]);

  const handleMarkGainedChange = useCallback((id: string, gained: boolean) => {
    setMarksGained((prev) => {
      const next = { ...prev, [id]: gained };
      saveImmediate({ thrallMarksGained: next }).catch(() => { setMarksGained(prev); addToast('Failed to save.'); });
      return next;
    });
  }, [saveImmediate, addToast]);

  const handleMarkCrossedOffChange = useCallback((id: string) => {
    setMarksCrossedOff((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveImmediate({ thrallMarksCrossedOff: next }).catch(() => { setMarksCrossedOff(prev); addToast('Failed to save.'); });
      return next;
    });
  }, [saveImmediate, addToast]);

  return (
    <div className={styles.root}>
      <PlaybookSection title="Your Master">
        <Text as="p" size="xs" color="muted" leading="normal">
          {parseInlineMarkdown('The Thing Below that you called upon? The one that plucked your soul from the Last Door and hides you from the Pale Hunter? It owns you now.')}
        </Text>
        <Input
          className={styles.masterInput}
          type="text"
          value={master}
          placeholder="Name your master, along with any titles that you know…"
          aria-label="Your master's name and titles"
          onChange={handleMasterChange}
          onBlur={handleMasterBlur}
        />
      </PlaybookSection>

      <RadioSelect
        playbookKey="thrall-instinct"
        title="Instinct"
        options={THRALL_INSTINCT_OPTIONS}
        data={{ instinct: thrallInstinct, instinctCustom: '' } as CharacterData}
        onSave={handleInstinctSave}
        noCustom
        chooseNote="replaces playbook instinct"
      />

      <RadioSelect
        playbookKey="thrall-impulse"
        title="Impulse"
        options={IMPULSE_OPTIONS}
        data={{ instinct: thrallImpulse, instinctCustom: thrallImpulseCustom } as CharacterData}
        onSave={handleImpulseSave}
        chooseNote="Ask the GM to choose 1, to represent your master's nature and will"
      />

      <PlaybookSection title="Moves">
        <Text as="p" size="xs" color="muted" leading="normal">
          You gain all of the following:
        </Text>
        <div className={styles.moveList}>
          {THRALL_MOVES.map((move) => (
            <Move
              key={move.id}
              move={move}
              uses={move.id === 'thrall-favor' ? { checked: favor, onChange: handleFavorChange } : undefined}
            />
          ))}
        </div>
      </PlaybookSection>

      <PlaybookSection title="Marks">
        <Text as="p" size="xs" color="muted" leading="normal">
          When you first gain this insert, the GM will choose 1 Mark for you, based on your master's nature. Gain more when a move tells you.
        </Text>
        <div className={styles.markList}>
          {MARK_DEFINITIONS.map((mark) => (
            <MarkEntry
              key={mark.id}
              mark={mark}
              gained={marksGained[mark.id] === true}
              crossedOff={marksCrossedOff[mark.id] === true}
              onGainedChange={handleMarkGainedChange}
              onCrossedOffChange={handleMarkCrossedOffChange}
            />
          ))}
        </div>
      </PlaybookSection>
    </div>
  );
};
