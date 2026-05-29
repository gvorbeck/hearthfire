import {
  useState,
  useId,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useTooltip } from "../Tooltip/useTooltip";
import { Button } from "../Button/Button";
import styles from "./Tabs.module.css";

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
  index,
  baseId,
  onRemove,
}: {
  tab: Tab;
  index: number;
  baseId: string;
  onRemove: () => void;
}) => {
  const removeTooltip = useTooltip({
    side: "bottom",
    tooltipId: `${baseId}-tab-${index}-remove-tooltip`,
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
        ×
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
  baseId,
  isActive,
  onActivate,
  onKeyDown,
  buttonRef,
  onRemove,
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
  const tooltip = useTooltip({
    side: "bottom",
    tooltipId: tab.badgeTooltip ? `${baseId}-tab-${index}-tooltip` : undefined,
  });
  const cx = clsx(styles.tab, isActive && styles.active);
  const tipCx = clsx(
    styles.tabTooltip,
    styles[tooltip.resolvedSide],
    tooltip.visible && styles.tabTooltipVisible,
  );

  const handleRef = (el: HTMLButtonElement | null) => {
    buttonRef(el);
    tooltip.anchorRef.current = el;
  };

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
      id={`${baseId}-tab-${index}`}
      aria-controls={`${baseId}-panel-${index}`}
      aria-selected={isActive}
      aria-describedby={tab.badgeTooltip ? tooltip.tooltipId : undefined}
      tabIndex={isActive ? 0 : -1}
      className={cx}
      onClick={() => onActivate(index)}
      onKeyDown={(e) => onKeyDown(e, index)}
      {...(tab.badgeTooltip ? tooltip.anchorProps : {})}
    >
      {tab.label}
      {tab.badge}
      {onRemove && (
        <TabRemoveButton
          tab={tab}
          index={index}
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
  const setActive = useCallback(
    (i: number) => {
      setInternalActive(i);
      onActiveChange?.(i);
    },
    [onActiveChange],
  );
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cx = clsx(styles.root, className);

  const buttonRefSetters = tabs.map((_, i) => (el: HTMLButtonElement | null) => { tabRefs.current[i] = el; });

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
      }
    },
    [tabs.length, setActive],
  );

  return (
    <div className={cx}>
      <div className={styles.tablistRow}>
        {onAdd && <AddTabButton baseId={baseId} onAdd={onAdd} />}
        <div className={styles.tablist} role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab, i) => (
            <TabButton
              key={i}
              tab={tab}
              index={i}
              baseId={baseId}
              isActive={active === i}
              onActivate={setActive}
              onKeyDown={handleKeyDown}
              buttonRef={buttonRefSetters[i]}
              onRemove={tab.onRemove}
            />
          ))}
        </div>
      </div>
      {tabs.map((tab, i) => (
        <div
          key={i}
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
