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
  overrideNote?: string;
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
  overrideNote,
  children,
}: PlaybookSectionProps) => {
  const showCollapse = collapsible && !!onToggleCollapse && !overrideNote;
  const chevronCx = clsx(styles.collapseChevron, !isCollapsed && styles.collapseChevronOpen);
  const collapseCx = clsx(styles.collapseToggle, warn && styles.collapseToggleHidden);
  const chooseCx = clsx(styles.sectionTitleChoose, (!warn || !!overrideNote) && styles.sectionTitleChooseHidden);
  const warnCx = clsx(styles.sectionTitleWarn, (!warn || !!overrideNote) && styles.sectionTitleWarnHidden);
  const sectionCx = clsx(styles.section, overrideNote && styles.sectionOverride);

  return (
    <section className={sectionCx}>
      <div className={styles.sectionHeader}>
        <Heading as="h3" size="label" className={styles.sectionTitle}>
          {title}
          {(choose !== undefined || chooseNote) && (
            <span className={chooseCx}>
              {choose !== undefined ? `(Choose ${choose}${chooseNote ? `, ${chooseNote}` : ''})` : `(${chooseNote})`}
            </span>
          )}
          <Tooltip text={warnText} side="top" noTabStop={!warn || !!overrideNote} className={warnCx}>
            <Icon name="warning" size="small" aria-hidden={true} />
          </Tooltip>
        </Heading>
        {overrideNote && (
          <span className={styles.sectionOverrideNote}>{overrideNote}</span>
        )}
        {showCollapse && (
          <Button
            variant="ghost"
            size="sm"
            className={collapseCx}
            onClick={warn ? undefined : onToggleCollapse}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
            tabIndex={warn ? -1 : undefined}
            aria-hidden={warn || undefined}
          >
            <Icon name="chevron-down" size="small" className={chevronCx} aria-hidden="true" />
          </Button>
        )}
      </div>
      {children}
    </section>
  );
};
