import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { Heading, Text, Button, Collapse, RuleDivider } from '@/components/primitives';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { SubList, PlaybookTable, PlaybookCallout } from '@/components/Playbook';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import styles from './GmPlaybook.module.css';

const SECTIONS = [
  'The core loop',
  'GM moves',
  'Principles',
  'Damage and debilities',
  'Content',
  'Threats',
  'I wonder…',
  'Expeditions',
  'Sites',
  'Discoveries',
  'Hazards',
  'Monsters',
  'NPCs',
  'Followers',
  'Homefront',
  'Flow of play',
];


const CoreLoop = () => (
  <div>
    <ol className={styles.stepList}>
      <li>
        <Heading as="h3" size="sm">Establish the situation</Heading>
        <SubList items={[
          'Frame the action',
          'Describe the environment',
          'Give details & specifics',
          'Ask questions, ask for input',
          'Portray NPCs and monsters',
          'Answer questions, clarify',
        ]} />
      </li>
      <li>
        <Heading as="h3" size="sm">Make a soft GM move</Heading>
        <Text color="muted">Provoke action and/or increase tension.</Text>
      </li>
      <li>
        <Heading as="h3" size="sm">Ask, "What do you do?"</Heading>
      </li>
      <li>
        <Heading as="h3" size="sm">Resolve their actions</Heading>
        <SubList items={[
          'If they trigger a player move, do what the move says.',
          'If they roll a 6−, make a hard GM move (establish badness).',
          'If they ignore trouble, make a hard GM move (establish badness).',
          'Otherwise, say what happens.',
        ]} />
      </li>
      <li>
        <Heading as="h3" size="sm">Repeat</Heading>
        <SubList items={[
          'Is the situation clear and compelling? Can the PC(s) act? Back to step 3.',
          'Is the situation clear, but escalating before the PCs act? Back to step 2.',
          'Is the situation clear, but needs a nudge? Back to step 2.',
          'Is the situation unclear? Does it need clarification, recapping, or updating? Back to step 1.',
          'Is the current scene or situation over? Wrap up, look for the next one. Back to step 1.',
        ]} />
      </li>
    </ol>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Other things to do</Heading>
      <SubList items={[
        'Take notes',
        'Draw maps',
        'Leave blanks',
        'Keep things moving',
        'Involve everyone',
        'Engage your players in world-building',
        'Sometimes, disclaim decision making',
      ]} />
    </div>
  </div>
);

const GmMoves = () => (
  <div>
    <SubList items={[
      'Announce trouble (future or offscreen)',
      'Reveal an unwelcome truth',
      'Ask a provocative question',
      'Put someone in a spot',
      'Use up their resources',
      'Turn their move back on them',
      'Demonstrate a downside',
      'Hurt someone',
      'Separate them',
      'Capture someone',
      'Offer an opportunity (with or without a cost)',
      'Tell them the consequences/requirements',
      'Advance towards impending doom',
    ]} />
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Exploration</Heading>
      <SubList items={[
        'Provide a choice of paths',
        'Hint at more than meets the eye',
        'Offer riches at a price',
        'Present a discovery',
        'Point to a looming danger',
        'Introduce a danger, person, or faction',
        'Bar the way',
      ]} />
    </div>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Homefront</Heading>
      <SubList items={[
        'Introduce someone interesting',
        'Reveal simmering tensions',
        'Present a want or need',
        'Show how others really feel',
        'Draw out their feelings',
        'Change a relationship',
        'Oppose their wishes',
        'Remind them of their obligations',
        'Start a conflict or crisis',
        'Play them against each other',
      ]} />
    </div>
  </div>
);

const DamageAndDebilities = () => (
  <div>
    <Text>Deal damage when your GM move has someone getting hurt, banged up, knocked around, injured. If it's caused by a danger, deal damage per its stats. Otherwise:</Text>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">What would it do to a normal person?</Heading>
      <PlaybookTable rows={[
        { label: 'Bruises & scrapes; pain; light burns', value: 'd4' },
        { label: 'Nasty flesh wounds/bruises/burns', value: 'd6' },
        { label: 'Broken bones; deep/wide burns', value: 'd8' },
        { label: 'Death or dismemberment', value: 'd10' },
      ]} />
    </div>
    <div className={styles.subsection}>
      <Text>Inflict a debility when your GM move would leave a PC weakened, dazed, or miserable.</Text>
      <SubList items={[
        'Weakened: fatigued, tired, sluggish, shaky. Disadvantage to STR and DEX.',
        'Dazed: out of it, befuddled, not thinking clearly. Disadvantage to INT and WIS.',
        'Miserable: distressed, grumpy, unwell, in pain. Disadvantage to CON and CHA.',
      ]} />
    </div>
    <PlaybookCallout title="RECOVER">
      <Text>When you <strong>take time to catch your breath and tend to what ails you</strong>, expend 1 use of supplies and recover HP equal to 4+Prosperity. You can't gain this benefit again until you take more damage.</Text>
      <Text>When you <strong>tend to a debility or a problematic wound</strong>, say how. The GM will either say that it's taken care of or tell you what's required to do so (Defying Danger, expending supplies or some other resource, finding ___, Making Camp, etc.).</Text>
    </PlaybookCallout>
    <div className={styles.subsection}>
      <Text>When they tend to a debility or problematic wound, additional requirements might include:</Text>
      <SubList items={[
        'Knowing Things about how to treat this',
        'Defying Danger, the danger being… the pain / them thrashing as you work / the wound/condition getting worse / that ___ arrives/happens before you finish / drawing the attention of ___ / that you need to use up/use more ___',
        'Expending (more) supplies, whisky, etc.',
        'Finding ___ (an herb, the antivenom, fresh water, something to use as a stent, etc.)',
        'Making Camp/letting them rest',
        'Doing something drastic (cauterizing, amputating, field surgery, etc.)',
      ]} />
      <Text color="muted">Combine with "and" and "or" as you see fit.</Text>
    </div>
  </div>
);

const SECTION_CONTENT: Partial<Record<string, () => React.ReactNode>> = {
  'The core loop': () => <CoreLoop />,
  'GM moves': () => <GmMoves />,
  'Principles': () => <SubList items={[
    'Follow the rules',
    'Begin and end with the fiction',
    'Address the characters, not the players',
    'Ask questions and build on the answers',
    'Be a fan of the player characters',
    'Embrace the fantastic and the mundane',
    'Exploit the setting guide',
    'Respect your prep',
    'Give your characters life',
    'Think offscreen, too',
    'Bring it home',
    'Let things breathe',
    'Let things burn',
  ]} />,
  'Damage and debilities': () => <DamageAndDebilities />,
};

export const GmPlaybook = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { game, loading, error } = useGame(id);

  if (loading) {
    return (
      <main className={styles.centered}>
        <Text color="muted">Loading…</Text>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Something went wrong</Heading>
        <Text color="muted">{error}</Text>
        <Link to={`/game/${id}`}>
          <Button variant="secondary">Back to Game</Button>
        </Link>
      </main>
    );
  }

  if (!game) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Game not found</Heading>
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </main>
    );
  }

  const gameName = game.name || DEFAULT_GAME_NAME;
  const crumbs = [
    { label: gameName, to: `/game/${id}` },
    { label: 'GM Playbook' },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Breadcrumb crumbs={crumbs} />
        <Heading as="h1" size="xl" className={styles.title}>GM Playbook</Heading>
        <RuleDivider className={styles.titleRule} />
      </div>
      <div className={styles.sections}>
        {SECTIONS.map(section => (
          <Collapse key={section} label={section}>
            {SECTION_CONTENT[section]?.() ?? <div className={styles.placeholder} />}
          </Collapse>
        ))}
      </div>
    </main>
  );
};
