import {
  useState,
  useId,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
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
          "--tooltip-top": `${fixedCoords?.top ?? 0}px`,
          "--tooltip-left": `${fixedCoords?.left ?? 0}px`,
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
  const { anchorRef, tooltipId, anchorProps, tooltipRef, visible, fixedCoords, arrowOffset, resolvedSide } = useTooltip({
    side: "bottom",
    tooltipId: `${baseId}-tab-${slotId}-remove-tooltip`,
    portal: true,
  });

  const handleClick = () => onRemove();

  return (
    <span className={styles.tabRemoveWrapper}>
      <button
        ref={anchorRef}
        type="button"
        className={styles.tabRemove}
        aria-label={tab.removeTooltip ?? `Remove ${tab.label} tab`}
        aria-describedby={tooltipId}
        onClick={handleClick}
        {...anchorProps}
      >
        <Icon name="close" aria-hidden size="small" />
      </button>
      <PortalTooltip
        tooltipRef={tooltipRef}
        tooltipId={tooltipId}
        visible={visible}
        fixedCoords={fixedCoords}
        arrowOffset={arrowOffset}
        resolvedSide={resolvedSide}
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
  const { anchorRef, tooltipId, anchorProps, tooltipRef, visible, fixedCoords, arrowOffset, resolvedSide } = useTooltip({
    side: "bottom",
    tooltipId: `${baseId}-add-tooltip`,
    portal: true,
  });

  return (
    <>
      <span
        ref={anchorRef}
        className={styles.addTabWrapper}
        {...anchorProps}
      >
        <Button
          variant="ghost"
          size="sm"
          icon="plus"
          onClick={onAdd}
          aria-label="Add an insert"
          aria-describedby={tooltipId}
          className={styles.addTab}
        />
      </span>
      <PortalTooltip
        tooltipRef={tooltipRef}
        tooltipId={tooltipId}
        visible={visible}
        fixedCoords={fixedCoords}
        arrowOffset={arrowOffset}
        resolvedSide={resolvedSide}
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
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, index: number) => void;
  tabRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onRemove?: () => void;
}) => {
  // Collect this tab's DOM node into the parent's ref array as the anchor mounts.
  // The tooltip hook owns the write to its own anchor storage and forwards here,
  // so we never mutate a hook-owned ref by hand.
  const collectTabNode = useCallback((el: HTMLElement | null) => {
    // Collecting child DOM nodes into the parent's ref array is the standard
    // callback-ref pattern; `tabRefs` is owned by the parent Tabs and passed down
    // precisely as mutable collection storage. The Compiler can't see that intent
    // from here, so it flags the write — safe to allow.
    // eslint-disable-next-line react-hooks/immutability
    tabRefs.current[index] = el as HTMLDivElement | null;
  }, [tabRefs, index]);
  const { anchorRef, tooltipId, anchorProps, tooltipRef, visible, nudgeX, arrowOffset, resolvedSide } = useTooltip({
    side: "bottom",
    tooltipId: tab.badgeTooltip ? `${baseId}-tab-${slotId}-tooltip` : undefined,
    externalRef: collectTabNode,
  });
  const cx = clsx(styles.tab, isActive && styles.active, onRemove && styles.tabHasRemove);
  const slotCx = clsx(styles.tabSlot, isActive && styles.tabSlotActive);
  const tipCx = clsx(
    styles.tabTooltip,
    styles[resolvedSide],
    visible && styles.tabTooltipVisible,
  );

  const handleClick = useCallback(() => onActivate(index), [onActivate, index]);
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    // role="tab" is not a native button, so activate on Enter/Space ourselves; arrow/Home/End
    // navigation is delegated to the parent handler.
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate(index);
      return;
    }
    onKeyDown(e, index);
  }, [onActivate, onKeyDown, index]);

  const badgeTooltipEl = tab.badgeTooltip ? (
    <span
      ref={tooltipRef}
      role="tooltip"
      id={tooltipId}
      aria-hidden={!visible}
      className={tipCx}
      style={
        {
          "--nudge-x": `${nudgeX}px`,
          "--arrow-offset": arrowOffset,
        } as React.CSSProperties
      }
    >
      {tab.badgeTooltip}
      <span className={styles.tabTooltipArrow} />
    </span>
  ) : null;

  // The remove control is a real <button>; render it as a sibling of the
  // role="tab" element (which is itself interactive) rather than a child, so the
  // tab never contains an interactive descendant.
  return (
    <div className={slotCx}>
      <div
        ref={anchorRef}
        role="tab"
        id={`${baseId}-tab-${slotId}`}
        aria-controls={`${baseId}-panel-${slotId}`}
        aria-selected={isActive}
        aria-describedby={tab.badgeTooltip ? tooltipId : undefined}
        tabIndex={isActive ? 0 : -1}
        className={cx}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...(tab.badgeTooltip ? anchorProps : {})}
      >
        {tab.label}
        {tab.badge}
        {badgeTooltipEl}
      </div>
      {onRemove && (
        <TabRemoveButton
          tab={tab}
          slotId={slotId}
          baseId={baseId}
          onRemove={onRemove}
        />
      )}
    </div>
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

  const baseId = useId();
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  const resolvedTabs = useMemo(
    () =>
      tabs.map((tab, i) => ({
        ...tab,
        id: (tab.id ?? `${baseId}-slot-${i}`).replace(/[^\w-]/g, "-"),
      })),
    [tabs, baseId],
  );

  // Track which panels have ever been active by resolved id, not index: panels
  // render keyed by id, and dynamic insert tabs shift indices out from under a
  // Set<number>, which would mis-mount panels.
  const [everActiveIds, setEverActiveIds] = useState<Set<string>>(
    () => new Set([resolvedTabs[active]?.id].filter((id): id is string => id !== undefined)),
  );
  const setActive = useCallback(
    (i: number) => {
      setInternalActive(i);
      const id = resolvedTabs[i]?.id;
      if (id !== undefined) {
        setEverActiveIds((prev) => (prev.has(id) ? prev : new Set([...prev, id])));
      }
      onActiveChange?.(i);
    },
    [onActiveChange, resolvedTabs],
  );

  // Record the active panel's id as "ever active" during render rather than in an
  // effect. This is React's sanctioned adjust-state-while-rendering pattern (no
  // post-paint cascade), and it also covers a controlled `active` prop changing
  // externally — a case the setActive click handler above wouldn't see.
  const activeId = resolvedTabs[active]?.id;
  if (activeId !== undefined && !everActiveIds.has(activeId)) {
    setEverActiveIds((prev) => (prev.has(activeId) ? prev : new Set([...prev, activeId])));
  }

  const cx = clsx(styles.root, className);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, i: number) => {
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
          {resolvedTabs.map((tab, i) => (
            <TabButton
              key={tab.id}
              tab={tab}
              index={i}
              slotId={tab.id}
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
      {resolvedTabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={active !== i}
          className={styles.panel}
        >
          {everActiveIds.has(tab.id) ? tab.content : null}
        </div>
      ))}
    </div>
  );
};
