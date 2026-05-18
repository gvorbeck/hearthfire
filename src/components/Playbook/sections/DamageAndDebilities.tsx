import { memo } from 'react';
import { Heading, Text, List } from '@/components/primitives';
import { PlaybookTable, PlaybookCallout } from '@/components/Playbook';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const DamageAndDebilities = memo(() => (
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
      <List variant="dash" items={[
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
      <List variant="dash" items={[
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
));
