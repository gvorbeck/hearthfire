import { useCallback } from 'react';
import { Input, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import styles from './RangerAnimalCompanion.module.css';

interface AnimalStatsProps {
  hp: string;
  armor: string;
  damage: string;
  name: string;
  damageTags: string;
  selectedTypeHp: string | undefined;
  onHpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHpBlur: () => void;
  onArmorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onArmorBlur: () => void;
  onDamageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDamageBlur: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
  onDamageTagsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDamageTagsBlur: () => void;
}

export const AnimalStats = ({
  hp,
  armor,
  damage,
  name,
  damageTags,
  selectedTypeHp,
  onHpChange,
  onHpBlur,
  onArmorChange,
  onArmorBlur,
  onDamageChange,
  onDamageBlur,
  onNameChange,
  onNameBlur,
  onDamageTagsChange,
  onDamageTagsBlur,
}: AnimalStatsProps) => {
  const handleWheel = useCallback((e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(), []);

  return (
    <PlaybookSection title="Stats">
      <Text as="p" size="xs" color="muted" leading="normal">
        {parseInlineMarkdown('You are accompanied by a beast, with whom you have bonded deeply and communicate without words. Treat it as a follower.')}
      </Text>
      <div className={styles.headerRow}>
        <div className={styles.statsRow}>
          <div className={styles.infoBox}>
            <Input
              className={styles.infoInput}
              type="number"
              value={hp}
              min={0}
              aria-label="Animal Companion HP"
              onChange={onHpChange}
              onBlur={onHpBlur}
              onWheel={handleWheel}
            />
            <Text as="span" size="xs" color="muted" className={styles.infoLabel}>HP <span className={styles.statNote}>Max [{selectedTypeHp ?? ' '}]</span></Text>
          </div>
          <div className={styles.infoBox}>
            <Input
              className={styles.infoInput}
              type="number"
              value={armor}
              min={0}
              aria-label="Animal Companion armor"
              onChange={onArmorChange}
              onBlur={onArmorBlur}
              onWheel={handleWheel}
            />
            <Text as="span" size="xs" color="muted" className={styles.infoLabel}>Armor <span className={styles.statNote}>See Type</span></Text>
          </div>
          <div className={styles.infoBox}>
            <Input
              className={styles.infoInput}
              type="text"
              value={damage}
              placeholder="—"
              aria-label="Animal Companion damage"
              onChange={onDamageChange}
              onBlur={onDamageBlur}
            />
            <Text as="span" size="xs" color="muted" className={styles.infoLabel}>Damage <span className={styles.statNote}>See Type</span></Text>
          </div>
        </div>
        <div className={styles.nameBlock}>
          <Input
            label="Name"
            className={styles.nameInput}
            type="text"
            value={name}
            placeholder="…"
            onChange={onNameChange}
            onBlur={onNameBlur}
          />
          <Input
            label="Damage tags"
            className={styles.tagsInput}
            type="text"
            value={damageTags}
            placeholder="…"
            onChange={onDamageTagsChange}
            onBlur={onDamageTagsBlur}
          />
        </div>
      </div>
    </PlaybookSection>
  );
};
