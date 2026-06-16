import { Text, List, Input } from '@/components/ui';
import { useDebouncedTextField } from '@/hooks/useDebouncedTextField';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

interface IWonderProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export const IWonder = ({ value, onSave }: IWonderProps) => {
  const questions = useDebouncedTextField(value, onSave);

  return (
    <div className={styles.contentForm}>
      <div className={styles.contentRules}>
        <Text size="xs">Keep a running list of open questions that either…</Text>
        <List variant="bullet" items={[
          "you don't know how to answer yet, or",
          'you want to answer via play.',
        ]} />
        <Text size="xs">Update this list between each session.</Text>
      </div>
      <Input multiline label="Questions" rows={12} {...questions} />
    </div>
  );
};
