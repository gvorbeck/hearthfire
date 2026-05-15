import { Heading, Text } from '@/components/primitives';
import { SubList, PlaybookTable, PlaybookCallout } from '@/components/Playbook';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const Expeditions = () => (
  <div>

    <PlaybookCallout title="CHART A COURSE">
      <Text>When you <strong>wish to travel to a distant place</strong>, name or describe your destination ("Gordin's Delve," "the hagr's lair," or "wherever these tracks lead"). If the route is unclear, tell the GM how you intend to reach it. The GM will then tell you what's required, the risks, and how long it will likely take.</Text>
      <Text>When you <strong>set out on the journey</strong>, the GM will present each of the challenges one at a time—plus any surprises that you couldn't have seen coming—in whatever order makes the most sense. Address them all and reach your destination.</Text>
    </PlaybookCallout>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Requirements</Heading>
      <SubList items={[
        'You must first travel to ___, and from there to your destination',
        'You must wait until ___',
        'You need a knowledgeable guide/accurate map/detailed directions',
        'It\'ll take at least ___ days (and a corresponding amount of supplies)',
        'You\'ll need to bring ___',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Challenges</Heading>
      <SubList items={[
        'You need to watch out for ___',
        'The way is perilous, plagued with danger',
        'You risk getting lost',
        'You must surmount/cross/brave ___',
        'The terrain itself is treacherous; you risk injury on the way',
        'The way will be grueling; you risk exhausting yourselves/your resources',
        'You risk drawing the attention of ___',
      ]} />
      <Text color="muted">Present each challenge once, at a fitting time/place. Once overcome, don't make them deal with it again except as a hard GM move. ("The way is perilous" is an exception, see below.)</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">When the way is perilous</Heading>
      <Text>On each leg of travel, <strong>point to a looming danger</strong> or <strong>introduce a danger</strong>. Maybe roll a Die of Fate.</Text>
      <PlaybookTable
        columnHeaders={['What happens', '1d6']}
        rows={[
          { label: 'A danger springs on them, unavoidable', value: '1' },
          { label: 'Introduce a danger, right in front of them', value: '2–3' },
          { label: 'Point to a looming danger', value: '4–5' },
          { label: 'Point to a looming danger, but also present a discovery', value: '6' },
        ]}
      />
    </div>

    <div className={styles.subsection}>
      <PlaybookTable
        title="Travel times"
        columnHeaders={['Journey', 'Time']}
        bordered
        rows={[
          { group: 'From Stonetop via the Roads to…' },
          { label: 'the Crossroads', value: '3–4 hours', indent: true },
          { label: 'the Foothills', value: '2 days', indent: true },
          { label: 'Titan Bones', value: '2 days', indent: true },
          { label: 'Gordin\'s Delve', value: '4 days', indent: true },
          { label: 'the Steplands', value: '4 days', indent: true },
          { label: 'Barrier Pass', value: '5 days', indent: true },
          { label: 'Marshedge', value: '10 days', indent: true },
          { group: 'From Stonetop to…' },
          { label: 'the cave bears\' den', value: '3–4 hours', indent: true },
          { label: 'the Red Grove', value: '4–6 hours', indent: true },
          { label: 'the Maw', value: '5–7 hours', indent: true },
          { group: 'From the Crossroads to…' },
          { label: 'the Ruined Tower', value: '5–6 hours', indent: true },
          { group: 'From the north edge of the Steplands to…' },
          { label: 'Blackwater Lake', value: '2–3 days', indent: true },
          { label: 'Three Coven Lake', value: '3–4 days', indent: true },
          { group: 'From Marshedge to…' },
          { label: 'the ruins on the Dread River', value: '2 days', indent: true },
          { label: 'the northern Manmarch', value: '4 days', indent: true },
          { label: 'Three-Coven Lake', value: '4 days', indent: true },
          { label: 'Lygos', value: '30 days', indent: true },
          { group: 'To Tor\'s Fist from…' },
          { label: 'the Foothills', value: '5 days', indent: true },
          { label: 'Barrier Pass', value: '6 days', indent: true },
        ]}
      />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">When they make camp</Heading>
      <SubList items={[
        'How will you avoid attention/spot danger?',
        'How do you plan to keep warm?',
        'Do you start a fire? What do you use for fuel?',
      ]} />
      <Text>If you know something will happen, it happens. If you think something might happen, but aren't sure, then ask someone to roll the Die of Fate.</Text>
      <PlaybookTable
        columnHeaders={['What happens', '1d6']}
        rows={[
          { label: 'Something dangerous approaches, inclined to do harm', value: '1' },
          { label: 'Something dangerous approaches, curious but not aggressive', value: '2' },
          { label: 'Something annoying happens (critters in the food, rain, an argument, etc.)', value: '3' },
          { label: 'The night passes uneventfully', value: '4–5' },
          { label: 'They observe something interesting, find something useful, or otherwise gain some small boon; or the night passes uneventfully', value: '6' },
        ]}
      />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Legs of travel</Heading>
      <Text><strong>If familiar, short, uneventful:</strong> gloss over it.</Text>
      <Text><strong>If unfamiliar:</strong> describe it, give impressions.</Text>
      <Text><strong>To create a sense of time passing:</strong> ask questions and/or have them Keep Company.</Text>
      <SubList items={[
        'What\'s the most striking thing that you notice?',
        'What\'s the best/worst/most unexpected thing about this leg of the journey?',
        'What have you heard about this area?',
        'When were you here last? How has it changed?',
        'How are you dealing with the weather?',
        'What are you looking forward to?',
        'What are you thinking/worrying about?',
      ]} />
      <Text>Portray NPCs, add details, answer questions.</Text>
      <Text>Make a soft GM move:</Text>
      <SubList items={[
        'Present a challenge from Chart a Course',
        'Present some other encounter',
        'Have an NPC/follower get into/cause trouble',
        'Stir up conflict between PCs',
        'Offer an opportunity to do something as they travel, or arrive at next point of interest',
      ]} />
      <Text color="muted">"What do you do?" Resolve. Repeat or move on.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Points of interest</Heading>
      <SubList items={[
        'Landmarks not yet seen in play',
        'Where you plan to frame scenes, make moves',
        'Their destination',
      ]} />
      <Text><strong>If you want to build tension:</strong> frame the scene with the location in sight but at a distance. Otherwise, frame the scene with them already there.</Text>
      <Text><strong>If unfamiliar:</strong> describe, give impressions. If the PCs know or picked this place, ask them instead.</Text>
      <Text>On the first visit to a landmark, ask questions.</Text>
      <SubList items={[
        'What\'s the most striking thing that you notice?',
        'What here tells you that this is a place where/of/that ___?',
        'What have you heard about this place?',
        'When were you here last? How has it changed?',
        'How does this place make you feel?',
        'What are you thinking/worrying about?',
      ]} />
      <Text>Portray NPCs, add details, answer questions. Maybe draw/provide a map.</Text>
      <Text><strong>If this is just a landmark, with no challenges or encounters:</strong> offer an opportunity to do something here or else move on to the next leg of travel.</Text>
      <Text>Otherwise, make a soft GM move. "What do you do?" Resolve actions. Repeat or move on.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Random weather</Heading>
      <Text>You decide the weather, but if you want, ask a player to roll the Die of Fate.</Text>
      <div className={styles.weatherGrid}>
        <PlaybookTable
          columnHeaders={['Late Winter / Early Spring', '1d6']}
          rows={[
            { label: 'Snow/sleet/hail; an early thunderstorm; or cold, soaking rain', value: '1' },
            { label: 'Cold and windy, maybe some showers', value: '2–3' },
            { label: 'Clouds on the horizon, steady wind; roll again later with disadvantage', value: '4' },
            { label: 'A fine, sunny spring day; clouds/wind gusts', value: '5–6' },
          ]}
        />
        <PlaybookTable
          columnHeaders={['Spring / Early Summer', '1d6']}
          rows={[
            { label: 'Heavy storm (wind, hail, thunder, lightning)', value: '1' },
            { label: 'Steady, chilly rain', value: '2' },
            { label: 'Warm & windy, maybe some brief showers', value: '3–4' },
            { label: 'Warm, sunny, pleasant', value: '5–6' },
          ]}
        />
        <PlaybookTable
          columnHeaders={['Summer', '1d6']}
          rows={[
            { label: 'Heavy storm (wind, hail, thunder, lightning, tornadoes)', value: '1' },
            { label: 'Blazing heat, still air, not a cloud in sight', value: '2' },
            { label: 'Hot & humid, with brief, drenching thunder storms', value: '3' },
            { label: 'Hot, muggy, some wind', value: '4–5' },
            { label: 'Warm, sunny, breezy, perfect', value: '6' },
          ]}
        />
        <PlaybookTable
          columnHeaders={['Late Summer / Early Autumn', '1d6']}
          rows={[
            { label: 'Powerful thunderstorm or cold, soaking rain', value: '1' },
            { label: 'Windy with a few rain showers', value: '2' },
            { label: 'Warm, clouds on horizon, steady wind; roll again later with disadvantage', value: '3' },
            { label: 'Hot & dry by day; cooler/windy at night', value: '4–5' },
            { label: 'Warm, sunny, breezy, perfect', value: '6' },
          ]}
        />
        <PlaybookTable
          columnHeaders={['Autumn', '1d6']}
          rows={[
            { label: 'Cold, drenching rain and/or sleet', value: '1' },
            { label: 'Cold, windy, light rain or early snow', value: '2' },
            { label: 'Chilly, windy, clouds on the horizon; roll again later with disadvantage', value: '3' },
            { label: 'Crisp, breezy', value: '4–6' },
          ]}
        />
        <PlaybookTable
          columnHeaders={['Winter', '1d6']}
          rows={[
            { label: 'Blizzard: wind, snow, all of it', value: '1' },
            { label: 'Intense cold and wind', value: '2' },
            { label: 'Very cold, very clear, very still', value: '3' },
            { label: 'Cold and snowy, or cold and windy', value: '4' },
            { label: 'Some snow, but mostly just dreary', value: '5' },
            { label: 'Warm (for winter) and sunny', value: '6' },
          ]}
        />
      </div>
    </div>

  </div>
);
