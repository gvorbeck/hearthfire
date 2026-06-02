import { useState, useCallback } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useCollapsibleSection } from '@/hooks/useCollapsibleSection';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';
import { useToast } from '@/components/primitives';
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
  const { addToast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>(data?.background ?? '');
  const [selectedChoices, setSelectedChoices] = useState<string[]>(data?.backgroundChoices ?? []);
  const [backgroundUses, setBackgroundUses] = useState<Record<string, number>>(data?.backgroundUses ?? {});
  const [freeText, setFreeText] = useState<Record<string, string>>(data?.backgroundFreeText ?? {});
  const selectedOptionRef = useLatest(selectedOption);
  const selectedChoicesRef = useLatest(selectedChoices);
  const backgroundUsesRef = useLatest(backgroundUses);
  const freeTextRef = useLatest(freeText);
  const onSaveRef = useLatest(onSave);

  const saveFreeText = useCallback(
    (answers: Record<string, string>) => onSaveRef.current?.({ backgroundFreeText: answers }) ?? Promise.resolve(),
    [],
  );
  const { onChange: debouncedFreeText } = useDebouncedSave(saveFreeText, 1000);

  useFirestoreSync(data?.background ?? '', setSelectedOption);
  useFirestoreSync(data?.backgroundChoices ?? [], setSelectedChoices);
  useFirestoreSync(data?.backgroundFreeText ?? {}, setFreeText);
  useFirestoreSync(data?.backgroundUses ?? {}, setBackgroundUses);

  const { isCollapsed, setIsCollapsed, handleToggleCollapse } = useCollapsibleSection(!!selectedOption);

  const handleFreeTextChange = useCallback((key: string, value: string) => {
    const next = { ...freeTextRef.current, [key]: value };
    setFreeText(next);
    debouncedFreeText(next);
  }, [debouncedFreeText]);

  const handleOptionChange = useCallback((value: string) => {
    const prev = selectedOptionRef.current;
    setSelectedOption(value);
    setSelectedChoices([]);
    onSaveRef.current?.({ background: value, backgroundChoices: [] }).catch(() => {
      setSelectedOption(prev);
      setIsCollapsed(false);
      addToast('Failed to save background selection.');
    });
  }, [addToast, setIsCollapsed]);

  const handleChoicesChange = useCallback((choices: string[]) => {
    const prev = selectedChoicesRef.current;
    setSelectedChoices(choices);
    onSaveRef.current?.({ background: selectedOptionRef.current, backgroundChoices: choices }).catch(() => {
      setSelectedChoices(prev);
      addToast('Failed to save background choices.');
    });
  }, [addToast]);

  const handleUsesChange = useCallback((optValue: string, count: number) => {
    const prev = backgroundUsesRef.current;
    const next = { ...prev, [optValue]: count };
    setBackgroundUses(next);
    onSaveRef.current?.({ backgroundUses: next }).catch(() => { setBackgroundUses(prev); addToast('Failed to save.'); });
  }, [addToast]);

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
