import { Heading, Text, List, Table } from "@/components/ui";
import playbookStyles from "@/components/gm-playbook/Playbook.module.css";
import styles from "@/pages/GmPlaybook/GmPlaybook.module.css";

const tagsRollItems = [
  "add +1 if the follower has at least one relevant tag or move (or +2 if they're also exceptional)",
  "add +0 if follower has no relevant tags",
  "have disadvantage if any of the follower's tags would get in the way",
];

const instinctItems = [
  "To take things too far",
  "To question leadership and authority",
  "To cling tightly to tradition",
  "To act impulsively",
  "To give in to temptation",
  "To not take things seriously",
  "To freeze up in the face of danger",
];

const costItems = [
  "Coin, payment, treasure",
  "Renown, public recognition",
  "Affection, respect (from you)",
  "Knowledge (about what?)",
  "Wrongs righted, good deeds done",
  "Amusement, entertainment",
  "Progress (towards a particular goal)",
];

const followersInPlayResistItems = [
  "they're angry, miserable, shocked, etc.;",
  "the order is unreasonable, foolish, degrading, distasteful; and/or",
  "the order goes against their instinct, tags, cost, or other traits.",
];

const followersInPlayFearItems = [
  "If they would: The PC is having them Defy Danger (the danger being that they freeze, panic, or screw up)",
  "If they would not: The follower needs to be Persuaded or otherwise convinced.",
];

const followersAtZeroHPItems = [
  "They're dead, immediately",
  "They trigger Death's Door (the player rolls)",
  "They're dying, and will die or roll for Death's Door if no one saves them.",
];

const groupFollowerItems = [
  "Clashes or Lets Fly (or Aids a PC who's doing so), the attack can hurt multiple foes. Roll the move once, but roll damage separately against each foe.",
  "Clashes or Lets Fly at a single foe (or Aids a PC in doing so), roll the move once (likely with advantage) and roll one attacker's damage, +1 per each additional attacker.",
  "Defends, then the group holds a common pool of Readiness, to spend on behalf of the group as a whole or an individual member, whichever makes sense.",
  "Recovers, then each member who regains HP must consume 1 use of supplies.",
  "Seeks Insight, then the PC can ask 3 or 1 questions total (not per member).",
  "Struggles as One along with one or more PCs, roll once for the group. On a 6–, decide which member(s) to put in a spot. On a 10+, ask the player who steps up to save a PC.",
  "Suffers any sort of cost or consequence, you decide which member(s) of the group are affected, and how.",
];

const stepsItems = [
  <>
    <Heading as="h3" size="sm">
      Basics
    </Heading>
    <Text>
      Write them up as an NPC: give them a name, develop their concept,
      think about how you&rsquo;ll describe them. What distinguishes them
      from other NPCs? Why do they follow the PCs?
    </Text>
  </>,
  <>
    <Heading as="h3" size="sm">
      Tags
    </Heading>
    <div className={playbookStyles.paragraphs}>
      <Text>Give them 2–4 tags, sometimes more. Tags are adjectives or nouns that finish the sentence, "This follower is/is a ___." Avoid overly broad tags like *experienced, invincible, skilled*, etc.</Text>
      <Text>
        When a follower makes a move at a PC&rsquo;s behest, the player
        rolls but instead of a +STAT, they&hellip;
      </Text>
    </div>
    <List variant="ellipses" items={tagsRollItems} />
    <Text>
      Tags also inform how the follower behaves, and what they will or
      won&rsquo;t do without convincing.
    </Text>
    <div className={playbookStyles.paragraphs}>
      <Text>**Useful tags:** ___-wise, agile, archer, athletic, beautiful, brave, cunning, fast, fierce, hardy, healer, intimidating, magical, observant, organized, patient, respected, self-sufficient, sharp-eyed, stealthy, tireless, tracker, warrior</Text>
      <Text>**Problematic tags:** bigoted, drunkard, greedy, gullible, lecherous, naive, proud, rookie, reckless, short-fused, stubborn, frail</Text>
      <Text>**Mixed blessing tags:** animal-lover, annoying, big, bully, callous, cautious, devious, eager, thieving, gossipy, honest, kind, little, shameless, terrifying</Text>
      <Text><><em>Exceptional</em>: reserve this tag for truly outstanding followers. If they have at least one other relevant tag, they get +2 on rolls instead of +1.</></Text>
      <Text><><em>Group</em>: multiple followers who share tags, moves, instinct, cost, and other stats. They share a pool of Loyalty, but each member has their own HP and can act individually.</></Text>
    </div>
  </>,
  <>
    <Heading as="h3" size="sm">
      Hit points
    </Heading>
    <Text>**How resilient are they?** (pick all that apply)</Text>
    <Table
      rows={[
        { label: "Weak/frail/soft", value: "3 HP" },
        { label: "Able-bodied", value: "6 HP" },
        { label: "Tough/strong/hard", value: "9 HP" },
        { label: "They're tiny", value: "−2 HP" },
        { label: "They're large", value: "+4 HP" },
        { label: "The fates smile on them", value: "+2 HP" },
      ]}
    />
  </>,
  <>
    <Heading as="h3" size="sm">
      Armor
    </Heading>
    <Text>**What protects them?** (pick all that apply)</Text>
    <Table
      rows={[
        { label: "Naught but cloth and flesh", value: "0 armor" },
        { label: "Leathers or thick hide", value: "1 armor" },
        { label: "Mail, scales, or similar", value: "2 armor" },
        { label: "Steel, boney plates, carapace", value: "3 armor" },
        { label: "Layers of magical wards", value: "4 armor" },
        { label: "A shield, or similar", value: "+1 armor" },
        { label: "Skill in defense or keen reflexes", value: "+1 armor" },
        { label: "Their tiny size", value: "+1 armor" },
        { label: "Their lack of vital organs", value: "+1 armor" },
      ]}
    />
  </>,
  <>
    <Heading as="h3" size="sm">
      Damage
    </Heading>
    <Text>**How dangerous are they?** (pick 1)</Text>
    <Table
      rows={[
        { label: "Not very", value: "d4 damage" },
        { label: "Can defend themselves", value: "d6 damage" },
        { label: "Veteran fighter/predator", value: "d8 damage" },
      ]}
    />
    <Text>
      Range and other tags are based on their gear. For beasts, use the
      tag guidelines for monsters.
    </Text>
  </>,
  <>
    <Heading as="h3" size="sm">
      Instinct
    </Heading>
    <Text>
      What do they naturally do that causes trouble for the PC(s) they
      follow? For example:
    </Text>
    <List variant="dash" items={instinctItems} />
  </>,
  <>
    <Heading as="h3" size="sm">
      Moves <span className={playbookStyles.muted}>(optional)</span>
    </Heading>
    <Text>
      Write up to 3 GM moves, reflecting abilities not covered by a tag,
      how they use a specific tag, and/or common behaviors (good or bad).
    </Text>
  </>,
  <>
    <Heading as="h3" size="sm">
      Cost
    </Heading>
    <Text>
      Choose one or make something up. When their cost is paid, they hold
      +1 Loyalty (max 3).
    </Text>
    <List variant="dash" items={costItems} />
  </>,
  <>
    <Heading as="h3" size="sm">
      Equipment
    </Heading>
    <Text>
      Decide what gear the follower is carrying, or ask the player to
      Outfit them as if they were a PC.
    </Text>
  </>,
];

export const Followers = () => (
  <div>
    <List variant="numbered" items={stepsItems} />

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">
        Followers in play
      </Heading>
      <div className={playbookStyles.paragraphs}>
        <Text>Followers are NPCs. They'll usually follow orders or look to their PC for direction. You might ask questions about how they'd likely act. But **you portray them, not the player.**</Text>
        <Text>**Followers trigger player moves only if a PC directs them to do so** (via Order Followers). If they act on their own, you say what happens.</Text>
        <Text>When a follower gets scared, tell the player. They can spend 1 Loyalty to have them overcome their fear and do as they're told. Otherwise, consider: **would the follower do this willingly if they weren't scared?**</Text>
      </div>
      <List variant="dash" items={followersInPlayFearItems} />
      <Text>**Followers might also resist orders if…**</Text>
      <List variant="ellipses" items={followersInPlayResistItems} />
      <div className={playbookStyles.paragraphs}>
        <Text>
          When a follower resists an order, make that clear to the player. They
          can spend the follower&rsquo;s Loyalty, Persuade them, let it go, etc.
        </Text>
        <Text>**Play up a follower's instinct, tags, and traits as sources of trouble.** The player can spend Loyalty to keep them in line, or Persuade them, or deal with the consequences.</Text>
        <Text>**When a PC has a follower do something off-screen**, resolve it with a single move at most (Defy Danger if it's not otherwise clear). Have the player roll when they'd learn the outcome, or when it becomes important for you the GM to know how things went.</Text>
        <Text>**When a follower Defends** and gets a 7+, the follower holds Readiness but the player decides when/how to spend it. Consider: would the follower actually do that, though? If not, the player must spend 1 Loyalty, too.</Text>
        <Text>**At 0 HP**, a follower is out of action and their fate is in your hands. For lethal damage, pick 1:</Text>
      </div>
      <List variant="dash" items={followersAtZeroHPItems} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">*Group* followers</Heading>
      <div className={playbookStyles.paragraphs}>
        <Text>
          Multiple individuals who share stats (tags, HP, armor, damage,
          instinct, moves, and cost) and who often act as one. E.g., the
          Marshal&rsquo;s crew.
        </Text>
        <Text>
          They hold a common pool of Loyalty, which can be spent to affect the
          whole group or specific members. The group&rsquo;s cost usually must
          be paid to the group as a whole.
        </Text>
        <Text>
          Each member of the group has their own HP; they take damage and regain
          HP individually.
        </Text>
        <Text>If a PC Orders Followers to have a group act as one, the player rolls for the move once (modified by the group's shared tags/moves). When a *group* follower…</Text>
      </div>
      <List variant="ellipses" items={groupFollowerItems} />
      <Text>
        When an individual member of a group first stands out, flesh them out
        with a name, a memorable trait, maybe an extra tag. A PC can direct them
        to act on their own, like a normal follower (with the group&rsquo;s
        tags, plus their own unique tags or moves, if any).
      </Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">
        Abstracting group exchanges
      </Heading>
      <Text>
        Optional rule for fights between larger groups. Each group deals damage
        and has HP/armor as per a single individual member. Larger groups deal
        +1 damage and have +1 armor for each multiple they outnumber their foe
        by (e.g. 3:1 gets +2 damage and armor). Damage represents casualties; if
        a group loses half its HP, then half of its members are out of the
        action. At 0 HP, it&rsquo;s routed, massacred, or otherwise defeated.
      </Text>
    </div>
  </div>
);
