import { useState, useRef, useEffect, useCallback } from 'react';
import { PlaybookSection } from '../PlaybookSection';
import { BackgroundOptionItem, type BackgroundOption } from './BackgroundOption';
import styles from './Background.module.css';
import type { CharacterData } from '@/types';

interface PlaybookBackgroundProps {
  playbookKey: string;
  options: BackgroundOption[];
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const PlaybookBackground = ({ playbookKey, options, data, onSave }: PlaybookBackgroundProps) => {
  const [selectedOption, setSelectedOption] = useState<string>(data?.background ?? '');
  const [selectedChoices, setSelectedChoices] = useState<string[]>(data?.backgroundChoices ?? []);
  const choiceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Gives the debounced callback a current value without re-creating it on every render.
  const selectedOptionRef = useRef(selectedOption);
  selectedOptionRef.current = selectedOption;

  useEffect(() => {
    if (data?.background !== undefined) setSelectedOption(data.background);
    if (data?.backgroundChoices !== undefined) setSelectedChoices(data.backgroundChoices);
  }, [data?.background, data?.backgroundChoices]);

  useEffect(() => () => {
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
  }, []);

  const handleOptionChange = useCallback((value: string) => {
    const prev = selectedOption;
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    setSelectedOption(value);
    setSelectedChoices([]);
    onSave({ background: value, backgroundChoices: [] }).catch(() => {
      setSelectedOption(prev);
    });
  }, [onSave, selectedOption]);

  const handleChoicesChange = useCallback((choices: string[]) => {
    const prev = selectedChoices;
    setSelectedChoices(choices);
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    // Debounce so rapid checkbox toggling costs one write instead of one per click.
    choiceDebounceRef.current = setTimeout(() => {
      onSave({ background: selectedOptionRef.current, backgroundChoices: choices }).catch(() => {
        setSelectedChoices(prev);
      });
    }, 1000);
  }, [onSave, selectedChoices]);

  return (
    <PlaybookSection title="Background" choose={1}>
      <div className={styles.options}>
        {options.map((opt) => (
          <BackgroundOptionItem
            key={opt.value}
            option={opt}
            groupName={`${playbookKey}-background`}
            selected={selectedOption === opt.value}
            selectedChoices={selectedChoices}
            onSelect={handleOptionChange}
            onChoicesChange={handleChoicesChange}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
