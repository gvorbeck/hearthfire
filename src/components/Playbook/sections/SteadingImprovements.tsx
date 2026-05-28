import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button, Heading, List, Text, Checkbox, Input, Radio } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { SteadingData, GmImprovement } from '@/types';
import styles from './SteadingImprovements.module.css';

interface CheckItem {
  label: string;
  count?: number;
}

type RequirementBlock =
  | { type: 'text'; content: string }
  | { type: 'checkboxes'; items: CheckItem[] };

interface Improvement {
  id: string;
  title: string;
  summary: string;
  requirements: RequirementBlock[];
  benefits: string[];
  list?: string[];
}

const IMPROVEMENTS: Improvement[] = [
  {
    id: 'additional-housing',
    title: 'Additional Housing',
    summary: "It's getting crowded! We need more room to live.",
    requirements: [
      { type: 'text', content: '**Requires** either one of these:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'An *exceptional* engineer/foreman, to design much roomier houses on the current land' },
          { label: "Building on parts of the fields, resulting in −1 Surplus generated with each autumn's harvest" },
        ],
      },
      { type: 'text', content: 'And then:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Pulling Together 5 times, each requiring 1 season, 1 Surplus, and a wagonload of timber and other supplies (Value 2), to (re)build homes.', count: 5 },
        ],
      },
    ],
    benefits: [
      'Increase Fortunes by 1 and add any new homes to the map.',
      'Henceforth, **when you consume Surplus in winter**, consider Population to be 1 lower than it is.',
    ],
  },
  {
    id: 'aurochs-hunting',
    title: 'Aurochs Hunting',
    summary: 'Large herds form on the Flats in spring. The Hillfolk hunt them, but Stonetop has never learned to do so.',
    requirements: [
      { type: 'text', content: '**Requires** 2 of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A Herd of Horses (and hunters to ride them)' },
          { label: 'Cooperating with the Hillfolk' },
          { label: 'A cunning plan' },
        ],
      },
      { type: 'text', content: 'And then:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A successful first hunt (played out in detail)' },
        ],
      },
    ],
    benefits: [
      'Add "Aurochs hunting (meat, hide, horn)" to the Resources list.',
      'Henceforth, when you **lead the aurochs hunt in spring**, roll +Defenses: **on a 10+**, gain 1d4 Surplus; **on a 7-9**, gain 1d4 Surplus but pick 1 from the list below; **on a 6−**, pick 1 from the list below, or pick 2 and gain 1d4 Surplus.',
    ],
    list: [
      "1d4 of the town's horses are lamed or killed",
      'A number of locals are injured; the steading marks *diminished* (disadvantage to Deploy, Muster, or Pull Together)',
      'The GM picks an NPC present for the hunt; they are killed',
      'The Hillfolk are somehow offended',
      "The herd is weak; if you hunt next year they'll be wiped out",
    ],
  },
  {
    id: 'expanded-trades',
    title: 'Expanded Trades',
    summary: 'Specialization is the key to prosperity!',
    requirements: [
      { type: 'text', content: '**Requires** one of the following improvements, to free up enough time to support more tradesfolk:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Harnessing the Stream' },
          { label: 'Raincatching' },
          { label: 'Mill' },
        ],
      },
      { type: 'text', content: 'And establishing at least 3 of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A chandler with extensive tools and supplies (Value 3)' },
          { label: 'A glassblower with a full glassworks (Value 3)' },
          { label: 'An *exceptional* weaver with good tools (Value 2) and a reliable supply of Whitefang wool' },
          { label: 'An *exceptional* potter with good tools (Value 2) and a reliable source of excellent clay' },
          { label: 'An *exceptional* smith with a newer, hotter forge (Value 3)' },
          { label: 'Some other *exceptional* tradesperson, with the appropriate tools and supplies (Value 2 or 3)' },
        ],
      },
    ],
    benefits: [
      'Increase Prosperity by 1. If you **cease to meet the requirements**, decrease Prosperity by 1.',
    ],
  },
  {
    id: 'greater-harvest',
    title: 'Greater Harvest',
    summary: 'Beyond the Old Wall, the prairie grass of the Flats chokes out any crops we try to grow.',
    requirements: [
      { type: 'text', content: '**Requires** 1 of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Doubling the yield of crops inside the Old Wall' },
          { label: 'Clearing/taming new fields beyond the Old Wall' },
        ],
      },
    ],
    benefits: [
      'Increase Fortunes by 1.',
      'Henceforth, when **the autumn harvest is complete**, gain +1d4 Surplus.',
    ],
  },
  {
    id: 'harnessing-the-stream',
    title: 'Harnessing the Stream',
    summary: 'A shallow creek flows just below the town. If only it could be harnessed!',
    requirements: [
      { type: 'text', content: '**Requires** 2 of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A reservoir for the Stream to pool in, and some way for water to flow uphill' },
          { label: "A series of aqueducts, from the Stream's source to Stonetop" },
        ],
      },
    ],
    benefits: [
      'Add them to the Resources list and increase Fortunes by 1.',
      'Henceforth, **when spring breaks forth and you roll a 7+ with Fortunes**, the steading generates 1 Surplus.',
    ],
  },
  {
    id: 'herd-of-horses',
    title: 'Herd of Horses',
    summary: 'Imagine what we could do with a dozen fine steeds.',
    requirements: [
      { type: 'text', content: '**Requires** all of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A site for a proper stable and corral' },
          { label: 'Pulling Together to build the stable and corral, which requires a month and a wagonload of timber (Value 2). Add them to the map.' },
          { label: 'Someone skilled in riding and training horses' },
          { label: 'Acquiring a small herd of horses, about a dozen (through trade or by catching wild ones)' },
          { label: 'Training/breaking them to the saddle and plow' },
          { label: 'Additional saddles, harness, plows, etc. (Value 2)' },
          { label: 'Pulling Together to have a couple dozen villagers learn to ride, requiring a season and 1 Surplus.' },
          { label: 'Someone to mind the herd and stable, full time' },
        ],
      },
    ],
    benefits: [
      'Increase Fortunes by 1 and replace "a pair of sturdy draft horses" with "a herd of horses" on the Assets list. Make a note of its size. Henceforth:',
      'When you **leverage the horses to Pull Together**, it takes half as long and costs half as much.',
      'When you **Requisition half the herd or less**, treat a 6− as a 7-9.',
      'When the **Seasons Change to summer**, any yearlings become horses (Value 3 once trained), any foals become yearlings (Value 2), and the herd gains foals (Value 1) equal to 1d4+Fortunes (min 0).',
      'When **winter grips the land**, the herd consumes 1 Surplus per 6 grown or yearling horses. For every Surplus not consumed, 1d6 horses are lost.',
    ],
  },
  {
    id: 'heroic-reputation',
    title: 'Heroic Reputation',
    summary: "Few have heard of Stonetop's heroes. Yet.",
    requirements: [
      { type: 'text', content: '**Requires** any 3 of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Impressing a band of Hillfolk' },
          { label: 'Braving a lake and coming back with proof' },
          { label: "Saving many Marshedge residents' lives" },
          { label: "Saving many Gordin's Delve residents' lives" },
          { label: 'Saving someone from beyond Marshedge' },
          { label: 'Hiring a minstrel to tell your tales (Value 2)' },
        ],
      },
    ],
    benefits: [
      'Gain the following move:',
      "When you **first meet someone from beyond Stonetop**, roll +Fortunes: **on a 10+**, say what they've heard about you or Stonetop, and gain advantage on your next move against them; **on a 7-9**, say what they've heard; **on a 6−**, the GM decides what they've heard.",
    ],
  },
  {
    id: 'inn',
    title: 'Inn',
    summary: "The public house offers a common room and shelter for a few horses, but it's hardly a proper inn.",
    requirements: [
      { type: 'text', content: '**Requires** all of the following, in order:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A designated building site' },
          { label: 'A competent engineer/foreman' },
          { label: 'Furnishings, equipment, and material (Value 3)' },
          { label: 'Pulling Together 2 times, each requiring 1 season, 1 Surplus, and timber/supplies (Value 2)', count: 2 },
          { label: 'A small, devoted staff (innkeep, cook, ostler, etc.)' },
        ],
      },
    ],
    benefits: [
      'Increase Fortunes by 1. Name the inn, add it to both the Resources list and map.',
      'Henceforth, when **the seasons change**, whoever is friendliest rolls +Fortunes: **on a 10+**, ask the GM 3 questions about the wider world; **on a 7-9**, ask 1 question; **on a 6−**, ask 1 question, but the GM describes some trouble that stems from the inn or its guests.',
      "Once per season, when you **expend 1 Surplus and bring folks together at the inn**, clear one of the steading's debilities.",
    ],
  },
  {
    id: 'market',
    title: 'Market',
    summary: 'Stonetop is at most an afterthought for traders in the region. We need to change that.',
    requirements: [
      { type: 'text', content: '**Requires** 1 of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A compelling good/service, exclusive to Stonetop' },
          { label: 'Establishing some other reason to visit Stonetop (place of pilgrimage, etc.)' },
        ],
      },
      { type: 'text', content: 'And:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A dedicated market site (add it to the map)' },
          { label: 'A trusted arbiter, able to enforce their own rulings on matters of trade' },
          { label: 'Four seasons in operation without notable incidents of violence, banditry, theft, etc.' },
        ],
      },
    ],
    benefits: [
      'Increase Prosperity by 1. If you **cease to meet the requirements**, decrease Prosperity by 1.',
      'When the **Seasons Change to spring, summer, or autumn** and the market is active, and Population is +1 or better, the Market generates 1 Surplus.',
    ],
  },
  {
    id: 'mill',
    title: 'Mill',
    summary: "We've got our pick of millstones. With a mill, we'd have better bread and more time for other crafts.",
    requirements: [
      { type: 'text', content: '**Requires** all of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'An *exceptional* engineer/foreman' },
          { label: 'A convenient, consistent power source (wind on a hill, a waterwheel, a Herd of Horses, magic, etc.)' },
          { label: 'A building site able to harness that power source' },
          { label: 'Pulling Together 2 times, each requiring a season, 1 Surplus, a wagonload of timber (Value 2), and rope and supplies (Value 2)', count: 2 },
          { label: 'A full-time miller' },
        ],
      },
    ],
    benefits: [
      'Increase Fortunes by 1. Add "Mill" to the Resources list and draw it on the map.',
      'Henceforth, when **the autumn harvest is complete**, the steading generates +1 Surplus. Also, when you Outfit from Stonetop or Have What You Need after doing so, each supply has 1 extra use.',
    ],
  },
  {
    id: 'palisade',
    title: 'Palisade',
    summary: "A wall of sharpened logs, 10' tall, to keep evil at bay.",
    requirements: [
      { type: 'text', content: '**Requires** all of the following, in order:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Lots of timber (~20–25 wagonloads, Value 3)' },
          { label: 'A competent engineer/foreman' },
          { label: 'Lots of rope, nails, pitch, etc. (Value 2)' },
          { label: 'Pulling Together, costing a month and 1 Surplus' },
        ],
      },
    ],
    benefits: [
      'Increase Fortunes by 1. Add "Palisade" to the Fortifications list and draw it on the map.',
      'Henceforth, when you **take advantage of the palisade**, you have advantage to Deploy.',
    ],
  },
  {
    id: 'raincatching',
    title: 'Raincatching',
    summary: 'Filling the cistern takes so much work. Surely, we can do better!',
    requirements: [
      { type: 'text', content: '**Requires** all of the following, in order:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'An *exceptional* engineer/foreman, to design a cunning system of roofs, gutters, and conduits' },
          { label: 'Enough slate/terracotta to roof all the buildings and construct the gutters and conduits (Value 3)' },
          { label: 'Pulling Together 3 times, each requiring 1 season and 1 Surplus', count: 3 },
        ],
      },
    ],
    benefits: [
      'Increase Fortunes by 1. Add "Raincatching" to the Resources list.',
      'Henceforth, when **summer comes and you roll a 7+ with Fortunes**, the steading generates 1 Surplus.',
    ],
  },
  {
    id: 'standing-watch',
    title: 'Standing Watch',
    summary: 'Some full-time warriors would make us all safer, no?',
    requirements: [
      { type: 'text', content: '**Requires** all of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A veteran warrior, able to command a crowd' },
          { label: 'At least 6 warriors, well-equipped and willing' },
          { label: 'The village leaders agreeing to support warriors who train and keep watch full-time' },
        ],
      },
    ],
    benefits: [
      'Add "Standing Watch" to the Fortifications list. At the start of each season, the watch consumes 1 Surplus or it disbands.',
      'When you **specifically involve the watch in a move**, treat Defenses as 1 higher than they are.',
    ],
  },
  {
    id: 'stone-wall',
    title: 'Stone Wall',
    summary: 'No mere palisade of wood, but a mighty rampart. We have the stone, after all.',
    requirements: [
      { type: 'text', content: '**Requires** all of the following, in order:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'An *exceptional* engineer/foreman' },
          { label: 'A stonecutter with an able crew' },
          { label: 'Equipment, tools, and material (Value 3)' },
          { label: 'Pulling Together 4 times, each costing 1 season, 1 Surplus, and supplies (Value 2)', count: 4 },
        ],
      },
    ],
    benefits: [
      'Add "Stone Wall" to the Fortifications list (erase "Palisade" if you had it) and draw it on the map. Henceforth:',
      'When you **take advantage of the stone wall**, you have advantage to Deploy.',
      'When **winter grips the land**, the steading consumes 1 less Surplus than normal.',
    ],
  },
  {
    id: 'township',
    title: 'Township',
    summary: 'Will this ever be more than a backwater village?',
    requirements: [
      { type: 'text', content: '**Requires** all of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Population +3 for 4 consecutive seasons' },
          { label: 'Additional Housing' },
          { label: 'Raincatching OR Harnessing the Stream' },
          { label: 'At least 4 other improvements' },
          { label: 'A formal government of some sort' },
        ],
      },
    ],
    benefits: [
      'Change Size to town and its Population to +0. Henceforth:',
      'When you **Muster, Pull Together, or Trade & Barter**, you have advantage.',
      'When **the seasons change to spring or summer**, the town generates Surplus equal to Population+1.',
      'When **winter grips the land**, roll 2d6+Population to consume Surplus instead of 1d4+Population.',
    ],
  },
  {
    id: 'weapons-of-war',
    title: 'Weapons of War',
    summary: 'Spears are great, but how about axes, picks, swords?',
    requirements: [
      { type: 'text', content: '**Requires** either:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Acquiring a few dozen good swords, battleaxes, maces, flails, warhammers, etc. (Value 3)' },
        ],
      },
      { type: 'text', content: 'Or all of:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A smith, with a full staff and upgraded tools (Value 2)' },
          { label: 'A cartload of good iron ore (Value 2)' },
          { label: '4 seasons of work by the smith' },
        ],
      },
      { type: 'text', content: 'And then:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A veteran warrior, able to command a crowd' },
          { label: 'Pulling Together to train the militia with these new weapons, requiring a season and 1 Surplus' },
        ],
      },
    ],
    benefits: [
      'Increase Defenses by 1. Add "Weapons of War" to the Fortifications list.',
      "Each spring, the village must expend 1 Surplus to maintain and replace the town's weapons.",
      "Henceforth, when you **Outfit from Stonetop or Have What You Need**, you can treat maces, flails, battleaxes, warhammers, and all swords as common items. Battleaxes and swords have \"x piercing,\" where x is the steading's current Prosperity.",
    ],
  },
  {
    id: 'well-trained-militia',
    title: 'Well-Trained Militia',
    summary: 'Everyone can use a spear and shield, but some hard drilling could make us a force to be reckoned with.',
    requirements: [
      { type: 'text', content: '**Requires** one of the following:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'A veteran warrior, able to command a crowd' },
        ],
      },
      { type: 'text', content: 'For each tactic below, Pull Together, requiring a season of drills and 1 Surplus:' },
      {
        type: 'checkboxes',
        items: [
          { label: 'Archery: barrages, ranged ambushes, sniping, etc.' },
          { label: 'Cavalry (requires a Herd of Horses): fighting from horseback, charges' },
          { label: 'Formations: shield walls, wedges, phalanx, etc.' },
          { label: 'Readiness: patrolling, reacting quickly to alarms' },
          { label: 'Skirmishing: ambushes, harassing, hit-and-run' },
        ],
      },
    ],
    benefits: [
      "When you **Deploy using one of the militia's trained tactics**, you are likely acting from a position of strength (you pick the consequence on a 7-9, not the GM).",
      'When the militia has trained in 2+ tactics, increase Defenses by 1.',
      'Each summer, the militia must spend 1 Surplus and a week or so practicing or else lose its training in 1 tactic.',
    ],
  },
];

let _nextId = 0;
const makeEmptyGmImprovement = (): GmImprovement => ({
  id: `gm-imp-${_nextId++}`,
  title: '',
  summary: '',
  requirements: '',
  effects: '',
  completed: false,
});

interface GmImprovementCardProps {
  slot: GmImprovement;
  index: number;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (index: number, patch: Partial<GmImprovement>) => void;
  onCategoryChange: (index: number, category: GmImprovement['category']) => void;
  onCompletedToggle: (index: number) => void;
  onRemove: (index: number) => void;
}

const GmImprovementCard = ({ slot, index, onFocus, onBlur, onChange, onCategoryChange, onCompletedToggle, onRemove }: GmImprovementCardProps) => {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(index, { title: e.target.value }), [index, onChange]);
  const handleSummaryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(index, { summary: e.target.value }), [index, onChange]);
  const handleRequirementsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(index, { requirements: e.target.value }), [index, onChange]);
  const handleEffectsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(index, { effects: e.target.value }), [index, onChange]);
  const handleCategoryResource = useCallback(() => onCategoryChange(index, 'resource'), [index, onCategoryChange]);
  const handleCategoryFortification = useCallback(() => onCategoryChange(index, 'fortification'), [index, onCategoryChange]);
  const handleCategoryAsset = useCallback(() => onCategoryChange(index, 'asset'), [index, onCategoryChange]);
  const handleCompletedToggle = useCallback(() => onCompletedToggle(index), [index, onCompletedToggle]);
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

  const slotCx = clsx(styles.item, styles.gmItem, slot.completed && styles.itemCompleted);

  return (
    <div className={slotCx}>
      <div className={styles.itemHeader}>
        <Checkbox
          checked={slot.completed}
          onChange={handleCompletedToggle}
          className={styles.itemCheckbox}
        />
        <Input
          aria-label="Improvement name"
          className={styles.gmTitleInput}
          value={slot.title}
          placeholder="IMPROVEMENT"
          onFocus={onFocus}
          onChange={handleTitleChange}
          onBlur={onBlur}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          aria-label="Remove improvement"
          onClick={handleRemove}
        />
      </div>
      <Input
        multiline
        aria-label="Summary"
        className={styles.gmTextarea}
        value={slot.summary}
        placeholder="Summary"
        rows={2}
        onFocus={onFocus}
        onChange={handleSummaryChange}
        onBlur={onBlur}
      />
      <div className={styles.categoryRow}>
        <Radio
          name={`gm-improvement-category-${slot.id}`}
          value="resource"
          label="Resource"
          className={styles.categoryRadio}
          checked={slot.category === 'resource'}
          onChange={handleCategoryResource}
        />
        <Radio
          name={`gm-improvement-category-${slot.id}`}
          value="fortification"
          label="Fortification"
          className={styles.categoryRadio}
          checked={slot.category === 'fortification'}
          onChange={handleCategoryFortification}
        />
        <Radio
          name={`gm-improvement-category-${slot.id}`}
          value="asset"
          label="Asset"
          className={styles.categoryRadio}
          checked={slot.category === 'asset'}
          onChange={handleCategoryAsset}
        />
      </div>
      <div className={styles.section}>
        <Heading as="h4" size="label">Requirements</Heading>
        <Input
          multiline
          aria-label="Requirements"
          className={styles.gmTextarea}
          value={slot.requirements}
          placeholder="Requirements"
          rows={3}
          onFocus={onFocus}
          onChange={handleRequirementsChange}
          onBlur={onBlur}
        />
      </div>
      <div className={styles.section}>
        <Heading as="h4" size="label">Effects</Heading>
        <Input
          multiline
          aria-label="Effects"
          className={styles.gmTextarea}
          value={slot.effects}
          placeholder="Effects"
          rows={3}
          onFocus={onFocus}
          onChange={handleEffectsChange}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
};

interface SteadingImprovementsProps {
  improvements: Record<string, boolean> | undefined;
  gmImprovements: GmImprovement[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

const makeReqKeys = (impId: string, blockIdx: number, itemIdx: number, count: number) =>
  Array.from({ length: count }, (_, i) => `${impId}__req__b${blockIdx}i${itemIdx}__${i}`);

const ReqCheckItem = ({
  item, keys, checkedValues, onToggle,
}: {
  item: CheckItem;
  keys: string[];
  checkedValues: boolean[];
  onToggle: (key: string) => void;
}) => {
  if (keys.length === 1) {
    return (
      <div className={styles.checkRow}>
        <Checkbox
          checked={checkedValues[0]}
          onChange={() => onToggle(keys[0])}
          label={<span>{parseInlineMarkdown(item.label)}</span>}
        />
      </div>
    );
  }

  return (
    <div className={styles.checkRow}>
      <div className={styles.multiBoxes}>
        {keys.map((key, i) => (
          <Checkbox
            key={key}
            aria-label={item.label}
            checked={checkedValues[i]}
            onChange={() => onToggle(key)}
          />
        ))}
      </div>
      <span className={styles.checkRowLabel}>{parseInlineMarkdown(item.label)}</span>
    </div>
  );
};

export const SteadingImprovements = ({ improvements = {}, gmImprovements, onSave }: SteadingImprovementsProps) => {
  const improvementsRef = useRef(improvements);
  improvementsRef.current = improvements;

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const [localSlots, setLocalSlots] = useState<GmImprovement[]>(() => gmImprovements ?? []);
  const focusedRef = useRef(false);
  const localSlotsRef = useRef(localSlots);

  useEffect(() => {
    if (!focusedRef.current) {
      const next = gmImprovements ?? [];
      localSlotsRef.current = next;
      setLocalSlots(next);
    }
  }, [gmImprovements]);

  const toggleKey = useCallback((key: string) => {
    onSaveRef.current({ improvements: { [key]: !improvementsRef.current[key] } });
  }, []);

  const saveSlots = useCallback((slots: GmImprovement[]) => {
    onSaveRef.current({ gmImprovements: slots });
  }, []);

  const handleSlotFocus = useCallback(() => { focusedRef.current = true; }, []);

  const handleSlotChange = useCallback((index: number, patch: Partial<GmImprovement>) => {
    setLocalSlots((prev) => {
      const next = prev.map((s, i) => i === index ? { ...s, ...patch } : s);
      localSlotsRef.current = next;
      return next;
    });
  }, []);

  const handleSlotBlur = useCallback(() => {
    focusedRef.current = false;
    saveSlots(localSlotsRef.current);
  }, [saveSlots]);

  const handleSlotCategoryChange = useCallback((index: number, category: GmImprovement['category']) => {
    const next = localSlotsRef.current.map((s, i) => i === index ? { ...s, category } : s);
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

  const handleSlotCompletedToggle = useCallback((index: number) => {
    const next = localSlotsRef.current.map((s, i) => i === index ? { ...s, completed: !s.completed } : s);
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

  const handleAdd = useCallback(() => {
    const next = [...localSlotsRef.current, makeEmptyGmImprovement()];
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

  const handleRemove = useCallback((index: number) => {
    const next = localSlotsRef.current.filter((_, i) => i !== index);
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

  return (
    <div className={styles.root}>
      <Text size="xs" color="muted">Check an improvement when all requirements are met. The GM may reveal additional improvements in play.</Text>
      <div className={styles.list}>
        {IMPROVEMENTS.map((imp) => {
          const completed = !!improvements[imp.id];
          const itemCx = clsx(styles.item, completed && styles.itemCompleted);
          return (
            <div key={imp.id} className={itemCx}>
              <div className={styles.itemHeader}>
                <Checkbox
                  checked={completed}
                  onChange={() => toggleKey(imp.id)}
                  label={<span className={styles.itemName}>{imp.title}</span>}
                  className={styles.itemCheckbox}
                />
              </div>
              <Text font="serif" color="muted" italic leading="tight">{parseInlineMarkdown(imp.summary)}</Text>

              <div className={styles.section}>
                <Heading as="h4" size="label">Requirements</Heading>
                <div className={styles.requirementBlocks}>
                  {imp.requirements.map((block, blockIdx) => {
                    if (block.type === 'text') {
                      return <Text key={`${imp.id}-req-${blockIdx}`} size="xs" color="muted">{parseInlineMarkdown(block.content)}</Text>;
                    }
                    return (
                      <div key={`${imp.id}-cb-${blockIdx}`} className={styles.checkList}>
                        {block.items.map((item, itemIdx) => {
                          const keys = makeReqKeys(imp.id, blockIdx, itemIdx, item.count ?? 1);
                          const checkedValues = keys.map((k) => !!improvements[k]);
                          return (
                          <ReqCheckItem
                            key={`${imp.id}-b${blockIdx}i${itemIdx}`}
                            item={item}
                            keys={keys}
                            checkedValues={checkedValues}
                            onToggle={toggleKey}
                          />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.section}>
                <Heading as="h4" size="label">When you meet the requirements</Heading>
                {imp.benefits.map((line, i) => (
                  <Text key={`${imp.id}-benefit-${i}`} font="serif" color="muted" leading="tight">{parseInlineMarkdown(line)}</Text>
                ))}
                {imp.list && (
                  <List variant="bullet" items={imp.list.map((item) => <span>{parseInlineMarkdown(item)}</span>)} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.gmSlots}>
        <Heading as="h3" size="sm">Other improvements</Heading>
        <Text size="xs" color="muted">Additional possible improvements to Stonetop, revealed by the GM.</Text>
        {localSlots.length > 0 && (
          <div className={styles.gmGrid}>
            {localSlots.map((slot, i) => (
              <GmImprovementCard
                key={slot.id}
                slot={slot}
                index={i}
                onFocus={handleSlotFocus}
                onBlur={handleSlotBlur}
                onChange={handleSlotChange}
                onCategoryChange={handleSlotCategoryChange}
                onCompletedToggle={handleSlotCompletedToggle}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon="plus"
          onClick={handleAdd}
        >
          Add improvement
        </Button>
      </div>
    </div>
  );
};
