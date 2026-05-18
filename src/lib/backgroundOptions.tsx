import type { BackgroundOption, PlaybookType } from '@/types';

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
