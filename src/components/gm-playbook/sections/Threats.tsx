import { memo } from 'react';
import { Heading, Text, List } from '@/components/ui';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const Threats = memo(() => (
  <div>
    <Text size="xs">Threats are the lingering problems that cause trouble for the PCs, the steading, the region, or even the world.</Text>
    <div className={styles.subsection}>
      <Text size="xs">Write up threats after the first session, based on what the players told you as they introduced their characters. Write new threats between sessions when…</Text>
      <List variant="bullet" items={[
        'the Seasons Change move results in a threat, and you choose to create one instead of make an existing one worse.',
        'you introduced a monster, NPC, or thing and you think it might cause trouble later.',
        'you expect the PCs to encounter the threat in an upcoming session.',
      ]} />
    </div>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Write up a threat</Heading>
      <List variant="numbered" items={[
        <Text size="xs">Give it a name and pick its type.</Text>,
        <Text size="xs">Add it (and its type) to a threat tracker (Homefront, Nearby, or Distant).</Text>,
        <Text size="xs">Give it an instinct (if it doesn't already have one). How does it cause problems for others? Write it as "to __" (e.g., "to enrich himself").</Text>,
        <Text size="xs">Write a quick description, including related threats or NPCs.</Text>,
        <Text size="xs">If it has momentum: write its impending doom and 2–4 grim portents.</Text>,
        <Text size="xs">Optional: write some stakes questions.</Text>,
        <Text size="xs">Optional: pick or write 2–4 GM moves.</Text>,
        <Text size="xs">Optional: write custom player moves.</Text>,
      ]} />
    </div>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Update threats</Heading>
      <Text size="xs">Between sessions, review each threat. If…</Text>
      <List variant="bullet" items={[
        'it is no longer a threat, then cross it off.',
        'grim portents occurred, then mark them.',
        'the PCs foiled it or changed its course, then update its grim portents and impending doom appropriately.',
        "it is moving toward something (but wasn't before), then write an impending doom and grim portents.",
        'its instinct or threat type no longer ring true, then revise them.',
        'any new stakes questions occur to you, then write them down.',
        'it got closer or further away, then move it from one threat tracker to the next.',
      ]} />
    </div>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Threat moves</Heading>
      <div className={styles.threatMovesGrid}>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>Affliction</Heading>
          <List variant="bullet" items={[
            'Worsen or quicken',
            'Spread to others/suck others in',
            'Mutate, take on a new form/aspect',
            'Eat away at something/someone',
            'Strip someone of honor/dignity',
            'Drive someone to desperation',
            'Justify selfishness, neglect',
            'Drive a wedge between people',
            'Cause delusion, stubbornness, foolishness',
            'Sow panic or despair',
            'Trigger shortages, hoarding',
            'Prompt violence, hatred, blame',
          ]} />
        </div>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>Beast</Heading>
          <List variant="bullet" items={[
            "Show up where it's not wanted",
            'Stalk or pursue prey',
            'Protect its home or family',
            'Make a show of strength, aggression',
            'Build or expand a nest/den/lair',
            'Modify its environment',
            'Flee or panic or rage',
            'Consume something (or someone)',
            'Grow or diminish, in size or numbers',
          ]} />
        </div>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>Institution</Heading>
          <List variant="bullet" items={[
            'Sway public opinion',
            'Put someone in their place',
            'Change a rule, law, or custom',
            'Acquire leverage, resources, influence',
            'Denounce something or someone',
            'Support a course of action',
            'Recruit new members or minions',
            'Squabble amongst themselves',
            'Change leadership',
            'Negotiate a deal or treaty',
            'Send someone else to do their dirty work',
          ]} />
        </div>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>MacGuffin</Heading>
          <List variant="bullet" items={[
            'Reveal a secret',
            'Draw attention to itself',
            'Point to something else',
            'Generate envy/fear/discord',
            'Weigh heavily, become a burden',
            'Be the target of theft',
            'Go missing',
            'Perform its function, heedlessly',
            'Fail at the worst possible moment',
            'Leave its mark on someone or thing',
            'Become something greater, or lesser',
          ]} />
        </div>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>Magical entity</Heading>
          <List variant="bullet" items={[
            'Spy on someone, unseen/from afar',
            'Sense powerful longings/emotions',
            'Appear in glimpses, dreams, visions',
            'Offer service, secrets, power',
            'Demand an oath or sacrifice',
            'Lay a curse',
            'Twist a bargain to its favor',
            'Send forth minions to do its bidding',
            'Shape its environs, per its nature',
            'Pursue alien goals',
            'Foster rivalries with similar powers',
            'Grow or diminish in strength',
          ]} />
        </div>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>Rabble</Heading>
          <List variant="bullet" items={[
            'Grow or gather in numbers',
            'Claim territory or resources',
            "Fall under a (new) leader's sway",
            'Undergo internal turmoil',
            'Make a show of strength/numbers',
            'Declare an enemy or an alliance',
            'Turn on one of their own',
            'Overwhelm a position or weaker group',
            'Despoil, loot, pillage, burn',
            'Refuse to be controlled/contained',
            'Disperse, scatter, flee',
          ]} />
        </div>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>Villain</Heading>
          <List variant="bullet" items={[
            'Grasp power, gain followers or allies',
            "Find someone's weakness",
            'Make an offer, with strings attached',
            'Demand concessions, obedience, or respect',
            'Make threats, veiled or not',
            'Attack cautiously, holding reserves',
            'Attack ruthlessly, with little warning',
            'Reveal preparations made in advance',
            'Sacrifice another to advance a goal',
            'Betray an ally or a trust',
            'Take a prisoner',
            'Do the unthinkable',
          ]} />
        </div>
        <div>
          <Heading as="h4" size="sm" className={styles.threatType}>Wildcard</Heading>
          <List variant="bullet" items={[
            'Aggressively pursue their instinct',
            'Show their worth, or lack thereof',
            'Display the contents of their heart',
            'Provide advice/aid, wanted or not',
            'Reveal a secret, or keep one closely',
            'Draw attention to themselves/others',
            'Appear unannounced',
            'Act strangely (for them)',
            'Bear witness',
            'Tell stories (true or not)',
            'Make/keep/break/demand a promise',
            'Force an issue or a confrontation',
            'Stand resolute and refuse to budge',
          ]} />
        </div>
      </div>
    </div>
  </div>
));
