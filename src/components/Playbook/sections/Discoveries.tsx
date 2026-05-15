import { Heading, Text } from '@/components/primitives';
import { SubList } from '@/components/Playbook';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const Discoveries = () => (
  <div>
    <div>
      <Heading as="h3" size="sm">Clues</Heading>
      <Text>Start with a revelation, what the PCs can learn. What could lead to that revelation?</Text>
      <SubList items={[
        'Signs left in the environment (tracks, etc.)',
        'Physical remains (blood, bone, scat, etc.)',
        'Something out of place',
        'Writing, art, markings (a note, graffiti, etc.)',
        'An NPC\'s/monster\'s behavior',
        'Noises, glimpses, scents',
        'Rumors, reports, tales, gossip',
        'Flashes, omens, revelations',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Encounters</Heading>
      <SubList items={[
        'Who/what is the encounter with?',
        'Where/when does it happen?',
        'What are they doing?',
        'Why are they here?',
        'What do they want?',
        'How do they react to the PCs?',
        'Why are you putting this encounter in the game? What\'s at stake?',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Opportunities</Heading>
      <SubList items={[
        'Useful or valuable stuff',
        'Expendable resources',
        'A good spot to make camp/set a trap/etc.',
        'The means to get somewhere',
        'A chance to ___',
        'A novel/pleasant experience',
        'A resource the PCs might come back for',
        'A place of power',
        'An arcanum',
        'Anything else that comes to mind',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Artifacts &amp; arcana</Heading>
      <div className={styles.contentRules}>
        <Text>Place them where they make sense, where they tell a story. Be generous with info. Don't imply deeper mysteries if there are none. If there are, make that clear: <strong>hint at more than meets the eye</strong> or <strong>offer an opportunity</strong>.</Text>
        <Text>If they get a 7+ to Know Things, reveal some combo of what it is/does, what it's worth, how they might activate it or sell it for full value, or how they might learn more. On a 7-9, reveal the trigger of an artifact's move or the front of an arcanum; on a 10+, give them the full move or both the front and back of an arcanum.</Text>
        <Text>If they can't figure it out, give them a path: <strong>tell the requirements</strong>, Make a Plan, write a love letter, or just tell them after some downtime and ask how they figured it out.</Text>
      </div>
    </div>
  </div>
);
