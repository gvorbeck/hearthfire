import { useState, useCallback } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useCollapsibleSection } from '@/hooks/useCollapsibleSection';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { PlaybookSection } from '../PlaybookSection';
import { BackgroundOptionItem } from './BackgroundOption';
import type { BackgroundOption, CharacterData } from '@/types';
import styles from './Background.module.css';

interface BackgroundProps {
  playbookKey?: string;
  options?: BackgroundOption[];
  level?: number;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

export const Background = ({ playbookKey, options, level = 0, data, onSave }: BackgroundProps = {}) => {
  const onSaveRef = useLatest(onSave);

  const { value: selectedOption, ref: selectedOptionRef, setValue: setSelectedOption, pendingRef: selectedOptionPendingRef } = useOptimisticField(
    data?.background ?? '',
    (next) => onSaveRef.current?.({ background: next }) ?? Promise.resolve(),
    'Failed to save background selection.',
  );
  const { value: selectedChoices, ref: selectedChoicesRef, save: saveChoices, setValue: setSelectedChoices, pendingRef: selectedChoicesPendingRef } = useOptimisticField(
    data?.backgroundChoices ?? [],
    // Choices are always written together with the current background to keep the two in sync.
    (next) => onSaveRef.current?.({ background: selectedOptionRef.current, backgroundChoices: next }) ?? Promise.resolve(),
    'Failed to save background choices.',
  );
  const { value: backgroundUses, ref: backgroundUsesRef, save: saveUses } = useOptimisticField(
    data?.backgroundUses ?? {},
    (next) => onSaveRef.current?.({ backgroundUses: next }) ?? Promise.resolve(),
    'Failed to save.',
  );
  const [freeText, setFreeText] = useState<Record<string, string>>(data?.backgroundFreeText ?? {});
  const freeTextRef = useLatest(freeText);

  const saveFreeText = (answers: Record<string, string>) =>
    onSaveRef.current?.({ backgroundFreeText: answers }) ?? Promise.resolve();
  const { onChange: debouncedFreeText } = useDebouncedSave(saveFreeText, 1000);

  const { isCollapsed, setIsCollapsed, handleToggleCollapse } = useCollapsibleSection(!!selectedOption);

  const handleFreeTextChange = useCallback((key: string, value: string) => {
    const next = { ...freeTextRef.current, [key]: value };
    setFreeText(next);
    debouncedFreeText(next);
  }, [debouncedFreeText]);

  const handleOptionChange = useCallback((value: string) => {
    const prevOption = selectedOptionRef.current;
    const prevChoices = selectedChoicesRef.current;
    selectedOptionPendingRef.current = true;
    selectedChoicesPendingRef.current = true;
    setSelectedOption(value);
    setSelectedChoices([]);
    onSaveRef.current?.({ background: value, backgroundChoices: [] })
      .catch(() => {
        setSelectedOption(prevOption);
        setSelectedChoices(prevChoices);
        setIsCollapsed(false);
      })
      .finally(() => {
        selectedOptionPendingRef.current = false;
        selectedChoicesPendingRef.current = false;
      });
  }, [setIsCollapsed, setSelectedOption, setSelectedChoices]);

  const handleChoicesChange = useCallback((choices: string[]) => {
    saveChoices(choices);
  }, [saveChoices]);

  const handleUsesChange = useCallback((optValue: string, count: number) => {
    saveUses({ ...backgroundUsesRef.current, [optValue]: count });
  }, [saveUses]);

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
      forceChildren
    >
      <div className={styles.options}>
        {visibleOptions.map((opt) => (
          <BackgroundOptionItem
            key={opt.value}
            option={opt}
            groupName={`${playbookKey}-background`}
            level={level}
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
