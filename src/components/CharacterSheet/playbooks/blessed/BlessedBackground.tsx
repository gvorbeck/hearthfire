import { useState, useRef, useEffect, useCallback } from 'react';
import { Radio, Checkbox, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './BlessedBackground.module.css';

interface ChoiceConfig {
  min: number;
  max: number;
  items: { label: React.ReactNode; value: string }[];
}

interface BackgroundOption {
  value: string;
  title: string;
  paragraphs: React.ReactNode[];
  choices?: ChoiceConfig;
}

const OPTIONS: BackgroundOption[] = [
  {
    value: 'initiate',
    title: 'Initiate',
    paragraphs: [
      <>Stonetop has long been home to a sacred order, keepers of the old ways and speakers for Danu. You are one such initiate, the most gifted in generations. You gain the Rites of the Land move.</>,
      <>There are other initiates in Stonetop, serving the goddess and the village. They aid you as followers—see the Initiates of Danu insert. Who are they? Choose 2 or 3:</>,
    ],
    choices: {
      min: 2,
      max: 3,
      items: [
        { value: 'enfys', label: <><strong>Enfys</strong>, your acolyte, beloved by birds</> },
        { value: 'afon', label: <><strong>Afon</strong>, strange and Fae-touched</> },
        { value: 'gwendyl', label: <><strong>Gwendyl</strong>, your mentor, a talented healer</> },
        { value: 'olwin', label: <><strong>Olwin</strong>, your anointed lover, seer of fates</> },
        { value: 'seren', label: <><strong>Seren the Eldest</strong>, wise and hard as winter</> },
      ],
    },
  },
  {
    value: 'raised-by-wolves',
    title: 'Raised by Wolves',
    paragraphs: [
      <>Maybe not by <em>wolves</em>, but you grew up in the wild. Beasts of land and air were your siblings. The sighing wind taught you language. The trees and rocks were your home. Were you one of the Forest Folk? Abandoned or orphaned? Lured into the Wood?</>,
      <>Regardless, you get the Trackless Step move (go mark it now). Also, when you <strong>Forage</strong>, you have advantage.</>,
      <>For some reason, you've made yourself known to Stonetop and perhaps you even call it home. But the ways of humans are still strange to you. Once per session, when <strong><em>your wild ways offend or alienate you from someone</em></strong>, mark XP.</>,
    ],
  },
  {
    value: 'vessel',
    title: 'Vessel',
    paragraphs: [
      <>A seed of Danu's power has taken root in your soul. Perhaps it has always been there and only recently sprouted. Or maybe it was planted in you during some portentous event.</>,
      <>Regardless, your dreams have been haunted by strange markings and symbols. You feel the mystic power in plants, stones, and soil. And you've felt the growing wrath of the Earth Mother as foul things begin to move about. Take the Danu's Grasp move (go mark it now).</>,
      <>Danu's power flows through you, but at great cost. When you <strong><em>would spend 1 Stock from your sacred pouch</em></strong>, you may choose to lose 2d4 HP instead.</>,
    ],
  },
];

interface BoundedCheckboxListProps {
  optionValue: string;
  choices: ChoiceConfig;
  disabled: boolean;
  selected: string[];
  onSave: (choices: string[]) => void;
}

const BoundedCheckboxList = ({ optionValue, choices, disabled, selected, onSave }: BoundedCheckboxListProps) => {
  const atMax = selected.length >= choices.max;

  const handleChange = useCallback((value: string, checked: boolean) => {
    const next = checked
      ? [...selected, value]
      : selected.filter((v) => v !== value);
    onSave(next);
  }, [selected, onSave]);

  return (
    <div className={styles.choices}>
      {choices.items.map((c) => {
        const isChecked = selected.includes(c.value);
        return (
          <Checkbox
            key={c.value}
            name={`blessed-background-${optionValue}`}
            value={c.value}
            checked={isChecked}
            disabled={disabled || (!isChecked && atMax)}
            onChange={(e) => handleChange(c.value, e.target.checked)}
            label={<Text as="span" size="sm">{c.label}</Text>}
          />
        );
      })}
    </div>
  );
};

interface BlessedBackgroundProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const BlessedBackground = ({ data, onSave }: BlessedBackgroundProps) => {
  const [selectedOption, setSelectedOption] = useState<string>(data?.background ?? '');
  const [selectedChoices, setSelectedChoices] = useState<string[]>(data?.backgroundChoices ?? []);
  const choiceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedOptionRef = useRef(selectedOption);
  selectedOptionRef.current = selectedOption;

  // Firestore data arrives async after mount; sync local state once it lands.
  useEffect(() => {
    if (data?.background !== undefined) setSelectedOption(data.background);
    if (data?.backgroundChoices !== undefined) setSelectedChoices(data.backgroundChoices);
  }, [data?.background, data?.backgroundChoices]);

  // Clear the debounce timer on unmount so the callback never fires after navigation.
  useEffect(() => {
    return () => {
      if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    };
  }, []);

  const handleOptionChange = (value: string) => {
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    setSelectedOption(value);
    setSelectedChoices([]);
    onSave({ background: value, backgroundChoices: [] });
  };

  const handleChoicesChange = (choices: string[]) => {
    setSelectedChoices(choices);
    if (choiceDebounceRef.current) clearTimeout(choiceDebounceRef.current);
    // Debounce so rapid checkbox toggling costs one write instead of one per click.
    choiceDebounceRef.current = setTimeout(() => {
      onSave({ background: selectedOptionRef.current, backgroundChoices: choices });
    }, 1000);
  };

  return (
    <PlaybookSection title="Background" choose={1}>
      <div className={styles.options}>
        {OPTIONS.map((opt) => (
          <div key={opt.value} className={styles.option}>
            <Radio
              name="blessed-background"
              value={opt.value}
              checked={selectedOption === opt.value}
              onChange={() => handleOptionChange(opt.value)}
              label={<span className={styles.optionTitle}>{opt.title}</span>}
            />
            <div className={styles.optionBody}>
              {opt.paragraphs.map((p, i) => (
                <Text key={`${opt.value}-p${i}`} size="sm">{p}</Text>
              ))}
              {opt.choices && (
                <BoundedCheckboxList
                  optionValue={opt.value}
                  choices={opt.choices}
                  disabled={selectedOption !== opt.value}
                  selected={selectedOption === opt.value ? selectedChoices : []}
                  onSave={handleChoicesChange}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </PlaybookSection>
  );
};
