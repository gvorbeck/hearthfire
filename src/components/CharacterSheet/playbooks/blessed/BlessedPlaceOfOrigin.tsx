import { useState, useEffect, useCallback } from 'react';
import { Radio } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './BlessedPlaceOfOrigin.module.css';

const ORIGINS = [
  {
    value: 'stonetop',
    label: 'Stonetop',
    names: 'Arwel, Blodwen, Brynmor, Celyn, Fflur, Gwynn, Tegwen, or Winned',
  },
  {
    value: 'barrier-pass',
    label: 'Barrier Pass',
    names: 'Alagh, Bora, Chambui, Enebish, Jalakai, Kamala, Sechen, or Todogen',
  },
  {
    value: 'the-steplands',
    label: 'The Steplands (Hillfolk)',
    names: 'Bejn, Decla, Franza, Irv, Ivet, Jak, Sibl, or Yez',
  },
  {
    value: 'the-wild',
    label: 'The Wild',
    names: 'Autumn, Badger, Big, Black, Bloody, Brave, Crow, Cub, Dark, Doe, Fang, Fierce, Flower, Gentle, Green, Grim, Hart, Leaf, Little, Lonely, Old, Owl, Pale, Pup, Quick, Quiet, Rain, Red, Sharp, Snake, Snow, Spring, Summer, Tall, Tree, Yellow, White, Wind, Winter, Wolf, Whisper',
  },
];

interface OriginOptionProps {
  opt: typeof ORIGINS[number];
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const OriginOption = ({ opt, isSelected, onSelect }: OriginOptionProps) => {
  const handleChange = useCallback(() => onSelect(opt.value), [onSelect, opt.value]);
  return (
    <div className={styles.option}>
      <Radio
        name="blessed-place-of-origin"
        value={opt.value}
        checked={isSelected}
        onChange={handleChange}
        label={
          <span className={styles.optionLabel}>
            <span className={styles.optionTitle}>{opt.label}</span>
            <span className={styles.optionNames}>{opt.names}</span>
          </span>
        }
      />
    </div>
  );
};

interface BlessedPlaceOfOriginProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const BlessedPlaceOfOrigin = ({ data, onSave }: BlessedPlaceOfOriginProps) => {
  const [selected, setSelected] = useState<string>(data?.placeOfOrigin ?? '');

  useEffect(() => {
    if (data?.placeOfOrigin !== undefined) setSelected(data.placeOfOrigin);
  }, [data?.placeOfOrigin]);

  const handleSelect = useCallback((value: string) => {
    setSelected(value);
    onSave({ placeOfOrigin: value });
  }, [onSave]);

  return (
    <PlaybookSection title="Place of Origin" choose={1}>
      <p className={styles.instruction}>
        Stonetop is your home, or close enough, but where are you (or your family) from originally?
        Pick an origin, then choose a matching name or make up your own — edit it in the header above.
      </p>
      <div className={styles.options}>
        {ORIGINS.map((opt) => (
          <OriginOption
            key={opt.value}
            opt={opt}
            isSelected={selected === opt.value}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
