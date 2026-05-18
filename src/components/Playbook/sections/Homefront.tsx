import { Heading, Text, Icon, List } from '@/components/primitives';
import { PlaybookCallout } from '@/components/Playbook';
import playbookStyles from '@/components/Playbook/Playbook.module.css';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

const SeasonHeading = ({ icon, label }: { icon: 'spring' | 'summer' | 'autumn' | 'winter'; label: string }) => (
  <div className={styles.seasonHeading}>
    <Icon name={icon} size="small" className={styles.seasonIcon} />
    <Heading as="h3" size="sm">{label}</Heading>
  </div>
);

export const Homefront = () => (
  <div>
    <div>
      <Heading as="h3" size="sm">Life in Stonetop</Heading>
      <div className={playbookStyles.paragraphs}>
        <div>
          <Text><strong>People:</strong></Text>
          <List variant="dash" items={[
            '~300 people live in Stonetop (~50 families)',
            'Most adults work the fields or keep a home; ~a dozen ply the Great Wood',
            'Few tradesfolk: a smith, tanner, potter, publican, midwife (plus apprentices)',
            'Other crafts (carpentry, weaving, sewing, distilling, etc.) done on the side',
          ]} />
        </div>
        <div>
          <Text><strong>Home &amp; hearth:</strong></Text>
          <List variant="dash" items={[
            'Homes are squat, stone (from the Old Wall), thatched roofs; 1-3 buildings per family',
            'Each family keeps a garden and livestock',
            'No mill; folks grind grain with quern-stones',
            'Most families keep a whisky still',
            'Water comes from cistern; fill with rain/snow',
            'Folks wash at the Stream, but rarely go alone',
          ]} />
        </div>
        <div>
          <Text><strong>Trade &amp; commerce:</strong></Text>
          <List variant="dash" items={[
            'Most crops go to the granary for public use',
            'Mostly barter; coin comes from outsiders',
            'Merchants come at least once a season (except winter)',
            'Gordin\'s Delve brings metal & tools',
            'Marshedge brings textiles, herbs, glass, finer goods from the south.',
            'By compact with the Forest Folk, no one fells living trees in the Great Wood (but the Forest Folk haven\'t been seen in a decade).',
          ]} />
        </div>
        <div>
          <Text><strong>Protection &amp; governance:</strong></Text>
          <List variant="dash" items={[
            'Every able body drills with the militia, keeps a spear handy, takes a turn at the watchtowers',
            'No nobles, no elected officials; decisions made by the wise, the cunning, the brave',
          ]} />
        </div>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Questions to ask</Heading>
      <List variant="dash" items={[
        'What task or chore are you working on?',
        'What\'s the best/worst thing about this chore?',
        'What\'s cooking on the hearthfire?',
        'What here makes the place feel like home?',
        'What about your home would you change if you could?',
        'How does Stonetop mark or celebrate the coming of spring/summer/autumn/winter?',
        'What\'s your (least) favorite thing about this season?',
        'What\'s your favorite tale of Stonetop\'s history?',
        'What\'s the scariest story that the elders tell?',
        'How do the villagers mark or celebrate a birth?',
        'How do the villagers mark one\'s coming of age?',
        'What do the villagers do with their dead?',
      ]} />
    </div>

    <div className={styles.subsection}>
      <SeasonHeading icon="spring" label="Spring" />
      <List variant="dash" items={[
        'Harvesting winter potatoes',
        'Spreading seed, planting beans/potatoes',
        'Harrowing soil (to cover seeds, plantings)',
        'Chasing birds from the fields (child\'s work)',
        'Spreading manure & plowing fallow fields',
        'Kidding goats, sheep',
        'Picking spring vegetables',
        'Clearing and planting gardens',
        'Harvesting/cutting deadfall for firewood',
        'Fur trapping, light hunting (for meat)',
      ]} />
    </div>

    <div className={styles.subsection}>
      <SeasonHeading icon="summer" label="Summer" />
      <List variant="dash" items={[
        'Haymaking (from Flats-grass, fallow fields)',
        'Weeding crops/gardens',
        'Spreading manure & replowing fallow fields',
        'Weaning goat kids & lambs',
        'Milking goats, shearing sheep',
        'Picking summer vegetables',
        'Berry-picking from gardens and the Wood',
        'Light hunting/trapping (for meat, not fur)',
      ]} />
    </div>

    <div className={styles.subsection}>
      <SeasonHeading icon="autumn" label="Autumn" />
      <List variant="dash" items={[
        'Harvesting beans, barley, oats, potatoes',
        'Gleaning fallen seed from fields (child\'s work)',
        'Threshing, winnowing, sieving, storing crops',
        'Plowing fallows & planting winter potatoes',
        'Picking & preserving autumn vegetables',
        'Breeding goats, sheep',
        'Foraging for nuts, fruits in the Wood',
        'Heavy hunting/trapping (fur & meat)',
        '(If able): harvesting timber from Foothills',
      ]} />
    </div>

    <div className={styles.subsection}>
      <SeasonHeading icon="winter" label="Winter" />
      <List variant="dash" items={[
        'Collecting snow for the cistern',
        'Distilling & aging whisky',
        'Tending to livestock, stockpiling manure',
        'Heavy trapping (for fur)',
        'Hunting as able (for meat)',
        'Slaughtering/butchering livestock as needed',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Always</Heading>
      <List variant="dash" items={[
        'Cooking, grinding grain, baking',
        'Rendering fat, making oil & rushlights',
        'Cleaning pens, coops, homes, clothes',
        'Collecting & hauling water, to & from cistern',
        'Spinning, weaving, sewing, hand-crafts',
        'Smithing, tanning, pottery, midwifery',
        'Maintenance (buildings, clothes, tools, etc.)',
        'Manning the watchtowers at night; drilling',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Aftermath</Heading>
      <List variant="numbered" items={[
        <Text>Determine what&rsquo;s happened while the PCs were gone or during the crisis. How will you reveal this? Make a to-do list!</Text>,
        <Text>Play out their return or the immediate aftermath of the crisis. Start working through your to-do list. Return Triumphant or Meet With Disaster, if appropriate.</Text>,
        <Text>See what follows. Play out any obvious or urgent scenes. Give each PC a scene with family or important NPCs. Do any other scenes you all want to play out.</Text>,
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Downtime</Heading>
      <List variant="dash" items={[
        'Take care of logistics',
        'Establish goals and intentions',
        'Frame scenes/situations as needed, to…',
        '… resolve a player\'s move/actions;',
        '… make a GM move/resolve stakes; or',
        '… play out a desired scene.',
        'Describe time passing',
        'Eventually, the Seasons Change',
      ]} />
      <Text>Downtime ends when the PCs head off on an expedition (to pursue a goal, or in response to a threat or opportunity) or a crisis erupts in town.</Text>
    </div>

    <div className={styles.subsection}>
      <PlaybookCallout title="MAKE A PLAN">
        <Text>When you <strong><em>wish to accomplish some project but aren&rsquo;t sure how to go about it</em></strong>, tell the GM what you hope to achieve. They&rsquo;ll say what&rsquo;s required. If you&rsquo;re stumped on how to accomplish one of the requirements, tell the GM and Make a Plan for that.</Text>
        <Text>Clarify exactly what they hope to achieve and how they plan to go about it. Then tell them as many of the following as makes sense, connected with &ldquo;and&rdquo; and &ldquo;or&rdquo; as you see fit.</Text>
        <List variant="dash" items={[
          'You must learn/know/decipher ___',
          'You must find/locate/obtain ___',
          'You must create/design/fix ___',
          'You\'ll need the help/support/approval of ___',
          'You must wait until/for ___',
          'You must travel to ___',
          'It\'ll take days/weeks/months/years (which means ___ will go undone)',
          'The best you can get/do is ___',
          'It will cost ___',
          'You\'ll risk ___',
          'The steading must Pull Together ___ times, each requiring ___',
        ]} />
      </PlaybookCallout>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Relative Value</Heading>
      <Text>Exchange rates are not standard, but&hellip;</Text>
      <div className={playbookStyles.paragraphs}>
        <div>
          <Text><strong>A Value 0 item</strong> is generally worth:</Text>
          <List variant="dash" items={[
            'A ◇ purse of copper coins',
            'A single silver coin',
            'A favor',
            'A few days of unskilled labor',
            'A common, mundane item',
          ]} />
        </div>
        <div>
          <Text><strong>A Value 1 item</strong> is generally worth:</Text>
          <List variant="dash" items={[
            'A handful of silver coins',
            'A season (or so) of unskilled labor',
            'A few days of skilled labor',
            'A unit of trade goods* (a sack of grain, a ◇ pouch of salt, a ◇◇ stack of pelts, etc.)',
            'A bit of finery (a ◇ richly embroidered cloak, a silk scarf, a silver comb, etc.)',
          ]} />
        </div>
        <div>
          <Text><strong>A Value 2 item</strong> is generally worth:</Text>
          <List variant="dash" items={[
            'A ◇ purse of silver coins',
            'A single gold coin',
            'A Surplus',
            'A year (or so) of unskilled labor',
            'A season (or so) of skilled labor',
            'A cartload of common trade goods*',
            'An item of luxury or status (a gold ring, an artful silver torc, a gemstone, etc.)',
          ]} />
        </div>
        <div>
          <Text><strong>A Value 3 item</strong> is generally worth:</Text>
          <List variant="dash" items={[
            'A handful of gold coins',
            'A year (or so) of skilled labor',
            'A good, trained horse or mule',
            'A precious item (ruby ring, gold torc, etc.)',
          ]} />
        </div>
        <div>
          <Text><strong>A Value 4 item</strong> is generally worth:</Text>
          <List variant="dash" items={[
            'A ◇ purse of gold coins',
            'A dozen or so horses',
            'A “priceless” item (huge flawless gemstone, ◇ gold statuette, ◇ bejeweled scepter, etc.)',
          ]} />
        </div>
        <Text>*Exotic trade goods are +1 Value.</Text>
        <Text>A ◇ <strong>purse of coins</strong> contains ~10 <strong>handfuls of coins</strong>. A handful is ~10 individual coins, and so a purse has ~100 coins in it.</Text>
        <Text>Remember, trade is based more on barter, debts, and honor than standard currency.</Text>
      </div>
    </div>
  </div>
);
