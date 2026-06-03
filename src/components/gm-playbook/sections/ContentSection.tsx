import { useState, useCallback, useEffect } from 'react';
import { Text, Input } from '@/components/ui';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import type { ContentLists } from '@/types';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

interface ContentSectionProps {
  content: ContentLists | undefined;
  onSave: (field: keyof ContentLists, value: string) => Promise<void>;
}

const useContentField = (
  initial: string,
  save: (v: string) => Promise<void>,
) => {
  const [local, setLocal] = useState(initial);
  const { onChange: debouncedChange, flush } = useDebouncedSave(save, 1500);

  useEffect(() => { setLocal(initial); }, [initial]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocal(e.target.value);
    debouncedChange(e.target.value);
  }, [debouncedChange]);

  const handleBlur = useCallback(() => { flush(local); }, [flush, local]);

  return { value: local, onChange: handleChange, onBlur: handleBlur };
};

export const ContentSection = ({ content, onSave }: ContentSectionProps) => {
  const saveExcluded = useCallback((v: string) => onSave('excluded', v), [onSave]);
  const saveVeiled = useCallback((v: string) => onSave('veiled', v), [onSave]);
  const saveSpecial = useCallback((v: string) => onSave('specialHandling', v), [onSave]);

  const excluded = useContentField(content?.excluded ?? '', saveExcluded);
  const veiled = useContentField(content?.veiled ?? '', saveVeiled);
  const special = useContentField(content?.specialHandling ?? '', saveSpecial);

  return (
    <div>
      <div className={styles.contentRules}>
        <Text size="xs">Keep this in sync with the steading playbook. Review it at the start of each session.</Text>
        <Text size="xs">When <strong>anyone calls "time out,"</strong> play stops. Step out of character, check in with each other, maybe take a break. Discuss what's wrong, player-to-player.</Text>
        <Text size="xs">If <strong>content was included that shouldn't have been</strong>, acknowledge the mistake, fix the fiction, and move on.</Text>
        <Text size="xs">If <strong>someone realizes they need content to be excluded, veiled, or handled in a particular way</strong>, then update the lists. Clarify specifics, now or later, but don't ask for reasons. Fix the fiction. Check in with the player(s). When everyone is ready, move on.</Text>
      </div>
      <Input multiline label="Excluded content" note="(Not part of the game, on-camera or off)" {...excluded} />
      <Input multiline label="Veiled content" note="(Part of the fiction, but only off-camera)" {...veiled} />
      <Input multiline label="Special handling" {...special} />
    </div>
  );
};
