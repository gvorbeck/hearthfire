import { describe, it, expect } from 'vitest';
import {
  buildRelationshipGraph,
  pairKey,
  reciprocalLabelOffset,
  reciprocalPairKeys,
  RECIPROCAL_LABEL_OFFSET,
} from '../relationshipGraphData';
import type { GraphEdge } from '../relationshipGraphData';
import type { GameSession, SteadingNPC, NpcRelationship } from '@/types';

const rel = (overrides: Partial<NpcRelationship> = {}): NpcRelationship => ({
  id: `rel-${overrides.targetId ?? 'x'}`,
  type: 'friend',
  targetId: '',
  targetKind: 'pc',
  ...overrides,
});

const npc = (id: string, overrides: Partial<SteadingNPC> = {}): SteadingNPC => ({
  id,
  name: `NPC ${id}`,
  ...overrides,
});

const makeGame = (overrides: Partial<GameSession> = {}): GameSession => ({
  id: 'g1',
  name: 'Test',
  createdAt: 0,
  characters: [],
  ...overrides,
});

const W = 720;
const H = 520;

describe('buildRelationshipGraph', () => {
  it('returns an empty graph when there are no relationships', () => {
    const game = makeGame({
      steading: { residents: [npc('r1'), npc('r2')] },
    });
    const graph = buildRelationshipGraph(game, W, H);
    expect(graph.nodes).toHaveLength(0);
    expect(graph.edges).toHaveLength(0);
  });

  it('drops NPCs that participate in no relationship', () => {
    const game = makeGame({
      steading: {
        residents: [
          npc('r1', { relationships: [rel({ targetId: 'r2', targetKind: 'resident' })] }),
          npc('r2'),
          npc('r3'), // unconnected — should not appear
        ],
      },
    });
    const graph = buildRelationshipGraph(game, W, H);
    const ids = graph.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(['r1', 'r2']);
  });

  it('resolves edges across PCs, residents, and neighbors', () => {
    const game = makeGame({
      characters: [{ id: 'pc1', name: 'Hero', playbook: 'blessed' } as never],
      steading: {
        residents: [npc('r1', { relationships: [rel({ targetId: 'pc1', targetKind: 'pc' })] })],
        neighbors: [npc('n1', { relationships: [rel({ targetId: 'r1', targetKind: 'resident' })] })],
      },
    });
    const graph = buildRelationshipGraph(game, W, H);
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges.map((e) => `${e.sourceId}->${e.targetId}`).sort()).toEqual([
      'n1->r1',
      'r1->pc1',
    ]);
    // PC label includes the playbook name.
    const pcNode = graph.nodes.find((n) => n.id === 'pc1');
    expect(pcNode?.kind).toBe('pc');
    expect(pcNode?.label).toContain('Hero');
  });

  it('ignores relationships with empty or unresolvable targets and self-links', () => {
    const game = makeGame({
      steading: {
        residents: [
          npc('r1', {
            relationships: [
              rel({ targetId: '', targetKind: 'pc' }), // blank
              rel({ targetId: 'ghost', targetKind: 'resident' }), // not a known node
              rel({ targetId: 'r1', targetKind: 'resident' }), // self-link
              rel({ targetId: 'r2', targetKind: 'resident' }), // valid
            ],
          }),
          npc('r2'),
        ],
      },
    });
    const graph = buildRelationshipGraph(game, W, H);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({ sourceId: 'r1', targetId: 'r2' });
  });

  it('collapses duplicate links in the same direction to one edge', () => {
    // Legacy data can have an NPC linked to the same target twice; keep only one
    // edge per direction so the two labels don't stack. The reverse stays.
    const game = makeGame({
      steading: {
        residents: [
          npc('r1', {
            relationships: [
              { id: 'a', type: 'fart', targetId: 'r2', targetKind: 'resident' },
              { id: 'b', type: 'burp', targetId: 'r2', targetKind: 'resident' },
            ],
          }),
          npc('r2', { relationships: [rel({ targetId: 'r1', targetKind: 'resident' })] }),
        ],
      },
    });
    const graph = buildRelationshipGraph(game, W, H);
    const dirs = graph.edges.map((e) => `${e.sourceId}->${e.targetId}`).sort();
    expect(dirs).toEqual(['r1->r2', 'r2->r1']);
  });

  it('restricts to the ego network when a focus id is given', () => {
    const game = makeGame({
      steading: {
        residents: [
          npc('r1', { relationships: [rel({ targetId: 'r2', targetKind: 'resident' })] }),
          npc('r2', { relationships: [rel({ targetId: 'r3', targetKind: 'resident' })] }),
          npc('r3', { relationships: [rel({ targetId: 'r4', targetKind: 'resident' })] }),
          npc('r4'),
        ],
      },
    });
    // Focus on r2: keep r2 + its direct neighbors r1 (incoming) and r3 (outgoing).
    const graph = buildRelationshipGraph(game, W, H, 'r2');
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['r1', 'r2', 'r3']);
    // r3->r4 is excluded because r4 isn't in the ego subset.
    expect(graph.edges.map((e) => `${e.sourceId}->${e.targetId}`).sort()).toEqual([
      'r1->r2',
      'r2->r3',
    ]);
  });

  it('produces a deterministic, finite layout', () => {
    const game = makeGame({
      steading: {
        residents: [
          npc('r1', { relationships: [rel({ targetId: 'r2', targetKind: 'resident' })] }),
          npc('r2', { relationships: [rel({ targetId: 'r3', targetKind: 'resident' })] }),
          npc('r3'),
        ],
      },
    });
    const a = buildRelationshipGraph(game, W, H);
    const b = buildRelationshipGraph(game, W, H);
    expect(a.nodes.map((n) => [n.id, n.x, n.y])).toEqual(b.nodes.map((n) => [n.id, n.x, n.y]));
    for (const n of a.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
  });

  it('keeps every node bounded and finite, even for a large graph', () => {
    // A 60-node chain exercises the tick-scaling path for big steadings. The
    // coordinate space scales up with node count (see sizeForCount), so nodes
    // are bounded by the scaled frame, not the base W×H — assert a generous
    // ceiling proportional to that growth rather than the raw base size.
    const residents = Array.from({ length: 60 }, (_, i) =>
      npc(`r${i}`, {
        relationships:
          i < 59
            ? [{ id: `rel-${i}`, type: 'knows', targetId: `r${i + 1}`, targetKind: 'resident' as const }]
            : [],
      }),
    );
    const graph = buildRelationshipGraph(makeGame({ steading: { residents } }), W, H);
    expect(graph.nodes).toHaveLength(60);
    // sqrt(60/8) ≈ 2.74; allow a little slack above that for the label gutter.
    const ceilingX = W * 3;
    const ceilingY = H * 3;
    for (const n of graph.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(ceilingX);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(ceilingY);
    }
  });

  it('spreads a large graph across 2D area instead of piling nodes on the frame edges', () => {
    // Regression for the bug where many NPCs got clamped flat against the
    // viewport walls (piling up on the sides/corners). A hub-and-chain web of
    // 40 nodes should occupy real width AND height, with few nodes stuck at the
    // extremes of the used span.
    const residents = Array.from({ length: 40 }, (_, i) => {
      const prev = i === 0 ? 'r39' : `r${i - 1}`;
      return npc(`r${i}`, {
        relationships: [
          { id: `rel-${i}-hub`, type: 'friend', targetId: 'r0', targetKind: 'resident' as const },
          { id: `rel-${i}-chain`, type: 'kin', targetId: prev, targetKind: 'resident' as const },
        ],
      });
    });
    const graph = buildRelationshipGraph(makeGame({ steading: { residents } }), W, H);
    const xs = graph.nodes.map((n) => n.x);
    const ys = graph.nodes.map((n) => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    // Real 2D spread, not a thin line crammed against one edge.
    expect(maxX - minX).toBeGreaterThan(200);
    expect(maxY - minY).toBeGreaterThan(200);

    // Only a handful of nodes should sit at the extreme edges of the used span
    // (a normal convex-hull boundary), not the majority (a wall pile-up).
    const onEdge = graph.nodes.filter(
      (n) => n.x <= minX + 2 || n.x >= maxX - 2 || n.y <= minY + 2 || n.y >= maxY - 2,
    ).length;
    expect(onEdge).toBeLessThan(graph.nodes.length / 3);
  });

  it('marks dead NPCs', () => {
    const game = makeGame({
      steading: {
        residents: [
          npc('r1', { dead: true, relationships: [rel({ targetId: 'r2', targetKind: 'resident' })] }),
          npc('r2'),
        ],
      },
    });
    const graph = buildRelationshipGraph(game, W, H);
    expect(graph.nodes.find((n) => n.id === 'r1')?.dead).toBe(true);
    expect(graph.nodes.find((n) => n.id === 'r2')?.dead).toBe(false);
  });
});

const edge = (sourceId: string, targetId: string): GraphEdge => ({
  id: `${sourceId}->${targetId}`,
  sourceId,
  targetId,
  type: 'knows',
});

describe('pairKey', () => {
  it('is order-independent, so A→B and B→A share a key', () => {
    expect(pairKey('a', 'b')).toBe(pairKey('b', 'a'));
  });
});

describe('reciprocalPairKeys', () => {
  it('flags only pairs that have an edge in both directions', () => {
    const both = reciprocalPairKeys([
      edge('a', 'b'), // one-way
      edge('c', 'd'), // ↩ reciprocal with next
      edge('d', 'c'),
    ]);
    expect(both.has(pairKey('c', 'd'))).toBe(true);
    expect(both.has(pairKey('a', 'b'))).toBe(false);
    expect(both.size).toBe(1);
  });

  it('does not flag two edges pointing the SAME way (duplicate link in legacy data)', () => {
    // Both edges are Bram→Ada. They'd share the same label offset, so treating
    // the pair as reciprocal would just re-overlap the labels — it must not.
    const both = reciprocalPairKeys([edge('bram', 'ada'), edge('bram', 'ada')]);
    expect(both.size).toBe(0);
  });
});

describe('reciprocalLabelOffset', () => {
  // The bug this guards against: the two labels of a reciprocal pair share a
  // midpoint. They must be pushed to opposite VERTICAL offsets so they never
  // overlap — at any line orientation, since the labels are horizontal text (#235).
  it('gives the two directions of a pair opposite vertical offsets', () => {
    const forward = reciprocalLabelOffset('a', 'b');
    const reverse = reciprocalLabelOffset('b', 'a');
    expect(forward.dy).toBe(-reverse.dy);
    expect(Math.abs(forward.dy)).toBe(RECIPROCAL_LABEL_OFFSET);
  });

  it('splits by id order, not edge direction, so it is stable', () => {
    // The id-sorted edge always goes up; its reverse always goes down —
    // independent of the geometric direction of the arrow.
    expect(reciprocalLabelOffset('a', 'b').dy).toBeLessThan(0);
    expect(reciprocalLabelOffset('b', 'a').dy).toBeGreaterThan(0);
  });

  it('offsets vertically only, so the separation holds even for a vertical line', () => {
    // A horizontal offset can't separate two horizontal labels on a vertical
    // line — this must stay purely vertical.
    expect(reciprocalLabelOffset('a', 'b').dx).toBe(0);
    expect(reciprocalLabelOffset('b', 'a').dx).toBe(0);
  });
});
