import { Radio, Checkbox, Text, Input } from '@/components/primitives';
import { parseMarkdown, parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { BackgroundOption, ChoiceConfig } from '@/types';
import styles from './Background.module.css';


interface BoundedCheckboxListProps {
  groupName: string;
  choices: ChoiceConfig;
  disabled: boolean;
  selected: string[];
  onSave: (choices: string[]) => void;
}

const BoundedCheckboxList = ({ groupName, choices, disabled, selected, onSave }: BoundedCheckboxListProps) => {
  const atMax = selected.length >= choices.max;

  return (
    <div className={styles.choices}>
      {choices.items.map((c) => {
        const isChecked = selected.includes(c.value);
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const next = e.target.checked
            ? [...selected, c.value]
            : selected.filter((v) => v !== c.value);
          onSave(next);
        };
        return (
          <Checkbox
            key={c.value}
            name={groupName}
            value={c.value}
            checked={isChecked}
            disabled={disabled || (!isChecked && atMax)}
            onChange={handleChange}
            label={<Text as="span" size="sm">{parseInlineMarkdown(c.label)}</Text>}
          />
        );
      })}
    </div>
  );
};

interface BackgroundOptionItemProps {
  option: BackgroundOption;
  groupName: string;
  selected: boolean;
  selectedChoices: string[];
  freeTextValue: string;
  onSelect: (value: string) => void;
  onChoicesChange: (choices: string[]) => void;
  onFreeTextChange: (key: string, value: string) => void;
}

export const BackgroundOptionItem = ({
  option,
  groupName,
  selected,
  selectedChoices,
  freeTextValue,
  onSelect,
  onChoicesChange,
  onFreeTextChange,
}: BackgroundOptionItemProps) => (
  <div className={styles.option}>
    <Radio
      name={groupName}
      value={option.value}
      checked={selected}
      onChange={() => onSelect(option.value)}
      label={<span className={styles.optionTitle}>{option.title}</span>}
    />
    <div className={styles.optionBody}>
      <div className={styles.optionContent}>
        {parseMarkdown(option.content)}
      </div>
      {option.choices && (
        <BoundedCheckboxList
          groupName={`${groupName}-choices-${option.value}`}
          choices={option.choices}
          disabled={!selected}
          selected={selected ? selectedChoices : []}
          onSave={onChoicesChange}
        />
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
);
