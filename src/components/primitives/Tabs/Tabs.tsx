import { useState, useId, useRef, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './Tabs.module.css';

interface Tab {
  label: string;
  content: ReactNode;
  badge?: ReactNode;
  badgeTooltip?: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  className?: string;
  'aria-label': string;
  onAdd?: () => void;
}

export const tabBadgeClass = styles.tabBadge;

export const Tabs = ({ tabs, defaultIndex = 0, activeIndex, onActiveChange, className, 'aria-label': ariaLabel, onAdd }: TabsProps) => {
  const [internalActive, setInternalActive] = useState(defaultIndex);
  const active = activeIndex ?? internalActive;
  const setActive = useCallback((i: number) => {
    setInternalActive(i);
    onActiveChange?.(i);
  }, [onActiveChange]);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cx = clsx(styles.root, className);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setActive(Number(e.currentTarget.dataset.index));
  }, [setActive]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    const i = Number(e.currentTarget.dataset.index);
    if (e.key === 'ArrowRight') {
      const next = (i + 1) % tabs.length;
      setActive(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (i - 1 + tabs.length) % tabs.length;
      setActive(prev);
      tabRefs.current[prev]?.focus();
    }
  }, [tabs.length, setActive]);

  return (
    <div className={cx}>
      <div className={styles.tablistRow}>
        {onAdd && (
          <Tooltip text="Add an insert" side="bottom" noTabStop>
            <button
              type="button"
              className={styles.addTab}
              onClick={onAdd}
              aria-label="Add an insert"
            >
              +
            </button>
          </Tooltip>
        )}
        <div className={styles.tablist} role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab, i) => {
            const tabCx = clsx(styles.tab, active === i && styles.active);
            const tooltipId = tab.badgeTooltip ? `${id}-tab-${i}-tooltip` : undefined;
            const btn = (
              <button
                key={tab.label}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                id={`${id}-tab-${i}`}
                aria-controls={`${id}-panel-${i}`}
                aria-selected={active === i}
                aria-describedby={tooltipId}
                tabIndex={active === i ? 0 : -1}
                className={tabCx}
                data-index={i}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
              >
                {tab.label}
                {tab.badge}
              </button>
            );
            return tab.badgeTooltip ? (
              <Tooltip key={tab.label} text={tab.badgeTooltip} side="bottom" noTabStop tooltipId={tooltipId}>
                {btn}
              </Tooltip>
            ) : btn;
          })}
        </div>
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
          className={styles.panel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
