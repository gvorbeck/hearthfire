import { memo } from 'react';
import { Heading, Text, List } from '@/components/ui';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const CoreLoop = memo(() => (
  <div>
    <List variant="numbered" items={[
      <>
        <Heading as="h3" size="sm">Establish the situation</Heading>
        <List variant="bullet" items={[
          'Frame the action',
          'Describe the environment',
          'Give details & specifics',
          'Ask questions, ask for input',
          'Portray NPCs and monsters',
          'Answer questions, clarify',
        ]} />
      </>,
      <>
        <Heading as="h3" size="sm">Make a soft GM move</Heading>
        <Text color="muted">Provoke action and/or increase tension.</Text>
      </>,
      <Heading as="h3" size="sm">Ask, "What do you do?"</Heading>,
      <>
        <Heading as="h3" size="sm">Resolve their actions</Heading>
        <List variant="bullet" items={[
          'If they trigger a player move, do what the move says.',
          'If they roll a 6−, make a hard GM move (establish badness).',
          'If they ignore trouble, make a hard GM move (establish badness).',
          'Otherwise, say what happens.',
        ]} />
      </>,
      <>
        <Heading as="h3" size="sm">Repeat</Heading>
        <List variant="bullet" items={[
          'Is the situation clear and compelling? Can the PC(s) act? Back to step 3.',
          'Is the situation clear, but escalating before the PCs act? Back to step 2.',
          'Is the situation clear, but needs a nudge? Back to step 2.',
          'Is the situation unclear? Does it need clarification, recapping, or updating? Back to step 1.',
          'Is the current scene or situation over? Wrap up, look for the next one. Back to step 1.',
        ]} />
      </>,
    ]} />
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Other things to do</Heading>
      <List variant="bullet" items={[
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
