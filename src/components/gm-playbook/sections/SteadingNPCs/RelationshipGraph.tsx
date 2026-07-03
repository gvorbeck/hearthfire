import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button, Text } from '@/components/ui';
import type { GameSession } from '@/types';
import { useLatest } from '@/hooks/useLatest';
import {
  buildRelationshipGraph,
  pairKey,
  reciprocalLabelOffset,
  reciprocalPairKeys,
} from './relationshipGraphData';
import type { GraphNode } from './relationshipGraphData';
import styles from './RelationshipGraph.module.css';

// Viewport the simulation lays out into. The SVG scales to its container via a
// viewBox, so these are coordinate-space units, not pixels. Sized to roughly the
// container's aspect ratio so nodes spread across the available width.
const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 600;
const NODE_RADIUS = 8;
// Breathing room around the fitted graph, in layout units. LABEL_PAD is extra
// right-side room for node labels, which render to the right of each dot.
const PAD = 24;
const LABEL_PAD = 120;
// Zoom bounds and the multiplier applied per button press / wheel notch.
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;

interface ViewTransform {
  x: number;
  y: number;
  k: number;
}

const IDENTITY_VIEW: ViewTransform = { x: 0, y: 0, k: 1 };

const clampZoom = (k: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));
// Roughly the number of characters that fit in the reserved label gutter at the
// label font size; longer names are clipped with an ellipsis (full name stays in
// the node's <title> for hover/screen readers).
const MAX_LABEL_CHARS = 22;

const truncateLabel = (label: string): string =>
  label.length > MAX_LABEL_CHARS ? `${label.slice(0, MAX_LABEL_CHARS - 1)}…` : label;

// --bp-md (768px): below this we default to the focused ego view, since a full
// web is unreadable on a phone. CSS custom properties can't be read in JS, so
// the value is duplicated here per the project's media-query convention.
const MOBILE_BREAKPOINT = 768;

const mobileQuery = `(max-width: ${MOBILE_BREAKPOINT}px)`;

// Live viewport check so the responsive policy updates on resize/rotate.
const useIsMobile = (): boolean => {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(mobileQuery).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(mobileQuery);
    const onChange = () => setMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return mobile;
};

interface RelationshipGraphProps {
  game: GameSession;
  // The relationship filter shared with the NPC editors. When set, the graph
  // focuses on that node's ego network.
  focusId?: string;
}

interface DragState {
  id: string;
  // Pointer-to-node offset in view coordinates, so the node doesn't jump to the
  // cursor on grab.
  offsetX: number;
  offsetY: number;
}

export const RelationshipGraph = ({ game, focusId }: RelationshipGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // The pan/zoom transform is applied to this inner group. Node-drag math reads
  // its CTM, so dragging stays accurate at any zoom or pan without extra math.
  const contentRef = useRef<SVGGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  // Per-node position overrides applied on top of the simulated layout once the
  // user drags a node.
  const [overrides, setOverrides] = useState<Record<string, { x: number; y: number }>>({});
  // Pan offset (x, y) and zoom factor (k) layered on top of the fitted viewBox.
  const [view, setView] = useState<ViewTransform>(IDENTITY_VIEW);
  // Live mirrors so pointer-down handlers can read current state without listing
  // it as a dependency (which would re-create the handler every pan frame).
  const viewRef = useLatest(view);
  // Active background pan, tracked in client pixels so a moving pointer maps 1:1.
  const panRef = useRef<{ pointerId: number; startX: number; startY: number; origin: ViewTransform } | null>(null);

  const mobile = useIsMobile();

  const graph = useMemo(
    () => buildRelationshipGraph(game, VIEW_WIDTH, VIEW_HEIGHT, focusId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game.characters, game.steading?.residents, game.steading?.neighbors, focusId],
  );

  // A stable signature of the current node set. When it changes (an NPC was
  // added, removed, or the view refocused) the simulated layout is regenerated,
  // so any dragged positions are stale and must be dropped. Dragging only updates
  // `overrides`, not the node set, so it never trips this reset.
  const nodeKey = graph.nodes.map((n) => n.id).join('|');
  useEffect(() => {
    setOverrides({});
    setView(IDENTITY_VIEW);
  }, [nodeKey]);

  // Resolve each node's rendered position: a drag override wins, else the layout.
  const nodes = useMemo(
    () => graph.nodes.map((n) => {
      const o = overrides[n.id];
      return o ? { ...n, x: o.x, y: o.y } : n;
    }),
    [graph.nodes, overrides],
  );
  const nodeById = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  // Node pairs that have an edge in both directions. Their labels share a
  // midpoint, so we offset each off the line to opposite sides to keep both
  // readable.
  const reciprocalPairs = useMemo(() => reciprocalPairKeys(graph.edges), [graph.edges]);

  // Fit the viewBox to the simulated layout (graph.nodes), NOT the drag-adjusted
  // positions — otherwise dragging a node to the edge would grow the frame and
  // shrink the whole graph each frame, runaway-zooming it to microscopic. The
  // frame stays fixed; nodes move within it, and pan/zoom handle the rest.
  const viewBox = useMemo(() => {
    if (graph.nodes.length === 0) return `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`;
    const xs = graph.nodes.map((n) => n.x);
    const ys = graph.nodes.map((n) => n.y);
    const minX = Math.min(...xs) - NODE_RADIUS - PAD;
    const minY = Math.min(...ys) - NODE_RADIUS - PAD;
    // Labels render to the right of each dot, so reserve room there. Half that
    // amount is added on the left too, so the dot cluster — whose own extent
    // ends at the rightmost dot — stays visually centered rather than crammed
    // against the left edge by the right-side label gutter.
    const maxX = Math.max(...xs) + NODE_RADIUS + PAD + LABEL_PAD;
    const minXAdjusted = minX - LABEL_PAD / 2;
    const maxY = Math.max(...ys) + NODE_RADIUS + PAD;
    return `${minXAdjusted} ${minY} ${maxX - minXAdjusted} ${maxY - minY}`;
  }, [graph.nodes]);

  // Map a client point into the coordinate space of `target` via its CTM.
  const toLocalCoords = useCallback((target: SVGGraphicsElement | null, clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg || !target) return { x: 0, y: 0 };
    const ctm = target.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  // Content-group space (pan/zoom baked in) — for node-drag, so a node lands
  // under the cursor at any view.
  const toViewCoords = useCallback(
    (clientX: number, clientY: number) => toLocalCoords(contentRef.current, clientX, clientY),
    [toLocalCoords],
  );

  // Root SVG space (viewBox units, before the pan/zoom transform) — pan and zoom
  // must work here, since that's the space the transform lives in; raw CSS pixels
  // would mismatch the letterboxed viewBox scale and make the graph drift.
  const toRootCoords = useCallback(
    (clientX: number, clientY: number) => toLocalCoords(svgRef.current, clientX, clientY),
    [toLocalCoords],
  );

  // A node owns its whole drag gesture: it captures the pointer on down and
  // handles its own move/up, so the capture target and the listeners are the
  // same element rather than relying on events bubbling up to the SVG.
  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      const id = e.currentTarget.dataset.id;
      const node = id ? nodeById.get(id) : undefined;
      if (!id || !node) return;
      // Claim the gesture so the background doesn't also start panning.
      e.stopPropagation();
      const { x, y } = toViewCoords(e.clientX, e.clientY);
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({ id, offsetX: x - node.x, offsetY: y - node.y });
    },
    [nodeById, toViewCoords],
  );

  const handleNodePointerMove = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (!drag) return;
      const { x, y } = toViewCoords(e.clientX, e.clientY);
      setOverrides((prev) => ({ ...prev, [drag.id]: { x: x - drag.offsetX, y: y - drag.offsetY } }));
    },
    [drag, toViewCoords],
  );

  const handleNodePointerUp = useCallback(() => setDrag(null), []);

  // Pointer-down on empty canvas arms a background pan (the pan only actually
  // moves once the pointer does). A node drag calls stopPropagation, so this
  // never fires for a node.
  const handleBackgroundPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Record the start point in viewBox units so the pan delta matches the space
    // the transform lives in (not raw CSS pixels, which are letterbox-scaled).
    const start = toRootCoords(e.clientX, e.clientY);
    panRef.current = { pointerId: e.pointerId, startX: start.x, startY: start.y, origin: viewRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [toRootCoords, viewRef]);

  const handleBackgroundPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const pan = panRef.current;
    if (!pan) return;
    // Pan moves the content 1:1 with the cursor, in viewBox units.
    const p = toRootCoords(e.clientX, e.clientY);
    setView({ ...pan.origin, x: pan.origin.x + (p.x - pan.startX), y: pan.origin.y + (p.y - pan.startY) });
  }, [toRootCoords]);

  const handleBackgroundPointerUp = useCallback(() => {
    panRef.current = null;
  }, []);

  // Zoom around a focal point given in viewBox units (the space the transform
  // lives in) so the content under that point stays put as the scale changes.
  const zoomAt = useCallback((factor: number, focalX: number, focalY: number) => {
    setView((v) => {
      const k = clampZoom(v.k * factor);
      const ratio = k / v.k;
      // Keep the focal point fixed: new offset = focal - ratio * (focal - old offset).
      return { k, x: focalX - ratio * (focalX - v.x), y: focalY - ratio * (focalY - v.y) };
    });
  }, []);

  // Zoom buttons pivot around the center of the visible frame, in viewBox units.
  const zoomAtFrameCenter = useCallback((factor: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const center = toRootCoords(rect.left + rect.width / 2, rect.top + rect.height / 2);
    zoomAt(factor, center.x, center.y);
  }, [toRootCoords, zoomAt]);

  const handleZoomIn = useCallback(() => zoomAtFrameCenter(ZOOM_STEP), [zoomAtFrameCenter]);
  const handleZoomOut = useCallback(() => zoomAtFrameCenter(1 / ZOOM_STEP), [zoomAtFrameCenter]);

  const handleResetView = useCallback(() => setView(IDENTITY_VIEW), []);

  // Snap any hand-dragged nodes back to their computed layout positions, without
  // touching the current pan/zoom.
  const handleResetNodes = useCallback(() => setOverrides({}), []);
  const hasMovedNodes = Object.keys(overrides).length > 0;

  // Whether the interactive SVG (vs. an empty/prompt placeholder) is rendered.
  const graphShown = graph.nodes.length > 0 && !(mobile && !focusId);

  // Wheel-zoom must be a non-passive native listener so preventDefault can stop
  // the page from scrolling; React's onWheel is passive and would reject it.
  // Re-runs when the SVG mounts (graphShown) so the listener attaches to it.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const focal = toRootCoords(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, focal.x, focal.y);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAt, toRootCoords, graphShown]);

  if (graph.nodes.length === 0) {
    return (
      <div className={styles.empty}>
        <Text size="sm" color="muted">
          No relationships to map yet. Link NPCs to characters or to each other and they'll appear here.
        </Text>
      </div>
    );
  }

  // On a phone the full web is unreadable, so we require a focus node: prompt the
  // user to pick one via the existing relationship filter, then render the
  // smaller ego network for whatever they choose.
  if (mobile && !focusId) {
    return (
      <div className={styles.empty}>
        <Text size="sm" color="muted">
          Pick a character in the filter above to see their relationships on this screen size.
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={viewBox}
        role="img"
        aria-label={`Relationship map: ${graph.nodes.length} characters, ${graph.edges.length} relationships`}
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handleBackgroundPointerMove}
        onPointerUp={handleBackgroundPointerUp}
        onLostPointerCapture={handleBackgroundPointerUp}
      >
        <defs>
          <marker
            id="rel-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className={styles.arrowHead} />
          </marker>
        </defs>

        <g ref={contentRef} transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
        <g>
          {graph.edges.map((edge) => {
            const a = nodeById.get(edge.sourceId);
            const b = nodeById.get(edge.targetId);
            if (!a || !b) return null;
            // Pull the line endpoint back to the node's rim so the arrowhead
            // sits at the edge of the circle, not buried under it.
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;
            const x1 = a.x + ux * NODE_RADIUS;
            const y1 = a.y + uy * NODE_RADIUS;
            const x2 = b.x - ux * NODE_RADIUS;
            const y2 = b.y - uy * NODE_RADIUS;
            let midX = (x1 + x2) / 2;
            let midY = (y1 + y2) / 2;
            // For a reciprocal pair both labels land on the same midpoint, so
            // offset each off the line to opposite sides (see reciprocalLabelOffset).
            if (reciprocalPairs.has(pairKey(edge.sourceId, edge.targetId))) {
              const { dx: offX, dy: offY } = reciprocalLabelOffset(edge.sourceId, edge.targetId);
              midX += offX;
              midY += offY;
            }
            return (
              <g key={edge.id} className={styles.edge}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className={styles.edgeLine} markerEnd="url(#rel-arrow)" />
                {edge.type && (
                  <text x={midX} y={midY} className={styles.edgeLabel} dy="-2">
                    {edge.type}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <g>
          {nodes.map((node) => {
            const groupCx = clsx(
              styles.node,
              styles[node.kind],
              node.dead && styles.dead,
              drag?.id === node.id && styles.dragging,
            );
            return (
              <g
                key={node.id}
                data-id={node.id}
                className={groupCx}
                transform={`translate(${node.x} ${node.y})`}
                onPointerDown={handleNodePointerDown}
                onPointerMove={handleNodePointerMove}
                onPointerUp={handleNodePointerUp}
                onLostPointerCapture={handleNodePointerUp}
              >
                <title>{node.label}</title>
                <circle r={NODE_RADIUS} className={styles.nodeCircle} />
                <text x={NODE_RADIUS + 4} y={4} className={styles.nodeLabel}>
                  {truncateLabel(node.label)}
                </text>
              </g>
            );
          })}
        </g>
        </g>
      </svg>

      <div className={styles.controls}>
        <Button variant="secondary" size="sm" icon="undo" onClick={handleResetNodes} disabled={!hasMovedNodes} aria-label="Reset node positions" />
        <Button variant="secondary" size="sm" icon="plus" onClick={handleZoomIn} aria-label="Zoom in" />
        <Button variant="secondary" size="sm" icon="minus" onClick={handleZoomOut} aria-label="Zoom out" />
        <Button variant="secondary" size="sm" icon="recenter" onClick={handleResetView} aria-label="Reset view" />
      </div>
    </div>
  );
};
