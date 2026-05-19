import clsx from 'clsx';
import { Heading, Icon, Tooltip } from '@/components/primitives';
import styles from './CharacterSheet.module.css';

const WARN_TEXT = 'This section has unresolved choices — select an option to complete it.';

interface PlaybookSectionProps {
  title: string;
  choose?: number;
  chooseNote?: string;
  warn?: boolean;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  children?: React.ReactNode;
}

export const PlaybookSection = ({
  title,
  choose,
  chooseNote,
  warn,
  collapsible,
  isCollapsed,
  onToggleCollapse,
  children,
}: PlaybookSectionProps) => {
  const showCollapse = collapsible && !warn;
  const chevronCx = clsx(styles.collapseChevron, !isCollapsed && styles.collapseChevronOpen);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Heading as="h3" size="label" className={styles.sectionTitle}>
          {title}
          {choose !== undefined && warn && (
            <span className={styles.sectionTitleChoose}>
              (Choose {choose}{chooseNote ? `, ${chooseNote}` : ''})
            </span>
          )}
          {warn && (
            <Tooltip text={WARN_TEXT} side="top" className={styles.sectionTitleWarn}>
              <Icon name="warning" size="small" aria-hidden={true} />
            </Tooltip>
          )}
        </Heading>
        {showCollapse && (
          <button
            type="button"
            className={styles.collapseToggle}
            onClick={onToggleCollapse}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            <Icon
              name="chevron-down"
              size="small"
              className={chevronCx}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
      {children}
    </section>
  );
};
