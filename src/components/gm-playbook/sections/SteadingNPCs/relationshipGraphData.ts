import { getPlaybook } from '@/lib/constants';
import type { GameSession, SteadingNPC } from '@/types';

export type GraphNodeKind = 'pc' | 'resident' | 'neighbor';

export interface GraphNode {
  id: string;
  label: string;
  kind: GraphNodeKind;
  dead: boolean;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Vertical half-gap, in layout units, between the two labels of a reciprocal
// pair. Labels are horizontal text, so only VERTICAL separation reliably keeps
// them apart at any line orientation — a perpendicular offset fails when the
// line itself is vertical (the two labels just shift sideways and still overlap).
// One label goes up by this, the other down, so the gap between them is twice
// this plus the font's line height (the label font is ~10 layout units tall, so
// this keeps a clear gap between the two lines of text).
export const RECIPROCAL_LABEL_OFFSET = 10;

/*
 * Unordered key for a pair of nodes, so an A→B edge and a B→A edge collapse to
 * the same key regardless of direction.
 */
export const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

/*
 * The set of node-pair keys that have an edge in BOTH directions (A→B and B→A).
 * Their two labels would otherwise land on the same midpoint. Two edges pointing
 * the SAME way (a duplicate link, possible in legacy data) don't count — they'd
 * share the same offset and re-overlap, so they aren't treated as reciprocal.
 */
export const reciprocalPairKeys = (edges: GraphEdge[]): Set<string> => {
  // Track the directions seen for each pair; a pair is reciprocal only once both
  // orientations (source<target and source>target) have appeared.
  const forward = new Set<string>();
  const backward = new Set<string>();
  const both = new Set<string>();
  for (const e of edges) {
    if (e.sourceId === e.targetId) continue;
    const key = pairKey(e.sourceId, e.targetId);
    const dir = e.sourceId < e.targetId ? forward : backward;
    dir.add(key);
    if (forward.has(key) && backward.has(key)) both.add(key);
  }
  return both;
};

/*
 * Vertical offset for a reciprocal edge's label so the pair's two labels don't
 * overlap. The label of the id-sorted (canonical) edge goes up, its counterpart
 * goes down — decided by endpoint id order, not the edge's own direction, so the
 * two are always split regardless of which way each arrow points. Purely vertical
 * because the labels are horizontal text: sideways separation would have to
 * exceed the label's width to clear it, but a fixed vertical gap always does.
 */
export const reciprocalLabelOffset = (sourceId: string, targetId: string): { dx: number; dy: number } => ({
  dx: 0,
  dy: sourceId < targetId ? -RECIPROCAL_LABEL_OFFSET : RECIPROCAL_LABEL_OFFSET,
});

interface RawNode {
  id: string;
  label: string;
  kind: GraphNodeKind;
  dead: boolean;
}

/*
 * Collect every PC, resident, and neighbor into a flat lookup so edges can be
 * resolved by targetId regardless of which collection the target lives in.
 */
const collectNodes = (game: GameSession): Map<string, RawNode> => {
  const map = new Map<string, RawNode>();
  for (const c of game.characters) {
    const playbook = getPlaybook(c.playbook)?.label ?? c.playbook;
    map.set(c.id, { id: c.id, label: `${c.name} (${playbook})`, kind: 'pc', dead: false });
  }
  for (const r of game.steading?.residents ?? []) {
    map.set(r.id, { id: r.id, label: r.name, kind: 'resident', dead: !!r.dead });
  }
  for (const n of game.steading?.neighbors ?? []) {
    map.set(n.id, { id: n.id, label: n.name, kind: 'neighbor', dead: !!n.dead });
  }
  return map;
};

/*
 * Build the directed edge list from NPC relationships. Only NPCs (residents +
 * neighbors) own relationships; PCs are link targets, never sources. An edge is
 * kept only when both endpoints resolve to a known node and the source isn't
 * pointing at itself. Duplicate links in the same direction (legacy data — the
 * editor now prevents them) collapse to a single edge, so their labels can't
 * stack on top of each other; the reverse direction is kept as its own edge.
 */
const collectEdges = (game: GameSession, known: Map<string, RawNode>): GraphEdge[] => {
  const npcs: SteadingNPC[] = [...(game.steading?.residents ?? []), ...(game.steading?.neighbors ?? [])];
  const edges: GraphEdge[] = [];
  const seenDirections = new Set<string>();
  for (const npc of npcs) {
    for (const rel of npc.relationships ?? []) {
      if (!rel.targetId || rel.targetId === npc.id) continue;
      if (!known.has(npc.id) || !known.has(rel.targetId)) continue;
      const direction = `${npc.id}->${rel.targetId}`;
      if (seenDirections.has(direction)) continue;
      seenDirections.add(direction);
      edges.push({ id: rel.id, sourceId: npc.id, targetId: rel.targetId, type: rel.type });
    }
  }
  return edges;
};

/*
 * Deterministic radial seed placement. Positions are derived purely from node
 * index and count — no Math.random — so the layout is stable across renders and
 * the simulation always settles to the same shape for the same data.
 */
const seedPositions = (ids: string[], width: number, height: number): Map<string, { x: number; y: number }> => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const positions = new Map<string, { x: number; y: number }>();
  const count = ids.length;
  ids.forEach((id, i) => {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2;
    positions.set(id, { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  });
  return positions;
};

const SIMULATION_TICKS = 300;
// Repulsion is O(nodes²) per tick. Past this many nodes we cut iteration count
// so opening the tab on a large steading doesn't briefly freeze the page; the
// layout settles a touch less but stays readable.
const TICK_SCALE_THRESHOLD = 40;
const MIN_SIMULATION_TICKS = 120;
const REPULSION = 26000;
const SPRING_LENGTH = 120;
const SPRING_STRENGTH = 0.025;
const CENTER_PULL = 0.005;
const DAMPING = 0.85;
// Keep nodes (and their labels/arrowheads) inside the viewBox. Labels render to
// the right of each node, so the right edge needs much more room than the left.
const MARGIN = 16;
const LABEL_MARGIN = 150;

/*
 * A small fixed-iteration force simulation: nodes repel each other, edges act as
 * springs, and a weak pull toward center keeps disconnected clusters on screen.
 * Runs synchronously to a settled layout — there's no animation, the graph is a
 * static snapshot the user can then drag.
 */
const simulate = (
  rawNodes: RawNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
): GraphNode[] => {
  const ids = rawNodes.map((n) => n.id);
  const seeded = seedPositions(ids, width, height);
  const pos = new Map(ids.map((id) => {
    const p = seeded.get(id)!;
    return [id, { x: p.x, y: p.y, vx: 0, vy: 0 }];
  }));
  const cx = width / 2;
  const cy = height / 2;

  // Keep total work (ticks × nodes²) bounded for large graphs.
  const ticks = ids.length > TICK_SCALE_THRESHOLD
    ? Math.max(MIN_SIMULATION_TICKS, Math.round(SIMULATION_TICKS * TICK_SCALE_THRESHOLD / ids.length))
    : SIMULATION_TICKS;

  for (let tick = 0; tick < ticks; tick++) {
    // Pairwise repulsion.
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos.get(ids[i])!;
        const b = pos.get(ids[j])!;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 0.01) {
          // Coincident nodes — nudge apart deterministically by index parity.
          dx = (i % 2 === 0 ? 1 : -1) * 0.5;
          dy = 0.5;
          distSq = 0.5;
        }
        const dist = Math.sqrt(distSq);
        const force = REPULSION / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
    }

    // Edge springs.
    for (const e of edges) {
      const a = pos.get(e.sourceId);
      const b = pos.get(e.targetId);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (dist - SPRING_LENGTH) * SPRING_STRENGTH;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    // Weak center pull + integrate with damping, then clamp inside the frame so
    // nodes and their right-hand labels never drift off-canvas.
    for (const id of ids) {
      const p = pos.get(id)!;
      p.vx += (cx - p.x) * CENTER_PULL;
      p.vy += (cy - p.y) * CENTER_PULL;
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;
      p.x = Math.max(MARGIN, Math.min(width - LABEL_MARGIN, p.x));
      p.y = Math.max(MARGIN, Math.min(height - MARGIN, p.y));
    }
  }

  return rawNodes.map((n) => {
    const p = pos.get(n.id)!;
    return { ...n, x: p.x, y: p.y };
  });
};

/*
 * Restrict the graph to an "ego" view: a focus node plus its direct neighbors
 * (in either direction) and the edges connecting them. Used on small screens and
 * when the relationship filter is active.
 */
const egoSubset = (
  rawNodes: RawNode[],
  edges: GraphEdge[],
  focusId: string,
): { nodes: RawNode[]; edges: GraphEdge[] } => {
  const keep = new Set<string>([focusId]);
  for (const e of edges) {
    if (e.sourceId === focusId) keep.add(e.targetId);
    if (e.targetId === focusId) keep.add(e.sourceId);
  }
  return {
    nodes: rawNodes.filter((n) => keep.has(n.id)),
    edges: edges.filter((e) => keep.has(e.sourceId) && keep.has(e.targetId)),
  };
};

/*
 * Build a laid-out relationship graph from the game's steading data.
 *
 * - `focusId` (optional) restricts the result to that node's ego network.
 * - Nodes with no relationships at all are dropped — the graph only shows the
 *   web that actually exists, not every NPC on the roster.
 */
export const buildRelationshipGraph = (
  game: GameSession,
  width: number,
  height: number,
  focusId?: string,
): GraphData => {
  const known = collectNodes(game);
  const allEdges = collectEdges(game, known);

  // Only keep nodes that participate in at least one edge.
  const connected = new Set<string>();
  for (const e of allEdges) {
    connected.add(e.sourceId);
    connected.add(e.targetId);
  }
  let rawNodes: RawNode[] = [...known.values()].filter((n) => connected.has(n.id));
  let edges = allEdges;

  if (focusId && connected.has(focusId)) {
    const subset = egoSubset(rawNodes, edges, focusId);
    rawNodes = subset.nodes;
    edges = subset.edges;
  }

  const nodes = simulate(rawNodes, edges, width, height);
  return { nodes, edges };
};
