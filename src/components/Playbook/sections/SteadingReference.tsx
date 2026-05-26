import { Heading, Text } from '@/components/primitives';
import playbookStyles from '@/components/Playbook/Playbook.module.css';
import styles from './SteadingReference.module.css';

const STONETOP_NAMES = 'Aderyn, Aeronwen, Afanen, Afon, Alun, Andras, Aneirin, Awstin, Bedwyr, Berwyn, Betrys, Braith, Briallen, Bronwen, Bryn, Cadi, Cadoc, Cadwygan, Caron, Cefin, Ceinwen, Ceridwyn, Cerys, Colwyn, Deiniol, Dilwen, Dylis, Eifion, Eirlys, Eluned, Emrys, Enfys, Eurwen, Gaenor, Garet, Gethin, Glyndir, Heledd, Hywel, Ifan, Iorwerth, Iwan, Leuca, Lewela, Linos, Mado, Maldwyn, Malon, Mared, Marged, Martyn, Meirion, Menwen, Mererid, Neirin, Nia, Ofydd, Olwyn, Owain, Padrig, Parry, Pryce, Pryder, Rheinal, Rhisiart, Rhosyn, Rydderch, Sawyl, Siana, Sioned, Talfryn, Tegid, Tiwlip, Tomos, Tudyr, Winifred, Yorath';
const MARSHEDGE_NAMES = 'Abben, Ailen, Brin, Brogan, Catlin, Coln, Daedre, Dermos, Ennin, Finnen, Gilor, Isbeal, Kiran, Lile, Lim, Mathuin, Mirne, Noren, Owan, Ragan, Renan, Seadha, Seann, Tierney, Ulliam';
const HILLFOLK_NAMES = 'Adm, Blej, Cirl, Davth, Elst, Gwilm, Gwenl, Henri, Ines, Jenfir, Jown, Juda, Kiln, Laurl, Loic, Merrn, Maikl, Nanzl, Nolwn, Quent, Reegn, Ropr, Sabi, Stren, Yanz';
const SOUTHERN_NAMES = 'Agatte, Aref, Alix, Baraz, Canan, Darya, Demetra, Elene, Elios, Fotios, Faruza, Golza, Iasos, Iona, Kyriakos, Marika, Maayan, Osher, Natasa, Nivola, Rinat, Stamat, Thecla, Zhaleh';
const MANMARCH_NAMES = 'Alther, Bathhilde, Berkhard, Bertrim, Clothar, Dagmar, Elfrida, Ganter, Gerhild, Hartig, Hilde, Hiltrude, Hramn, Ludig, Luise, Meike, Modd, Sabrinne, Swanhilde, Ulrike, Urrsla, Weillem, Wiland, Wulfrim';
const BARRIER_PASS_NAMES = 'Choden, Dawa, Dorji, Duga, Jamya, Kunza, Lhamo, Norbu, Nyado, Passan, Sonam, Tashi, Tenzi, Tseri, Wanchu, Yonta';

const TRAITS_COL_A = [
  'all thumbs', 'ambitious', 'beloved by everyone', 'beautiful singing voice', 'best cook',
  'best weaver', 'blind', 'braved the Ruined Tower', 'cautious', 'cheery', 'chronic cough',
  'complains too much', 'cowardly', 'craves recognition', 'curious', 'dallied with the Fae years ago',
  'deaf', 'desperately wants a child', 'distills the best whisky', "doesn't pull their weight",
  'drunkard', 'eagle-eye', 'fearless', 'foundling', 'gathers herbs from the Wood',
  'gets the best deals', 'gifted storyteller', 'gods-fearing', 'good with children', 'happy-go-lucky',
  'has a beef with Marshedge', 'has a good heart', 'has a lot of backbone', 'has a wandering eye',
  'has a way with animals', 'has Fae blood in their veins', 'has just terrible luck',
  'has lost their nerve', 'has no respect for their elders', 'has terrible nightmares',
];

const TRAITS_COL_B = [
  'has the most children', 'has their head in the clouds', 'hates the Hillfolk', 'hears voices',
  'humorless', 'immaculate appearance', 'jealous', 'just got married', 'keeps to themselves',
  'knows all the gossip', 'lame', 'likes to hurt things', 'lived among the Forest Folk',
  'lost all their children', 'lovesick', 'loves their dogs', 'loyal friend', 'most handsome',
  'moved here recently', 'must approve any marriages', 'mute', 'not afraid of deep water',
  'not too bright', 'oldest', 'orphan', 'overprotective', 'prettiest', 'prideful', 'reckless',
  'refuses to marry', 'resents their lot in life', 'runs everywhere', 'sensitive', 'simpleton',
  'slew many crinwin', 'stoic', 'stubborn', 'suffers from fits', "swears they met the Pale Hunter",
  'tells the best jokes', 'tender-hearted', 'tends the Gods\' Pavilion', 'tends to the sick & injured',
  'touched', 'very strong', 'wants to have kids', 'well-read', 'well-traveled', 'widowed',
  'will eat anything',
];

const PLACES_OF_INTEREST = [
  'The Stone',
  'The Granary',
  'Public House & Stables',
  'Cistern',
  'Pavilion of the Gods',
  'Watchtowers',
];

export const SteadingReference = () => (
  <div className={styles.root}>
    <div>
      <Heading as="h3" size="sm">Places of interest</Heading>
      <Text size="sm" color="muted">Key locations on the village map. Add PC homes and notable NPC homes as established in play.</Text>
      <ul className={styles.placesList} aria-label="Places of interest">
        {PLACES_OF_INTEREST.map((place) => (
          <li key={place} className={styles.place}>{place}</li>
        ))}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <li key={n} className={styles.placeBlank} aria-label={`Empty location ${n}`} />
        ))}
      </ul>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">Names</Heading>
      <Text size="sm" color="muted">Pick one, make one up, or ask a player to.</Text>
      <div className={playbookStyles.paragraphs}>
        <Text size="sm"><strong>Stonetop</strong> (Welsh): {STONETOP_NAMES}</Text>
        <Text size="sm"><strong>Marshedge</strong> (Irish): {MARSHEDGE_NAMES}</Text>
        <Text size="sm"><strong>Hillfolk</strong> (Breton, clipped): {HILLFOLK_NAMES}</Text>
        <Text size="sm"><strong>Southern</strong> (Greek, Hebrew, Persian, Arabic): {SOUTHERN_NAMES}</Text>
        <Text size="sm"><strong>Manmarch</strong> (Germanic): {MANMARCH_NAMES}</Text>
        <Text size="sm"><strong>Barrier Pass</strong> (Tibetan, Nepali): {BARRIER_PASS_NAMES}</Text>
        <Text size="sm" color="muted"><em>Gordin's Delve: choose from other lists; everyone there comes from somewhere else.</em></Text>
      </div>
    </div>

    <div className={styles.subsection}>
      <Heading as="h3" size="sm">NPC Traits</Heading>
      <Text size="sm" color="muted">Assign as needed; choose from this list or make up your own.</Text>
      <div className={styles.traitsGrid}>
        <ul className={styles.traitsList} aria-label="NPC traits (first half)">
          {TRAITS_COL_A.map((t) => <li key={t} className={styles.trait}>{t}</li>)}
        </ul>
        <ul className={styles.traitsList} aria-label="NPC traits (second half)">
          {TRAITS_COL_B.map((t) => <li key={t} className={styles.trait}>{t}</li>)}
        </ul>
      </div>
    </div>
  </div>
);
