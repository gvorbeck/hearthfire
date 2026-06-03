import { useState, useRef, useEffect, useId, useCallback } from 'react';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const SCREEN_MARGIN = 8;
const TOOLTIP_GAP = 8;

export interface UseTooltipOptions {
  side?: TooltipSide;
  tooltipId?: string;
  portal?: boolean;
}

interface PositionState {
  resolvedSide: TooltipSide;
  nudgeX: number;
  arrowOffset: string;
  fixedCoords: { top: number; left: number } | null;
}

export interface UseTooltipResult {
  tooltipId: string;
  visible: boolean;
  resolvedSide: TooltipSide;
  nudgeX: number;
  arrowOffset: string;
  fixedCoords: { top: number; left: number } | null;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLSpanElement>;
  anchorProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export const useTooltip = ({ side = 'top', tooltipId: externalId, portal = false }: UseTooltipOptions = {}): UseTooltipResult => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<PositionState>({
    resolvedSide: side,
    nudgeX: 0,
    arrowOffset: '50%',
    fixedCoords: null,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const generatedId = useId();
  const tooltipId = externalId ?? generatedId;

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const anchor = anchorRef.current;
    const tip = tooltipRef.current;

    if (anchor && tip) {
      const anchorRect = anchor.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();
      const tipWidth = tipRect.width;
      const tipHeight = tipRect.height;
      const vw = window.innerWidth;

      if (side === 'top' || side === 'bottom') {
        const naturalLeft = anchorRect.left + anchorRect.width / 2 - tipWidth / 2;
        const naturalRight = naturalLeft + tipWidth;

        let shift = 0;
        if (naturalLeft < SCREEN_MARGIN) {
          shift = SCREEN_MARGIN - naturalLeft;
        } else if (naturalRight > vw - SCREEN_MARGIN) {
          shift = (vw - SCREEN_MARGIN) - naturalRight;
        }

        const flippedSide =
          side === 'top' && anchorRect.top - tipHeight - TOOLTIP_GAP < SCREEN_MARGIN ? 'bottom'
          : side === 'bottom' && anchorRect.bottom + tipHeight + TOOLTIP_GAP > window.innerHeight - SCREEN_MARGIN ? 'top'
          : side;

        if (portal) {
          const tipTop = flippedSide === 'bottom'
            ? anchorRect.bottom + TOOLTIP_GAP
            : anchorRect.top - tipHeight - TOOLTIP_GAP;
          setPosition({
            resolvedSide: flippedSide,
            nudgeX: 0,
            arrowOffset: '50%',
            fixedCoords: { top: tipTop, left: anchorRect.left + anchorRect.width / 2 },
          });
        } else {
          setPosition({
            resolvedSide: flippedSide,
            nudgeX: shift,
            arrowOffset: shift !== 0 ? `${50 - (shift / tipWidth) * 100}%` : '50%',
            fixedCoords: null,
          });
        }
      } else if (side === 'right') {
        const naturalRight = anchorRect.right + TOOLTIP_GAP + tipWidth;
        setPosition({
          resolvedSide: naturalRight > vw - SCREEN_MARGIN ? 'left' : 'right',
          nudgeX: 0,
          arrowOffset: '50%',
          fixedCoords: null,
        });
      } else {
        const naturalLeft = anchorRect.left - TOOLTIP_GAP - tipWidth;
        setPosition({
          resolvedSide: naturalLeft < SCREEN_MARGIN ? 'right' : 'left',
          nudgeX: 0,
          arrowOffset: '50%',
          fixedCoords: null,
        });
      }
    }

    setVisible(true);
  }, [side, portal]);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }, []);

  return {
    tooltipId,
    visible,
    resolvedSide: position.resolvedSide,
    nudgeX: position.nudgeX,
    arrowOffset: position.arrowOffset,
    fixedCoords: position.fixedCoords,
    anchorRef,
    tooltipRef,
    anchorProps: {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
    },
  };
};
