import { describe, it, expect } from 'vitest';
import { buildRelationshipGraph } from '../relationshipGraphData';
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

  it('keeps every node inside the frame, even for a large graph', () => {
    // A 60-node chain exercises the tick-scaling path for big steadings.
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
    for (const n of graph.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(W);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(H);
    }
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
