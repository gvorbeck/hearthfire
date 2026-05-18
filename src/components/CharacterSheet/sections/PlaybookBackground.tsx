import { useState, useRef, useEffect, useCallback } from 'react';
import { PlaybookSection } from '../PlaybookSection';
import { BackgroundOptionItem } from './BackgroundOption';
import type { BackgroundOption } from '@/types';
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
  const [freeText, setFreeText] = useState<Record<string, string>>(data?.backgroundFreeText ?? {});
  const choiceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const freeTextDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Gives the debounced callbacks a current value without re-creating them on every render.
  const selectedOptionRef = useRef(selectedOption);
  selectedOptionRef.current = selectedOption;
  const freeTextRef = useRef(freeText);
  freeTextRef.current = freeText;

  useEffect(() => {
    if (data?.background !== undefined) setSelectedOption(data.background);
    if (data?.backgroundChoices !== undefined) setSelectedChoices(data.backgroundChoices);
    if (data?.backgroundFreeText !== undefined) setFreeText(data.backgroundFreeText);
  }, [data?.background, data?.backgroundChoices, data?.backgroundFreeText]);

  useEffect(() => () => {
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    if (freeTextDebounceRef.current) clearTimeout(freeTextDebounceRef.current);
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

  const handleFreeTextChange = useCallback((key: string, value: string) => {
    const prev = freeTextRef.current;
    const next = { ...prev, [key]: value };
    setFreeText(next);
    if (freeTextDebounceRef.current) clearTimeout(freeTextDebounceRef.current);
    freeTextDebounceRef.current = setTimeout(() => {
      onSave({ backgroundFreeText: freeTextRef.current }).catch(() => setFreeText(prev));
    }, 1000);
  }, [onSave]);

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
            freeTextValue={opt.freeText ? (freeText[opt.freeText.key] ?? '') : ''}
            onSelect={handleOptionChange}
            onChoicesChange={handleChoicesChange}
            onFreeTextChange={handleFreeTextChange}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
