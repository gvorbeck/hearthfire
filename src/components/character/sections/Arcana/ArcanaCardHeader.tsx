import { Button, Icon, Text } from '@/components/ui';
import styles from './ArcanaCardHeader.module.css';

interface ArcanaCardHeaderProps {
  id: string;
  name: string;
  tags?: string;
  // Minor arcana carry a provisions weight; rendered as that many empty-provisions diamonds.
  weight?: number;
  onRemove: () => void;
}

// The card title row shared by major and minor arcana: name, optional weight + tags, and the remove
// button. Minor cards pass a weight; major cards omit it.
export const ArcanaCardHeader = ({
  id,
  name,
  tags,
  weight,
  onRemove,
}: ArcanaCardHeaderProps) => (
  <div className={styles.header}>
    <div className={styles.headerText}>
      <Text font="serif" weight="bold">
        {name}
      </Text>
      {(weight !== undefined || tags) && (
        <div className={styles.meta}>
          {weight !== undefined && (
            <span className={styles.provisions}>
              {Array.from({ length: weight }).map((_, i) => (
                <Icon
                  key={`prov-${id}-${i}`}
                  name="empty-provisions"
                  size="small"
                  aria-label="provisions"
                />
              ))}
            </span>
          )}
          {tags && (
            <Text as="span" font="serif" italic color="muted">
              {tags}
            </Text>
          )}
        </div>
      )}
    </div>
    <Button
      variant="ghost"
      icon="close"
      onClick={onRemove}
      aria-label={`Remove ${name}`}
      className={styles.removeBtn}
    />
  </div>
);
