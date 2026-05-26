import { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { Heading, Text, Checkbox, Collapse } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { SteadingData } from '@/types';
import styles from './SteadingImprovements.module.css';

interface Improvement {
  id: string;
  title: string;
  summary: string;
  requirements: string[];
  benefits: string[];
}

const IMPROVEMENTS: Improvement[] = [
  {
    id: 'additional-housing',
    title: 'Additional Housing',
    summary: "It's getting crowded! We need more room to live.",
    requirements: [
      '**Either one of:**',
      '— An exceptional engineer/foreman, to design much roomier houses on the current land',
      "— Building on parts of the fields, resulting in −1 Surplus generated with each autumn's harvest",
      "**And then:** Pulling Together 5 times, each requiring 1 season, 1 Surplus, and a wagonload of timber and other supplies (Value 2), to (re)build homes.",
    ],
    benefits: [
      'Increase Fortunes by 1 and add any new homes to the map.',
      'Henceforth, when you consume Surplus in winter, consider Population to be 1 lower than it is.',
    ],
  },
  {
    id: 'aurochs-hunting',
    title: 'Aurochs Hunting',
    summary: 'Large herds form on the Flats in spring. The Hillfolk hunt them, but Stonetop has never learned to do so.',
    requirements: [
      '**2 of the following:**',
      '— A Herd of Horses (and hunters to ride them)',
      '— Cooperating with the Hillfolk',
      '— A cunning plan',
      '**And then:** A successful first hunt (played out in detail).',
    ],
    benefits: [
      'Add "Aurochs hunting (meat, hide, horn)" to the Resources list.',
      'Henceforth, when you lead the aurochs hunt in spring, roll +Defenses: on a 10+, gain 1d4 Surplus; on a 7-9, gain 1d4 Surplus but pick 1 from the list below; on a 6−, pick 1 from the list below, or pick 2 and gain 1d4 Surplus.',
      "— 1d4 of the town's horses are lamed or killed",
      '— A number of locals are injured; the steading marks diminished',
      '— The GM picks an NPC present for the hunt; they are killed',
      '— The Hillfolk are somehow offended',
      "— The herd is weak; if you hunt next year they'll be wiped out",
    ],
  },
  {
    id: 'expanded-trades',
    title: 'Expanded Trades',
    summary: 'Specialization is the key to prosperity!',
    requirements: [
      '**One of the following improvements first:** Harnessing the Stream, Raincatching, or Mill.',
      '**And establishing at least 3 of:**',
      '— A chandler with extensive tools and supplies (Value 3)',
      '— A glassblower with a full glassworks (Value 3)',
      '— An exceptional weaver with good tools (Value 2) and a reliable supply of Whitefang wool',
      '— An exceptional potter with good tools (Value 2) and a reliable source of excellent clay',
      '— An exceptional smith with a newer, hotter forge (Value 3)',
      '— Some other exceptional tradesperson, with appropriate tools and supplies (Value 2 or 3)',
    ],
    benefits: [
      'Increase Prosperity by 1. If you cease to meet the requirements, decrease Prosperity by 1.',
    ],
  },
  {
    id: 'greater-harvest',
    title: 'Greater Harvest',
    summary: 'Beyond the Old Wall, the prairie grass of the Flats chokes out any crops we try to grow.',
    requirements: [
      '**1 of the following:**',
      '— Doubling the yield of crops inside the Old Wall',
      '— Clearing/taming new fields beyond the Old Wall',
    ],
    benefits: [
      'Increase Fortunes by 1.',
      'Henceforth, when the autumn harvest is complete, gain +1d4 Surplus.',
    ],
  },
  {
    id: 'harnessing-the-stream',
    title: 'Harnessing the Stream',
    summary: 'A shallow creek flows just below the town. If only it could be harnessed!',
    requirements: [
      '**2 of the following:**',
      '— Some method of making water flow uphill',
      "— A series of aqueducts, from the stream's source back to Stonetop",
      '— A reservoir to contain the diverted water',
    ],
    benefits: [
      'Add resources to the Resources list and increase Fortunes by 1.',
      'Henceforth, when spring breaks forth and you roll a 7+ with Fortunes, the steading generates 1 Surplus.',
    ],
  },
  {
    id: 'herd-of-horses',
    title: 'Herd of Horses',
    summary: 'Imagine what we could do with a dozen fine steeds.',
    requirements: [
      '**All of the following:**',
      '— A site for a proper stable and corral',
      '— Pulling Together to build the stable and corral (a month + a wagonload of timber, Value 2)',
      '— Someone skilled in riding and training horses',
      '— Acquiring a small herd of horses, about a dozen (through trade or by catching wild ones)',
      '— Training/breaking them to the saddle and plow',
      '— Additional saddles, harness, plows, etc. (Value 2)',
      '— Pulling Together to have a couple dozen villagers learn to ride (a season + 1 Surplus)',
      '— Someone to mind the herd and stable, full time',
    ],
    benefits: [
      'Increase Fortunes by 1. Replace "a pair of sturdy draft horses" with "a herd of horses" on the Assets list.',
      '— When you leverage the horses to Pull Together, it takes half as long and costs half as much.',
      '— When you Requisition half the herd or less, treat a 6− as a 7-9.',
      '— When the Seasons Change to summer, yearlings become horses (Value 3 once trained), foals become yearlings (Value 2), and the herd gains foals equal to 1d4+Fortunes (min 0).',
      '— When winter grips the land, the herd consumes 1 Surplus per 6 grown or yearling horses. For every Surplus not consumed, 1d6 horses are lost.',
    ],
  },
  {
    id: 'heroic-reputation',
    title: 'Heroic Reputation',
    summary: "Few have heard of Stonetop's heroes. Yet.",
    requirements: [
      '**Any 3 of the following:**',
      '— Impressing a band of Hillfolk',
      '— Braving a lake and coming back with proof',
      "— Saving many Marshedge residents' lives",
      "— Saving many Gordin's Delve residents' lives",
      '— Saving someone from beyond Marshedge',
      '— Hiring a minstrel to tell your tales (Value 2)',
    ],
    benefits: [
      'Gain the move: When you first meet someone from beyond Stonetop, roll +Fortunes: on a 10+, say what they\'ve heard about you or Stonetop, and gain advantage on your next move against them; on a 7-9, say what they\'ve heard; on a 6−, the GM decides what they\'ve heard.',
    ],
  },
  {
    id: 'inn',
    title: 'Inn',
    summary: "The public house offers a common room and shelter for a few horses, but it's hardly a proper inn.",
    requirements: [
      '**All of the following, in order:**',
      '— A designated building site',
      '— A competent engineer/foreman',
      '— Furnishings, equipment, and material (Value 3)',
      '— Pulling Together 2 times, each requiring 1 season, 1 Surplus, and timber/supplies (Value 2)',
      '— A small, devoted staff (innkeep, cook, ostler, etc.)',
    ],
    benefits: [
      'Increase Fortunes by 1. Name the inn, add it to both the Resources list and map.',
      'Henceforth, when the seasons change, whoever is friendliest rolls +Fortunes: on a 10+, ask the GM 3 questions about the wider world; on a 7-9, ask 1 question; on a 6−, ask 1 question, but the GM describes some trouble that stems from the inn or its guests.',
      'Once per season, when you expend 1 Surplus and bring folks together at the inn, clear one of the steading\'s debilities.',
    ],
  },
  {
    id: 'market',
    title: 'Market',
    summary: 'Stonetop is at most an afterthought for traders in the region. We need to change that.',
    requirements: [
      '**1 of the following:**',
      '— A compelling good/service, exclusive to Stonetop',
      '— Establishing some other reason to visit Stonetop (place of pilgrimage, etc.)',
      '**And:**',
      '— A dedicated market site (add it to the map)',
      '— A trusted arbiter, able to enforce their own rulings on matters of trade',
      '— Four seasons in operation without notable incidents of violence, banditry, theft, etc.',
    ],
    benefits: [
      'Increase Prosperity by 1. If you cease to meet the requirements, decrease Prosperity by 1.',
      'When the Seasons Change to spring, summer, or autumn and the market is active, and Population is +1 or better, the Market generates 1 Surplus.',
    ],
  },
  {
    id: 'mill',
    title: 'Mill',
    summary: "We've got our pick of millstones. With a mill, we'd have better bread and more time for other crafts.",
    requirements: [
      '**All of the following:**',
      '— An exceptional engineer/foreman',
      '— A convenient, consistent power source (wind on a hill, a waterwheel, a Herd of Horses, magic, etc.)',
      '— A building site able to harness that power source',
      '— Pulling Together 2 times, each requiring a season, 1 Surplus, a wagonload of timber (Value 2), and rope and supplies (Value 2)',
      '— A full-time miller',
    ],
    benefits: [
      'Increase Fortunes by 1. Add "Mill" to the Resources list and draw it on the map.',
      'Henceforth, when the autumn harvest is complete, the steading generates +1 Surplus. Also, when you Outfit from Stonetop or Have What You Need after doing so, each supply has 1 extra use.',
    ],
  },
  {
    id: 'palisade',
    title: 'Palisade',
    summary: "A wall of sharpened logs, 10' tall, to keep evil at bay.",
    requirements: [
      '**All of the following, in order:**',
      '— Lots of timber (~20-25 wagonloads, Value 3)',
      '— A competent engineer/foreman',
      '— Lots of rope, nails, pitch, etc. (Value 2)',
      '— Pulling Together, costing a month and 1 Surplus',
    ],
    benefits: [
      'Increase Fortunes by 1. Add "Palisade" to the Fortifications list and draw it on the map.',
      'Henceforth, when you take advantage of the palisade, you have advantage to Deploy.',
    ],
  },
  {
    id: 'raincatching',
    title: 'Raincatching',
    summary: 'Filling the cistern takes so much work. Surely, we can do better!',
    requirements: [
      '**All of the following, in order:**',
      '— An exceptional engineer/foreman, to design a cunning system of roofs, gutters, and conduits',
      '— Enough slate/terracotta to roof all the buildings and construct the gutters and conduits (Value 3)',
      '— Pulling Together 3 times, each requiring 1 season and 1 Surplus',
    ],
    benefits: [
      'Increase Fortunes by 1. Add "Raincatching" to the Resources list.',
      'Henceforth, when summer comes and you roll a 7+ with Fortunes, the steading generates 1 Surplus.',
    ],
  },
  {
    id: 'standing-watch',
    title: 'Standing Watch',
    summary: 'Some full-time warriors would make us all safer, no?',
    requirements: [
      '**All of the following:**',
      '— A veteran warrior, able to command a crowd',
      '— At least 6 warriors, well-equipped and willing',
      '— The village leaders agreeing to support warriors who train and keep watch full-time',
    ],
    benefits: [
      'Add "Standing Watch" to the Fortifications list. At the start of each season, the watch consumes 1 Surplus or it disbands.',
      'When you specifically involve the watch in a move, treat Defenses as 1 higher than they are.',
    ],
  },
  {
    id: 'stone-wall',
    title: 'Stone Wall',
    summary: 'No mere palisade of wood, but a mighty rampart. We have the stone, after all.',
    requirements: [
      '**All of the following, in order:**',
      '— An exceptional engineer/foreman',
      '— A stonecutter with an able crew',
      '— Equipment, tools, and material (Value 3)',
      '— Pulling Together 4 times, each costing 1 season, 1 Surplus, and supplies (Value 2)',
    ],
    benefits: [
      'Add "Stone Wall" to the Fortifications list (erase "Palisade" if you had it) and draw it on the map.',
      '— When you take advantage of the stone wall, you have advantage to Deploy.',
      '— When winter grips the land, the steading consumes 1 less Surplus than normal.',
    ],
  },
  {
    id: 'township',
    title: 'Township',
    summary: 'Will this ever be more than a backwater village?',
    requirements: [
      '**All of the following:**',
      '— Population +3 for 4 consecutive seasons',
      '— Additional Housing',
      '— Raincatching OR Harnessing the Stream',
      '— At least 4 other improvements',
      '— A formal government of some sort',
    ],
    benefits: [
      'Change Size to town and its Population to +0.',
      '— When you Muster, Pull Together, or Trade & Barter, you have advantage.',
      '— When the seasons change to spring or summer, the town generates Surplus equal to Population+1.',
      '— When winter grips the land, roll 2d6+Population to consume Surplus instead of 1d4+Population.',
    ],
  },
  {
    id: 'weapons-of-war',
    title: 'Weapons of War',
    summary: 'Spears are great, but how about axes, picks, swords?',
    requirements: [
      '**Either:**',
      '— Acquiring a few dozen good swords, battleaxes, maces, flails, warhammers, etc. (Value 3)',
      '**Or all of:**',
      '— A smith, with a full staff and upgraded tools (Value 2)',
      '— A cartload of good iron ore (Value 2)',
      '— 4 seasons of work by the smith',
      '**And then:**',
      '— A veteran warrior, able to command a crowd',
      '— Pulling Together to train the militia with these new weapons, requiring a season and 1 Surplus',
    ],
    benefits: [
      'Increase Defenses by 1. Add "Weapons of War" to the Fortifications list.',
      "Each spring, the village must expend 1 Surplus to maintain and replace the town's weapons.",
      "Henceforth, when you Outfit from Stonetop or Have What You Need, you can treat maces, flails, battleaxes, warhammers, and all swords as common items. Battleaxes and swords have \"x piercing,\" where x is the steading's current Prosperity.",
    ],
  },
  {
    id: 'well-trained-militia',
    title: 'Well-Trained Militia',
    summary: 'Everyone can use a spear and shield, but some hard drilling could make us a force to be reckoned with.',
    requirements: [
      '**One of the following:**',
      '— A veteran warrior, able to command a crowd',
      '**For each tactic below, Pull Together, requiring a season of drills and 1 Surplus:**',
      '— Archery: barrages, ranged ambushes, sniping, etc.',
      '— Cavalry (requires a Herd of Horses): fighting from horseback, charges',
      '— Formations: shield walls, wedges, phalanx, etc.',
      '— Readiness: patrolling, reacting quickly to alarms',
      '— Skirmishing: ambushes, harassing, hit-and-run',
    ],
    benefits: [
      'When you Deploy using one of the militia\'s trained tactics, you are likely acting from a position of strength (you pick the consequence on a 7-9, not the GM).',
      'When the militia has trained in 2+ tactics, increase Defenses by 1.',
      'Each summer, the militia must spend 1 Surplus and a week or so practicing or else lose its training in 1 tactic.',
    ],
  },
];

interface SteadingImprovementsProps {
  improvements: Record<string, boolean> | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingImprovements = ({ improvements = {}, onSave }: SteadingImprovementsProps) => {
  const toggle = useCallback((id: string) => {
    onSave({ improvements: { ...improvements, [id]: !improvements[id] } });
  }, [onSave, improvements]);

  const toggleHandlers = useMemo(
    () => Object.fromEntries(IMPROVEMENTS.map((imp) => [imp.id, () => toggle(imp.id)])),
    [toggle],
  );

  return (
    <div className={styles.root}>
      <Text size="sm" color="muted">Check an improvement when all requirements are met. The GM may reveal additional improvements in play.</Text>
      <div className={styles.list}>
        {IMPROVEMENTS.map((imp) => {
          const completed = !!improvements[imp.id];
          const itemCx = clsx(styles.item, completed && styles.itemCompleted);
          return (
            <div key={imp.id} className={itemCx}>
              <div className={styles.itemHeader}>
                <Checkbox
                  checked={completed}
                  onChange={toggleHandlers[imp.id]}
                  label={
                    <span className={styles.itemTitle}>
                      <span className={styles.itemName}>{imp.title}</span>
                      <span className={styles.itemSummary}>{imp.summary}</span>
                    </span>
                  }
                />
              </div>
              <Collapse label="Requirements & benefits">
                <div className={styles.details}>
                  <div className={styles.detailBlock}>
                    <Heading as="h4" size="label">Requirements</Heading>
                    {imp.requirements.map((line) => (
                      <p key={line.slice(0, 40)} className={styles.detailLine}>{parseInlineMarkdown(line)}</p>
                    ))}
                  </div>
                  <div className={styles.detailBlock}>
                    <Heading as="h4" size="label">Benefits</Heading>
                    {imp.benefits.map((line) => (
                      <p key={line.slice(0, 40)} className={styles.detailLine}>{parseInlineMarkdown(line)}</p>
                    ))}
                  </div>
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>

      <div className={styles.gmSlots}>
        <Heading as="h3" size="label">GM-Revealed Improvements</Heading>
        <Text size="sm" color="muted">The GM may present additional improvements in the course of play.</Text>
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const blankItemCx = clsx(styles.item, styles.itemBlank);
          return (
            <div key={n} className={blankItemCx}>
              <span className={styles.blankLabel}>Improvement {n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
