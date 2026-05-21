import { useState, useRef, useEffect, useId, useCallback } from 'react';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const SCREEN_MARGIN = 8;
const TOOLTIP_GAP = 8;

export interface UseTooltipOptions {
  side?: TooltipSide;
  tooltipId?: string;
}

export interface UseTooltipResult {
  tooltipId: string;
  visible: boolean;
  resolvedSide: TooltipSide;
  nudgeX: number;
  arrowOffset: string;
  anchorRef: React.RefObject<HTMLElement>;
  tooltipRef: React.RefObject<HTMLSpanElement>;
  anchorProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export const useTooltip = ({ side = 'top', tooltipId: externalId }: UseTooltipOptions = {}): UseTooltipResult => {
  const [visible, setVisible] = useState(false);
  const [resolvedSide, setResolvedSide] = useState<TooltipSide>(side);
  const [nudgeX, setNudgeX] = useState(0);
  const [arrowOffset, setArrowOffset] = useState('50%');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLElement>(null);
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
      const tipWidth = tip.offsetWidth;
      const tipHeight = tip.offsetHeight;
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

        setResolvedSide(flippedSide);
        setNudgeX(shift);
        setArrowOffset(shift !== 0 ? `${50 - (shift / tipWidth) * 100}%` : '50%');
      } else if (side === 'right') {
        const naturalRight = anchorRect.right + TOOLTIP_GAP + tipWidth;
        setResolvedSide(naturalRight > vw - SCREEN_MARGIN ? 'left' : 'right');
        setNudgeX(0);
        setArrowOffset('50%');
      } else {
        const naturalLeft = anchorRect.left - TOOLTIP_GAP - tipWidth;
        setResolvedSide(naturalLeft < SCREEN_MARGIN ? 'right' : 'left');
        setNudgeX(0);
        setArrowOffset('50%');
      }
    }

    setVisible(true);
  }, [side]);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }, []);

  return {
    tooltipId,
    visible,
    resolvedSide,
    nudgeX,
    arrowOffset,
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
