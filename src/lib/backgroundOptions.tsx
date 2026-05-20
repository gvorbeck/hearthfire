import type { BackgroundOption, PlaybookType } from '@/types';

export const FOX_LIFE_OF_CRIME_BACKGROUND = 'a-life-of-crime';

export const BACKGROUND_OPTIONS: Partial<Record<PlaybookType, BackgroundOption[]>> = {
  blessed: [
    {
      value: 'initiate',
      title: 'Initiate',
      content: `Stonetop has long been home to a sacred order, keepers of the old ways and speakers for Danu. You are one such initiate, the most gifted in generations. You gain the Rites of the Land move.

There are other initiates in Stonetop, serving the goddess and the village. They aid you as followers—see the Initiates of Danu insert. Who are they? Choose 2 or 3:`,
      choices: {
        min: 2,
        max: 3,
        items: [
          { value: 'enfys', label: '**Enfys**, your acolyte, beloved by birds' },
          { value: 'afon', label: '**Afon**, strange and Fae-touched' },
          { value: 'gwendyl', label: '**Gwendyl**, your mentor, a talented healer' },
          { value: 'olwin', label: '**Olwin**, your anointed lover, seer of fates' },
          { value: 'seren', label: '**Seren the Eldest**, wise and hard as winter' },
        ],
      },
    },
    {
      value: 'raised-by-wolves',
      title: 'Raised by Wolves',
      content: `Maybe not by *wolves*, but you grew up in the wild. Beasts of land and air were your siblings. The sighing wind taught you language. The trees and rocks were your home. Were you one of the Forest Folk? Abandoned or orphaned? Lured into the Wood?

Regardless, you get the Trackless Step move (go mark it now). Also, when you **Forage**, you have advantage.

For some reason, you've made yourself known to Stonetop and perhaps you even call it home. But the ways of humans are still strange to you. Once per session, when ***your wild ways offend or alienate you from someone***, mark XP.`,
    },
    {
      value: 'vessel',
      title: 'Vessel',
      content: `A seed of Danu's power has taken root in your soul. Perhaps it has always been there and only recently sprouted. Or maybe it was planted in you during some portentous event.

Regardless, your dreams have been haunted by strange markings and symbols. You feel the mystic power in plants, stones, and soil. And you've felt the growing wrath of the Earth Mother as foul things begin to move about. Take the Danu's Grasp move (go mark it now).

Danu's power flows through you, but at great cost. When you ***would spend 1 Stock from your sacred pouch***, you may choose to lose 2d4 HP instead.`,
    },
  ],
  fox: [
    {
      value: 'the-natural',
      title: 'The Natural',
      content: `You grew up around here, and always picked things up quickly. Reading and numbers, sure, but more. Hide and seek. Throwing stones. Climbing. Fighting. Whatever you tried, you were good at it. As good as anyone else, if not better.

Sure, you've got a reputation for bending the rules. Playing dirty. But why play if you don't play to win, right? And who do they come to when there's a problem needs solving? You, that's who.

When you **Seek Insight**, you may roll +INT instead of +WIS and add "What opportunity does no one else see?" to the list of possible questions.`,
    },
    {
      value: 'a-life-of-crime',
      title: 'A Life of Crime',
      content: `You're new to Stonetop, having left behind a… *colorful* past. How did you get into that life? Why and how did you get out? Who and what did you leave behind?

Regardless, these people have taken you in. Time to lead an honest life, right?

You start with either Burgle or Light Fingers (your choice) as an extra move, and either burglar tools or a hidden stash (your choice) as an additional special possession. Go mark them now.`,
    },
    {
      value: 'the-prodigal-returned',
      title: 'The Prodigal Returned',
      content: `You left long ago, travelling far and living by your wits. Why did you leave? What deeds do you boast of, and which do you regret?

You always longed to return to Stonetop, and return you have. You're a bit of a celebrity now, and you've got friends (or close enough) strewn about the known world.

When you ***declare that you know someone outside of Stonetop***, someone who can help, name them and roll +CHA: **on a 10+**, yeah, they can help (tell us why they're willing); on a 7-9, they can help but pick 1 from the list below; on a 6-, the GM chooses 1 and then some.

- They still hold a grudge
- They're going to need something from you first
- They swore off this sort of thing long ago
- You can't exactly, y'know, trust them`,
    },
  ],
  judge: [
    {
      value: 'legacy',
      title: 'Legacy',
      content: `You are the latest in a long line of Judges—born here, apprenticed to the prior Judge, and charged with the passing of the mantle. The Chronicle is a rich repository of lore, but there's no index, so good luck finding anything.

When you ***Know Things about the people or history of Stonetop***, you have advantage.

When you ***spend days, weeks, or months poring over the Chronicle***, ask the GM a question, and the GM will tell you what you learn in that time.`,
    },
    {
      value: 'missionary',
      title: 'Missionary',
      content: `You are part of a larger order of Judges, sent here to protect the flickering flame of civilization. The Chronicle is relatively new; your position in town is far from certain. Add these Judges to the Neighbors section of the steading playbook (pick 2 more):`,
      choices: {
        min: 2,
        max: 2,
        items: [
          { value: 'devin', label: '**Devin** (from Marshedge)', locked: true },
          { value: 'haeris', label: '**Haeris** (from Gordin\'s Delve)', locked: true },
          { value: 'isalde', label: '**Isalde** (from the Manmarch)' },
          { value: 'rahat', label: '**Rahat** (from Lygos)' },
          { value: 'tejisha', label: '**Tejisha** (from Barrier Pass)' },
          { value: 'unz', label: '**Unz** (from the Hillfolk)' },
        ],
      },
    },
    {
      value: 'prophet',
      title: 'Prophet',
      uses: 2,
      content: `The line of Judges was broken long ago, the Chronicle lost or fallen into ruin. Aratis has called you personally to her service through dreams, omens, and visions. Some in town resent the authority you've assumed.

When you ***spend a few days communing with Aratis about a threat facing Stonetop or civilization as a whole***, roll +WIS: on a 7+, Aratis reveals the course of action she would have you take; **on a 10+**, you also hold 2 Sanction. While ***acting on her orders***, spend 1 Sanction to add +1 to a roll you just made.`,
    },
  ],
  lightbearer: [
    {
      value: 'auspicious-birth',
      title: 'Auspicious Birth',
      uses: 1,
      content: `You were born in Stonetop, and that birth was marked by the God of Light. You were born during an eclipse, perhaps, or under the light of a bright new star? Maybe you bear a sun-shaped birthmark?

Whatever the sign, your connection to Helior was clear early on. You've a place of honor in Stonetop, though it'd be a lie to say you don't make some uneasy.

When ***one of your moves has you mark a debility***, you may mark this background's circle instead, to no ill effect. Clear it when you Make Camp or Convalesce.`,
    },
    {
      value: 'itinerant-mystic',
      title: 'Itinerant Mystic',
      uses: 3,
      content: `They think of you as a self-important kook who comes through now and again, speaking in riddles and playing tricks with the light. Sure, they know there's something holy about you, but it's not like you're a priest or anything. Priests talk sense.

When you ***go off a-wandering***, hold 1 Enigma if you're gone for days, 2 if you're gone for weeks, or 3 if you're gone for months. At the very start of play, hold 3 Enigma. Spend Enigma 1-for-1 to:

- Return from your wandering exactly when and where you are needed, fully Outfitted
- Know Things as if you rolled a 10+, drawing on what you learned while away
- Have What You Need to produce an oddly specific yet mundane item of Value 1 or less`,
    },
    {
      value: 'soul-on-fire',
      title: 'Soul on Fire',
      content: `You once led a wordly life, full of fear and doubt, base pleasures and petty grudges. But something happened. Injury, illness, a brush with death. Or just a moment of such profound misery and self-loathing that you thought you could fall no further.

There, in the dark, Helior's light shined upon you, igniting in your soul, lifting you and filling you with a profound sense of purpose.

When you ***Persuade a group by preaching charity, mercy, and hope and roll a 7+***, aside from the usual effect, choose 1:

- Your name and your message spread
- Someone approaches you, now or later, eager to know more`,
    },
  ],
  ranger: [
    {
      value: 'mighty-hunter',
      title: 'Mighty Hunter',
      content: `You are a hunter of the Great Wood, the best the town has seen in generations. You know every part of the Wood within a two-day march.

You start with both the Expert Tracker move and the Stalker move. Go mark them now.`,
    },
    {
      value: 'wide-wanderer',
      title: 'Wide Wanderer',
      content: `You have travelled much of the known world and perhaps parts beyond. Add each of the following to the Neighbors list in the Stonetop playbook, choosing 1 trait for each:

- **Ennis** (from Marshedge)
- **Shahar** (from Gordin's Delve)
- **Yannic** (from the Hillfolk)
- **Tovia** (from Lygos)
- **Sasca** (from the northern Manmarch)

You start with the Mental Map move. Mark it now.

When you ***Know Things about the wider world***, you can roll +WIS instead of +INT.

When you ***arrive somewhere you've visited before*** (your call), tell the GM when you were last here, and the GM will tell you how it's changed.`,
    },
    {
      value: 'beast-bonded',
      title: 'Beast-Bonded',
      content: `You grew up civilized, but your soul is bound to a beast of the wild. You're closer to it than to any man or woman. How did this bond come about? How long ago? Regardless, you start with the Animal Companion move. Go mark it now.

When you ***focus on your animal companion for a few moments***, you can use any of the actions you've marked below, no matter the distance between you. Mark 1 action at 1st level, then another at 3rd, 5th, 7th, and 9th.`,
      choices: {
        min: 0,
        max: 5,
        levelGatedMax: [[1, 1], [3, 2], [5, 3], [7, 4], [9, 5]],
        items: [
          { value: 'gauge-distance', label: 'Gauge its distance and direction from you' },
          { value: 'call-back', label: 'Call it back to your side' },
          { value: 'sense-emotion', label: 'Sense its emotional state' },
          { value: 'brief-impression', label: 'Get a brief impression of what it senses' },
          { value: 'lend-strength', label: 'Lend it your strength—lose 1d6 HP, and it regains an equal amount' },
        ],
      },
    },
  ],
  seeker: [
    {
      value: 'patriot',
      title: 'Patriot',
      content: `These people are family. Chaos grows all around, but you'll be damned if you'll let your family come to harm. Damned indeed.

You have sought out and embraced dark power to protect that which you hold dear. Or perhaps that power fell upon you, and you took it up for the greater good. Either way, you seek more.

You start with the Let's Make a Deal move and are Well Versed in the Things Below (go mark them now). You've also acquired 1 major arcanum:`,
      choices: {
        min: 1,
        max: 1,
        items: [
          { value: 'hecumel-codex', label: '◇ The Hec\'tumel Codex' },
          { value: 'red-scepter', label: '◇ The Red Scepter' },
          { value: 'staff-lidless-orb', label: '◇ The Staff of the Lidless Orb' },
        ],
      },
    },
    {
      value: 'antiquarian',
      title: 'Antiquarian',
      content: `The past has buried many secrets, and you are determined to dig them up. Years of study across the land have led you here, and you are convinced that this town holds the key to your greatest discoveries. What is it you hope to find? What is it that keeps you here?

In any case, your travels and studies mean that you start with the Polyglot move and that you are Well Versed in the Makers and their arts (go mark them now). You've also acquired 1 major arcanum:`,
      choices: {
        min: 1,
        max: 1,
        items: [
          { value: 'noruba-ice-sphere', label: '◇ Noruba\'s Ice Sphere' },
          { value: 'azure-hand', label: '◇ The Azure Hand' },
          { value: 'mindgem', label: '◇◇ The Mindgem' },
        ],
      },
    },
    {
      value: 'witch-hunter',
      title: 'Witch Hunter',
      content: `You've dedicated your life to rooting out and destroying horrors and their servants. What set you down this path? What did you sacrifice to walk it? What led you to call Stonetop home?

Regardless, you start with the Everything Bleeds move and are Well Versed in (pick 1) the Fae, the Things Below, or the Last Door and what lies beyond (go mark them now). You've also acquired 1 major arcanum:`,
      choices: {
        min: 1,
        max: 1,
        items: [
          { value: 'demonhide-cloak', label: '◇ The Demonhide Cloak' },
          { value: 'redwood-effigy', label: 'The Redwood Effigy' },
          { value: 'twisted-spear', label: '◇◇ The Twisted Spear' },
        ],
      },
    },
  ],
  'would-be-hero': [
    {
      value: 'impetuous-youth',
      title: 'Impetuous Youth',
      content: `Stonetop has always been home, but you chafe at the demands of mundane life and have always longed for more. Excitement! Danger!

When you ***make a move and come up short***, you can give it your all and turn a 6- into a 7-9, a 7-9 into a 10+, and (if it matters) a 10-11 into a 12+. But if you do, pick 1 (the GM will fill in the details):

- You get hurt (2d4 damage and an actual injury)
- You cause collateral damage, endanger others, or otherwise escalate the situation
- Something on your person is lost or breaks`,
    },
    {
      value: 'driven',
      title: 'Driven',
      content: `You once led a simple life, but something happened. Something changed you, burdened you with terrible purpose. What was it? Choose 1:`,
      choices: {
        min: 1,
        max: 1,
        items: [
          { value: 'loved-one-killed', label: 'A loved one was killed or abducted' },
          { value: 'someone-gave-life', label: 'Someone gave their life to save you' },
          { value: 'idol-sacrificed', label: 'Your idol sacrificed themselves to save many' },
          { value: 'dark-mystery', label: 'You stumbled upon a dark mystery' },
          { value: 'terrible-mistake', label: 'You must make amends for a terrible mistake' },
        ],
      },
    },
    {
      value: 'destined',
      title: 'Destined',
      uses: 3,
      content: `Fate has laid her hand upon you. Choose 3-4 of the items below to describe your destiny:`,
      postContent: `At the ***start of a session***, roll +Omens: **on a 7+**, lose all Omens and the GM will describe a vision or portent that points toward your fate and/or clarifies your current situation; also, **on a 10+**, ask the GM a follow-up question and get a clear, helpful answer; ***on a 6-***, don't mark XP, hold +1 Omen, and tell us of your recent nightmares or a troubling vision, and how your fears play into them.

***Until your destiny is fulfilled***, treat a 6- on Death's Door as a 7-9, and a 7-9 as a 10+.`,
      choices: {
        min: 3,
        max: 4,
        items: [
          { value: 'anointed', label: 'anointed' },
          { value: 'marked-at-birth', label: 'marked at birth' },
          { value: 'coming-foretold', label: 'your coming foretold' },
          { value: 'destroy', label: 'destroy' },
          { value: 'discover', label: 'discover' },
          { value: 'free', label: 'free' },
          { value: 'protect', label: 'protect' },
          { value: 'restore', label: 'restore' },
          { value: 'unify', label: 'unify' },
          { value: 'blood', label: 'blood' },
          { value: 'civilization', label: 'civilization' },
          { value: 'darkness', label: 'darkness' },
          { value: 'earth-and-stone', label: 'earth & stone' },
          { value: 'fire', label: 'fire' },
          { value: 'ice', label: 'ice' },
          { value: 'light', label: 'light' },
          { value: 'life', label: 'life' },
          { value: 'storms', label: 'storms' },
          { value: 'war', label: 'war' },
          { value: 'water', label: 'water' },
          { value: 'the-fae', label: 'the Fae' },
          { value: 'the-gods', label: 'the gods' },
          { value: 'the-makers', label: 'the Makers' },
          { value: 'the-stone', label: 'the Stone' },
          { value: 'the-things-below', label: 'the Things Below' },
        ],
      },
    },
  ],
  marshal: [
    {
      value: 'scion',
      title: 'Scion',
      content: `You grew up here, descended from a long line. Some of the biggest names in Stonetop's past are perched in your family tree. Everyone in the village takes your authority as a given, and your crew is a well-established institution in town.

You start with the Veteran Crew move, in addition to your usual moves. Go mark it now.

When you ***create your Crew***, they automatically have the *respected* tag (in addition to your usual picks, and any you get from Veteran Crew).`,
    },
    {
      value: 'penitent',
      title: 'Penitent',
      content: `Before you came here, you led a band of ne'er-do-wells: bandits, raiders, or bloody-handed mercenaries. But something changed. A moment of truth led you and your followers—some of them at least—to leave that life behind. And for whatever reason, the people of Stonetop took you in.

When you ***draw on your bloody past to Know Things***, you may roll +STR instead of +INT. If you do, the GM will ask you who you wronged back then or who might still hold a grudge. Answer them now.

When you ***create your Crew***, they automatically have the *warriors* tag (in addition to your usual picks).`,
    },
    {
      value: 'luminary',
      title: 'Luminary',
      content: `You're a natural leader—your words inspire, your plans win the day, your deeds are recounted far and wide. Are you touched by the gods? Does ancient blood flow in your veins? Or are you simply the champion that Stonetop needs in these trying times?

You start with the We Happy Few move, in addition to your usual moves. Go mark it now.

When you ***create your Crew***, they automatically have the *devoted* tag (in addition to your usual picks).`,
    },
  ],
  heavy: [
    {
      value: 'sheriff',
      title: 'Sheriff',
      content: `You keep order in Stonetop and protect it from outside threats. It might not be anything official, but everyone knows you've got a cool head and the weight to back up your words.

When you **bark an order or warning**, roll +CHA: on a 7+, they must choose 1:

- Do what you say
- Dig in/take cover/flee
- Attack you

On a 10+, you can sense which one they're about to do and act first if you like; gain advantage if you do.`,
    },
    {
      value: 'blood-soaked-past',
      title: 'Blood-Soaked Past',
      content: `You left behind a life of violence and a name mothers used to scare their children. For whatever reason, the people of Stonetop took you (back?) in and treat you like one of their own.

When you ***Persuade using violence or threats against someone who knows your black reputation***, you can roll +STR instead of +CHA. Also, if you take the Formidable move, you can choose to roll +CON instead of +CHA.

When you ***fight to kill without mercy or hesitation***, you deal +1d4 damage.`,
    },
    {
      value: 'storm-marked',
      title: 'Storm-Marked',
      content: `You've been touched by Tor (Rain-maker, Thunderhead, Slayer-of-Beasts!) and bear runic markings similar to those etched into the Stone. When did the marks manifest? Are they a symbol of your strength, speed, and courage? Or their source?

You start with the Storm Markings major arcanum. Mark one of the boxes on the front of the Storm Markings sheet, and describe here the time you were struck by lightning and walked away unharmed:`,
      freeText: { key: 'heavy-storm-marked-lightning', label: 'The time you were struck by lightning' },
    },
  ],
};
