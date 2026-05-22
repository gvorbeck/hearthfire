import clsx from 'clsx';
import { Button, Heading, Icon, Tooltip } from '@/components/primitives';
import styles from './CharacterSheet.module.css';

const DEFAULT_WARN_TEXT = 'This section has unresolved choices — select an option to complete it.';

interface PlaybookSectionProps {
  title: string;
  choose?: number;
  chooseNote?: string;
  warn?: boolean;
  warnText?: string;
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
  warnText = DEFAULT_WARN_TEXT,
  collapsible,
  isCollapsed,
  onToggleCollapse,
  children,
}: PlaybookSectionProps) => {
  const showCollapse = collapsible && !warn && !!onToggleCollapse;
  const chevronCx = clsx(styles.collapseChevron, !isCollapsed && styles.collapseChevronOpen);
  const chooseCx = clsx(styles.sectionTitleChoose, !warn && styles.sectionTitleChooseHidden);
  const warnCx = clsx(styles.sectionTitleWarn, !warn && styles.sectionTitleWarnHidden);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <Heading as="h3" size="label" className={styles.sectionTitle}>
          {title}
          {(choose !== undefined || chooseNote) && (
            <span className={chooseCx}>
              {choose !== undefined ? `(Choose ${choose}${chooseNote ? `, ${chooseNote}` : ''})` : `(${chooseNote})`}
            </span>
          )}
          <Tooltip text={warnText} side="top" noTabStop={!warn} className={warnCx}>
            <Icon name="warning" size="small" aria-hidden={true} />
          </Tooltip>
        </Heading>
        {showCollapse && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.collapseToggle}
            onClick={onToggleCollapse}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            <Icon name="chevron-down" size="small" className={chevronCx} aria-hidden="true" />
          </Button>
        )}
      </div>
      {children}
    </section>
  );
};
