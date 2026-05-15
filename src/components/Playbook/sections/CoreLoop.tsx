import { memo } from 'react';
import { Heading, Text } from '@/components/primitives';
import { SubList } from '@/components/Playbook';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const CoreLoop = memo(() => (
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
));
