import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { Heading, Text, Button, Collapse, RuleDivider } from '@/components/primitives';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { SubList, PlaybookTable, PlaybookCallout, TextareaField } from '@/components/Playbook';
import type { ContentLists } from '@/types';
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

interface ContentSectionProps {
  content: ContentLists | undefined;
  onSave: (field: keyof ContentLists, value: string) => Promise<void>;
}

const ContentSection = ({ content, onSave }: ContentSectionProps) => {
  const saveExcluded = useCallback((v: string) => onSave('excluded', v), [onSave]);
  const saveVeiled = useCallback((v: string) => onSave('veiled', v), [onSave]);
  const saveSpecial = useCallback((v: string) => onSave('specialHandling', v), [onSave]);

  return (
    <div>
      <div className={styles.contentRules}>
        <Text size="sm">Keep this in sync with the steading playbook. Review it at the start of each session.</Text>
        <Text size="sm">When <strong>anyone calls "time out,"</strong> play stops. Step out of character, check in with each other, maybe take a break. Discuss what's wrong, player-to-player.</Text>
        <Text size="sm">If <strong>content was included that shouldn't have been</strong>, acknowledge the mistake, fix the fiction, and move on.</Text>
        <Text size="sm">If <strong>someone realizes they need content to be excluded, veiled, or handled in a particular way</strong>, then update the lists. Clarify specifics, now or later, but don't ask for reasons. Fix the fiction. Check in with the player(s). When everyone is ready, move on.</Text>
      </div>
      <TextareaField label="Excluded content" note="(Not part of the game, on-camera or off)" value={content?.excluded ?? ''} onSave={saveExcluded} />
      <TextareaField label="Veiled content" note="(Part of the fiction, but only off-camera)" value={content?.veiled ?? ''} onSave={saveVeiled} />
      <TextareaField label="Special handling" value={content?.specialHandling ?? ''} onSave={saveSpecial} />
    </div>
  );
};

const Threats = () => (
  <div>
    <Text size="sm">Threats are the lingering problems that cause trouble for the PCs, the steading, the region, or even the world.</Text>
    <div className={styles.subsection}>
      <Text size="sm">Write up threats after the first session, based on what the players told you as they introduced their characters. Write new threats between sessions when…</Text>
      <SubList items={[
        'the Seasons Change move results in a threat, and you choose to create one instead of make an existing one worse.',
        'you introduced a monster, NPC, or thing and you think it might cause trouble later.',
        'you expect the PCs to encounter the threat in an upcoming session.',
      ]} />
    </div>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Write up a threat</Heading>
      <ol className={styles.stepList}>
        <li><Text size="sm">Give it a name and pick its type.</Text></li>
        <li><Text size="sm">Add it (and its type) to a threat tracker (Homefront, Nearby, or Distant).</Text></li>
        <li><Text size="sm">Give it an instinct (if it doesn't already have one). How does it cause problems for others? Write it as "to __" (e.g., "to enrich himself").</Text></li>
        <li><Text size="sm">Write a quick description, including related threats or NPCs.</Text></li>
        <li><Text size="sm">If it has momentum: write its impending doom and 2–4 grim portents.</Text></li>
        <li><Text size="sm">Optional: write some stakes questions.</Text></li>
        <li><Text size="sm">Optional: pick or write 2–4 GM moves.</Text></li>
        <li><Text size="sm">Optional: write custom player moves.</Text></li>
      </ol>
    </div>
    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Update threats</Heading>
      <Text size="sm">Between sessions, review each threat. If…</Text>
      <SubList items={[
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
          <SubList items={[
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
          <SubList items={[
            'Show up where it\'s not wanted',
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
          <SubList items={[
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
          <SubList items={[
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
          <SubList items={[
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
          <SubList items={[
            'Grow or gather in numbers',
            'Claim territory or resources',
            'Fall under a (new) leader\'s sway',
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
          <SubList items={[
            'Grasp power, gain followers or allies',
            'Find someone\'s weakness',
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
          <SubList items={[
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
);

interface IWonderProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

const IWonder = ({ value, onSave }: IWonderProps) => (
  <div>
    <div className={styles.contentRules}>
      <Text size="sm">Keep a running list of open questions that either…</Text>
      <SubList items={[
        'you don\'t know how to answer yet, or',
        'you want to answer via play.',
      ]} />
      <Text size="sm">Update this list between each session.</Text>
    </div>
    <TextareaField label="Questions" value={value} onSave={onSave} rows={12} />
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
  const { game, loading, error, updateContent, updateField } = useGame(id);

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
            {section === 'Content'
              ? <ContentSection content={game.content} onSave={updateContent} />
              : section === 'Threats'
              ? <Threats />
              : section === 'I wonder…'
              ? <IWonder value={game.iWonder ?? ''} onSave={v => updateField('iWonder', v)} />
              : SECTION_CONTENT[section]?.() ?? <div className={styles.placeholder} />}
          </Collapse>
        ))}
      </div>
    </main>
  );
};
