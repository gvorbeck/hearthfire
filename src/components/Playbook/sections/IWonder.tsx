import { memo } from 'react';
import { Text, List } from '@/components/primitives';
import { TextareaField } from '@/components/Playbook';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

interface IWonderProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export const IWonder = memo(({ value, onSave }: IWonderProps) => (
  <div>
    <div className={styles.contentRules}>
      <Text size="sm">Keep a running list of open questions that either…</Text>
      <List variant="dash" items={[
        "you don't know how to answer yet, or",
        'you want to answer via play.',
      ]} />
      <Text size="sm">Update this list between each session.</Text>
    </div>
    <TextareaField label="Questions" value={value} onSave={onSave} rows={12} />
  </div>
));
