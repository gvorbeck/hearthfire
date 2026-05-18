import { Heading, Text, List } from '@/components/primitives';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const Sites = () => (
  <div>
    <Text>Interesting places that…</Text>
    <List variant="dash" items={[
      '… tell a story, via their environment;',
      '… are exciting to explore; and',
      '… present players with interesting decisions',
    ]} />
    <Text>In every area/room/scene, include at least one detail or element that reflects the site's story.</Text>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Considerations</Heading>
      <Text>Play out scenes/situations set in or inspired by the site. Run the core loop, but keep in mind:</Text>
      <List variant="dash" items={[
        'Physical space: dimensions, construction, clearance, obstacles, footing, levels, etc.',
        'Light sources: who has them, range/tags, who out there sees them, duration',
        'Senses other than sight: sounds, odors, textures, heat/cold, humidity, feelings, etc.',
        'Marching order: especially in tight spots',
        'PCs\' equipment: what they have in hand vs. stowed, load, dimensions, noise, etc.',
        'Followers & NPCs: where they are, what they\'re doing, how they react',
        'Physical and mental states: hunger, thirst, fatigue, irritability, confusion, dread, etc.',
        'Denizens: signs of their presence, how they react to PCs',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Exploration</Heading>
      <Text>When the PCs move on, identify the next interesting scene/situation in the site. Establish the PCs intent, compare to your prep or sense of the site. If the next scene/situation is obvious, great.</Text>
      <Text>If not, you might…</Text>
      <List variant="dash" items={[
        '… rely on a player move (e.g. Defy Danger to follow directions without getting lost, Seek Insight to see what they find, etc.);',
        '… pick a GM move, frame the action where it\'d make sense to make that move; or',
        '… pick/roll on a relevant table, or use an example site from Book II.',
      ]} />
      <Text>Transition directly to the next scene/situation, or zoom out and:</Text>
      <List variant="dash" items={[
        'Describe environment they pass through',
        'Ask the PCs questions',
        'Portray followers and NPCs',
        'Maybe Keep Company',
        'Maybe make a soft GM move',
      ]} />
      <Text>Then frame the action at the next scene or situation, and go from there.</Text>
    </div>

    <List variant="numbered" items={[
      <>
        <Heading as="h3" size="sm">Lay the site's foundation</Heading>
        <List variant="dash" items={[
          'Ask questions, if they\'d know of this place',
          'Build on what you\'ve got: context, established details, things you\'ve decided, your purpose for including the site',
          'Exploit the setting guide, using the relevant tables, procedures, and examples',
        ]} />
      </>,
      <>
        <Heading as="h3" size="sm">Build up the site's story</Heading>
        <List variant="dash" items={[
          'Look for connections to setting elements, the PCs, stuff players care about, threats, NPCs, past events, open questions.',
          'Ask yourself questions that arise naturally from all of the above.',
          'Answer those questions. Make decisions! Look for new connections/questions as you do. Repeat as needed.',
          'Create a timeline of the site\'s story. Clarify and revise as needed.',
        ]} />
      </>,
      <>
        <Heading as="h3" size="sm">Sketch out the site's contents</Heading>
        <List variant="dash" items={[
          'Populate it with various NPCs/monsters',
          'Identify dangers & discoveries implied by the site\'s foundation, story, and denizens',
          'Establish areas/rooms, as suggested by the foundation, story, denizens, common sense, why the PCs are here. Create new areas or rooms as if they were sites themselves.',
          'Describe the environment. The kinds of rooms, areas, terrain, features, construction. Specific details. Reflect the site\'s story!',
          'Arrange areas/rooms: Group them, create lists to pick from, write down connections between them, draw a nodal diagram, and/or draw a representational map.',
        ]} />
      </>,
      <>
        <Heading as="h3" size="sm">Write it up</Heading>
        <Text>As much as you like and find helpful.</Text>
        <List variant="dash" items={[
          'Create maps or visuals, if you have time and you think it\'ll help.',
          'Detail areas/rooms: descriptions, impressions, questions, content, story, exits',
          'Subdivide as needed',
          'Find/create content: dangers, discoveries, NPCs. Pick from Book II or make them up!',
          'Make lists and tables to pick from/roll on',
          'Make plans: GM moves, if/thens, Die of Fate tables, custom moves, timetables, impending dooms & grim portents, etc.',
          'Review and revise. Make it make sense. Fix inconsistencies. Tighten stuff up.',
        ]} />
      </>,
    ]} />
  </div>
);
