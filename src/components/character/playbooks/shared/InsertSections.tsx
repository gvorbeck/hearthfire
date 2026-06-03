import { useCallback } from 'react';
import { Input, Text } from '@/components/ui';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { INSERT_PURPOSE_OPTIONS as PurposeOptions } from '@/lib/insertSharedData';
import styles from './InsertSections.module.css';

interface PurposeDetailProps {
  opt: (typeof PurposeOptions)[number];
  nameValue: string;
  onNameChange: (purposeValue: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
}

export const PurposeDetail = ({ opt, nameValue, onNameChange, onNameBlur }: PurposeDetailProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onNameChange(opt.value, e),
    [onNameChange, opt.value],
  );

  return (
    <div className={styles.purposeDetail}>
      <Input
        className={styles.purposeNameInput}
        type="text"
        value={nameValue}
        placeholder={opt.namePlaceholder}
        aria-label={opt.namePrompt}
        onChange={handleChange}
        onBlur={onNameBlur}
      />
      <ul className={styles.triggerList}>
        {opt.triggers.map((t) => (
          <li key={t} className={styles.triggerItem}>
            <Text as="span" size="sm" font="serif" color="muted">{parseInlineMarkdown(t)}</Text>
          </li>
        ))}
      </ul>
    </div>
  );
};

