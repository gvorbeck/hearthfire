import { useCallback, useRef, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import styles from './ArcanaSubTabs.module.css';

export type ArcanaSubTab = 'minor' | 'major';

interface ArcanaSubTabsProps {
  subTab: ArcanaSubTab;
  onSelect: (tab: ArcanaSubTab) => void;
  minorCount: number;
  majorCount: number;
}

export const ArcanaSubTabs = ({ subTab, onSelect, minorCount, majorCount }: ArcanaSubTabsProps) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelectMinorTab = useCallback(() => onSelect('minor'), [onSelect]);
  const handleSelectMajorTab = useCallback(() => onSelect('major'), [onSelect]);

  const minorTabCx = clsx(styles.subTab, subTab === 'minor' && styles.subTabActive);
  const majorTabCx = clsx(styles.subTab, subTab === 'major' && styles.subTabActive);

  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const tabs: ArcanaSubTab[] = ['minor', 'major'];
      const currentIndex = tabs.indexOf(subTab);
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        onSelect(tabs[nextIndex]);
        tabRefs.current[nextIndex]?.focus();
      }
    },
    [subTab, onSelect],
  );

  return (
    <div className={styles.tabRow}>
      <div className={styles.subTabBar} role="tablist" aria-label="Arcana" onKeyDown={handleTabKeyDown}>
        <button
          ref={(el) => { tabRefs.current[0] = el; }}
          id="arcana-minor-tab"
          role="tab"
          className={minorTabCx}
          onClick={handleSelectMinorTab}
          aria-selected={subTab === 'minor'}
          aria-controls="arcana-minor-panel"
          tabIndex={subTab === 'minor' ? 0 : -1}
        >
          Minor Arcana
          {minorCount > 0 && (
            <span className={styles.badge}>{minorCount}</span>
          )}
        </button>
        <button
          ref={(el) => { tabRefs.current[1] = el; }}
          id="arcana-major-tab"
          role="tab"
          className={majorTabCx}
          onClick={handleSelectMajorTab}
          aria-selected={subTab === 'major'}
          aria-controls="arcana-major-panel"
          tabIndex={subTab === 'major' ? 0 : -1}
        >
          Major Arcana
          {majorCount > 0 && (
            <span className={styles.badge}>{majorCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};
