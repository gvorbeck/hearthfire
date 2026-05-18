import { Radio, Checkbox, Text, List } from '@/components/primitives';
import type { BackgroundOption, ChoiceConfig } from '@/types';
import styles from './Background.module.css';

export type { BackgroundOption, ChoiceConfig };

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
            label={<Text as="span" size="sm">{c.label}</Text>}
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
  onSelect: (value: string) => void;
  onChoicesChange: (choices: string[]) => void;
}

export const BackgroundOptionItem = ({
  option,
  groupName,
  selected,
  selectedChoices,
  onSelect,
  onChoicesChange,
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
      {option.paragraphs.map((p, i) => (
        <Text key={`${option.value}-p${i}`} size="sm">{p}</Text>
      ))}
      {option.bullets && <List variant="bullet" items={option.bullets} />}
      {option.choices && (
        <BoundedCheckboxList
          groupName={`${groupName}-choices-${option.value}`}
          choices={option.choices}
          disabled={!selected}
          selected={selected ? selectedChoices : []}
          onSave={onChoicesChange}
        />
      )}
    </div>
  </div>
);
