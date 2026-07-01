import { useState, useRef, useEffect, useId, useCallback } from 'react';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const SCREEN_MARGIN = 8;
const TOOLTIP_GAP = 8;

export interface UseTooltipOptions {
  side?: TooltipSide;
  tooltipId?: string;
  portal?: boolean;
  // Called with the anchor element whenever it mounts/unmounts, so a consumer can
  // also collect the node (e.g. into a parent ref array) without reaching in and
  // mutating the hook's own anchor ref.
  externalRef?: (el: HTMLElement | null) => void;
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
  // A callback ref: attach via ref={anchorRef}. The hook owns the write to its
  // internal anchor storage (and forwards to any externalRef), so consumers never
  // mutate a hook-owned ref directly.
  anchorRef: (el: HTMLElement | null) => void;
  tooltipRef: React.RefObject<HTMLSpanElement>;
  anchorProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onPointerDown: (e: React.PointerEvent) => void;
  };
}

export const useTooltip = ({ side = 'top', tooltipId: externalId, portal = false, externalRef }: UseTooltipOptions = {}): UseTooltipResult => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<PositionState>({
    resolvedSide: side,
    nudgeX: 0,
    arrowOffset: '50%',
    fixedCoords: null,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Private anchor storage, owned entirely by this hook. Consumers attach it via
  // the `setAnchor` callback ref below rather than touching this directly.
  const anchorRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const generatedId = useId();
  const tooltipId = externalId ?? generatedId;

  const setAnchor = useCallback((el: HTMLElement | null) => {
    anchorRef.current = el;
    externalRef?.(el);
  }, [externalRef]);

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

  // Touch devices have no hover or focus-via-tab, so tooltip content would be
  // unreachable. Tapping the anchor toggles the tooltip; tapping anywhere else
  // (or pressing Escape) dismisses it. pointerdown lets us branch on
  // pointerType so we don't fight the synthesized mouse events touch produces.
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    if (visible) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(false);
    } else {
      show();
    }
  }, [visible, show]);

  useEffect(() => {
    if (!visible) return;
    const dismiss = (e: Event) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      setVisible(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', onKey);
    };
  }, [visible]);

  return {
    tooltipId,
    visible,
    resolvedSide: position.resolvedSide,
    nudgeX: position.nudgeX,
    arrowOffset: position.arrowOffset,
    fixedCoords: position.fixedCoords,
    anchorRef: setAnchor,
    tooltipRef,
    anchorProps: {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      onPointerDown: handlePointerDown,
    },
  };
};
