import { memo, useCallback } from 'react';
import { Radio, Checkbox, Text, Input } from '@/components/primitives';
import { UseDots } from '@/components/CharacterSheet/Move';
import { parseMarkdown, parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { BackgroundOption, ChoiceConfig } from '@/types';
import styles from './Background.module.css';

const resolveMax = (choices: ChoiceConfig, level: number): number => {
  if (!choices.levelGatedMax) return choices.max;
  let max = 0;
  for (const [minLevel, gatedMax] of choices.levelGatedMax) {
    if (level >= minLevel) max = gatedMax;
  }
  return max;
};

interface BoundedCheckboxListProps {
  groupName: string;
  choices: ChoiceConfig;
  level: number;
  disabled: boolean;
  selected: string[];
  onSave: (choices: string[]) => void;
}

const BoundedCheckboxList = ({ groupName, choices, level, disabled, selected, onSave }: BoundedCheckboxListProps) => {
  const lockedValues = choices.items.filter((c) => c.locked).map((c) => c.value);
  const userSelected = selected.filter((v) => !lockedValues.includes(v));
  const effectiveMax = resolveMax(choices, level);
  const atMax = userSelected.length >= effectiveMax;

  const handleItemChange = useCallback((value: string, checked: boolean) => {
    const next = checked
      ? [...selected, value]
      : selected.filter((v) => v !== value);
    onSave(next);
  }, [selected, onSave]);

  return (
    <div className={styles.choices}>
      {choices.items.map((c) => {
        const isChecked = c.locked || selected.includes(c.value);
        return (
          <Checkbox
            key={c.value}
            name={groupName}
            value={c.value}
            checked={isChecked}
            disabled={disabled || c.locked || (!isChecked && atMax)}
            readOnly={c.locked}
            onChange={c.locked ? undefined : (e) => handleItemChange(c.value, e.target.checked)}
            label={<Text as="span" size="md">{parseInlineMarkdown(c.label)}</Text>}
          />
        );
      })}
    </div>
  );
};

interface BackgroundOptionItemProps {
  option: BackgroundOption;
  groupName: string;
  level: number;
  selected: boolean;
  selectedChoices: string[];
  usesChecked: number;
  freeTextValue: string;
  onSelect: (value: string) => void;
  onChoicesChange: (choices: string[]) => void;
  onUsesChange: (value: string, count: number) => void;
  onFreeTextChange: (key: string, value: string) => void;
}

export const BackgroundOptionItem = memo(({
  option,
  groupName,
  level,
  selected,
  selectedChoices,
  usesChecked,
  freeTextValue,
  onSelect,
  onChoicesChange,
  onUsesChange,
  onFreeTextChange,
}: BackgroundOptionItemProps) => (
  <div className={styles.option}>
    <Radio
      name={groupName}
      value={option.value}
      checked={selected}
      onChange={() => onSelect(option.value)}
      label={
        <span className={styles.optionTitleRow}>
          <span className={styles.optionTitle}>{option.title}</span>
          {option.uses !== undefined && (
            <span className={styles.optionTitleRowUses}>
              <UseDots
                total={option.uses}
                checked={usesChecked}
                onChange={(n) => onUsesChange(option.value, n)}
                disabled={!selected}
              />
            </span>
          )}
        </span>
      }
    />
    <div className={styles.optionBody}>
      <div className={styles.optionContent}>
        {parseMarkdown(option.content)}
      </div>
      {option.choices && (
        <BoundedCheckboxList
          groupName={`${groupName}-choices-${option.value}`}
          choices={option.choices}
          level={level}
          disabled={!selected}
          selected={selected ? selectedChoices : []}
          onSave={onChoicesChange}
        />
      )}
      {option.postContent && (
        <div className={styles.optionContent}>
          {parseMarkdown(option.postContent)}
        </div>
      )}
      {option.freeText && (
        <Input
          multiline
          id={`${groupName}-freetext-${option.value}`}
          label={option.freeText.label}
          value={freeTextValue}
          disabled={!selected}
          onChange={(e) => onFreeTextChange(option.freeText!.key, e.target.value)}
        />
      )}
    </div>
  </div>
));
