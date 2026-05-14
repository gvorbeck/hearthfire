import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { Heading, Text, Button, Collapse } from '@/components/primitives';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { SubList } from '@/components/Playbook';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import styles from './GmPlaybook.module.css';

const CORE_LOOP = 'The core loop';

const SECTIONS = [
  CORE_LOOP,
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
    <div className={styles.otherThings}>
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

const SECTION_CONTENT: Partial<Record<string, React.ReactNode>> = {
  [CORE_LOOP]: <CoreLoop />,
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
      <Breadcrumb crumbs={crumbs} />
      <Heading as="h1" size="xl" className={styles.title}>GM Playbook</Heading>
      <div className={styles.sections}>
        {SECTIONS.map(section => (
          <Collapse key={section} label={section}>
            {SECTION_CONTENT[section] ?? <div className={styles.placeholder} />}
          </Collapse>
        ))}
      </div>
    </main>
  );
};
