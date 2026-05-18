import type { BackgroundOption, PlaybookType } from '@/types';

export const BACKGROUND_OPTIONS: Partial<Record<PlaybookType, BackgroundOption[]>> = {
  blessed: [
    {
      value: 'initiate',
      title: 'Initiate',
      paragraphs: [
        <>Stonetop has long been home to a sacred order, keepers of the old ways and speakers for Danu. You are one such initiate, the most gifted in generations. You gain the Rites of the Land move.</>,
        <>There are other initiates in Stonetop, serving the goddess and the village. They aid you as followers—see the Initiates of Danu insert. Who are they? Choose 2 or 3:</>,
      ],
      choices: {
        min: 2,
        max: 3,
        items: [
          { value: 'enfys', label: <><strong>Enfys</strong>, your acolyte, beloved by birds</> },
          { value: 'afon', label: <><strong>Afon</strong>, strange and Fae-touched</> },
          { value: 'gwendyl', label: <><strong>Gwendyl</strong>, your mentor, a talented healer</> },
          { value: 'olwin', label: <><strong>Olwin</strong>, your anointed lover, seer of fates</> },
          { value: 'seren', label: <><strong>Seren the Eldest</strong>, wise and hard as winter</> },
        ],
      },
    },
    {
      value: 'raised-by-wolves',
      title: 'Raised by Wolves',
      paragraphs: [
        <>Maybe not by <em>wolves</em>, but you grew up in the wild. Beasts of land and air were your siblings. The sighing wind taught you language. The trees and rocks were your home. Were you one of the Forest Folk? Abandoned or orphaned? Lured into the Wood?</>,
        <>Regardless, you get the Trackless Step move (go mark it now). Also, when you <strong>Forage</strong>, you have advantage.</>,
        <>For some reason, you've made yourself known to Stonetop and perhaps you even call it home. But the ways of humans are still strange to you. Once per session, when <strong><em>your wild ways offend or alienate you from someone</em></strong>, mark XP.</>,
      ],
    },
    {
      value: 'vessel',
      title: 'Vessel',
      paragraphs: [
        <>A seed of Danu's power has taken root in your soul. Perhaps it has always been there and only recently sprouted. Or maybe it was planted in you during some portentous event.</>,
        <>Regardless, your dreams have been haunted by strange markings and symbols. You feel the mystic power in plants, stones, and soil. And you've felt the growing wrath of the Earth Mother as foul things begin to move about. Take the Danu's Grasp move (go mark it now).</>,
        <>Danu's power flows through you, but at great cost. When you <strong><em>would spend 1 Stock from your sacred pouch</em></strong>, you may choose to lose 2d4 HP instead.</>,
      ],
    },
  ],
  fox: [
    {
      value: 'the-natural',
      title: 'The Natural',
      paragraphs: [
        <>You grew up around here, and always picked things up quickly. Reading and numbers, sure, but more. Hide and seek. Throwing stones. Climbing. Fighting. Whatever you tried, you were good at it. As good as anyone else, if not better.</>,
        <>Sure, you've got a reputation for bending the rules. Playing dirty. But why play if you don't play to win, right? And who do they come to when there's a problem needs solving? You, that's who.</>,
        <>When you <strong>Seek Insight</strong>, you may roll +INT instead of +WIS and add "What opportunity does no one else see?" to the list of possible questions.</>,
      ],
    },
    {
      value: 'a-life-of-crime',
      title: 'A Life of Crime',
      paragraphs: [
        <>You're new to Stonetop, having left behind a… <em>colorful</em> past. How did you get into that life? Why and how did you get out? Who and what did you leave behind?</>,
        <>Regardless, these people have taken you in. Time to lead an honest life, right?</>,
        <>You start with either Burgle or Light Fingers (your choice) as an extra move, and either burglar tools or a hidden stash (your choice) as an additional special possession. Go mark them now.</>,
      ],
    },
    {
      value: 'the-prodigal-returned',
      title: 'The Prodigal Returned',
      paragraphs: [
        <>You left long ago, travelling far and living by your wits. Why did you leave? What deeds do you boast of, and which do you regret?</>,
        <>You always longed to return to Stonetop, and return you have. You're a bit of a celebrity now, and you've got friends (or close enough) strewn about the known world.</>,
        <>When you <strong><em>declare that you know someone outside of Stonetop</em></strong>, someone who can help, name them and roll +CHA: <strong>on a 10+</strong>, yeah, they can help (tell us why they're willing); <strong>on a 7-9</strong>, they can help but pick 1 from the list below; <strong>on a 6-</strong>, the GM chooses 1 and then some.</>,
      ],
      bullets: [
        <>They still hold a grudge</>,
        <>They're going to need something from you first</>,
        <>They swore off this sort of thing long ago</>,
        <>You can't exactly, y'know, trust them</>,
      ],
    },
  ],
};
