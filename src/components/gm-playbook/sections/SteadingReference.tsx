import { useCallback } from 'react';
import { Heading, Text, Stack } from '@/components/ui';
import { ImprovementList } from './ImprovementList';
import {
  STONETOP_NAMES_STR,
  MARSHEDGE_NAMES_STR,
  HILLFOLK_NAMES_STR,
  SOUTHERN_NAMES_STR,
  MANMARCH_NAMES_STR,
  BARRIER_PASS_NAMES_STR,
} from '@/lib/npcNames';
import type { SteadingData } from '@/types';
import styles from './SteadingReference.module.css';

const TRAITS_COL_A = [
  'all thumbs', 'ambitious', 'beloved by everyone', 'beautiful singing voice', 'best cook',
  'best weaver', 'blind', 'braved the Ruined Tower', 'cautious', 'cheery', 'chronic cough',
  'complains too much', 'cowardly', 'craves recognition', 'curious', 'dallied with the Fae years ago',
  'deaf', 'desperately wants a child', 'distills the best whisky', "doesn't pull their weight",
  'drunkard', 'eagle-eye', 'fearless', 'foundling', 'gathers herbs from the Wood',
  'gets the best deals', 'gifted storyteller', 'gods-fearing', 'good with children', 'happy-go-lucky',
  'has a beef with Marshedge', 'has a good heart', 'has a lot of backbone', 'has a wandering eye',
  'has a way with animals', 'has Fae blood in their veins', 'has just terrible luck',
  'has lost their nerve', 'has no respect for their elders', 'has terrible nightmares',
];

const TRAITS_COL_B = [
  'has the most children', 'has their head in the clouds', 'hates the Hillfolk', 'hears voices',
  'humorless', 'immaculate appearance', 'jealous', 'just got married', 'keeps to themselves',
  'knows all the gossip', 'lame', 'likes to hurt things', 'lived among the Forest Folk',
  'lost all their children', 'lovesick', 'loves their dogs', 'loyal friend', 'most handsome',
  'moved here recently', 'must approve any marriages', 'mute', 'not afraid of deep water',
  'not too bright', 'oldest', 'orphan', 'overprotective', 'prettiest', 'prideful', 'reckless',
  'refuses to marry', 'resents their lot in life', 'runs everywhere', 'sensitive', 'simpleton',
  'slew many crinwin', 'stoic', 'stubborn', 'suffers from fits', "swears they met the Pale Hunter",
  'tells the best jokes', 'tender-hearted', 'tends the Gods\' Pavilion', 'tends to the sick & injured',
  'touched', 'very strong', 'wants to have kids', 'well-read', 'well-traveled', 'widowed',
  'will eat anything',
];

const BUILT_IN_PLACES = [
  'The Stone',
  'The Granary',
  'Public House & Stables',
  'Cistern',
  'Pavilion of the Gods',
  'Watchtowers',
];

interface SteadingReferenceProps {
  placesOfInterest: string[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingReference = ({ placesOfInterest, onSave }: SteadingReferenceProps) => {
  const savePlaces = useCallback((items: string[]) => onSave({ placesOfInterest: items }), [onSave]);

  return (
    <div className={styles.root}>
      <div className={styles.places}>
        <Heading as="h3" size="sm">Places of interest</Heading>
        <Text size="xs" color="muted">Key locations on the village map. Add PC homes and notable NPC homes as established in play.</Text>
        <ImprovementList
          fixedItems={BUILT_IN_PLACES}
          improvementItems={[]}
          customItems={placesOfInterest}
          improvements={{}}
          onSave={savePlaces}
          addLabel="Add location"
          itemLabel="Location"
        />
      </div>

      <div className={styles.subsection}>
        <Heading as="h3" size="sm">Names</Heading>
        <Text size="xs" color="muted">Pick one, make one up, or ask a player to.</Text>
        <Stack gap={4}>
          <Text size="xs">{`**Stonetop** (Welsh): ${STONETOP_NAMES_STR}`}</Text>
          <Text size="xs">{`**Marshedge** (Irish): ${MARSHEDGE_NAMES_STR}`}</Text>
          <Text size="xs">{`**Hillfolk** (Breton, clipped): ${HILLFOLK_NAMES_STR}`}</Text>
          <Text size="xs">{`**Southern** (Greek, Hebrew, Persian, Arabic): ${SOUTHERN_NAMES_STR}`}</Text>
          <Text size="xs">{`**Manmarch** (Germanic): ${MANMARCH_NAMES_STR}`}</Text>
          <Text size="xs">{`**Barrier Pass** (Tibetan, Nepali): ${BARRIER_PASS_NAMES_STR}`}</Text>
          <Text size="xs" color="muted">*Gordin's Delve: choose from other lists; everyone there comes from somewhere else.*</Text>
        </Stack>
      </div>

      <div className={styles.subsection}>
        <Heading as="h3" size="sm">NPC Traits</Heading>
        <Text size="xs" color="muted">Assign as needed; choose from this list or make up your own.</Text>
        <div className={styles.traitsGrid}>
          <ul className={styles.traitsList} aria-label="NPC traits (first half)">
            {TRAITS_COL_A.map((t) => <li key={t} className={styles.trait}>{t}</li>)}
          </ul>
          <ul className={styles.traitsList} aria-label="NPC traits (second half)">
            {TRAITS_COL_B.map((t) => <li key={t} className={styles.trait}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};
