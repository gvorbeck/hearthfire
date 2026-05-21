import clsx from 'clsx';
import { PlaybookSection } from '../../PlaybookSection';
import { Move } from '../../Move';
import { usePlaybookChecked } from '@/hooks/usePlaybookChecked';
import { LIGHTBEARER_INVOCATIONS } from '@/lib/lightbearerInvocations';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './LightbearerInvocations.module.css';

const INTRO_TEXT = 'You start knowing 2 Invocations. Each time you reach an even-numbered level, learn 1 new Invocation. While one Invocation is *ongoing*, you can\'t use another.';

interface LightbearerInvocationsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const LightbearerInvocations = ({ data, onSave }: LightbearerInvocationsProps) => {
  const { checked, handleChange } = usePlaybookChecked(data, onSave, 'lightbearerInvocations');

  const sorted = [
    ...LIGHTBEARER_INVOCATIONS.filter((inv) => checked[inv.id]),
    ...LIGHTBEARER_INVOCATIONS.filter((inv) => !checked[inv.id]),
  ];

  return (
    <PlaybookSection title="Invocations">
      <p className={styles.intro}>{parseInlineMarkdown(INTRO_TEXT)}</p>
      <div className={clsx(styles.grid)}>
        {sorted.map((inv) => (
          <Move
            key={inv.id}
            move={inv}
            selected={checked[inv.id] ?? false}
            onSelectChange={(val) => handleChange(inv.id, val)}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
