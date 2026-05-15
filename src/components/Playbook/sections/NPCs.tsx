import { Heading, Text } from '@/components/primitives';
import { SubList, PlaybookCallout } from '@/components/Playbook';
import playbookStyles from '@/components/Playbook/Playbook.module.css';
import styles from '@/pages/GmPlaybook/GmPlaybook.module.css';

export const NPCs = () => (
  <div>
    <div>
      <Heading as="h3" size="sm">Names</Heading>
      <Text>Pick one, make one up, or ask a player to.</Text>
      <div className={playbookStyles.paragraphs}>
        <Text><strong>Stonetop names</strong> (Welsh): Aderyn, Aeronwen, Afanen, Afon, Alun, Andras, Aneirin, Awstin, Bedwyr, Berwyn, Betrys, Braith, Briallen, Bronwen, Bryn, Cadi, Cadoc, Cadwygan, Caron, Cefin, Ceinwen, Ceridwyn, Cerys, Colwyn, Deiniol, Dilwen, Dylis, Eifion, Eirlys, Eluned, Emrys, Enfys, Eurwen, Gaenor, Garet, Gethin, Glyndir, Heledd, Hywel, Ifan, Iorwerth, Iwan, Leuca, Lewela, Linos, Mado, Maldwyn, Malon, Mared, Marged, Martyn, Meirion, Menwen, Mererid, Neirin, Nia, Ofydd, Olwyn, Owain, Padrig, Parry, Pryce, Pryder, Rheinal, Rhisiart, Rhosyn, Rydderch, Sawyl, Siana, Sioned, Talfryn, Tegid, Tiwlip, Tomos, Tudyr, Winifred, Yorath</Text>
        <Text><strong>Marshedge names</strong> (Irish): Abben, Ailen, Brin, Brogan, Catlin, Coln, Daedre, Dermos, Ennin, Finnen, Gilor, Isbeal, Kiran, Lile, Lim, Mathuin, Mirne, Noren, Owan, Ragan, Renan, Seadha, Seann, Tierney, Ulliam</Text>
        <Text><strong>Hillfolk names</strong> (Breton, missing vowels, clipped): Adm, Blej, Cirl, Davth, Elst, Gwilm, Gwenl, Henri, Ines, Jenfir, Jown, Juda, Kiln, Laurl, Loic, Merrn, Maikl, Nanzl, Nolwn, Quent, Reegn, Ropr, Sabi, Stren, Yanz</Text>
        <Text><strong>Southern names</strong> (Greek, Hebrew, Persian, Arabic): Agatte, Aref, Alix, Baraz, Canan, Darya, Demetra, Elene, Elios, Fotios, Faruza, Golza, Iasos, Iona, Kyriakos, Marika, Maayan, Osher, Natasa, Nivola, Rinat, Stamat, Thecla, Zhaleh</Text>
        <Text><strong>Manmarcher names</strong> (Germanic): Alther, Bathhilde, Berkhard, Bertrim, Clothar, Dagmar, Elfrida, Ganter, Gerhild, Hartig, Hilde, Hiltrude, Hramn, Ludig, Luise, Meike, Modd, Sabrinne, Swanhilde, Ulrike, Urrsla, Weillem, Wiland, Wulfrim</Text>
        <Text><strong>Barrier Pass names</strong> (Tibetan, Nepali): Choden, Dawa, Dorji, Duga, Jamya, Kunza, Lhamo, Norbu, Nyado, Passan, Sonam, Tashi, Tenzi, Tseri, Wanchu, Yonta</Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Trait</Heading>
      <div className={playbookStyles.paragraphs}>
        <Text>Pick an NPC Trait from the steading playbook, make one up, or ask a player to do so.</Text>
        <Text>Build on that trait, and what you already know about them and their relationship to the PCs. Make connections and coherent contradictions. Breathe life into them!</Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Questions</Heading>
      <Text>For locals, or people the PCs know well:</Text>
      <SubList items={[
        'Are you related to them? How?',
        'What\'s their family situation? (Married? Kids? Parents? Siblings? Grandparents/kids?)',
        'Who else are they close to? Who cares about them?',
        'What do you like/dislike about them?',
        'What are they respected for?',
        'What do others say behind their back?',
        'What\'s their most notable feature?',
        'How have they always treated you?',
        'What do they seem to like or enjoy?',
        'What do they seem to like/dislike?',
      ]} />
      <Text>For outsiders that the PCs know:</Text>
      <SubList items={[
        'When and how did you first meet them?',
        'When did you last see them?',
        'What do you know of their family?',
        'How would you describe them to someone else?',
        'What do you expect to find yourselves talking/arguing/reminiscing about?',
        'Why are you (not) looking forward to seeing them again?',
        'How have they changed since last you met?',
      ]} />
      <Text>For folks the PCs have heard of:</Text>
      <SubList items={[
        'What are they known for?',
        'What\'s said to be their most notable feature?',
        'Who do you know who\'s actually met them?',
        'How are they different from what you expected?',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Impressions</Heading>
      <Text>Give up to 3, from different areas. Most should reflect their nature; maybe 1 should contrast.</Text>
      <div className={playbookStyles.paragraphs}>
        <Text><strong>Face:</strong> angular, broken nose, dimpled, freckles, hawk nose, leathery, missing teeth, paint, scar, scowl, soft, sunburnt, tattoo, warts, etc.</Text>
        <Text><strong>Eyes:</strong> big, bright, cool, cloudy, dark, deep, droopy, missing, pale, small, squinty, quick, watery, etc.</Text>
        <Text><strong>Hair:</strong> bald, curly, greasy, straight, thick, thin, etc.</Text>
        <Text><strong>Body:</strong> big, heavyset, little, lithe, meaty, missing ___, round, short, stooped, tall, thick, thin, wiry, etc.</Text>
        <Text><strong>Presence:</strong> alert, brooding, cheery, elegant, fidgety, friendly, haughty, hunched, intense, serene, etc.</Text>
        <Text><strong>Scent:</strong> earthy, musky, floral, ripe, sour, smoky, etc.</Text>
        <Text><strong>Clothes:</strong> boots, charms, clean, [color], dirty, furs, ribbons, silk, torc, threadbare, unkempt, etc.</Text>
        <Text><strong>Voice:</strong> breathy, clipped, crass, gruff, high, hoarse, lilting, lisping, monotone, mumbly, nasally, quavery, rumbling, shrill, soft, stutter, etc.</Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Instinct</Heading>
      <div className={playbookStyles.paragraphs}>
        <Text><strong>What do they naturally do?</strong> Write it as "to ___" (e.g. "to protect her family").</Text>
        <Text><strong>If they're a monster or a threat</strong>, it should bring them into conflict with others.</Text>
        <Text><strong>If they're a follower</strong>, it should cause trouble for the PC who leads them.</Text>
        <Text><strong>For anyone else</strong>, it should reflect their basic outlook and how they approach the world.</Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Tags &amp; moves <span className={playbookStyles.muted}>(optional)</span></Heading>
      <Text>Assign tags as you see fit, adjectives or nouns that describe their nature, capabilities (or lack thereof), or notable traits: <em>cunning, gullible, bold, cautious, warrior, farmer, devious, honest</em>, etc.</Text>
      <Text>Write up to 3 GM moves, reflecting a skill or ability, a specific manifestation of a tag, or just something they're likely to do.</Text>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Connections <span className={playbookStyles.muted}>(optional)</span></Heading>
      <Text>Ask yourself some or all of the following:</Text>
      <SubList items={[
        'What do they think of the PCs?',
        'Who are they related to? Friends with?',
        'Who are they loyal to, and why?',
        'Who do they dislike, and why?',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Motivations <span className={playbookStyles.muted}>(optional)</span></Heading>
      <Text>Ask yourself some of the following:</Text>
      <SubList items={[
        'What do they fear?',
        'What angers them?',
        'What do they long for?',
        'What do they think they deserve?',
        'What do they want from the PCs?',
        'What do they aspire to do or be?',
      ]} />
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Embodiment <span className={playbookStyles.muted}>(optional)</span></Heading>
      <Text>Use one or more tricks to embody the NPC:</Text>
      <div className={playbookStyles.paragraphs}>
        <Text><strong>Pick an actor or character from TV, film, or theater.</strong> Try to portray them.</Text>
        <Text><strong>Pick someone you know, personally.</strong> Try to impersonate them, but don't tell anyone.</Text>
        <Text><strong>Pick a way of speaking/tweaking your voice</strong>, a catch phrase, or a physical tic or behavior for this NPC. Use it whenever you portray them.</Text>
        <Text><strong>Find or create a picture of them.</strong> Display it when portraying this NPC.</Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">HP, armor, damage <span className={playbookStyles.muted}>(optional)</span></Heading>
      <Text>If you think it will matter, stat them up as if they were monsters or followers, whichever seems more appropriate.</Text>
    </div>

    <div className={styles.subsection}>
      <PlaybookCallout title="PERSUADE (vs. NPCs)">
        <Text>When you <strong><em>press or entice an NPC</em></strong>, say what you want them to do (or not do). If they <strong>have reason to resist</strong>, roll +CHA: <strong>on a 10+</strong>, they either do as you want or reveal the easiest way to convince them; <strong>on a 7-9</strong>, they reveal something you can do to convince them, though it'll likely be costly, tricky, or distasteful.</Text>
      </PlaybookCallout>
      <Text className={playbookStyles.spacerTop}>Things that might convince an NPC:</Text>
      <SubList items={[
        'A promise/oath/vow',
        'A chance to do it safely/freely/discretely',
        'Appeasing or appealing to their ego/honor/conscience/fears',
        'A convincing deception',
        'A better/fair/excessive offer',
        'Helping them/doing it with them',
        'Violence (or a credible threat thereof)',
        'Something they want or need (coin/food/booze/etc.)',
        'Assurance/proof/corroboration',
        'Pressure/permission/help from ___',
        'Or anything else that makes sense',
      ]} />
      <div className={playbookStyles.paragraphs}>
        <Text>Make your choices based on your sense of the NPC, their instinct, their motives, and your prep. The PC might not be able to convince them <em>right now</em>, but a 7+ should always at least reveal a path forward.</Text>
        <Text>It's okay to offer alternatives on how the NPC could be convinced. "He's waiting for a bribe; a few coppers would do it. Or you could rough him up a bit, you're pretty sure that'd work, too."</Text>
      </div>
    </div>
  </div>
);
