import { useCallback } from 'react';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { Move } from '../../Move';
import type { MoveDefinition, PlaybookSectionProps } from '@/types';
import { InsertLayout } from '../shared/InsertLayout';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { GHOST_MOVES, GHOST_CONSEQUENCE_LABELS } from '@/lib/moves/inserts';
import styles from './GhostInsert.module.css';

const POLTERGEIST_MOVE: MoveDefinition = {
  id: 'ghost-poltergeist-fury',
  name: 'Poltergeist — Fury',
  rightControl: [{ type: 'dot', number: 4, label: 'Fury' }],
  body: [
    { kind: 'para', text: 'Spend Fury, 1-for-1, to:' },
    { kind: 'list', items: [
      'Shatter, break, or destroy a number of small mundane objects, or one big object.',
      'Hurl an object at someone and roll +DEX: **on a 10+**, deal your damage (*forceful*); **on a 7-9**, deal your damage (*forceful*) but lose 1d4 HP.',
      'Attack someone with telekinetic force and roll +INT: **on a 10+**, fling them to a place you can see and pin them there, spending 1 HP each time they make a committed effort to break free; **on a 7-9**, as 10+, but you also lose 1d4 HP.',
    ] },
  ],
};

const GHOST_KEYS = {
  instinct: 'ghostInstinct',
  purpose: 'ghostPurpose',
  purposeName: 'ghostPurposeName',
} as const;

const POLTERGEIST_ID = 'poltergeist';
const BREAKDOWN_ID = 'breakdown';
const UNSTABLE_ID = 'unstable';

const isConsequenceDisabled = (id: string, checked: Record<string, boolean>) =>
  id === UNSTABLE_ID && !checked[BREAKDOWN_ID];

type GhostInsertProps = PlaybookSectionProps;

export const GhostInsert = ({ data, onSave }: GhostInsertProps) => {
  const { value: furyChecked, save: saveFury } = useOptimisticField(
    resolvePlaybookFeatures(data).ghostPoltergeistFury ?? 0,
    (next) => onSave(featurePatch(data, { ghostPoltergeistFury: next })),
    'Failed to save.',
  );

  const consequenceAddon = useCallback(({
    consequences,
  }: Parameters<NonNullable<React.ComponentProps<typeof InsertLayout>['consequenceAddon']>>[0]) => {
    if (!consequences[POLTERGEIST_ID]) return null;
    return (
      <div className={styles.furySection}>
        <Move
          title={POLTERGEIST_MOVE.name}
          move={POLTERGEIST_MOVE}
          defaultChecked
          rightControlState={[{ checked: furyChecked, onChange: saveFury }]}
        />
      </div>
    );
  }, [furyChecked, saveFury]);

  return (
    <InsertLayout
      playbookName="ghost"
      data={data}
      onSave={onSave}
      sectionKeys={GHOST_KEYS}
      moves={GHOST_MOVES}
      consequenceKey="ghostConsequences"
      consequenceLabels={GHOST_CONSEQUENCE_LABELS}
      isConsequenceDisabled={isConsequenceDisabled}
      consequenceAddon={consequenceAddon}
      checkboxGroupItemGap="md"
    />
  );
};
