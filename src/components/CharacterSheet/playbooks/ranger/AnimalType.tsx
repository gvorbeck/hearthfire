import { useCallback, useMemo } from 'react';
import { Checkbox, CheckboxGroup, Input, Text } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { AnimalTypeConfig } from '@/types';
import styles from './RangerAnimalCompanion.module.css';

export const ANIMAL_TYPES: AnimalTypeConfig[] = [
  {
    id: 'bird',
    label: 'Bird',
    examples: 'falcon, eagle, owl, buzzard, magpie',
    hp: '5',
    armor: '1',
    damage: 'd4',
    pickCount: 4,
    picks: [
      { id: 'improved-damage', label: 'Improved damage die (d6)' },
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (agility)' },
      { id: 'attack-bird', label: '*attack-bird*' },
      { id: 'cautious', label: '*cautious*' },
      { id: 'clever', label: '*clever*' },
      { id: 'fast', label: '*fast*' },
      { id: 'mimic', label: '*mimic*' },
      { id: 'sharp-eyed', label: '*sharp-eyed*' },
      { id: 'stealthy', label: '*stealthy*' },
      { id: 'thieving', label: '*thieving*' },
      { id: 'tiny', label: '*tiny*', defaultChecked: true },
      { id: 'tireless', label: '*tireless*' },
    ],
  },
  {
    id: 'critter',
    label: 'Critter',
    examples: 'cat, fox, possum, raccoon, weasel',
    hp: '5',
    armor: '1',
    damage: 'd4',
    pickCount: 5,
    picks: [
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (agility)' },
      { id: 'agile', label: '*agile*' },
      { id: 'adorable', label: '*adorable*' },
      { id: 'annoying', label: '*annoying*' },
      { id: 'burrowing', label: '*burrowing*' },
      { id: 'cautious', label: '*cautious*' },
      { id: 'clever', label: '*clever*' },
      { id: 'climber', label: '*climber*' },
      { id: 'dextrous', label: '*dextrous*' },
      { id: 'keen-eared', label: '*keen-eared*' },
      { id: 'keen-eyed', label: '*keen-eyed*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'quick', label: '*quick*' },
      { id: 'stealthy', label: '*stealthy*' },
      { id: 'stinky', label: '*stinky*' },
      { id: 'tiny', label: '*tiny*', defaultChecked: true },
      { id: 'thieving', label: '*thieving*' },
    ],
  },
  {
    id: 'brute',
    label: 'Brute',
    examples: 'bear, boar, wolverine, aurochs, drake',
    hp: '12',
    armor: '0',
    damage: 'd6',
    pickCount: 3,
    picks: [
      { id: 'armor-plus1', label: '+1 armor (hide, scales, etc.)' },
      { id: 'damage-plus2-forceful', label: 'Damage is +2 damage, *forceful*' },
      { id: 'damage-messy-piercing', label: 'Damage is *messy*, 1 piercing' },
      { id: 'large', label: '*large* (+4 HP, +1 damage, +*close*)' },
      { id: 'easy-going', label: '*easy-going*' },
      { id: 'fearless', label: '*fearless*' },
      { id: 'gluttonous', label: '*gluttonous*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'powerful', label: '*powerful*' },
      { id: 'protective', label: '*protective*' },
      { id: 'quick', label: '*quick*' },
      { id: 'terrifying', label: '*terrifying*' },
      { id: 'tough', label: '*tough*', defaultChecked: true },
    ],
  },
  {
    id: 'predator',
    label: 'Predator',
    examples: 'hound, wolf, cougar, drake',
    hp: '8',
    armor: '0',
    damage: 'd8',
    pickCount: 3,
    picks: [
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (hide)' },
      { id: 'damage-messy-piercing', label: 'Damage is *messy*, 1 piercing' },
      { id: 'agile', label: '*agile*' },
      { id: 'climber', label: '*climber*' },
      { id: 'clever', label: '*clever*' },
      { id: 'enduring', label: '*enduring*' },
      { id: 'fast', label: '*fast*' },
      { id: 'fierce', label: '*fierce*', defaultChecked: true },
      { id: 'keen-eared', label: '*keen-eared*' },
      { id: 'keen-eyed', label: '*keen-eyed*' },
      { id: 'pack-hunter', label: '*pack-hunter*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'patient', label: '*patient*' },
      { id: 'powerful', label: '*powerful*' },
      { id: 'stealthy', label: '*stealthy*' },
      { id: 'terrifying', label: '*terrifying*' },
    ],
  },
  {
    id: 'steed',
    label: 'Steed',
    examples: 'horse, mule',
    hp: '12',
    armor: '0',
    damage: 'd6+1',
    pickCount: 4,
    picks: [
      { id: 'hp-plus4', label: '+4 HP' },
      { id: 'armor-plus1', label: '+1 armor (hide)' },
      { id: 'damage-plus2-forceful', label: 'Damage is +2 damage, *forceful*' },
      { id: 'aggressive', label: '*aggressive*' },
      { id: 'agile', label: '*agile*' },
      { id: 'beautiful', label: '*beautiful*' },
      { id: 'calm', label: '*calm*' },
      { id: 'clever', label: '*clever*' },
      { id: 'hardy', label: '*hardy*' },
      { id: 'keen-nosed', label: '*keen-nosed*' },
      { id: 'large', label: '*large*', defaultChecked: true },
      { id: 'powerful', label: '*powerful*' },
      { id: 'swift', label: '*swift*' },
    ],
  },
];

export interface TypePicksSectionProps {
  typeId: string;
  typeConfig: AnimalTypeConfig;
  isSelected: boolean;
  picks: Record<string, boolean>;
  customText: string;
  customChecked: boolean;
  onPickChange: (id: string, checked: boolean) => void;
  onCustomChange: (typeId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomBlur: (typeId: string) => void;
  onCustomCheckedChange: (typeId: string, checked: boolean) => void;
}

export const TypePicksSection = ({
  typeId,
  typeConfig,
  isSelected,
  picks,
  customText,
  customChecked,
  onPickChange,
  onCustomChange,
  onCustomBlur,
  onCustomCheckedChange,
}: TypePicksSectionProps) => {
  const selectedCount = typeConfig.picks.filter((p) => !p.defaultChecked && picks[`${typeConfig.id}:${p.id}`]).length;
  const atMax = selectedCount + (customChecked ? 1 : 0) >= typeConfig.pickCount;

  const items = useMemo(() => typeConfig.picks.map((p) => {
    const key = `${typeConfig.id}:${p.id}`;
    const isDefault = !!p.defaultChecked;
    return {
      id: key,
      label: <span>{parseInlineMarkdown(p.label)}</span>,
      disabled: !isSelected || isDefault || (!picks[key] && atMax),
    };
  }), [typeConfig, isSelected, picks, atMax]);

  const checkedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const p of typeConfig.picks) {
      const key = `${typeConfig.id}:${p.id}`;
      map[key] = p.defaultChecked ? true : (picks[key] ?? false);
    }
    return map;
  }, [typeConfig, picks]);

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCustomChange(typeId, e),
    [typeId, onCustomChange],
  );
  const handleCustomBlur = useCallback(() => onCustomBlur(typeId), [typeId, onCustomBlur]);
  const handleCustomCheckedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCustomCheckedChange(typeId, e.target.checked),
    [typeId, onCustomCheckedChange],
  );

  return (
    <div className={styles.typePicksSection}>
      <Text as="span" size="xs" color="muted" leading="normal">
        {parseInlineMarkdown(`**HP** ${typeConfig.hp} **Armor** ${typeConfig.armor} (size) **Damage** ${typeConfig.damage} *(hand)*`)}
      </Text>
      <Text as="span" size="xs" color="muted" leading="normal">Pick {typeConfig.pickCount} more:</Text>
      <CheckboxGroup
        items={items}
        checked={checkedMap}
        onChange={onPickChange}
        columns={2}
      />
      <div className={styles.typeCustomRow}>
        <Checkbox
          checked={customChecked}
          disabled={!isSelected || (!customChecked && atMax) || !customText}
          onChange={handleCustomCheckedChange}
          aria-label={`Mark custom pick for ${typeConfig.label} as active`}
        />
        <Input
          className={styles.typeCustomInput}
          type="text"
          value={customText}
          placeholder="Custom pick…"
          aria-label={`${typeConfig.label} custom pick`}
          disabled={!isSelected}
          onChange={handleCustomChange}
          onBlur={handleCustomBlur}
        />
      </div>
    </div>
  );
};
