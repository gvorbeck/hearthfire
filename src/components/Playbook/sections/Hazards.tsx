import { Heading, Text, List, Table } from '@/components/primitives';
import playbookStyles from '@/components/Playbook/Playbook.module.css';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const Hazards = () => (
  <div>
    <div>
      <Heading as="h3" size="sm">As a detailed description</Heading>
      <Text>Just describe what it is, what it looks like, what it does, how it works.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">As GM moves</Heading>
      <Text>Write one or more GM moves that reflect some of the following, as makes sense for the hazard:</Text>
      <List variant="dash" items={[
        'How its presence is foreshadowed or revealed',
        'How it harms or hinders',
        'How it escalates or gets worse',
        'How it thwarts attempts to overcome it',
      ]} />
      <Text>If dynamic, changing: give it an <strong>instinct</strong>, written as "to ___" (e.g. "to bury everything").</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">As an impending doom</Heading>
      <div className={playbookStyles.paragraphs}>
        <Text>Write down the ultimate bad thing that can happen (e.g. tunnel collapses, they roll Death's Door).</Text>
        <Text>Write 1-4 events describing how it starts and escalates; assign each event one or more check boxes.</Text>
        <Text>Optional: write a trigger that causes it to advance, fictional ("Each time the pillars are damaged") or mechanical ("Each time someone rolls doubles").</Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">As player moves</Heading>
      <Text>Write a fictional trigger ("When you <strong><em>trigger the hazard</em></strong>, …") and resolution, using any combo of the following that makes sense:</Text>
      <List variant="dash" items={[
        '___ happens (and ___ is bad)',
        'Pick X from a list',
        'Tell us ___',
        'Lose ___',
        'Take damage/suffer a debility/Death\'s Door',
        'Roll +STAT (or something); on a 10+, ___; on a 7-9, ___; (optionally) on a 6-, ___',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">If it deals damage</Heading>
      <Text><strong>What would it do to a typical person?</strong> (pick 1)</Text>
      <Table
        rows={[
          { label: 'Bruises & scrapes; pain; light burns', value: 'd4' },
          { label: 'Nasty flesh wounds, bruises, burns', value: 'd6' },
          { label: 'Broken bones, bad burns, terrible pain', value: 'd8' },
          { label: 'Death or dismemberment', value: 'd10' },
        ]}
      />
      <Text><strong>If…</strong> (choose all that apply)</Text>
      <Table
        rows={[
          { label: '… armor can\'t protect them', value: 'ignores armor' },
          { label: '… it cuts through leather/hide', value: '1 piercing, messy' },
          { label: '… it tears metal apart', value: '3 piercing, messy' },
          { label: '… it knocks them around', value: 'forceful' },
          { label: '… it\'s big/vicious/scary', value: '+2 damage' },
          { label: '… they\'ve taken precautions', value: '+disadvantage' },
          { label: '… they\'re caught off-guard', value: '+advantage' },
        ]}
      />
    </div>
  </div>
);
