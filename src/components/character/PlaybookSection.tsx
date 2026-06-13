import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { Button, Heading, Icon, Text, Tooltip } from '@/components/ui';
import styles from './CharacterSheet.module.css';

const DEFAULT_WARN_TEXT = 'This section has unresolved choices — select an option to complete it.';

interface PlaybookSectionProps {
  title: string;
  choose?: number;
  chooseNote?: string;
  warn?: boolean;
  warnText?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  forceChildren?: boolean;
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
  defaultOpen = true,
  isCollapsed,
  onToggleCollapse,
  forceChildren,
  overrideNote,
  children,
}: PlaybookSectionProps) => {
  const isUncontrolled = collapsible && !onToggleCollapse;
  const [selfOpen, setSelfOpen] = useState(defaultOpen);

  const handleSelfToggle = useCallback(() => setSelfOpen(v => !v), []);

  const collapsed = isUncontrolled ? !selfOpen : !!isCollapsed;
  const handleToggle = isUncontrolled ? handleSelfToggle : onToggleCollapse;

  const showCollapse = collapsible && !overrideNote;
  const chevronCx = clsx(styles.collapseChevron, !collapsed && styles.collapseChevronOpen);
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
            <Text as="span" className={chooseCx}>
              {choose !== undefined ? `(Choose ${choose}${chooseNote ? `, ${chooseNote}` : ''})` : `(${chooseNote})`}
            </Text>
          )}
          <Tooltip text={warnText} side="top" noTabStop={!warn || !!overrideNote} className={warnCx}>
            <Icon name="warning" size="small" aria-hidden={true} />
          </Tooltip>
        </Heading>
        {overrideNote && (
          <Text as="span" className={styles.sectionOverrideNote}>{overrideNote}</Text>
        )}
        {showCollapse && (
          <Button
            variant="ghost"
            size="sm"
            className={collapseCx}
            onClick={warn ? undefined : handleToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
            tabIndex={warn ? -1 : undefined}
            aria-hidden={warn || undefined}
          >
            <Icon name="chevron-down" size="small" className={chevronCx} aria-hidden="true" />
          </Button>
        )}
      </div>
      {(!collapsed || forceChildren) && children}
    </section>
  );
};
