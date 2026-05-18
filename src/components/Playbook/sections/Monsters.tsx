import { Heading, Text, List } from '@/components/primitives';
import { PlaybookTable, PlaybookCallout } from '@/components/Playbook';
import playbookStyles from '@/components/Playbook/Playbook.module.css';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const Monsters = () => (
  <div>
    <div>
      <Heading as="h3" size="sm">1. Concept</Heading>
      <Text>Picture it. What is it? What does it do? How does it live, eat, fight? If you're unsure, use a theme table from the setting guide. Or, pick a classic fantasy monster and reimagine it for Stonetop.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">2. Name</Heading>
      <Text><strong>If the monster…</strong></Text>
      <List variant="dash" items={[
        '… has a proper name, call it that.',
        '… is a known, mundane thing, then give it a short descriptive name in plain English',
        '… is a thing of rumor and legend, give a name from another language',
        '… is unknown and unnamed, give it a spooky, descriptive title in plain English.',
      ]} />
      <Text>Stonetop names sound Welsh. Marshedge names sound Irish. Hillfolk names sound Breton (but clipped, missing vowels). Manmarch names sound German. Barrier Pass names sound Nepali or Tibetan. Lygos names sound Greek, Hebrew, Persian, or Arabic.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">3. Tags</Heading>
      <Text><strong>How does it usually hunt or fight?</strong> (pick 1)</Text>
      <PlaybookTable
        rows={[
          { label: 'In large groups (6 or more)', value: 'horde' },
          { label: 'In small groups (2-5 per group)', value: 'group' },
          { label: 'By itself', value: 'solitary' },
        ]}
      />
      <Text><strong>How big is it?</strong> (pick 1)</Text>
      <PlaybookTable
        rows={[
          { label: 'Cat-sized or smaller', value: 'tiny' },
          { label: 'Like a human child', value: 'small' },
          { label: 'Adult human-sized', value: '–' },
          { label: 'Like a horse, cart, etc.', value: 'large' },
          { label: 'Like an elephant, or bigger', value: 'huge' },
        ]}
      />
      <Text><strong>What is its nature?</strong> (add all that apply)</Text>
      <PlaybookTable
        rows={[
          { label: 'Lacks physical form', value: 'spirit' },
          { label: 'Between physical and spiritual', value: 'fae' },
          { label: 'Made by someone', value: 'construct' },
          { label: 'Changed by the Things Below', value: 'corrupted' },
          { label: 'From the first age of creation', value: 'primordial' },
          { label: 'Dead, but in denial', value: 'undead' },
        ]}
      />
      <Text><strong>What is it notable for?</strong> (add all that apply)</Text>
      <PlaybookTable
        rows={[
          { label: 'Amassing trinkets and treasure', value: 'hoarder' },
          { label: 'Avoiding fights, fleeing early', value: 'cautious' },
          { label: 'Intelligence', value: 'cunning or devious' },
          { label: 'Disturbing/terrible presence', value: 'terrifying' },
          { label: 'Sneaking, surprising, ambushing', value: 'stealthy' },
          { label: 'Using spells or magic', value: 'magical' },
          { label: 'Working well in groups', value: 'organized' },
          { label: 'Something else', value: 'invent a tag' },
        ]}
      />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">4. Hit points</Heading>
      <Text><strong>How does it hunt or fight?</strong> (pick 1)</Text>
      <PlaybookTable
        rows={[
          { label: 'In large groups (horde)', value: '3 HP' },
          { label: 'In small groups (group)', value: '6 HP' },
          { label: 'By itself (solitary)', value: '12 HP' },
        ]}
      />
      <Text><strong>How big is it?</strong> (pick 1)</Text>
      <PlaybookTable
        rows={[
          { label: 'Cat-sized or smaller (tiny)', value: '−2 HP' },
          { label: 'Human-sized (adult or child)', value: '+0 HP' },
          { label: 'Like a horse, cart, etc. (large)', value: '+4 HP' },
          { label: 'Like an elephant, or bigger (huge)', value: '+8 HP' },
        ]}
      />
      <Text><strong>It…</strong> (choose all that apply)</Text>
      <PlaybookTable
        rows={[
          { label: '… is particularly tough or durable', value: '+4 HP' },
          { label: '… is smiled upon by the fates', value: '+2 HP' },
          { label: '… is animated by more than biology', value: '+4 HP' },
          { label: '… lacks vital organs', value: '+3 HP' },
        ]}
      />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">5. Armor</Heading>
      <Text><strong>What protects it?</strong> (pick 1)</Text>
      <PlaybookTable
        rows={[
          { label: 'Naught but cloth and flesh', value: '0 armor' },
          { label: 'Leathers or thick hide', value: '1 armor' },
          { label: 'Mail, scales, or similar', value: '2 armor' },
          { label: 'Steel, bony plates, carapace', value: '3 armor' },
          { label: 'Potent wards/supernatural resilience', value: '4 armor' },
        ]}
      />
      <Text><strong>It…</strong> (choose all that apply)</Text>
      <PlaybookTable
        rows={[
          { label: '… is cat-sized or smaller (tiny)', value: '+1 armor' },
          { label: '… bears a shield, or similar', value: '+1 armor' },
          { label: '… is skilled in defense', value: '+1 armor' },
          { label: '… lacks vital organs', value: '+1 armor' },
        ]}
      />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">6. Damage</Heading>
      <Text><strong>How does it hunt or fight?</strong> (pick 1)</Text>
      <PlaybookTable
        rows={[
          { label: 'In large groups (6 or more, horde)', value: 'd6' },
          { label: 'In small groups (2-5, group)', value: 'd8' },
          { label: 'By itself (solitary)', value: 'd10' },
        ]}
      />
      <Text><strong>What's the nature of its attack?</strong> (pick all that apply)</Text>
      <PlaybookTable
        rows={[
          { label: 'Useful up close and personal', value: 'hand' },
          { label: 'Works well at sword\'s reach', value: 'close' },
          { label: 'Can keep foes at bay', value: 'reach' },
          { label: 'Useful at range', value: 'near or far' },
          { label: 'Can hurt many foes at once', value: 'area' },
          { label: 'Small and weak', value: '−1 die size' },
          { label: 'Vicious and obvious', value: '+2 damage' },
          { label: 'Relentless or overwhelming', value: 'advantage' },
          { label: 'Latches on, pins, grapples', value: 'grabby' },
          { label: 'Can slice through thick hide', value: '1 piercing, messy' },
          { label: 'Can tear metal apart', value: '3 piercing, messy' },
          { label: 'Bypasses armor entirely', value: 'ignores armor' },
          { label: 'Prone to breakage', value: 'crude' },
        ]}
      />
      <Text><strong>How big is it?</strong> (pick 1)</Text>
      <PlaybookTable
        rows={[
          { label: 'Cat-sized or smaller (tiny)', value: '−2 damage, reduce range' },
          { label: 'Like a human shield (small)', value: 'reduce range' },
          { label: 'Adult human-sized', value: '–' },
          { label: 'Like a horse, cart, etc. (large)', value: '+1 damage, add a range' },
          { label: 'Like an elephant, or bigger (huge)', value: '+3 damage, add a range' },
        ]}
      />
      <Text><strong>What else applies?</strong> (pick all that do)</Text>
      <PlaybookTable
        rows={[
          { label: 'It\'s impressively strong', value: '+2 damage, forceful' },
          { label: 'It strikes deftly and precisely', value: '+1 piercing' },
          { label: 'Physical injury is not the worst danger it poses', value: '−1 die size' },
          { label: 'It is ancient and noteworthy', value: '+1 die size' },
          { label: 'It abhors violence', value: 'disadvantage' },
        ]}
      />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">7. Special qualities</Heading>
      <Text>Write one for each of the following it possesses:</Text>
      <List variant="dash" items={[
        'An exceptional/limited sense',
        'A useful adaptation/defense',
        'A strange form or composition',
        'A weakness or vulnerability',
        'An effect on its environment',
        'An important trait, not otherwise obvious',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">8. Instinct</Heading>
      <Text>What does it do or want that causes problems? This is its instinct. Write it as, "to ___" (e.g., "to consume the flesh of innocents").</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">9. Moves</Heading>
      <Text>Write moves that fill in the blank: "The monster can/will ___."</Text>
      <PlaybookTable
        columnHeaders={['If the monster…', 'write a move based on…']}
        rows={[
          { label: '… is deceptive/sneaky', value: '… wits or dirty tricks.' },
          { label: '… uses magic or spells', value: '… those powers.' },
          { label: '… works well in groups', value: '… its allies or tactics.' },
          { label: '… is a spirit', value: '… how it takes physical form.' },
          { label: '… poses more than physical danger', value: '… the true danger.' },
          { label: '… defends itself', value: '… how it does so.' },
          { label: '… has a special attack', value: '… what that attack does.' },
        ]}
      />
      <Text>If the monster has less than 3 moves, or you feel like something's missing, write moves based on whatever is notable about its behavior.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">10. Description</Heading>
      <Text>How big? What's it look like? How does it move? Compare it to familiar things. Include at least one impression from a sense other than sight.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">11. Optional</Heading>
      <Text>Write any of these that will help you portray the monster or use it in play.</Text>
      <div className={playbookStyles.paragraphs}>
        <Text><strong>Tactics:</strong> if/then or when/then statements, like…</Text>
        <List variant="dash" items={[
          '"If the PCs make noise/draw attention: watch from afar, alert others, wait until night."',
          '"If the PCs talk in their presence: learn their voices, to mimic them later."',
          '"When night falls: lure someone away with a mimicked voice, kill them, take their stuff."',
        ]} />
        <Text><strong>Something interesting/something useful:</strong> pre-plan things to reveal if PCs Know Things.</Text>
        <Text><strong>Custom player moves:</strong> particularly good for resolving nasty attacks (mind control, poison, etc.).</Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <PlaybookCallout title="Monsters & followers">
        <Text>When you <strong><em>convert a monster into a follower</em></strong>:</Text>
        <List variant="dash" items={[
          'Add any tags you deem appropriate',
          'Choose (or make up) a cost, and add a spot to record their Loyalty (max 3)',
          'Otherwise use it as-is.',
        ]} />
        <Text>When you <strong><em>convert a follower into a monster</em></strong>, use their stats as-is. If you haven't already done so, write some GM moves for them.</Text>
      </PlaybookCallout>
    </div>
  </div>
);
