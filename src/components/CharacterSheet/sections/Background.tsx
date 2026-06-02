import { useState, useRef, useEffect, useCallback } from 'react';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useCollapsibleSection } from '@/hooks/useCollapsibleSection';
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
  const selectedOptionRef = useRef(selectedOption);
  selectedOptionRef.current = selectedOption;
  const selectedChoicesRef = useRef(selectedChoices);
  selectedChoicesRef.current = selectedChoices;
  const backgroundUsesRef = useRef(backgroundUses);
  backgroundUsesRef.current = backgroundUses;
  const freeTextRef = useRef(freeText);
  freeTextRef.current = freeText;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const lastFirestoreBackgroundRef = useRef<string | undefined>(undefined);

  const saveFreeText = useCallback(
    (answers: Record<string, string>) => onSaveRef.current?.({ backgroundFreeText: answers }) ?? Promise.resolve(),
    [],
  );
  const { onChange: debouncedFreeText } = useDebouncedSave(saveFreeText, 1000);

  useEffect(() => {
    const incoming = JSON.stringify([data?.background, data?.backgroundChoices, data?.backgroundFreeText, data?.backgroundUses]);
    if (incoming === lastFirestoreBackgroundRef.current) return;
    lastFirestoreBackgroundRef.current = incoming;
    if (data?.background !== undefined) setSelectedOption(data.background);
    if (data?.backgroundChoices !== undefined) setSelectedChoices(data.backgroundChoices);
    if (data?.backgroundFreeText !== undefined) setFreeText(data.backgroundFreeText);
    if (data?.backgroundUses !== undefined) setBackgroundUses(data.backgroundUses);
  }, [data?.background, data?.backgroundChoices, data?.backgroundFreeText, data?.backgroundUses]);

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
