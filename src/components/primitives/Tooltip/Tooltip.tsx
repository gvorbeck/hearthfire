import clsx from 'clsx';
import { useTooltip } from './useTooltip';
import styles from './Tooltip.module.css';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  text: string;
  side?: TooltipSide;
  className?: string;
  /** Set when the child is already focusable (e.g. a button) to avoid a duplicate tab stop on the wrapper. */
  noTabStop?: boolean;
  /** Pass the id of the tooltip element to an already-focusable child via aria-describedby. */
  tooltipId?: string;
  children: React.ReactNode;
}


export const Tooltip = ({ text, side = 'top', className, noTabStop = false, tooltipId: externalId, children }: TooltipProps) => {
  const { tooltipId, visible, resolvedSide, nudgeX, arrowOffset, anchorRef, tooltipRef, anchorProps } = useTooltip({ side, tooltipId: externalId });

  const wrapperCx = clsx(styles.wrapper, className);
  const cx = clsx(styles.tooltip, styles[resolvedSide], visible && styles.visible);

  return (
    <span
      ref={anchorRef as React.MutableRefObject<HTMLSpanElement | null>}
      className={wrapperCx}
      aria-describedby={noTabStop ? undefined : tooltipId}
      tabIndex={noTabStop ? undefined : 0}
      {...anchorProps}
    >
      {children}
      <span
        ref={tooltipRef}
        role="tooltip"
        id={tooltipId}
        aria-hidden={!visible}
        className={cx}
        style={{ '--nudge-x': `${nudgeX}px`, '--arrow-offset': arrowOffset } as React.CSSProperties}
      >
        {text}
        <span className={styles.arrow} />
      </span>
    </span>
  );
};
