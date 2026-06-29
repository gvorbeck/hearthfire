import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Text } from '@/components/ui';
import type { GameSession } from '@/types';
import { buildRelationshipGraph } from './relationshipGraphData';
import type { GraphNode } from './relationshipGraphData';
import styles from './RelationshipGraph.module.css';

// Viewport the simulation lays out into. The SVG scales to its container via a
// viewBox, so these are coordinate-space units, not pixels. Sized to roughly the
// container's aspect ratio so nodes spread across the available width.
const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 600;
const NODE_RADIUS = 8;
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
  const [drag, setDrag] = useState<DragState | null>(null);
  // Per-node position overrides applied on top of the simulated layout once the
  // user drags a node.
  const [overrides, setOverrides] = useState<Record<string, { x: number; y: number }>>({});

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

  // Convert a pointer event to view coordinates via the SVG's CTM.
  const toViewCoords = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      const id = e.currentTarget.dataset.id;
      const node = id ? nodeById.get(id) : undefined;
      if (!id || !node) return;
      const { x, y } = toViewCoords(e.clientX, e.clientY);
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({ id, offsetX: x - node.x, offsetY: y - node.y });
    },
    [nodeById, toViewCoords],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (!drag) return;
      const { x, y } = toViewCoords(e.clientX, e.clientY);
      setOverrides((prev) => ({ ...prev, [drag.id]: { x: x - drag.offsetX, y: y - drag.offsetY } }));
    },
    [drag, toViewCoords],
  );

  const handlePointerUp = useCallback(() => setDrag(null), []);

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
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label={`Relationship map: ${graph.nodes.length} characters, ${graph.edges.length} relationships`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
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
                onPointerDown={handlePointerDown}
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
      </svg>
    </div>
  );
};
