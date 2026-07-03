import type { DropdownGroup } from '@/components/ui';
import { getPlaybook } from '@/lib/constants';
import type { NpcRelationship, GameSession } from '@/types';

export const NPC_TRAITS = [
  'all thumbs', 'ambitious', 'beloved by everyone', 'beautiful singing voice', 'best cook',
  'best weaver', 'blind', 'braved the Ruined Tower', 'cautious', 'cheery', 'chronic cough',
  'complains too much', 'cowardly', 'craves recognition', 'curious',
  'dallied with the Fae years ago', 'deaf', 'desperately wants a child', 'distills the best whisky',
  "doesn't pull their weight", 'drunkard', 'eagle-eye', 'fearless', 'foundling',
  'gathers herbs from the Wood', 'gets the best deals', 'gifted storyteller', 'gods-fearing',
  'good with children', 'happy-go-lucky',
  'has a beef with Marshedge', 'has a good heart', 'has a lot of backbone', 'has a wandering eye',
  'has a way with animals', 'has Fae blood in their veins', 'has just terrible luck',
  'has lost their nerve', 'has no respect for their elders', 'has terrible nightmares',
  'has the most children', 'has their head in the clouds', 'hates the Hillfolk', 'hears voices',
  'humorless',
  'immaculate appearance', 'jealous', 'just got married', 'keeps to themselves',
  'knows all the gossip', 'lame', 'likes to hurt things', 'lived among the Forest Folk',
  'lost all their children', 'lovesick', 'loves their dogs', 'loyal friend',
  'most handsome', 'moved here recently', 'must approve any marriages',
  'mute', 'not afraid of deep water', 'not too bright', 'oldest', 'orphan',
  'overprotective', 'prettiest', 'prideful', 'reckless', 'refuses to marry',
  'resents their lot in life', 'runs everywhere', 'sensitive', 'simpleton',
  'slew many crinwin', 'stoic', 'stubborn', 'suffers from fits',
  'swears they met the Pale Hunter', 'tells the best jokes', 'tender-hearted',
  "tends the Gods' Pavilion", 'tends to the sick & injured', 'touched', 'very strong',
  'wants to have kids', 'well-read', 'well-traveled', 'widowed', 'will eat anything',
];

export type RelTarget = `${'pc' | 'resident' | 'neighbor'}::${string}`;

export const encodeTarget = (rel: NpcRelationship): RelTarget | '' =>
  rel.targetId ? `${rel.targetKind}::${rel.targetId}` as RelTarget : '';

export const decodeTarget = (value: RelTarget): { targetId: string; targetKind: 'pc' | 'resident' | 'neighbor' } => {
  const sep = value.indexOf('::');
  return {
    targetKind: value.slice(0, sep) as 'pc' | 'resident' | 'neighbor',
    targetId: value.slice(sep + 2),
  };
};

export interface NpcFormState {
  name: string;
  pronouns: string;
  occupation: string;
  traits: string[];
  relationships: NpcRelationship[];
  notes: string;
}

export const EMPTY_FORM: NpcFormState = {
  name: '',
  pronouns: '',
  occupation: '',
  traits: [],
  relationships: [],
  notes: '',
};

export const NPC_CONFIG = {
  residents: {
    title: 'Residents of Stonetop',
    description: 'Add each NPC that is named during introductions or play. Give each an occupation (even if just farmer or homemaker) and at least 1 trait.',
  },
  neighbors: {
    title: 'Notable Neighbors',
    description: "Add NPCs from neighboring areas (Marshedge, Gordin's Delve, the Steplands, Lygos, etc.) when instructed by a playbook or as needed.",
  },
} as const;

export const buildGroups = (game: GameSession): DropdownGroup<RelTarget>[] => {
  const pcs = game.characters.map((c) => ({
    value: `pc::${c.id}` as RelTarget,
    label: `${c.name} (${getPlaybook(c.playbook)?.label ?? c.playbook})`,
  }));
  const residents = (game.steading?.residents ?? []).map((r) => ({
    value: `resident::${r.id}` as RelTarget,
    label: r.name,
  }));
  const neighbors = (game.steading?.neighbors ?? []).map((n) => ({
    value: `neighbor::${n.id}` as RelTarget,
    label: n.name,
  }));

  const groups: DropdownGroup<RelTarget>[] = [];
  if (pcs.length > 0) groups.push({ label: 'Player Characters', options: pcs });
  if (residents.length > 0) groups.push({ label: 'Stonetop Residents', options: residents });
  if (neighbors.length > 0) groups.push({ label: 'Notable Neighbors', options: neighbors });
  return groups;
};

/*
 * Drop options whose encoded value is in `taken` (targets already linked by
 * other relationship rows), so a character can't be linked twice. Groups left
 * with no options are dropped. Used to keep each relationship row's dropdown from
 * offering a character another row already points at.
 */
export const filterLinkedTargets = (
  groups: DropdownGroup<RelTarget>[],
  taken: Set<string>,
): DropdownGroup<RelTarget>[] =>
  groups
    .map((group) => ({ ...group, options: group.options.filter((opt) => !taken.has(opt.value)) }))
    .filter((group) => group.options.length > 0);

export const buildNameMap = (game: GameSession): Map<string, string> => {
  const map = new Map<string, string>();
  for (const c of game.characters) map.set(c.id, c.name);
  for (const r of game.steading?.residents ?? []) map.set(r.id, r.name);
  for (const n of game.steading?.neighbors ?? []) map.set(n.id, n.name);
  return map;
};
