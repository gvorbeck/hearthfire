import { useCallback, memo } from 'react';
import { Text } from '@/components/ui';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import { usePlaybookChecked } from '@/hooks/usePlaybookChecked';
import { LIGHTBEARER_INVOCATIONS } from '@/lib/lightbearerInvocations';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { MoveDefinition, PlaybookSectionProps } from '@/types';
import styles from './LightbearerInvocations.module.css';

const INTRO_LINES = [
  "Lightbearer, you start knowing 2 Invocations. Each time you reach an even-numbered level, learn 1 new Invocation.",
  "While one Invocation is *ongoing*, you can't use another. You can end an Invocation whenever you wish, and it will end immediately if your holy light is extinguished. An Invocation's range is equal to that of its light source.",
];

interface InvocationMoveProps {
  inv: MoveDefinition;
  isChecked: boolean;
  onChange: (id: string, val: boolean) => void;
}

const InvocationMove = memo(({ inv, isChecked, onChange }: InvocationMoveProps) => {
  const handleChange = useCallback((val: boolean) => onChange(inv.id, val), [inv.id, onChange]);
  return (
    <Move
      move={inv}
      selection={{ selected: isChecked, onChange: handleChange }}
    />
  );
});

type LightbearerInvocationsProps = PlaybookSectionProps;

export const LightbearerInvocations = ({
  data,
  onSave,
}: LightbearerInvocationsProps) => {
  const { checked, handleChange } = usePlaybookChecked(
    data,
    onSave,
    'lightbearerInvocations',
  );

  const sorted = [
    ...LIGHTBEARER_INVOCATIONS.filter((inv) => checked[inv.id]),
    ...LIGHTBEARER_INVOCATIONS.filter((inv) => !checked[inv.id]),
  ];

  return (
    <PlaybookSection title="Invocations">
      <div className={styles.intro}>
        {INTRO_LINES.map((line) => (
          <Text key={line} font="serif" color="muted">{parseInlineMarkdown(line)}</Text>
        ))}
      </div>
      <div className={styles.grid}>
        {sorted.map((inv) => (
          <InvocationMove
            key={inv.id}
            inv={inv}
            isChecked={checked[inv.id] ?? false}
            onChange={handleChange}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
