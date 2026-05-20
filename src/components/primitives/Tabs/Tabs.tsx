import { useState, useId, useRef, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './Tabs.module.css';

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
  className?: string;
  'aria-label': string;
  onAdd?: () => void;
}

export const Tabs = ({ tabs, defaultIndex = 0, className, 'aria-label': ariaLabel, onAdd }: TabsProps) => {
  const [active, setActive] = useState(defaultIndex);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cx = clsx(styles.root, className);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight') {
      const next = (i + 1) % tabs.length;
      setActive(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (i - 1 + tabs.length) % tabs.length;
      setActive(prev);
      tabRefs.current[prev]?.focus();
    }
  }, [tabs.length]);

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
            return (
              <button
                key={tab.label}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                id={`${id}-tab-${i}`}
                aria-controls={`${id}-panel-${i}`}
                aria-selected={active === i}
                tabIndex={active === i ? 0 : -1}
                className={tabCx}
                onClick={() => setActive(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              >
                {tab.label}
              </button>
            );
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
