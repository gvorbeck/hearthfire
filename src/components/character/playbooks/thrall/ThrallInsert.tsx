import { useCallback } from 'react';
import clsx from 'clsx';
import { Button, Input, Text } from '@/components/ui';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import { RadioSelect } from '../../sections/RadioSelect';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { usePlaybookField } from '@/hooks/usePlaybookField';
import { useCrewSave } from '../shared/useCrewSave';
import { useTrackedField } from '../shared/useTrackedField';
import type { CharacterData, MoveDefinition, PlaybookSectionProps } from '@/types';
import { THRALL_MOVES, THRALL_MARK_DEFINITIONS } from '@/lib/moves/inserts';
import styles from './ThrallInsert.module.css';

const THRALL_INSTINCT_OPTIONS = [
  { value: 'fascination', label: 'FASCINATION', description: 'To explore your powers, your master, your new existence.' },
  { value: 'resistance', label: 'RESISTANCE', description: 'To struggle against your master and cling to your humanity.' },
  { value: 'shame', label: 'SHAME', description: 'To hide and deny your true nature.' },
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

interface MarkEntryProps {
  mark: MoveDefinition;
  gained: boolean;
  crossedOff: boolean;
  onGainedChange: (id: string, val: boolean) => void;
  onCrossedOffChange: (id: string) => void;
}

// Marks have a single select box (leftControl 1, no take boxes), so onTakesChange is never invoked.
const noop = () => {};

const MarkEntry = ({ mark, gained, crossedOff, onGainedChange, onCrossedOffChange }: MarkEntryProps) => {
  const handleSelectChange = useCallback((val: boolean) => onGainedChange(mark.id, val), [mark.id, onGainedChange]);
  const handleCrossOff = useCallback(() => onCrossedOffChange(mark.id), [mark.id, onCrossedOffChange]);
  const markCx = clsx(styles.markEntry, crossedOff && styles.markCrossedOff);
  const crossOffCx = clsx(styles.crossOffBtn, crossedOff && styles.crossOffBtnActive);
  return (
    <div className={markCx}>
      <Move
        title={mark.name}
        move={mark}
        selection={{ selected: gained, onSelectChange: handleSelectChange, readOnly: crossedOff, takesChecked: 0, onTakesChange: noop }}
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

type ThrallInsertProps = PlaybookSectionProps;

export const ThrallInsert = ({ data, onSave }: ThrallInsertProps) => {
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);

  const init = resolvePlaybookFeatures(data);
  const { value: master, handleChange: handleMasterChange, handleBlur: handleMasterBlur } =
    useTrackedField(init.thrallMaster ?? '', 'thrallMaster', saveDebounced, flushDebounce);

  const { value: favor, save: saveFavor } = useOptimisticField(
    init.thrallFavor ?? 0,
    (next) => onSave(featurePatch(data, { thrallFavor: next })),
    'Failed to save.',
  );
  const { value: marksGained, ref: marksGainedRef, save: saveMarksGained } = useOptimisticField(
    init.thrallMarksGained ?? {},
    (next) => onSave(featurePatch(data, { thrallMarksGained: next })),
    'Failed to save.',
  );
  const { value: marksCrossedOff, ref: marksCrossedOffRef, save: saveMarksCrossedOff } = useOptimisticField(
    init.thrallMarksCrossedOff ?? {},
    (next) => onSave(featurePatch(data, { thrallMarksCrossedOff: next })),
    'Failed to save.',
  );
  const { value: thrallInstinct, save: saveThrallInstinct } = usePlaybookField('thrallInstinct', init.thrallInstinct ?? '', saveImmediate, 'Failed to save.');
  const { value: thrallImpulse, ref: thrallImpulseRef, setValue: setThrallImpulse, pendingRef: thrallImpulsePendingRef } = usePlaybookField('thrallImpulse', init.thrallImpulse ?? '', saveImmediate, 'Failed to save.');
  const { value: thrallImpulseCustom, ref: thrallImpulseCustomRef, setValue: setThrallImpulseCustom, pendingRef: thrallImpulseCustomPendingRef } = usePlaybookField('thrallImpulseCustom', init.thrallImpulseCustom ?? '', saveImmediate, 'Failed to save.');

  // RadioSelect writes to patch.instinct; remap to thrall-specific Firestore fields.
  const handleInstinctSave = useCallback(
    (patch: Partial<CharacterData>) => { saveThrallInstinct(patch.instinct ?? ''); return Promise.resolve(); },
    [saveThrallInstinct],
  );

  const handleImpulseSave = useCallback(
    (patch: Partial<CharacterData>) => {
      const prevImpulse = thrallImpulseRef.current;
      const prevCustom = thrallImpulseCustomRef.current;
      thrallImpulsePendingRef.current = true;
      thrallImpulseCustomPendingRef.current = true;
      setThrallImpulse(patch.instinct ?? '');
      setThrallImpulseCustom(patch.instinctCustom ?? '');
      return saveImmediate({ thrallImpulse: patch.instinct ?? '', thrallImpulseCustom: patch.instinctCustom ?? '' })
        .catch(() => { setThrallImpulse(prevImpulse); setThrallImpulseCustom(prevCustom); })
        .finally(() => { thrallImpulsePendingRef.current = false; thrallImpulseCustomPendingRef.current = false; });
    },
    [saveImmediate, setThrallImpulse, setThrallImpulseCustom, thrallImpulsePendingRef, thrallImpulseCustomPendingRef],
  );

  const handleFavorChange = useCallback((count: number) => {
    saveFavor(count);
  }, [saveFavor]);

  const handleMarkGainedChange = useCallback((id: string, gained: boolean) => {
    saveMarksGained({ ...marksGainedRef.current, [id]: gained });
  }, [saveMarksGained]);

  const handleMarkCrossedOffChange = useCallback((id: string) => {
    const prev = marksCrossedOffRef.current;
    saveMarksCrossedOff({ ...prev, [id]: !prev[id] });
  }, [saveMarksCrossedOff]);

  return (
    <div className={styles.root}>
      <PlaybookSection title="Your Master">
        <Text size="xs" color="muted" leading="normal">
          The Thing Below that you called upon? The one that plucked your soul from the Last Door and hides you from the Pale Hunter? It owns you now.
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
        <Text size="xs" color="muted" leading="normal">
          You gain all of the following:
        </Text>
        <div className={styles.moveList}>
          {THRALL_MOVES.map((move) => (
            <Move
              key={move.id}
              title={move.name}
              move={move}
              defaultChecked
              rightControlState={move.id === 'thrall-favor' ? [{ checked: favor, onChange: handleFavorChange }] : undefined}
            />
          ))}
        </div>
      </PlaybookSection>

      <PlaybookSection title="Marks">
        <Text size="xs" color="muted" leading="normal">
          When you first gain this insert, the GM will choose 1 Mark for you, based on your master's nature. Gain more when a move tells you.
        </Text>
        <div className={styles.markList}>
          {THRALL_MARK_DEFINITIONS.map((mark) => (
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
