import { Heading, Text } from '@/components/primitives';
import { SubList, PlaybookTable } from '@/components/Playbook';
import playbookStyles from '@/components/Playbook/Playbook.module.css';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const Followers = () => (
  <div>
    <ol className={styles.stepList}>
      <li>
        <Heading as="h3" size="sm">Basics</Heading>
        <Text>Write them up as an NPC: give them a name, develop their concept, think about how you&rsquo;ll describe them. What distinguishes them from other NPCs? Why do they follow the PCs?</Text>
      </li>
      <li>
        <Heading as="h3" size="sm">Tags</Heading>
        <div className={playbookStyles.paragraphs}>
          <Text>Give them 2&ndash;4 tags, sometimes more. Tags are adjectives or nouns that finish the sentence, &ldquo;This follower is/is a ___.&rdquo; Avoid overly broad tags like <em>experienced, invincible, skilled</em>, etc.</Text>
          <Text>When a follower makes a move at a PC&rsquo;s behest, the player rolls but instead of a +STAT, they&hellip;</Text>
        </div>
        <SubList items={[
          '… add +1 if the follower has at least one relevant tag or move (or +2 if they’re also exceptional)',
          '… add +0 if follower has no relevant tags',
          '… have disadvantage if any of the follower’s tags would get in the way',
        ]} />
        <Text>Tags also inform how the follower behaves, and what they will or won&rsquo;t do without convincing.</Text>
        <div className={playbookStyles.paragraphs}>
          <Text><strong>Useful tags:</strong> ___-wise, agile, archer, athletic, beautiful, brave, cunning, fast, fierce, hardy, healer, intimidating, magical, observant, organized, patient, respected, self-sufficient, sharp-eyed, stealthy, tireless, tracker, warrior</Text>
          <Text><strong>Problematic tags:</strong> bigoted, drunkard, greedy, gullible, lecherous, naive, proud, rookie, reckless, short-fused, stubborn, frail</Text>
          <Text><strong>Mixed blessing tags:</strong> animal-lover, annoying, big, bully, callous, cautious, devious, eager, thieving, gossipy, honest, kind, little, shameless, terrifying</Text>
          <Text><em>Exceptional</em>: reserve this tag for truly outstanding followers. If they have at least one other relevant tag, they get +2 on rolls instead of +1.</Text>
          <Text><em>Group</em>: multiple followers who share tags, moves, instinct, cost, and other stats. They share a pool of Loyalty, but each member has their own HP and can act individually.</Text>
        </div>
      </li>
      <li>
        <Heading as="h3" size="sm">Hit points</Heading>
        <Text><strong>How resilient are they?</strong> (pick all that apply)</Text>
        <PlaybookTable
          rows={[
            { label: 'Weak/frail/soft', value: '3 HP' },
            { label: 'Able-bodied', value: '6 HP' },
            { label: 'Tough/strong/hard', value: '9 HP' },
            { label: 'They’re tiny', value: '−2 HP' },
            { label: 'They’re large', value: '+4 HP' },
            { label: 'The fates smile on them', value: '+2 HP' },
          ]}
        />
      </li>
      <li>
        <Heading as="h3" size="sm">Armor</Heading>
        <Text><strong>What protects them?</strong> (pick all that apply)</Text>
        <PlaybookTable
          rows={[
            { label: 'Naught but cloth and flesh', value: '0 armor' },
            { label: 'Leathers or thick hide', value: '1 armor' },
            { label: 'Mail, scales, or similar', value: '2 armor' },
            { label: 'Steel, boney plates, carapace', value: '3 armor' },
            { label: 'Layers of magical wards', value: '4 armor' },
            { label: 'A shield, or similar', value: '+1 armor' },
            { label: 'Skill in defense or keen reflexes', value: '+1 armor' },
            { label: 'Their tiny size', value: '+1 armor' },
            { label: 'Their lack of vital organs', value: '+1 armor' },
          ]}
        />
      </li>
      <li>
        <Heading as="h3" size="sm">Damage</Heading>
        <Text><strong>How dangerous are they?</strong> (pick 1)</Text>
        <PlaybookTable
          rows={[
            { label: 'Not very', value: 'd4 damage' },
            { label: 'Can defend themselves', value: 'd6 damage' },
            { label: 'Veteran fighter/predator', value: 'd8 damage' },
          ]}
        />
        <Text>Range and other tags are based on their gear. For beasts, use the tag guidelines for monsters.</Text>
      </li>
      <li>
        <Heading as="h3" size="sm">Instinct</Heading>
        <Text>What do they naturally do that causes trouble for the PC(s) they follow? For example:</Text>
        <SubList items={[
          'To take things too far',
          'To question leadership and authority',
          'To cling tightly to tradition',
          'To act impulsively',
          'To give in to temptation',
          'To not take things seriously',
          'To freeze up in the face of danger',
        ]} />
      </li>
      <li>
        <Heading as="h3" size="sm">Moves <span className={playbookStyles.muted}>(optional)</span></Heading>
        <Text>Write up to 3 GM moves, reflecting abilities not covered by a tag, how they use a specific tag, and/or common behaviors (good or bad).</Text>
      </li>
      <li>
        <Heading as="h3" size="sm">Cost</Heading>
        <Text>Choose one or make something up. When their cost is paid, they hold +1 Loyalty (max 3).</Text>
        <SubList items={[
          'Coin, payment, treasure',
          'Renown, public recognition',
          'Affection, respect (from you)',
          'Knowledge (about what?)',
          'Wrongs righted, good deeds done',
          'Amusement, entertainment',
          'Progress (towards a particular goal)',
        ]} />
      </li>
      <li>
        <Heading as="h3" size="sm">Equipment</Heading>
        <Text>Decide what gear the follower is carrying, or ask the player to Outfit them as if they were a PC.</Text>
      </li>
    </ol>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Followers in play</Heading>
      <div className={playbookStyles.paragraphs}>
        <Text>Followers are NPCs. They&rsquo;ll usually follow orders or look to their PC for direction. You might ask questions about how they&rsquo;d likely act. But <strong>you portray them, not the player.</strong></Text>
        <Text><strong>Followers trigger player moves only if a PC directs them to do so</strong> (via Order Followers). If they act on their own, you say what happens.</Text>
        <Text>When a follower gets scared, tell the player. They can spend 1 Loyalty to have them overcome their fear and do as they&rsquo;re told. Otherwise, consider: <strong>would the follower do this willingly if they weren&rsquo;t scared?</strong></Text>
      </div>
      <SubList items={[
        'If they would: The PC is having them Defy Danger (the danger being that they freeze, panic, or screw up)',
        'If they would not: The follower needs to be Persuaded or otherwise convinced.',
      ]} />
      <Text><strong>Followers might also resist orders if&hellip;</strong></Text>
      <SubList items={[
        '… they’re angry, miserable, shocked, etc.;',
        '… the order is unreasonable, foolish, degrading, distasteful; and/or',
        '… the order goes against their instinct, tags, cost, or other traits.',
      ]} />
      <div className={playbookStyles.paragraphs}>
        <Text>When a follower resists an order, make that clear to the player. They can spend the follower&rsquo;s Loyalty, Persuade them, let it go, etc.</Text>
        <Text><strong>Play up a follower&rsquo;s instinct, tags, and traits as sources of trouble.</strong> The player can spend Loyalty to keep them in line, or Persuade them, or deal with the consequences.</Text>
        <Text><strong>When a PC has a follower do something off-screen</strong>, resolve it with a single move at most (Defy Danger if it&rsquo;s not otherwise clear). Have the player roll when they&rsquo;d learn the outcome, or when it becomes important for you the GM to know how things went.</Text>
        <Text><strong>When a follower Defends</strong> and gets a 7+, the follower holds Readiness but the player decides when/how to spend it. Consider: would the follower actually do that, though? If not, the player must spend 1 Loyalty, too.</Text>
        <Text><strong>At 0 HP</strong>, a follower is out of action and their fate is in your hands. For lethal damage, pick 1:</Text>
      </div>
      <SubList items={[
        'They’re dead, immediately',
        'They trigger Death’s Door (the player rolls)',
        'They’re dying, and will die or roll for Death’s Door if no one saves them.',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm"><em>Group</em> followers</Heading>
      <div className={playbookStyles.paragraphs}>
        <Text>Multiple individuals who share stats (tags, HP, armor, damage, instinct, moves, and cost) and who often act as one. E.g., the Marshal&rsquo;s crew.</Text>
        <Text>They hold a common pool of Loyalty, which can be spent to affect the whole group or specific members. The group&rsquo;s cost usually must be paid to the group as a whole.</Text>
        <Text>Each member of the group has their own HP; they take damage and regain HP individually.</Text>
        <Text>If a PC Orders Followers to have a group act as one, the player rolls for the move once (modified by the group&rsquo;s shared tags/moves). When a <em>group</em> follower&hellip;</Text>
      </div>
      <SubList items={[
        '… Clashes or Lets Fly (or Aids a PC who’s doing so), the attack can hurt multiple foes. Roll the move once, but roll damage separately against each foe.',
        '… Clashes or Lets Fly at a single foe (or Aids a PC in doing so), roll the move once (likely with advantage) and roll one attacker’s damage, +1 per each additional attacker.',
        '… Defends, then the group holds a common pool of Readiness, to spend on behalf of the group as a whole or an individual member, whichever makes sense.',
        '… Recovers, then each member who regains HP must consume 1 use of supplies.',
        '… Seeks Insight, then the PC can ask 3 or 1 questions total (not per member).',
        '… Struggles as One along with one or more PCs, roll once for the group. On a 6–, decide which member(s) to put in a spot. On a 10+, ask the player who steps up to save a PC.',
        '… suffers any sort of cost or consequence, you decide which member(s) of the group are affected, and how.',
      ]} />
      <Text>When an individual member of a group first stands out, flesh them out with a name, a memorable trait, maybe an extra tag. A PC can direct them to act on their own, like a normal follower (with the group&rsquo;s tags, plus their own unique tags or moves, if any).</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Abstracting group exchanges</Heading>
      <Text>Optional rule for fights between larger groups. Each group deals damage and has HP/armor as per a single individual member. Larger groups deal +1 damage and have +1 armor for each multiple they outnumber their foe by (e.g. 3:1 gets +2 damage and armor). Damage represents casualties; if a group loses half its HP, then half of its members are out of the action. At 0 HP, it&rsquo;s routed, massacred, or otherwise defeated.</Text>
    </div>
  </div>
);
