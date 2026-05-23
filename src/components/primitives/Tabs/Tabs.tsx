import { useState, useId, useRef, useCallback, type ReactNode, type KeyboardEvent, type MouseEvent } from 'react';
import clsx from 'clsx';
import { useTooltip } from '../Tooltip/useTooltip';
import styles from './Tabs.module.css';

interface Tab {
  label: string;
  content: ReactNode;
  badge?: ReactNode;
  badgeTooltip?: string;
  onRemove?: () => void;
  removeTooltip?: string;
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

const TabRemoveButton = ({ tab, index, baseId, onRemove }: { tab: Tab; index: number; baseId: string; onRemove: () => void }) => {
  const removeTooltip = useTooltip({ side: 'bottom', tooltipId: `${baseId}-tab-${index}-remove-tooltip` });

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  const tipCx = clsx(styles.tabTooltip, styles[removeTooltip.resolvedSide], removeTooltip.visible && styles.tabTooltipVisible);

  return (
    <span className={styles.tabRemoveWrapper}>
      <button
        ref={(el) => { (removeTooltip.anchorRef as React.MutableRefObject<HTMLElement | null>).current = el; }}
        type="button"
        className={styles.tabRemove}
        aria-label={tab.removeTooltip ?? `Remove ${tab.label} tab`}
        aria-describedby={removeTooltip.tooltipId}
        onClick={handleClick}
        {...removeTooltip.anchorProps}
      >
        ×
      </button>
      <span
        ref={removeTooltip.tooltipRef}
        role="tooltip"
        id={removeTooltip.tooltipId}
        aria-hidden={!removeTooltip.visible}
        className={tipCx}
        style={{ '--nudge-x': `${removeTooltip.nudgeX}px`, '--arrow-offset': removeTooltip.arrowOffset } as React.CSSProperties}
      >
        {tab.removeTooltip ?? `Remove ${tab.label}`}
        <span className={styles.tabTooltipArrow} />
      </span>
    </span>
  );
};

const TabButton = ({
  tab, index, baseId, isActive, onActivate, onKeyDown, buttonRef, onRemove,
}: {
  tab: Tab;
  index: number;
  baseId: string;
  isActive: boolean;
  onActivate: (index: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onRemove?: () => void;
}) => {
  const tooltip = useTooltip({ side: 'bottom', tooltipId: tab.badgeTooltip ? `${baseId}-tab-${index}-tooltip` : undefined });
  const cx = clsx(styles.tab, isActive && styles.active);

  const handleClick = useCallback(() => onActivate(index), [onActivate, index]);
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, index), [onKeyDown, index]);

  return (
    <button
      ref={(el) => {
        buttonRef(el);
        (tooltip.anchorRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      role="tab"
      id={`${baseId}-tab-${index}`}
      aria-controls={`${baseId}-panel-${index}`}
      aria-selected={isActive}
      aria-describedby={tab.badgeTooltip ? tooltip.tooltipId : undefined}
      tabIndex={isActive ? 0 : -1}
      className={cx}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...(tab.badgeTooltip ? tooltip.anchorProps : {})}
      style={{ position: 'relative' }}
    >
      {tab.label}
      {tab.badge}
      {onRemove && <TabRemoveButton tab={tab} index={index} baseId={baseId} onRemove={onRemove} />}
      {tab.badgeTooltip && (() => {
        const tipCx = clsx(styles.tabTooltip, styles[tooltip.resolvedSide], tooltip.visible && styles.tabTooltipVisible);
        return (
          <span
            ref={tooltip.tooltipRef}
            role="tooltip"
            id={tooltip.tooltipId}
            aria-hidden={!tooltip.visible}
            className={tipCx}
            style={{ '--nudge-x': `${tooltip.nudgeX}px`, '--arrow-offset': tooltip.arrowOffset } as React.CSSProperties}
          >
            {tab.badgeTooltip}
            <span className={styles.tabTooltipArrow} />
          </span>
        );
      })()}
    </button>
  );
};

export const Tabs = ({ tabs, defaultIndex = 0, activeIndex, onActiveChange, className, 'aria-label': ariaLabel, onAdd }: TabsProps) => {
  const [internalActive, setInternalActive] = useState(defaultIndex);
  const active = activeIndex ?? internalActive;
  const setActive = useCallback((i: number) => {
    setInternalActive(i);
    onActiveChange?.(i);
  }, [onActiveChange]);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cx = clsx(styles.root, className);

  const handleActivate = useCallback((i: number) => setActive(i), [setActive]);

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
  }, [tabs.length, setActive]);

  return (
    <div className={cx}>
      <div className={styles.tablistRow}>
        {onAdd && (
          <button
            type="button"
            className={styles.addTab}
            onClick={onAdd}
            aria-label="Add an insert"
          >
            +
          </button>
        )}
        <div className={styles.tablist} role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab, i) => (
            <TabButton
              key={tab.label}
              tab={tab}
              index={i}
              baseId={baseId}
              isActive={active === i}
              onActivate={handleActivate}
              onKeyDown={handleKeyDown}
              buttonRef={(el) => { tabRefs.current[i] = el; }}
              onRemove={tab.onRemove}
            />
          ))}
        </div>
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={active !== i}
          className={styles.panel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
