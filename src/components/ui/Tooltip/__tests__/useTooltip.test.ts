import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTooltip, type UseTooltipOptions } from '../useTooltip';

// Mirrors the constants in useTooltip.ts.
const MARGIN = 8;
const GAP = 8;

const TIP_W = 100;
const TIP_H = 30;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// jsdom has no layout engine, so every rect is 0×0 at 0,0 unless we supply one.
const withRect = <T extends HTMLElement>(el: T, { left, top, width, height }: Rect): T => {
  el.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({}),
    }) as DOMRect;
  return el;
};

// Hoisted so renderHook gets a stable options reference on every render.
const PORTAL_BOTTOM: UseTooltipOptions = { side: 'bottom', portal: true };
const FLOW_BOTTOM: UseTooltipOptions = { side: 'bottom', portal: false };

// Drives the hook exactly as a real anchor does: attach both nodes, then hover.
const showAt = (options: UseTooltipOptions, anchorRect: Rect) => {
  const { result } = renderHook(() => useTooltip(options));
  const anchor = withRect(document.createElement('span'), anchorRect);
  const tip = withRect(document.createElement('span'), { left: 0, top: 0, width: TIP_W, height: TIP_H });

  act(() => {
    result.current.anchorRef(anchor);
    result.current.tooltipRef.current = tip;
  });
  act(() => {
    result.current.anchorProps.onMouseEnter();
  });

  return result;
};

// A portalled tooltip is centred on fixedCoords.left by translateX(-50%), so the
// painted box straddles that point.
const boxOf = (left: number) => ({ left: left - TIP_W / 2, right: left + TIP_W / 2 });

// Where the arrow actually lands, given the box and the percentage offset.
const arrowX = (left: number, arrowOffset: string) =>
  boxOf(left).left + (TIP_W * parseFloat(arrowOffset)) / 100;

const CENTRED = { left: 500, top: 100, width: 40, height: 20 };
const AT_LEFT_EDGE = { left: 0, top: 100, width: 20, height: 20 };

describe('useTooltip portal positioning', () => {
  it('centres the tooltip on its anchor when there is room', () => {
    const { current } = showAt(PORTAL_BOTTOM, CENTRED);

    expect(current.resolvedSide).toBe('bottom');
    expect(current.fixedCoords).toEqual({ top: CENTRED.top + CENTRED.height + GAP, left: 520 });
    expect(current.arrowOffset).toBe('50%');
  });

  it('pulls a tooltip back on screen at the left edge', () => {
    const { current } = showAt(PORTAL_BOTTOM, AT_LEFT_EDGE);

    // Centred it would start at -40, off screen. It must stop at the margin.
    expect(boxOf(current.fixedCoords!.left).left).toBe(MARGIN);
  });

  it('pulls a tooltip back on screen at the right edge', () => {
    const atRightEdge = { left: window.innerWidth - 20, top: 100, width: 20, height: 20 };
    const { current } = showAt(PORTAL_BOTTOM, atRightEdge);

    expect(boxOf(current.fixedCoords!.left).right).toBe(window.innerWidth - MARGIN);
  });

  it('keeps the arrow on the anchor after nudging the tooltip on screen', () => {
    const atRightEdge = { left: window.innerWidth - 20, top: 100, width: 20, height: 20 };

    for (const anchorRect of [CENTRED, AT_LEFT_EDGE, atRightEdge]) {
      const { current } = showAt(PORTAL_BOTTOM, anchorRect);
      const anchorCentre = anchorRect.left + anchorRect.width / 2;

      // The bubble slides but the arrow must stay over the thing it describes.
      expect(arrowX(current.fixedCoords!.left, current.arrowOffset)).toBeCloseTo(anchorCentre, 5);
    }
  });

  it('flips above the anchor when there is no room below', () => {
    const nearBottom = { left: 500, top: window.innerHeight - 28, width: 40, height: 20 };
    const { current } = showAt(PORTAL_BOTTOM, nearBottom);

    expect(current.resolvedSide).toBe('top');
    expect(current.fixedCoords!.top).toBe(nearBottom.top - TIP_H - GAP);
  });

  it('leaves the in-flow branch positioning through nudgeX, not coordinates', () => {
    const { current } = showAt(FLOW_BOTTOM, AT_LEFT_EDGE);

    expect(current.fixedCoords).toBeNull();
    // In flow the anchor is the origin, so the same correction rides the transform.
    expect(current.nudgeX).toBe(MARGIN - (10 - TIP_W / 2));
  });
});
