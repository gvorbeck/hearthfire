import { useState, useRef, useEffect, useCallback } from 'react';
import { useDebouncedAnswers } from '@/hooks/useDebouncedAnswers';
import { useToast } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import { BackgroundOptionItem } from './BackgroundOption';
import type { BackgroundOption, CharacterData } from '@/types';
import styles from './Background.module.css';

const noopSave = () => Promise.resolve();

interface BackgroundProps {
  playbookKey?: string;
  options?: BackgroundOption[];
  level?: number;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

export const Background = ({ playbookKey, options, level, data, onSave }: BackgroundProps = {}) => {
  const { addToast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>(data?.background ?? '');
  const [selectedChoices, setSelectedChoices] = useState<string[]>(data?.backgroundChoices ?? []);
  const [backgroundUses, setBackgroundUses] = useState<Record<string, number>>(data?.backgroundUses ?? {});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitializedCollapse = useRef(false);
  const choiceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedOptionRef = useRef(selectedOption);
  selectedOptionRef.current = selectedOption;
  const selectedChoicesRef = useRef(selectedChoices);
  selectedChoicesRef.current = selectedChoices;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const buildFreeTextPatch = useCallback(
    (answers: Record<string, string>): Partial<CharacterData> => ({ backgroundFreeText: answers }),
    [],
  );
  const { answers: freeText, setAnswers: setFreeText, handleAnswer: handleFreeTextChange } = useDebouncedAnswers(
    data?.backgroundFreeText,
    // setFreeText (below) syncs server-sourced changes into this hook's state,
    // matching the pattern in usePlaybookCheckedWithAnswers.
    onSave ?? noopSave,
    buildFreeTextPatch,
    1000,
  );

  useEffect(() => {
    if (data?.background !== undefined) setSelectedOption(data.background);
    if (data?.backgroundChoices !== undefined) setSelectedChoices(data.backgroundChoices);
    if (data?.backgroundFreeText !== undefined) setFreeText(data.backgroundFreeText);
    if (data?.backgroundUses !== undefined) setBackgroundUses(data.backgroundUses);
  }, [data?.background, data?.backgroundChoices, data?.backgroundFreeText, data?.backgroundUses, setFreeText]);

  useEffect(() => {
    if (data?.background && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [data?.background]);

  useEffect(() => () => { if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current); }, []);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  const handleOptionChange = useCallback((value: string) => {
    const prev = selectedOption;
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    setSelectedOption(value);
    setSelectedChoices([]);
    setIsCollapsed(true);
    onSaveRef.current?.({ background: value, backgroundChoices: [] }).catch(() => {
      setSelectedOption(prev);
      setIsCollapsed(false);
      addToast('Failed to save background selection.');
    });
  }, [selectedOption]);

  const handleChoicesChange = useCallback((choices: string[]) => {
    setSelectedChoices(choices);
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    choiceDebounceRef.current = setTimeout(() => {
      const prev = selectedChoicesRef.current;
      onSaveRef.current?.({ background: selectedOptionRef.current, backgroundChoices: selectedChoicesRef.current }).catch(() => {
        setSelectedChoices(prev);
        addToast('Failed to save background choices.');
      });
    }, 1000);
  }, []);

  const handleUsesChange = useCallback((optValue: string, count: number) => {
    const prev = backgroundUses;
    const next = { ...backgroundUses, [optValue]: count };
    setBackgroundUses(next);
    onSave?.({ backgroundUses: next }).catch(() => { setBackgroundUses(prev); addToast('Failed to save.'); });
  }, [backgroundUses, onSave]);

  if (!options) return <PlaybookSection title="Background" />;

  const warn = !selectedOption;
  const visibleOptions = isCollapsed && selectedOption
    ? options.filter((opt) => opt.value === selectedOption)
    : options;

  return (
    <PlaybookSection
      title="Background"
      choose={1}
      warn={warn}
      collapsible={!!selectedOption}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
    >
      <div className={styles.options}>
        {visibleOptions.map((opt) => (
          <BackgroundOptionItem
            key={opt.value}
            option={opt}
            groupName={`${playbookKey}-background`}
            level={level!}
            selected={selectedOption === opt.value}
            selectedChoices={selectedChoices}
            usesChecked={backgroundUses[opt.value] ?? 0}
            freeTextValue={opt.freeText ? (freeText[opt.freeText.key] ?? '') : ''}
            onSelect={handleOptionChange}
            onChoicesChange={handleChoicesChange}
            onUsesChange={handleUsesChange}
            onFreeTextChange={handleFreeTextChange}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
