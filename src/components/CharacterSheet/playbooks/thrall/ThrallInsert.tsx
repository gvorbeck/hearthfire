import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { CheckboxGroup, Input, Radio, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import type { MoveDefinition } from '../../Move';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../shared/useCrewSave';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './ThrallInsert.module.css';

const THRALL_INSTINCT_OPTIONS = [
  { value: 'fascination', label: 'FASCINATION', description: 'To explore your powers, your master, your new existence.' },
  { value: 'resistance', label: 'RESISTANCE', description: 'To struggle against your master and cling to your humanity.' },
  { value: 'shame', label: 'SHAME', description: 'To hide and deny your true nature.' },
] as const;

const FAVOR_MOVE: MoveDefinition = {
  id: 'thrall-favor',
  name: 'Favor',
  uses: 3,
  usesLabel: 'Favor',
  body: [
    'Your Favor starts at 0 and can go no higher than 3. When you *have 3 Favor and would gain another*, reduce your Favor to 0 and choose 1:',
  ],
  list: [
    'Ask a question of your master and gain advantage on your next roll to act on the answer.',
    'Gain a new Mark of your choice. Then ask the GM to choose a Mark that you don\'t have, and cross it off—you can never gain it.',
  ],
};

const URGES_MOVE: MoveDefinition = {
  id: 'thrall-urges',
  name: 'Urges',
  body: [
    'When *the GM compels you to act on your impulse*, gain 1 Favor if you act as bidden. If you resist, roll +WIS: **on a 10+**, your actions are your own; **on a 7-9**, choose 1:',
  ],
  list: [
    'Struggle for control until someone or something snaps you out of it',
    'Start acting as compelled, putting yourself or an ally in a spot before you regain control',
    'Harm yourself (d6 damage, ignores armor) to regain control',
  ],
  footer: [
    'On a 6-, you come to your senses later, having done gods-know-what.',
    'When you *act on your impulse without being compelled to do so*, and your actions cause you or your allies trouble, gain 1 Favor.',
  ],
};

const DARK_SUCCOR_MOVE: MoveDefinition = {
  id: 'thrall-dark-succor',
  name: 'Dark Succor',
  body: [
    'When you *are dying or killed outright*, your master intercedes on your behalf. You will recover, here and now or at a time and place of the GM\'s choosing. Then, roll +Favor: **on a 10+**, choose 1; **on a 7-9**, choose 2; **on a 6-**, all 3 apply.',
  ],
  list: [
    'Gain a new Mark of the GM\'s choice',
    'Cross off a Mark that you don\'t have—you can never gain it',
    'Your master gives you a task; until you complete it, your Favor stays at 0.',
  ],
  footer: 'Regardless, reset your Favor to 0.',
};

const UNHOLY_VESSEL_MOVE: MoveDefinition = {
  id: 'thrall-unholy-vessel',
  name: 'Unholy Vessel',
  body: 'When you *would gain a Mark but there are none left to gain*, your humanity is utterly lost. You become a threat in the GM\'s control. Make a new character.',
};

const THRALL_MOVES: MoveDefinition[] = [
  FAVOR_MOVE,
  URGES_MOVE,
  DARK_SUCCOR_MOVE,
  UNHOLY_VESSEL_MOVE,
];

const IMPULSE_OPTIONS = [
  { id: 'impulse-conflict', label: 'Stoke conflict, confusion, distrust' },
  { id: 'impulse-erode', label: 'Erode hope/faith/honor/self-image' },
  { id: 'impulse-hide', label: 'Hide/bury/smother things or ideas' },
  { id: 'impulse-deprive', label: 'Deprive others of what they need' },
  { id: 'impulse-harm', label: 'Inflict harm, cruelly and unnecessarily' },
  { id: 'impulse-desecrate', label: 'Desecrate/mutilate/ruin things of value' },
  { id: 'impulse-shock', label: 'Shock/terrify/horrify others' },
] as const;

interface MarkDefinition {
  id: string;
  label: string;
  body: string | string[];
  list?: string[];
  footer?: string | string[];
  hpPenalty?: boolean;
}

const MARK_DEFINITIONS: MarkDefinition[] = [
  {
    id: 'festering-rot',
    label: 'A Festering Rot',
    body: [
      'You are unharmed by poison, disease, caustic substances, and vermin bites. Things in your presence rot, crack, corrode, and spoil.',
      'When you *roll doubles*, something on your person is ruined. The GM will tell you what, and how.',
    ],
  },
  {
    id: 'child-of-the-deeps',
    label: 'Child of the Deeps',
    hpPenalty: true,
    body: [
      'Reduce your max HP by 2.',
      'You can breathe water and suffer no harm from cold or pressure. Your skin becomes squamous. When you *go a day without bathing*, mark a debility.',
      'While near a body of water, you can spend 1 Favor to call forth a slimy tentacle to do your bidding. Treat it as a follower: *stealthy, relentless*; HP 6; Damage d10 (*reach, forceful, grabby*); Instinct: to squeeze the life from things; Cost: lives drowned.',
    ],
  },
  {
    id: 'death-mask',
    label: 'Death Mask',
    body: [
      'You find or craft a horrid mask. When you *do not wear your mask*, you have disadvantage on all rolls.',
      'When you *wear your mask*, undead treat as one of their own.',
      'When you *wear your mask*, you can spend 1 Favor to fill any living thing that sees you with dread. They must choose: flee, cower, or stand fast. If they stand fast, you have advantage on your first roll against them.',
    ],
  },
  {
    id: 'quicksilver-dreams',
    label: 'Quicksilver Dreams',
    hpPenalty: true,
    body: [
      'Reduce your max HP by 2.',
      'When you *Make Camp*, everyone with you suffers nightmares and has disadvantage on their next roll.',
      'You can spend 1 Favor to inflict false sensations upon someone, as long as you can see them.',
    ],
  },
  {
    id: 'ravenous',
    label: 'Ravenous',
    body: [
      'You are filled with unending hunger. Gain an extra impulse: "Wantonly devour flesh."',
      'When you *Make Camp*, consume an extra 1d4 provisions or uses of supplies.',
    ],
    list: [
      'Touch something. For as long as you hold it, everyone who sees it desires it.',
      'Gain a horrid, iron-rending maw (*hand*, 3 piercing, *messy*) for as long as you wish, and with it the ability to eat and digest anything.',
    ],
    footer: 'You can spend 1 Favor to:',
  },
  {
    id: 'red-wrath',
    label: 'Red Wrath',
    hpPenalty: true,
    body: [
      'Reduce your max HP by 2. When *the GM compels you to violence*, you have disadvantage to resist.',
      'When you *let your fury fly and lash out at someone* (*hand, close*), spend 1-3 Favor and roll +Favor spent: **on a 10+**, deal 2d8 damage (*messy, forceful*) and shock, terrify, or impress any onlookers; **on a 7-9**, as a 10+ but you keep attacking your victim (or their corpse) in an unthinking rage, heedless of other danger.',
    ],
  },
  {
    id: 'shadows-cold-embrace',
    label: "Shadow's Cold Embrace",
    hpPenalty: true,
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
    label: 'Speak Truth, Whisper Secrets',
    hpPenalty: true,
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
    footer: 'When you *use the answer against them*, you have advantage.',
  },
  {
    id: 'torments-blessing',
    label: "Torment's Blessing",
    body: [
      'Your wounds are slow to heal. When you *recover HP*, recover only half the amount that you should. But, you never need to Defy Danger due to pain, blood loss, and weakness due to wounds.',
      'When you *speak a word of torment*, name someone nearby, spend 1-3 Favor, and roll +Favor spent: **on a 10+**, they take 2d4 damage and are wracked with pain—lesser victims are incapacitated, and mighty foes are momentarily stunned; **on a 7-9**, they take 1d6 damage (ignores armor) and lesser victims are momentarily stunned.',
    ],
  },
];

interface ThrallInsertProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const ThrallInsert = ({ data, onSave }: ThrallInsertProps) => {
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const features = resolvePlaybookFeatures(data);

  const [master, setMaster] = useState<string>(() => features.thrallMaster ?? '');
  const [instinct, setInstinct] = useState<string>(() => features.thrallInstinct ?? '');
  const [impulse, setImpulse] = useState<string>(() => features.thrallImpulse ?? '');
  const [favor, setFavor] = useState<number>(() => features.thrallFavor ?? 0);
  const [marksGained, setMarksGained] = useState<Record<string, boolean>>(
    () => features.thrallMarksGained ?? {},
  );
  const [marksCrossedOff, setMarksCrossedOff] = useState<Record<string, boolean>>(
    () => features.thrallMarksCrossedOff ?? {},
  );

  const [instinctCollapsed, setInstinctCollapsed] = useState(false);
  const hasInitInstinctCollapse = useRef(false);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.thrallMaster !== undefined) setMaster(f.thrallMaster);
    if (f.thrallInstinct !== undefined) setInstinct(f.thrallInstinct);
    if (f.thrallImpulse !== undefined) setImpulse(f.thrallImpulse);
    if (f.thrallFavor !== undefined) setFavor(f.thrallFavor);
    if (f.thrallMarksGained !== undefined) setMarksGained(f.thrallMarksGained);
    if (f.thrallMarksCrossedOff !== undefined) setMarksCrossedOff(f.thrallMarksCrossedOff);
  }, [data]);

  useEffect(() => {
    if (instinct && !hasInitInstinctCollapse.current) {
      hasInitInstinctCollapse.current = true;
      setInstinctCollapsed(true);
    }
  }, [instinct]);

  const handleToggleInstinctCollapse = useCallback(() => setInstinctCollapsed((v) => !v), []);

  const handleMasterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaster(val);
    saveDebounced({ thrallMaster: val });
  }, [saveDebounced]);

  const handleMasterBlur = useCallback(() => {
    flushDebounce({ thrallMaster: master });
  }, [flushDebounce, master]);

  const handleInstinctChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInstinct(val);
    setInstinctCollapsed(true);
    saveImmediate({ thrallInstinct: val });
  }, [saveImmediate]);

  const handleImpulseChange = useCallback((id: string, checked: boolean) => {
    const next = checked ? id : '';
    setImpulse(next);
    saveImmediate({ thrallImpulse: next });
  }, [saveImmediate]);

  const handleFavorChange = useCallback((count: number) => {
    setFavor(count);
    saveImmediate({ thrallFavor: count });
  }, [saveImmediate]);

  const handleMarkGainedChange = useCallback((id: string, checked: boolean) => {
    setMarksGained((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ thrallMarksGained: next });
      return next;
    });
  }, [saveImmediate]);

  const handleMarkCrossedOffChange = useCallback((id: string, checked: boolean) => {
    setMarksCrossedOff((prev) => {
      const next = { ...prev, [id]: checked };
      saveImmediate({ thrallMarksCrossedOff: next });
      return next;
    });
  }, [saveImmediate]);

  const instinctVisible = instinctCollapsed && instinct
    ? THRALL_INSTINCT_OPTIONS.filter((o) => o.value === instinct)
    : THRALL_INSTINCT_OPTIONS;

  const impulseCheckboxItems = useMemo(
    () => IMPULSE_OPTIONS.map((opt) => ({
      id: opt.id,
      label: <span>{opt.label}</span>,
      disabled: impulse !== '' && impulse !== opt.id,
    })),
    [impulse],
  );

  return (
    <div className={styles.root}>
      <PlaybookSection title="Your Master">
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          The Thing Below that you called upon? The one that plucked your soul from the Last Door
          and hides you from the Pale Hunter? It owns you now.
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
          {instinctVisible.map((opt) => (
            <Radio
              key={opt.value}
              className={styles.radioRow}
              name="thrall-instinct"
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

      <PlaybookSection title="Impulse" chooseNote="GM chooses 1">
        <CheckboxGroup
          items={impulseCheckboxItems}
          checked={{ [impulse]: true }}
          onChange={handleImpulseChange}
        />
      </PlaybookSection>

      <PlaybookSection title="Moves">
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          You gain all of the following:
        </Text>
        <div className={styles.moveList}>
          {THRALL_MOVES.map((move) => (
            <Move
              key={move.id}
              move={move}
              usesChecked={move.id === 'thrall-favor' ? favor : undefined}
              onUsesChange={move.id === 'thrall-favor' ? handleFavorChange : undefined}
            />
          ))}
        </div>
      </PlaybookSection>

      <PlaybookSection title="Marks" chooseNote="GM chooses 1 to start; more as moves tell you">
        <div className={styles.markList}>
          {MARK_DEFINITIONS.map((mark) => {
            const gained = marksGained[mark.id] === true;
            const crossedOff = marksCrossedOff[mark.id] === true;
            const markCx = clsx(styles.markEntry, crossedOff && styles.markCrossedOff);
            const bodyParagraphs = Array.isArray(mark.body) ? mark.body : [mark.body];
            const footerParagraphs = mark.footer
              ? Array.isArray(mark.footer) ? mark.footer : [mark.footer]
              : [];
            return (
              <div key={mark.id} className={markCx}>
                <div className={styles.markHeader}>
                  <label className={styles.markGainedLabel}>
                    <input
                      type="checkbox"
                      className={styles.markCheckbox}
                      checked={gained}
                      disabled={crossedOff}
                      onChange={(e) => handleMarkGainedChange(mark.id, e.target.checked)}
                      aria-label={`Mark gained: ${mark.label}`}
                    />
                    <strong className={styles.markName}>{mark.label}</strong>
                  </label>
                  <button
                    type="button"
                    className={clsx(styles.crossOffBtn, crossedOff && styles.crossOffBtnActive)}
                    onClick={() => handleMarkCrossedOffChange(mark.id, !crossedOff)}
                    aria-pressed={crossedOff}
                    aria-label={crossedOff ? `Restore mark: ${mark.label}` : `Cross off mark (can never gain): ${mark.label}`}
                  >
                    ✕
                  </button>
                </div>
                {!crossedOff && (
                  <div className={styles.markBody}>
                    {bodyParagraphs.map((p, i) => (
                      <p key={i} className={styles.markProse}>{parseInlineMarkdown(p)}</p>
                    ))}
                    {mark.list && (
                      <ul className={styles.markBulletList}>
                        {mark.list.map((item, i) => (
                          <li key={i} className={styles.markBulletItem}>
                            <Text as="span" size="sm" color="muted">{parseInlineMarkdown(item)}</Text>
                          </li>
                        ))}
                      </ul>
                    )}
                    {footerParagraphs.map((p, i) => (
                      <p key={i} className={styles.markProse}>{parseInlineMarkdown(p)}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PlaybookSection>
    </div>
  );
};
