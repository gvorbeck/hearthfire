import { memo } from 'react';
import { Heading, List } from '@/components/ui';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const GmMoves = memo(() => (
  <div>
    <List variant="bullet" items={[
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
      <List variant="bullet" items={[
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
      <List variant="bullet" items={[
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
));
