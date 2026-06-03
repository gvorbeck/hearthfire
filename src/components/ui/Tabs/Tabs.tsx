import {
  useState,
  useId,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useTooltip } from "../Tooltip/useTooltip";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import styles from "./Tabs.module.css";

interface Tab {
  id?: string;
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
  "aria-label": string;
  onAdd?: () => void;
}

export const tabBadgeClass = styles.tabBadge;

const portalTarget = typeof document !== "undefined" ? document.body : null;

const PortalTooltip = ({
  tooltipRef,
  tooltipId,
  visible,
  fixedCoords,
  arrowOffset,
  resolvedSide,
  children,
}: {
  tooltipRef: React.RefObject<HTMLSpanElement>;
  tooltipId: string;
  visible: boolean;
  fixedCoords: { top: number; left: number } | null;
  arrowOffset: string;
  resolvedSide: string;
  children: ReactNode;
}) => {
  if (!portalTarget) return null;

  const tipCx = clsx(
    styles.tabTooltip,
    styles.portalFixed,
    styles[resolvedSide],
    visible && styles.tabTooltipVisible,
  );

  return createPortal(
    <span
      ref={tooltipRef}
      role="tooltip"
      id={tooltipId}
      aria-hidden={!visible}
      className={tipCx}
      style={
        {
          top: fixedCoords?.top ?? 0,
          left: fixedCoords?.left ?? 0,
          "--nudge-x": "0px",
          "--arrow-offset": arrowOffset,
        } as React.CSSProperties
      }
    >
      {children}
      <span className={styles.tabTooltipArrow} />
    </span>,
    portalTarget,
  );
};

const TabRemoveButton = ({
  tab,
  slotId,
  baseId,
  onRemove,
}: {
  tab: Tab;
  slotId: string;
  baseId: string;
  onRemove: () => void;
}) => {
  const removeTooltip = useTooltip({
    side: "bottom",
    tooltipId: `${baseId}-tab-${slotId}-remove-tooltip`,
    portal: true,
  });

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <span className={styles.tabRemoveWrapper}>
      <button
        ref={removeTooltip.anchorRef as React.MutableRefObject<HTMLButtonElement | null>}
        type="button"
        className={styles.tabRemove}
        aria-label={tab.removeTooltip ?? `Remove ${tab.label} tab`}
        aria-describedby={removeTooltip.tooltipId}
        onClick={handleClick}
        {...removeTooltip.anchorProps}
      >
        <Icon name="close" aria-hidden size="small" />
      </button>
      <PortalTooltip
        tooltipRef={removeTooltip.tooltipRef}
        tooltipId={removeTooltip.tooltipId}
        visible={removeTooltip.visible}
        fixedCoords={removeTooltip.fixedCoords}
        arrowOffset={removeTooltip.arrowOffset}
        resolvedSide={removeTooltip.resolvedSide}
      >
        {tab.removeTooltip ?? `Remove ${tab.label}`}
      </PortalTooltip>
    </span>
  );
};

const AddTabButton = ({
  baseId,
  onAdd,
}: {
  baseId: string;
  onAdd: () => void;
}) => {
  const addTooltip = useTooltip({
    side: "bottom",
    tooltipId: `${baseId}-add-tooltip`,
    portal: true,
  });

  return (
    <>
      <span
        ref={addTooltip.anchorRef as React.MutableRefObject<HTMLSpanElement | null>}
        className={styles.addTabWrapper}
        {...addTooltip.anchorProps}
      >
        <Button
          variant="ghost"
          size="sm"
          icon="plus"
          onClick={onAdd}
          aria-label="Add an insert"
          aria-describedby={addTooltip.tooltipId}
          className={styles.addTab}
        />
      </span>
      <PortalTooltip
        tooltipRef={addTooltip.tooltipRef}
        tooltipId={addTooltip.tooltipId}
        visible={addTooltip.visible}
        fixedCoords={addTooltip.fixedCoords}
        arrowOffset={addTooltip.arrowOffset}
        resolvedSide={addTooltip.resolvedSide}
      >
        Add an Insert
      </PortalTooltip>
    </>
  );
};

const TabButton = ({
  tab,
  index,
  slotId,
  baseId,
  isActive,
  onActivate,
  onKeyDown,
  tabRefs,
  onRemove,
}: {
  tab: Tab;
  index: number;
  slotId: string;
  baseId: string;
  isActive: boolean;
  onActivate: (index: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  tabRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  onRemove?: () => void;
}) => {
  const tooltip = useTooltip({
    side: "bottom",
    tooltipId: tab.badgeTooltip ? `${baseId}-tab-${slotId}-tooltip` : undefined,
  });
  const cx = clsx(styles.tab, isActive && styles.active);
  const tipCx = clsx(
    styles.tabTooltip,
    styles[tooltip.resolvedSide],
    tooltip.visible && styles.tabTooltipVisible,
  );

  const handleRef = useCallback((el: HTMLButtonElement | null) => {
    tabRefs.current[index] = el;
    tooltip.anchorRef.current = el;
  }, [tabRefs, index, tooltip.anchorRef]);

  const handleClick = useCallback(() => onActivate(index), [onActivate, index]);
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, index), [onKeyDown, index]);

  const badgeTooltipEl = tab.badgeTooltip ? (
    <span
      ref={tooltip.tooltipRef}
      role="tooltip"
      id={tooltip.tooltipId}
      aria-hidden={!tooltip.visible}
      className={tipCx}
      style={
        {
          "--nudge-x": `${tooltip.nudgeX}px`,
          "--arrow-offset": tooltip.arrowOffset,
        } as React.CSSProperties
      }
    >
      {tab.badgeTooltip}
      <span className={styles.tabTooltipArrow} />
    </span>
  ) : null;

  return (
    <button
      ref={handleRef}
      role="tab"
      id={`${baseId}-tab-${slotId}`}
      aria-controls={`${baseId}-panel-${slotId}`}
      aria-selected={isActive}
      aria-describedby={tab.badgeTooltip ? tooltip.tooltipId : undefined}
      tabIndex={isActive ? 0 : -1}
      className={cx}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...(tab.badgeTooltip ? tooltip.anchorProps : {})}
    >
      {tab.label}
      {tab.badge}
      {onRemove && (
        <TabRemoveButton
          tab={tab}
          slotId={slotId}
          baseId={baseId}
          onRemove={onRemove}
        />
      )}
      {badgeTooltipEl}
    </button>
  );
};

export const Tabs = ({
  tabs,
  defaultIndex = 0,
  activeIndex,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  onAdd,
}: TabsProps) => {
  const [internalActive, setInternalActive] = useState(defaultIndex);
  const active = activeIndex ?? internalActive;
  const [everActive, setEverActive] = useState(() => new Set([activeIndex ?? defaultIndex]));
  const setActive = useCallback(
    (i: number) => {
      setInternalActive(i);
      setEverActive((prev) => (prev.has(i) ? prev : new Set([...prev, i])));
      onActiveChange?.(i);
    },
    [onActiveChange],
  );

  useEffect(() => {
    if (activeIndex !== undefined) {
      setEverActive((prev) => (prev.has(activeIndex) ? prev : new Set([...prev, activeIndex])));
    }
  }, [activeIndex]);

  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cx = clsx(styles.root, className);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
      if (e.key === "ArrowRight") {
        const next = (i + 1) % tabs.length;
        setActive(next);
        tabRefs.current[next]?.focus();
      } else if (e.key === "ArrowLeft") {
        const prev = (i - 1 + tabs.length) % tabs.length;
        setActive(prev);
        tabRefs.current[prev]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        setActive(0);
        tabRefs.current[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        const last = tabs.length - 1;
        setActive(last);
        tabRefs.current[last]?.focus();
      }
    },
    [tabs.length, setActive],
  );

  return (
    <div className={cx}>
      <div className={styles.tablistRow}>
        <div className={styles.tablist} role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab, i) => (
            <TabButton
              key={tab.id ?? tab.label}
              tab={tab}
              index={i}
              slotId={tab.id ?? tab.label}
              baseId={baseId}
              isActive={active === i}
              onActivate={setActive}
              onKeyDown={handleKeyDown}
              tabRefs={tabRefs}
              onRemove={tab.onRemove}
            />
          ))}
        </div>
        {onAdd && <AddTabButton baseId={baseId} onAdd={onAdd} />}
      </div>
      {tabs.map((tab, i) => {
        const slotId = tab.id ?? tab.label;
        return (
          <div
            key={slotId}
            role="tabpanel"
            id={`${baseId}-panel-${slotId}`}
            aria-labelledby={`${baseId}-tab-${slotId}`}
            hidden={active !== i}
            className={styles.panel}
          >
            {everActive.has(i) ? tab.content : null}
          </div>
        );
      })}
    </div>
  );
};
