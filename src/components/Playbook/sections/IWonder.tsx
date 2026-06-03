import { useState, useCallback, useEffect } from 'react';
import { Text, List, Input } from '@/components/primitives';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

interface IWonderProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export const IWonder = ({ value, onSave }: IWonderProps) => {
  const [local, setLocal] = useState(value);
  const { onChange: debouncedChange, flush } = useDebouncedSave(onSave, 1500);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocal(e.target.value);
    debouncedChange(e.target.value);
  }, [debouncedChange]);

  const handleBlur = useCallback(() => { flush(local); }, [flush, local]);

  return (
    <div>
      <div className={styles.contentRules}>
        <Text size="xs">Keep a running list of open questions that either…</Text>
        <List variant="dash" items={[
          "you don't know how to answer yet, or",
          'you want to answer via play.',
        ]} />
        <Text size="xs">Update this list between each session.</Text>
      </div>
      <Input multiline label="Questions" value={local} rows={12} onChange={handleChange} onBlur={handleBlur} />
    </div>
  );
};
