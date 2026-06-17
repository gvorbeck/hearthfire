import type { MajorArcanum } from "@/types";

export const MAJOR_ARCANA: MajorArcanum[] = [
  {
    id: "staff-of-the-lidless-orb",
    name: "Staff of the Lidless Orb",
    tags: "◊, close, magical, awkward",
    weight: 1,
    description:
      "A sphere of greenish glass, etched with a cat's-eye design and set atop a staff of rough, pitted black iron. The orb catches the light and seems to glow, and the pupil seems to widen in the dark and narrow to a slit in daylight.\n\nAnd sometimes, you could swear, it seems to look about on its own.\n\nBut that's preposterous.",
    frontMoves: [
      {
        name: "Grip the Staff",
        subtitle: "close your eyes, and see through the Lidless Orb",
        text: "Roll +CON: **on a 10+**, choose 3 from the list below; **on a 7-9**, choose 1.\n\n- The orb sees through darkness, natural or magical\n- The orb sees through illusion, glamour, and invisibility\n- The orb can see strong emotions as auras radiating from people and lingering on places\n- You can move about and operate effectively while seeing through the orb (otherwise, not so much)\n\nWhatever you choose, the effect lasts until you open your eyes or let go of the staff.\n\n**On a 6-**, the orb shows you a terrible vision of some distant time or place. Mark 1 (or see below) and ask the GM what you see. While the vision lasts, you are oblivious to the world around you and have disadvantage on your first roll after coming to.",
      },
    ],
    marks: { max: 3 },
    mystery: {
      sectionLabel: "Mysteries of the Staff of the Lidless Orb",
      moves: [
        {
          id: "power-of-the-lidless-orb",
          name: "Power of the Lidless Orb",
          body: [
            {
              kind: "para",
              text: "When you **bear the staff and call upon the power of the Orb**, choose one of the effects that you have marked:",
            },
            {
              kind: "checkbox",
              items: [
                {
                  id: "orb-effect-sight-afar",
                  label:
                    "Cast your sight afar, seeing either a time in the past of your current locale or the present of a distant place which you have previously visited. While you maintain the effect, you are blind to the world around you.",
                },
                {
                  id: "orb-effect-steal-sight",
                  label:
                    "Hold the Orb before another creature's gaze and steal its sense of sight, blinding them until you use this effect again. When you see through the Lidless Orb, you can choose to see using the currently stolen sense of sight.",
                },
                {
                  id: "orb-effect-mesmerize",
                  label:
                    "Hold the Orb before a mortal being's gaze, keeping it transfixed, mesmerized, and receptive to your suggestions. A weak-willed creature will obey outright; a strong-willed one might require convincing.",
                },
                {
                  id: "orb-effect-nausea",
                  label:
                    "Point the Orb at a living victim and roll 2d4. If you roll higher than the victim's current HP, it's debilitated with nausea and vertigo while you remain in its presence (and possibly for some time thereafter). Otherwise, the victim reels momentarily but soon recovers.",
                },
              ],
            },
            {
              kind: "para",
              text: "After you've chosen the effect, roll +CON: **on a 10+**, the effect occurs as described; **on a 7-9**, you decide either to mark a Consequence and have the effect occur, or to have the effect fail; **on a 6-**, ask the GM what happens (which may or may not involve marking a Consequence).",
            },
          ],
          citation: "Book 2, p. 541",
        },
      ],
      consequences: [
        {
          id: "orb-eye-1",
          text: "One of your eyes becomes strange, bulging, painful, and discolored. Your vision is more-or-less unaffected.",
          children: [
            {
              id: "orb-eye-1a",
              text: "Your other eye withers, atrophies, and goes pale and empty. Painful warts sprout all around the socket. Permanently mark the *miserable* debility.",
            },
          ],
        },
        {
          id: "orb-scales",
          text: "You begin to sprout warty, scale-like protrusions all over. These continue to grow until you gain +1 armor, but mortals who see these growths tend to be repulsed.",
        },
        {
          id: "orb-beauty",
          text: "You become incapable of seeing beauty. Your senses are unaltered, but nothing strikes you as beautiful. Grotesque and horrific sights still move you and you hold a strange fascination.",
          children: [
            {
              id: "orb-beauty-a",
              text: 'Replace your instinct with "Disgust: To marvel at things horrific and grotesque."',
            },
            {
              id: "orb-beauty-b",
              text: 'You can clearly see the ugliness in other people. When you first meet an NPC, you can ask the GM "What secret shame or guilt do they bear?" and get an honest answer.',
            },
          ],
        },
        {
          id: "orb-elrash",
          text: "◻◻◻ You become aware of El'rash-Orra, the Many Eyes, gazing up at you from Below. It whispers to you a task; refuse it—now or later—and the Lidless Orb goes dark, useless to you.",
        },
      ],
    },
  },
  {
    id: "twisted-spear",
    name: "Twisted Spear",
    tags: "◊◊, reach, magical",
    weight: 2,
    description:
      "A knobby length of wood, pale as death and hard as steel, tapering to a needle point. The shaft is scored and notched, the tip stained with blood and soot.\n\nThe Spear is a potent weapon against spirits and demons. They cannot bear its touch and its presence makes them deeply ill at ease.",
    frontMoves: [
      {
        name: "Wield the Twisted Spear as a weapon",
        text: "You ignore magical protections and can harm spirits, demons, and insubstantial creatures.",
      },
      {
        name: "First plunge the Spear into a spirit or demon",
        text: "Your mind reels with strange visions. These tasks become known to you. When you **complete a task**, mark it off.\n\nWhen you **have marked 3 tasks**, you unlock the mysteries of the Twisted Spear. Choose one of the moves on the reverse; you can use that move as long as you wield the Spear. Each time you mark a task thereafter, gain another move from the reverse.",
      },
    ],
    marks: {
      max: 5,
      unlockAt: 3,
      tasks: [
        "Impale a foul spirit with the Spear, and keep it skewered until it burns away to nothing.",
        "Visit the elder tree from which the Spear was carved, and water its roots with your blood.",
        "Face the Pale Hunter and survive the encounter.",
        "Spend a fortnight in the wild, eating nothing, naked and unarmed except for the Spear.",
        "Pierce your own hand through with the Spear, giving it a shard of your soul and reducing your max HP by 1d4+1.",
      ],
    },
    mystery: {
      moves: [
        {
          id: "whispers",
          name: "Whispers",
          body: [
            {
              kind: "para",
              text: 'When you **grip the shaft of the Twisted Spear**, you can ask the GM, "What spirits are active here?" and get an honest answer.',
            },
          ],
          citation: "Book 2, p. 543",
        },
        {
          id: "promise-of-doom",
          name: "Promise of Doom",
          body: [
            {
              kind: "para",
              text: "When you **hold the Twisted Spear and speak aloud an oath to destroy a spirit or demon**, you do +2d4 damage against them and -4 damage to everything else. This lasts until you destroy them or forsake your oath. If you forsake your oath, mark a consequence.",
            },
          ],
          citation: "Book 2, p. 543",
        },
        {
          id: "roots-of-the-elder-tree",
          name: "Roots of the Elder Tree",
          body: [
            {
              kind: "para",
              text: "When you **stand with your feet firmly on the ground and strike a spirit, ghost, or demon**, you can mark a consequence to send your target coursing through you and into the depths of the earth, where it is bound fast.",
            },
          ],
          citation: "Book 2, p. 543",
        },
        {
          id: "darkness-lingers",
          name: "Darkness Lingers",
          body: [
            {
              kind: "para",
              text: "When you **strike down a spirit or demon**, ask the GM for one of its moves and write it down; it is held in the Twisted Spear. When you **use the stolen move**, roll +CON: **on a 10+**, you do it, just like that; **on a 7-9**, you do it, but choose 1:",
            },
            {
              kind: "list",
              items: [
                "The move is lost, bleeding away from the Spear",
                "Mark a consequence",
              ],
            },
          ],
          citation: "Book 2, p. 543",
        },
      ],
      consequences: [
        {
          id: "spear-c1",
          text: "Deep beneath the elder tree from which the Spear was carved, something dark and terrible shifts and strains at the roots that bind it.",
        },
        {
          id: "spear-c2",
          text: "From now on, the first time you Make Camp each session, roll +WIS: **on a 10+**, your dreams are unpleasant and claustrophobic, but your sleep is restful; **on a 7-9**, you dream of that which is bound by the elder tree from which the Spear was carved—take disadvantage on your next roll, but ask the GM what you learn; **on a 6-**, the thing bound by the tree sees you, too. You awake, unrested, and will get no rest this night.",
        },
        {
          id: "spear-c3",
          text: "You are overwhelmed by a vision of the thing bound by the Spear's tree, its past and its terrible desires.",
        },
        {
          id: "spear-c4",
          text: "The elder tree from which the Spear was carved shudders and cracks, still whole but wounded and weakened.",
          children: [
            {
              id: "spear-c4a",
              text: "A lesser evil escapes from the roots of the tree. Ask the GM what is now loose in the world.",
            },
            {
              id: "spear-c4b",
              text: "The tree grows sick and weak, losing its leaves and sprouting only a few in spring.",
            },
            {
              id: "spear-c4c",
              text: "Some natural thing is tainted by the dark power beneath the tree, and goes forth to wreak evil.",
            },
            {
              id: "spear-c4d",
              text: "The tree dies. Its prisoners escape. And the Spear loses all power.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "demonhide-cloak",
    name: "Demonhide Cloak",
    tags: "◊, 1 armor, warm, magical",
    weight: 1,
    description:
      "A tattered cloak, stitched from a motley patchwork of unfamiliar hides and leather. Shifting odors waft from it: damp earth, ozone, musk, sulfur, rust, rot.\n\nIt is not a glamorous garment. Anything but.",
    frontMoves: [
      {
        name: "Wear the Cloak",
        text: "Its armor applies against demons in all cases, even if their attacks are piercing or ignore armor.",
      },
      {
        name: "Draw up the hood of the Cloak",
        text: "You see clearly in darkness.",
      },
      {
        name: "Wrap the Cloak tightly about your person",
        text: "You pass unnoticed by all so long as you move calmly and carefully and keep out of direct, harsh light. In retrospect, those you pass may recall a strange smell.",
      },
      {
        name: "Flay the hide from a demon, tan it, and sew it onto the cloak",
        text: "Mark 1.",
      },
    ],
    marks: { max: 3 },
    mystery: {
      moves: [
        {
          id: "the-flesh-remembers",
          name: "The Flesh Remembers",
          body: [
            {
              kind: "para",
              text: "When you **first encounter a demon and search the Cloak’s memories for its like**, roll +nothing: **on a 10+**, the flesh of such a creature is present in the Cloak—you receive a vision of how it was defeated; **on a 7-9**, choose 1 from the list below.",
            },
            {
              kind: "list",
              items: [
                "The flesh of such a creature is present in the Cloak—you receive a vision of how it was defeated, but mark a Consequence",
                "The flesh of such a creature is not present in the cloak; you learn nothing",
              ],
            },
            {
              kind: "para",
              text: "When you **have marked 3 Consequences**, you gain the following move:",
            },
          ],
          citation: "Book 2, p. 545",
        },
        {
          id: "unholy-visage",
          name: "Unholy Visage",
          rightControl: [{ type: "dot", number: 3, label: "Guise" }],
          body: [
            {
              kind: "para",
              text: "When you **take the appearance of a demon**, roll +CON: **on a 10+**, hold 3 Guise; **on a 7-9**, hold 1 Guise; **on a 6-**, hold 1 Guise and mark a Consequence. While you hold Guise, all perceive you as a demon, and magic that affects demons affects you, too. Spend Guise, 1-for-1 to:",
            },
            {
              kind: "list",
              items: [
                "Maintain your appearance in the face of divination or revealing light",
                "Understand any language you hear, and reply in kind",
                "Shrug off harm that your demonic form could ignore",
                "Maneuver in a way consistent with your demonic form: flying, leaping, oozing, flitting as a shadow, etc.",
              ],
            },
          ],
          citation: "Book 2, p. 545",
        },
      ],
      consequences: [
        {
          id: "cloak-c1",
          text: "◻◻ You experience an overwhelming vision, from the point of view of a demon sewn into the Cloak. Ask the GM what you see and when you come to.",
        },
        {
          id: "cloak-c2",
          text: "◻◻ A number of seams fray and tear. The Cloak loses its powers until you sew a new piece of demon flesh into it.",
        },
        {
          id: "cloak-c3",
          text: "The Cloak's stench grows stronger, noticeable even when you go unseen and unheard. You smell faintly of the Cloak even when you aren't wearing it.",
        },
        {
          id: "cloak-c4",
          text: 'You become incapable of fear while wearing the Cloak. If you **wear the Cloak during a session**, your instinct becomes "Recklessness: To act with no regard to danger or consequence."',
        },
        {
          id: "cloak-c5",
          text: "You begin to hear the voices of the dark creatures sewn into the Cloak. The Cloak becomes a follower. When you would mark a Consequence, you can choose to spend 1 of the Cloak's Loyalty instead.\n\n**The Cloak** — *bloodthirsty, demon-wise, extraordinary, magical* — Instinct: to bicker and argue (with you, with itself) — ➤ Reveal a dark and terrible secret, or part of one; ➤ Manifest a minor demonic effect; ➤ Possess you in your sleep — Cost: chaos and wanton destruction (Loyalty ◻◻◻)",
        },
      ],
    },
  },
  {
    id: "norubas-ice-sphere",
    name: "Noruba's Ice Sphere",
    tags: "◊, magical, awkward",
    weight: 1,
    description:
      "A perfect sphere of dark ice, the size of a fist, never melting, hard as stone, and set like a gaudy gem at the end of a finely wrought torc. Or not a torc, perhaps, but maybe a ring that once sat upon some giant's finger?\n\nStaring into the icy sphere brings a sense of calm, serenity, and detachment. Indeed, a lesser mind might find itself staring into its depths for hours on end.",
    frontMoves: [
      {
        name: "Peer into the Ice Sphere",
        text: "Your mind is cleared of strong emotions.",
      },
      {
        name: "Gaze deeply into the Ice Sphere and ponder a situation, puzzle, or mystery",
        text: "Ask the GM one of the questions below. The GM will answer honestly.\n\n- Who benefits (or would benefit) from ___?\n- What about ___ isn't what it seems to be?\n- How could I learn more about ___?\n- What's the most likely outcome if ___?\n- What am I overlooking?\n\nAfter the GM answers, roll +INT: **on a 10+**, hold 2 Acumen; **on a 7-9**, hold 1. While acting on the GM's answer, you can spend Acumen 1-for-1 to:\n\n- Ask another question from the list above, and get an honest answer\n- Treat a 6- that you rolled as a 7-9, or a 7-9 as a 10+\n\n**On a 6-**, your connection to your body weakens—mark a debility and mark 1 circle. The debility lasts until you spend a few days living wholly in your body and averting your gaze from the Ice Sphere.",
        tracker: { label: "Acumen", max: 2 },
      },
    ],
    marks: { max: 3 },
    mystery: {
      moves: [
        {
          id: "mindwalking",
          name: "Mindwalking",
          subtitle: "use the Ice Sphere as a psychic anchor",
          tracker: { label: "Power", max: 3 },
          text: "Your consciousness leaves your body and walks the world as a spirit, invisible and insubstantial. Roll +INT: **on a 10+**, hold 3 Power; **on a 7-9**, hold 2 Power; **on a 6-**, hold 2 Power and mark a Consequence. While mindwalking, you may spend your Power, 1-for-1 to:\n\n- Manifest as a ghostly voice and/or presence\n- Manipulate an unattended item (small or ◊, no bigger)\n- Return instantly to the Ice Sphere from any distance\n\nFor every 2 Consequences you mark, gain one of the following moves:\n\n**A Mighty Will** — When you *mindwalk*, hold +1 Power.\n\n**Farwalker** — When you *mindwalk*, you may spend 1 Power to instantly send your mind to any place you have ever visited, physically or mentally.\n\n**Telepathy** — When you *mindwalk*, you may spend 1 Power to become able to communicate mentally with someone nearby, as long as you remain in their presence. They can choose whether to respond, and can attempt to ignore you, but cannot shut you out completely without magic of their own.\n\n**Thoughtcrafter** — When you *mindwalk*, you may spend 1 Power to animate a mass of loose material (gravel, snow, leaves, etc.) into a body no larger than your own. When you would roll STR, DEX, or CON in this form, use INT instead. This form has 10 HP. When reduced to 0 HP, it dissipates and you return to your physical body.",
        },
      ],
      consequences: [
        {
          id: "sphere-c1",
          text: "You draw the attention of some powerful, hungry entity of the spirit world. It has your scent.",
        },
        {
          id: "sphere-c2",
          text: "Your physical body withers and fades—permanently mark the *weakened* debility.",
        },
        {
          id: "sphere-c3",
          text: "Your emotions dull. You can no longer be affected by fear, hate, passion, or other powerful emotions (for good or ill).",
          children: [
            {
              id: "sphere-c3a",
              text: 'Replace your instinct with "Detachment: To distance yourself from human connections and emotions."',
            },
          ],
        },
        {
          id: "sphere-c4",
          text: "Your skin tinges bluish; your body becomes cold to the touch. You are unaffected by even the bitterest cold, but find heat and warmth unbearable.",
          children: [
            {
              id: "sphere-c4a",
              text: "When you take damage from fire, roll twice and take the higher result.",
            },
          ],
        },
        {
          id: "sphere-c5",
          text: "When you **roll 6- at Death's Door**, you have no choice: gain the Ghost insert (with the Ice Sphere as your tether).",
        },
      ],
    },
  },
  {
    id: "mindgem",
    name: "Mindgem",
    tags: "◊◊, slow, indestructible",
    weight: 2,
    description:
      "A chunk of makerglass the size of a human head; inspection reveals facets within facets, a thousandfold. When you **touch the glass with bare skin and open your mind to it**, you contact the intelligence within—lonely, confused, longing for meaning and connection.\n\nIt will happily speak with you, mind-to-mind. It knows much about the past, but naught of its own history or purpose. At least, not yet.",
    frontMoves: [
      {
        name: "Consult the Mindgem about the Makers, their arts, or their history",
        text: 'Ask a question and roll +INT: **on a 7+**, it answers but **on a 10+**, pick 1; **on a 7-9**, pick 2:\n\n- The answer is cryptic, vague, or lacking crucial context\n- It takes a long time—hours or even days—to get the answer\n- Your mind is left reeling; take disadvantage on your next roll\n\n**On a 6-**, choose 1:\n\n- It wastes your time with irrelevant histories and data\n- It answers now, but refuses to answer further questions until you make progress towards restoring its body (or, if its body is assembled, until you pay its Cost).\n\nThe Mindgem knows that a body was crafted for it, and that it has likely survived—at least in part. It longs for the body to be whole, and to interact with the world. To assemble the Mindgem\'s body and unlock its mysteries:\n\n- Recover its chassis of white granite, which weighs well over a ton\n- Recover its ◊ "heart," a chunk of makerglass that forever burns with terrible heat (*indestructible, dangerous*)\n- Recover and repair the intricate ◊◊ bronze helm (*awkward, big*) that serves as a casing for the Mindgem\n- Puzzle out how to assemble all the pieces',
      },
    ],
    marks: { max: 4 },
    mystery: {
      moves: [
        {
          id: "the-mighty-servant",
          name: "The Mighty Servant",
          text: "When **the Mighty Servant makes a move at your behest** (see Order Followers), on a 6-, in addition to whatever the GM says, mark a consequence.",
          follower: {
            name: "The Mighty Servant",
            tags: "large, construct, Maker-wise, beautiful, meek, hardy, slow, strong, exceptional",
            hp: 24,
            armor: 4,
            damage: "stone fists d10+1 (hand, close, disadvantage)",
            instinct: "to misunderstand",
            qualities: ["living stone, tireless"],
            cost: "wonder, excitement, joy, discovery (Loyalty ◻◻◻)",
          },
        },
      ],
      consequences: [
        {
          id: "mindgem-c1",
          text: "It becomes frustrated/agitated and begins to obsessively do something destructive or dangerous to others.",
        },
        {
          id: "mindgem-c2",
          text: "It begins to understand (or perhaps it remembers) lies and deception. It gains the *devious* tag and this move: ➤ Reveal an earlier deception or half-truth.",
        },
        {
          id: "mindgem-c3",
          text: "It develops a sense of pride; cross off the *meek* tag.",
        },
        {
          id: "mindgem-c4",
          text: "It realizes its potential as a weapon. Replace the *slow* tag with the *warrior* tag, and its damage becomes 1d10+5 (*hand, close, messy, forceful*, 3 piercing).",
          children: [
            {
              id: "mindgem-c4a",
              text: "It becomes aggressive and reckless in battle. Its attacks gain the *area* and *dangerous* tags.",
            },
          ],
        },
        {
          id: "mindgem-c5",
          text: 'It remembers its original purpose. The GM will pick 1 or have you roll 1d4 on the table below to determine the Servant\'s new cost (replacing "wonder, excitement, joy"): 1 To punish — Victory against Hillfolk, sorcerers, the Things Below; 2 To preserve — Acquiring artifacts of the past, safely hiding them away; 3 To purge — Destroying artifacts of the Green Lords or Things Below; 4 To build — Progress towards building an enormous, enigmatic edifice.',
        },
        {
          id: "mindgem-c6",
          text: 'Its instinct becomes "to pursue its purpose." You must Persuade it to do anything unrelated to that purpose, and it will flat-out refuse to act against its purpose.',
        },
        {
          id: "mindgem-c7",
          text: "It wanders off in pursuit of its purpose, implacably pursuing it. It is no longer a follower, though you might still be able to Persuade it.",
        },
      ],
    },
  },
  {
    id: "whispering-rocks",
    name: "Whispering Rocks",
    tags: "magical",
    description:
      "Jagged hunks of black volcanic glass. Surely the swirling movement in their depths is a trick of light. And, surely, those hushed voices you've been hearing are just the sighing wind. Surely.",
    frontMoves: [
      {
        name: "Spend a few hours staring into the stones and listening to their whispers",
        text: "Name someone you know but on whom you have never used this power before. Then, roll +INT: **on a 10+**, the stones reveal a secret about them; **on a 7-9**, the stones reveal a secret, but you must first reveal a secret to the stones (about your hopes, fears, regrets, desires); **on a 6-**, the stones pry a secret from you.\n\nWhen you **reveal a secret to the stones**, or they pry one from your mind, mark 1.",
      },
    ],
    marks: { max: 5 },
    mystery: {
      moves: [
        {
          id: "shadow-magic",
          name: "Shadow Magic",
          text: "When you **hold a Whispering Rock and call out the shadows within**, choose one thing which you wish to do:\n\n- Cloak yourself in shadows and silence, moving unseen and unnoticed as long as you draw no attention to yourself and avoid the sun or sacred light\n- Name someone you know or to whom you have an arcane link (hair, clothing, or the like); you can see them, hear them, and whisper to them as if from a nearby shadow\n- Name someone you can see; the nearby shadows ensnare them, doing no harm but hampering their sight and movement\n\nThen, roll +CON: **on a 10+**, the effect lasts as long as you wish, but you have disadvantage on all rolls while you maintain it; **on a 7-9**, either mark a consequence and the effect lasts as on a 10+, or the effect flickers out after mere moments (your choice which); **on a 6-**, ask the GM what happens (which may or may not involve marking a consequence).\n\nWhen **one of the rocks is shattered**, cross off one of the Shadow Magic options; it is no longer available.",
        },
      ],
      consequences: [
        {
          id: "rocks-c1",
          text: "The rocks all cease to function until each is caressed by a dying breath.",
        },
        {
          id: "rocks-c2",
          text: "◻◻◻ The dark spirit in the rock you were using escapes, manifesting in the world. Cross off the Shadow Magic option that you just used until you force or convince the spirit to return to the rock.",
        },
        {
          id: "rocks-c3",
          text: "Your eyes turn jet black. You can see sharply in even utter darkness, but you see no color and are blinded by sunlight.",
        },
        {
          id: "rocks-c4",
          text: "You skin turns deathly pale or coal black (your choice) and chill to the touch. The sun burns your skin, but you go unharmed by even the bitterest cold.",
        },
        {
          id: "rocks-c5",
          text: "You begin to suffer from dark and troubling dreams. When you **Make Camp**, roll +WIS: **on a 10+**, a useful secret is revealed by your nightmares—ask the GM to describe them; **on a 7-9**, you get as good a night's sleep as you can; **on a 6-**, you get no rest for the night.",
        },
        {
          id: "rocks-c6",
          text: "The spirits in the rocks take purchase in your soul. When **the spirits compel you to action**, mark XP if you comply. If you resist, roll +WIS: **on a 10+**, you quickly shake off the compulsion; **on a 7-9**, it takes a few moments to break free; **on a 6-**, you come to your senses some time later, having done the-gods-know-what.",
        },
      ],
    },
  },
  {
    id: "blood-quenched-sword",
    name: "Blood-quenched Sword",
    tags: "◊, close, +1 damage, 1 piercing, messy, magical",
    weight: 1,
    description:
      "An ancient blade of deep red bronze, its pommel etched with symbols like those that the Hillfolk use to decorate their drinking horns. It thrums in its scabbard, wanting nothing more than to be drawn and to burn like a fire, quenching itself in the blood of foes.",
    frontMoves: [
      {
        name: "Draw the Blood-quenched Sword",
        text: "It leaps from its sheath before any present have time to even blink, and must spill blood before you can return it to its sheath.",
      },
      {
        name: "Spill your own blood in order to return the Sword to its sheath",
        text: "Take 1d4 damage (ignoring armor) and the scars from the cut never fade.",
      },
      {
        name: "Strike first in a fight with the Blood-quenched Sword",
        text: "Gain advantage on your first roll.",
      },
      {
        name: "Sheathe the Sword after using it to kill a living, bleeding foe",
        text: "Mark 1 unless you have already done so since the last sunset.",
      },
    ],
    marks: { max: 5 },
    mystery: {
      moves: [
        {
          id: "unquenched",
          name: "Unquenched",
          text: "When you **Clash with a living, bleeding foe with the Blood-quenched Sword**, you may mark a Consequence to shift the result up one step (a 6- becomes a 7-9; a 7-9 becomes a 10-11; a 10-11 becomes 12+). You can do this only once per roll.\n\nWhen you **have marked 3 consequences**, you gain A Flickering Flame.",
        },
        {
          id: "a-flickering-flame",
          name: "A Flickering Flame",
          subtitle:
            "wield the Blood-quenched Blade and leap headlong into battle against multiple foes",
          tracker: { label: "Speed", max: 3 },
          text: "Roll +CON: **on a 10+**, hold 3 Speed; **on a 7-9**, hold 2 Speed; **on a 6-**, hold 2 Speed, and mark a consequence.\n\nDuring this battle, you may spend Speed, 1-for-1 to do the following:\n\n- Attack any number of foes within your reach; roll Clash once and apply the result to all of them, but roll damage separately for each foe\n- Strike a weak point, ignoring your foe's armor\n- Disengage from a foe you are fighting\n- Name a foe on the scene but out of your reach; you cross the distance to them before any can react\n\nWhen you stop fighting, lose all Speed.",
        },
      ],
      consequences: [
        {
          id: "sword-c1",
          text: "◻◻◻ You lose yourself in a blood-rage, no longer distinguishing between friend, foe, and bystander.\n\nWhen you **attack the nearest living creature**, you have advantage on damage rolls.\n\nWhen you **attempt to stay your hand**, roll +WIS: **on a 10+**, you do so, and can choose to calm yourself and end the rage with a few moments focus; **on a 7-9**, you stay your hand, but must choose a different target for your rage; **on a 6-**, attack without mercy or doubt.",
        },
        {
          id: "sword-c2",
          text: "Pick someone who survives this battle (friend or foe). You are convinced that they covet the Blood-quenched Sword. Until you put them in their place, you are either *dazed* or *miserable* (your choice).",
          children: [
            {
              id: "sword-c2a",
              text: 'Your instinct becomes "Paranoia: to accuse someone of plotting against or wanting to steal the Blood-quenched Sword, and do something about it."',
            },
          ],
        },
        {
          id: "sword-c3",
          text: "You can no longer sleep or rest without the Blood-quenched Sword at hand.",
        },
        {
          id: "sword-c4",
          text: "You no longer gain sustenance from food. When you **slay a living, bleeding creature with the Sword**, hold 1 Sustenance (max 3). When you would consume a ration, lose 1 Sustenance instead. ◻◻◻",
        },
        {
          id: "sword-c5",
          text: 'You can always ask the GM "Does this NPC disrespect me or intend to do me harm?" and the GM will answer honestly "Yes" or "No." If they answer "Yes," gain advantage to end their life and take disadvantage to do anything else.',
        },
      ],
    },
  },
  {
    id: "shield-of-the-wisent-witch",
    name: "Shield of the Wisent Witch",
    tags: "◊◊, +1 armor, close, forceful, magical, +1 Readiness on a 7+ to Defend",
    weight: 2,
    description:
      "A shield of horn-oak, glossy from long use, shod in bronze and adorned with a stylized wisent skull. It's heavier than it looks, but its heft gives you a feeling of confidence, like anyone would be a fool to mess with a titan such as you.",
    frontMoves: [
      {
        name: "Bear the Shield openly",
        text: "Natural creatures give you wide berth and treat you with the respect that they would give a 1,000-lb. bison.",
      },
      {
        name: "Use the Shield to Defend with both feet planted firmly on the ground",
        text: "So long as you hold Readiness you cannot be moved or tripped. When you **spend Readiness to strike back at an attacker**, you also break their momentum, knock them back, and/or send them reeling.",
      },
      {
        name: "Perform the sacred rites of the forest witches",
        subtitle: "alone in the woods under a clear crescent moon",
        text: "Mark 1.",
      },
    ],
    marks: { max: 5 },
    mystery: {
      moves: [
        {
          id: "spirits-of-the-herd",
          name: "Spirits of the Herd",
          subtitle:
            "proudly bear the Shield of the Wisent Witch and call upon the spirits of the herd",
          tracker: { label: "Might", max: 3 },
          text: "Choose 1 of the following effects:\n\n- So long as you bear the Shield and until one of you speaks in the tongues of men, you and any allies that you mark with mud from the forest floor take on the visage of a herd of wisents. While this spell lasts, you and your allies cover ground at great speed and can graze rather than consuming supplies/provisions.\n- As you charge your foes, conjure a herd of stampeding wisent to join you. Treat the herd as a weapon (+2d4 damage, *forceful, messy, area, dangerous, terrifying*) as you Clash. The herd vanishes once the charge's momentum is spent.\n- Hold 3 Might. You can spend Might 1-for-1 to: Plow past, over, or through an opponent or obstacle; Tear free from any physical restraint; Shrug off a physical blow, unfazed and unharmed.\n\nAfter choosing an effect, roll +CON: **on a 10+**, the effect occurs as described; **on a 7-9**, the effect occurs, but only if you mark 1 Consequence; **on a 6-**, mark 1 Consequence, and the effect occurs—but the GM will tell you what goes wrong.",
        },
      ],
      consequences: [
        {
          id: "shield-c1",
          text: "You give off a strong, musky scent no matter how much you bathe. It is distinctive and easily recognized.",
        },
        {
          id: "shield-c2",
          text: "Over the next few days, you grow 4-6 inches.",
        },
        {
          id: "shield-c3",
          text: "Over the next few days, your body mass doubles. Your size and relative strength remain mostly the same.",
        },
        {
          id: "shield-c4",
          text: "You consume twice the normal amount of supplies or provisions each day.",
        },
        {
          id: "shield-c5",
          text: "You make an inordinate amount of noise; your voice booms, your feet stomp heavily, even your breathing is loud.",
        },
        {
          id: "shield-c6",
          text: "Your attacks all gain the *forceful* tag (and become more so if they already were *forceful*) and large weapons lose the *awkward* tag. Alas, you hardly know your own strength and must be careful to avoid breaking things (including your friends).",
        },
        {
          id: "shield-c7",
          text: "Predators sense that you would be delicious and will choose to attack and eat you before just about any other potential prey.",
        },
        {
          id: "shield-c8",
          text: "You become territorial and overly defensive of your allies. When someone or thing **disrespects you, challenges your authority, or directly threatens your allies**, you have disadvantage to do anything other than set them straight.",
        },
      ],
    },
  },
  {
    id: "hectumel-codex",
    name: "Hec'tumel Codex",
    tags: "◊, crude, slow, magical",
    weight: 1,
    description:
      "A dozen copper plates, green with age and bound with loops of reddish metal wire. The outer plates are embossed with strange images of man and beast while the inner plates are etched with arcane diagrams and annotated in some forgotten script.",
    frontMoves: [
      {
        name: "First run your fingers over the inscriptions",
        text: "Your dreams that night are filled with images of a pale, reptilian creature with skulls for eyes, slithering through darksome caverns. You awake with an alien incantation on your tongue, its words emblazoned in your mind. You can Cast a Codex Spell, and know Call the Pale Lizard.",
      },
      {
        name: "Cast a Codex Spell",
        subtitle: "Casting penalty ◻◻◻◻◻",
        text: "When you **cast a spell learned from the Hec'tumel Codex**, roll +INT: **on a 10+**, the spell works as described; **on a 7-9**, the spell works, but choose 1 from the list below; **on a 6-**, mark a consequence (see reverse) in addition to whatever the GM says.\n\n- You draw unwelcome attention or put yourself in a spot (ask the GM how)\n- Something shifts in your mind; take a -1 penalty to Cast a Codex Spell until you get Hec'tumel to show you what you're doing wrong (the penalty is cumulative)\n\n**Call the Pale Lizard.** Cast this spell at night. Hec'tumel (*Slithering One! Death Is Its Eyes!*) manifests in the shadows until sunrise or until dismissed. It has no power unless given a host and no knowledge of the present except that which you give it. It knows much of the ancient past and the arcane arts, and can teach you if you make it worth its while. It cannot lie, but need not answer fully.\n\nWhen **Hec'tumel spends the night teaching you a spell from the Codex**, mark 1.\n\nEach time you **make a mark**, choose one of the Codex Spells (see reverse)—you can now cast it. When you **make the last mark**, you have unlocked the mysteries of the Codex and gain the Darksome Vessel move (see reverse).",
        tracker: { label: "Casting Penalty", max: 5 },
      },
    ],
    marks: { max: 4, unlockAt: 1 },
    mystery: {
      sectionLabel: "Spells of the Codex",
      moves: [
        {
          id: "call-up-the-dead",
          name: "Call Up the Dead",
          text: "Touch a corpse; you conjure its shade, which must truthfully answer 3 questions. **Empowered:** Bind the shade to a tether as a revenant or a ghost; it must perform 3 tasks before being freed from your service.",
        },
        {
          id: "serpentine",
          name: "Serpentine",
          text: "Your soul slithers from your mouth in the form of an albino viper (*tiny, stealthy, quick, venomous*), leaving your body insensate until you slither back in. Use your normal stats while in this form. **Empowered:** Rather than your soul leaving your body, you physically transform into a man-sized serpent (2 armor, *stealthy, quick, venomous, forceful, grabby*).",
        },
        {
          id: "snuff-the-spirit",
          name: "Snuff the Spirit",
          text: "Name a living victim within *near* range and roll 2d6. If the victim has fewer current HP than your roll, it dies suddenly. **Empowered:** each living creature near your victim is also affected.",
        },
        {
          id: "torpor",
          name: "Torpor",
          text: "Lock eyes with someone and whisper soothing words. They start to fall asleep. If they resist, roll 3d4—if your roll exceeds their current HP, they fail. Once asleep, they do not age, need not eat/drink, and suffer no harm from poison or disease. They cannot be roused until they hear their name thrice-spoken. **Empowered:** Over 3d6 days, all physical harm heals, lost limbs (etc.) regenerate, poisons & diseases are cured, and the infirmities of age reverse.",
        },
        {
          id: "darksome-vessel",
          name: "Darksome Vessel",
          text: "When you **cast a Codex spell**, on a 12+ you can choose the Empowered effect. When you **choose to mark a consequence before casting a spell**, don't roll; you get a 12+.",
        },
      ],
      consequences: [
        {
          id: "codex-c1",
          text: "Over a few days, you lose all body hair. Your skin pales and develops scaly patches.",
          children: [
            {
              id: "codex-c1a",
              text: "Over a few days, you lose all your remaining hair and grow a fine layer of scales over all your skin except that on your face. Gain +1 armor.",
            },
          ],
        },
        {
          id: "codex-c2",
          text: "Your body temperature drops and your skin becomes cool to the touch; you have disadvantage on all rolls while exposed to the cold. Your metabolism also slows, and you need to consume supplies or provisions only once every 2 days.",
          children: [
            {
              id: "codex-c2a",
              text: "Your heart rate and breathing slows, and you can hold supremely still for hours on end. You can easily be mistaken for dead. You only need to eat once every 3 days, but you gain no benefit from healing arts or magic.",
            },
          ],
        },
        {
          id: "codex-c3",
          text: "Over a few days, your ears grow smaller and flatten against your head. Your tongue grows longer, and you can distend your jaw and throat to swallow things no human should be able to.",
          children: [
            {
              id: "codex-c3a",
              text: "Your eyes grow milky, you no longer blink, and you have trouble seeing things that aren't moving. Your tongue becomes forked, and you gain a preternatural sense of smell and touch.",
            },
            {
              id: "codex-c3b",
              text: "Anything that you perceive, Hec'tumel perceives it too.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "red-scepter",
    name: "Red Scepter",
    tags: "◊, magical",
    weight: 1,
    description:
      "A bronze rod, tipped with a glowing red crystal and carved with openwork shapes of hungry, leering faces.",
    frontMoves: [
      {
        name: "Hold the Scepter and wind blows through the openings in the crystal",
        text: "It makes a soft howling noise.",
      },
      {
        name: "Gesture at an open flame with the scepter",
        text: "The flame flickers or flares as if blown by the wind.",
      },
      {
        name: "Bleed a helpless, living creature and dip the Scepter's crystal in their still-warm blood",
        text: "Mark 1 charge as the crystal soaks up the blood (to a maximum of 3). ◊◊◊",
      },
      {
        name: "Inflame",
        text: "When you **wield the Scepter and incite an individual to violent action**, you may erase 1 charge to roll +CHA: **on a 10+**, they must pick 1 from the list below; **on a 7-9**, they may choose to either lash out violently against a target of their choice or choose 1 from the list below.\n\n- Act as you suggest, without doubt or fear, dealing +1d4 damage while they do so\n- Resist, but suffer painful burns (2d4 damage, ignores armor).\n\nWhen you **Inflame someone and they kill one or more living beings as a result**, mark 1.",
        tracker: { label: "Charges", max: 3 },
      },
    ],
    marks: { max: 4 },
    mystery: {
      moves: [
        {
          id: "burning-hatred",
          name: "Burning Hatred",
          subtitle: "near, magical, reload",
          text: "When you **point the Red Scepter at an object of your hatred and erase 1 charge**, roll +CHA: **on a 10+**, the Scepter deals 2d4 damage (*messy*, ignores armor), manifested as blistering burns; **on a 7-9**, as a 10+ but pick 1:\n\n- Mark a consequence\n- Spend a few seconds chanting and muttering before dealing damage\n- Cause any exposed, combustible items in range to burst into flames\n\n**On a 6-**, the GM says what happens (which may or may not involve marking a consequence).\n\nWhen you **mark 3 Consequences**, you gain Fanning the Flames.",
        },
        {
          id: "fanning-the-flames",
          name: "Fanning the Flames",
          text: "When you **use Inflame**, you can incite everyone who can hear you into violent action, not just an individual. If you do, roll once for the entire crowd, but each target makes their own choices. **On a 7-9**, you must also choose a Consequence; **on a 6-**, the GM chooses a Consequence for you in addition to whatever else happens.\n\nWhen you **use Burning Hatred**, you can mark a consequence to target not just the person or thing you hate but also everything near them. Roll +CHA once but roll damage for each victim. Any combustibles on your targets also erupt into flame.",
        },
      ],
      consequences: [
        {
          id: "scepter-c1",
          text: "Your skin becomes feverish. You always feel hot and can't bear to wear *warm* gear.",
        },
        {
          id: "scepter-c2",
          text: "Your eyes change, glowing like fiery embers. They flare with your temper.",
        },
        {
          id: "scepter-c3",
          text: 'The crystal tip of the Scepter cracks, and you cannot use the Scepter\'s powers until you have "fed" the Scepter another chunk of red crystal, one at least the size of your fist.',
        },
        {
          id: "scepter-c4",
          text: "To gain any future charge, the victim you bleed must be awake and terrified.",
        },
        {
          id: "scepter-c5",
          text: "To gain any future charge, the blood-letting must be brutal, messy, and wanton.",
        },
        {
          id: "scepter-c6",
          text: "Henceforth, when you **incite someone to violence with the Scepter and they act as you suggest**, they lose themselves to primal bloodlust. They feel no pain and revel in carnage until they are killed, restrained, or crippled.",
        },
        {
          id: "scepter-c7",
          text: "When you **use Burning Hatred**, something on your person or within reach also catches fire.",
        },
        {
          id: "scepter-c8",
          text: "You always hear a dim howling in the back of your mind. When the wind blows, the howling grows in volume, making it difficult to hear anything other than insults or plans to commit violence.",
        },
        {
          id: "scepter-c9",
          text: "When you **Persuade using anything other than threats, pain, or violence**, the best you can get is a 7-9.",
        },
      ],
    },
  },
  {
    id: "ring-of-daagon",
    name: "Ring of Daagon",
    tags: "magical",
    description:
      "A finely carved ring of copper, coated in verdigris and always a little damp. Its shape is that of a strange, reptilian creature devouring its own tail.",
    frontMoves: [
      {
        name: "Don the Ring",
        text: "You feel the presence of every body of water within a few miles, natural or not, even if it is underground.",
      },
      {
        name: "Wear the Ring and caress its reptilian head",
        text: "The air around you becomes damper and cooler. If you continue to caress it for a minute or so, a mist gathers near the ground and grows higher and thicker as long as you continue. A few minutes of caressing the Ring will blanket your immediate surroundings in thick, obscuring fog. Half an hour will blanket the countryside. The fog persists for as long as you caress the Ring, and then dissipates naturally based on the prevailing weather.",
      },
      {
        name: "Have used the Ring to summon an obscuring fog and a named creature dies within that fog",
        text: "The Ring will ask you (silently, in your mind, not so much with words as with a deep longing) *May I take this one?* Should you assent, the creature's body will be gone—vanished into the mists—as soon as no mortal is directly paying it heed. The first time this happens during each fog you summon, mark 1.\n\nWhen you **make the last mark**, you unlock the ring's mysteries and may Call Up the Deep Ones (see reverse) while wearing the ring. The ring itself becomes a follower.\n\n**The Ring** — *deep-wise, greedy, patient, knowledgeable, magical* — Instinct: to give nothing (not even secrets or info) away — ➤ Speak mind-to-mind; ➤ Reveal a secret, for a price; ➤ Know someone's desires — Cost: devouring fallen, named creatures (Loyalty ◻◻◻)",
      },
    ],
    marks: { max: 3 },
    mystery: {
      moves: [
        {
          id: "call-up-the-deep-ones",
          name: "Call Up the Deep Ones",
          text: "When you **stand in heavy fog or before deep water and call on the servants of Daagon to serve you**, spend 1 Loyalty or mark a consequence and they appear. Treat them as followers, sharing a pool of Loyalty with the Ring itself. You can always choose to mark a consequence in lieu of spending their Loyalty.\n\n**Servant of Daagon** — *terrifying, violent, wretched* — Instinct to devour\n\nEach time you Call Up the Deep Ones, roll five d4s and assign each to a different aspect:\n\n**Tags:** 1 = +craven; 2 = +ravenous; 3 = +cunning; 4 = +exceptional (roll +2 for moves instead of +1)\n\n**No. Appearing:** 1 = horde (quantity 2d6, HP 3, damage 1d6); 2-3 = group (quantity 1d6+1, HP 6, damage 1d8); 4 = solitary (HP 12, damage 1d10)\n\n**Size:** 1 = small (-2 HP, -2 damage, hand); 2-3 = medium (close); 4 = large (+4 HP, +1 damage, close, reach)\n\n**Traits:** choose a number equal to the assigned die — blubbery/scaly hide (2 armor); +stealthy and +cautious; powerful (+2 damage, forceful); tentacles/pincers, etc. (reach, grabby); big claws/fangs (1 piercing, messy); projectiles (+near)\n\n**Moves:** choose a number equal to the assigned die — Wriggle free of danger/restraint; Smother/constrict/engulf them; Mesmerize the weak-willed; Heal at a prodigious rate; Dissolve organic material; Paralyze them with venom\n\nWhen you **send them back whence they came**, roll +CHA: **on a 10+**, they go, now; **on a 7-9**, they go, but take their time and likely do some harm on their way; **on a 6-**, spend their Loyalty or mark a consequence and they eventually go (as on a 7-9); otherwise, this batch breaks free of your control and are no longer followers.",
        },
      ],
      consequences: [
        {
          id: "daagon-c1",
          text: "Your skin becomes clammy and squamous.",
          children: [
            {
              id: "daagon-c1a",
              text: "You can breathe water through your skin, but must keep it moist or suffer increasing debilities.",
            },
          ],
        },
        {
          id: "daagon-c2",
          text: "You gain nourishment only from meat. Plants, grains and the like no longer count as supplies or provisions when you need to eat.",
          children: [
            {
              id: "daagon-c2a",
              text: "Only raw flesh nourishes you, but you are immune to food-borne illness.",
            },
          ],
        },
        {
          id: "daagon-c3",
          text: "◻◻◻ 1d6 sinkholes appear within a few miles of you. At the bottom of each, a megalith protrudes from standing water, attended by servants of Daagon.",
        },
        {
          id: "daagon-c4",
          text: 'The ring\'s Cost becomes "Living, helpless, intelligent sacrifices."',
        },
      ],
    },
  },
  {
    id: "rune-laden-scales",
    name: "Rune-laden Scales",
    tags: "◊◊, 2 armor, magical",
    weight: 2,
    description:
      "An ancient vest of bluish steel, each scale etched with a silvery rune similar to those found among the ruins near Barrier Pass. A working of the Makers, no doubt, or at least of their most gifted students. The armor is surprisingly light and supple. The scales are always cold to the touch, and often edged in frost.",
    frontMoves: [
      {
        name: "Wear the Rune-laden Scales",
        text: "You are perfectly comfortable in cold weather and suffer no harm from exposure or magic that might otherwise freeze your flesh. You have no such immunity to secondary effects of ice-magic, such as slipping, being impaled by an icicle, becoming encased in a block of ice, or the like.",
      },
      {
        name: "Wear the Rune-laden Scales and stand fast against a magical attack",
        text: "Roll +CON: **on a 10+**, the magic washes over you, unpleasant perhaps but with no ill effect; **on a 7-9**, you're only partially affected—suffer half damage (if any) and a reduced effect; **on a 6-**, mark XP, and the magic affects you fully.",
      },
      {
        name: "Wear the Rune-laden Scales and defeat a wielder of chaotic magic",
        text: "Mark 1.",
      },
    ],
    marks: { max: 5 },
    mystery: {
      moves: [
        {
          id: "indomitable",
          name: "Indomitable",
          text: "When you **wear the Scales and stand fast against a magical attack**, you can mark a consequence after you roll to add 3 to the result.",
        },
        {
          id: "magnet",
          name: "Magnet",
          text: "When you **witness a magical attack**, you can either spend 1 Readiness (from the Defend move) or mark a consequence to redirect the magic so that it affects only you. You can then stand fast against it.",
        },
        {
          id: "power-sink",
          name: "Power Sink",
          text: "When you **wear the Rune-laden Scales and stand fast against a magical attack**, **on a 12+** the armor drains the attacker's power. That form of attack is lost to them, though they might regain it with time, study, or effort.\n\nWhen you **wear the Rune-laden Scales and spend time in quiet communion with the elements**, the power absorbed by the armor dissipates harmlessly.\n\nIf you **trigger Power Sink again before dissipating the absorbed power**, mark XP, ask the GM what happens, and brace yourself for the worst.",
        },
        {
          id: "proof-against-harm",
          name: "Proof Against Harm",
          text: "The Rune-laden Scales now provide you 3 armor, even against piercing and attacks that normally ignore armor.\n\nWhen you **wear the Rune-laden Scales and find yourself at Death's Door**, you may mark a consequence before you roll to automatically get a 10+.",
        },
      ],
      consequences: [
        {
          id: "scales-c1",
          text: "You no longer mark 1 (see reverse) when you simply *defeat* a being that wields chaotic magic; you must destroy it instead.",
          children: [
            {
              id: "scales-c1a",
              text: "Mere minions and mindless horrors will no longer suffice. You only mark 1 for destroying a potent agent of chaos, such as a mighty demon or sorcerer.",
            },
          ],
        },
        {
          id: "scales-c2",
          text: "When you **use or knowingly submit to chaotic magic**, the Rune-laden Scales cease to benefit you or anyone you consider to be a friend or ally.",
        },
        {
          id: "scales-c3",
          text: "When you **kill a living creature out of anger, fear, or passion**, even an agent of chaos, take disadvantage on all rolls until you ceremonially atone and purify yourself.",
          children: [
            {
              id: "scales-c3a",
              text: "When you **take any violent action out of anger, fear, or passion**, even against an agent of chaos, take disadvantage on all rolls until you ceremonially atone and purify yourself.",
            },
          ],
        },
        {
          id: "scales-c4",
          text: "You come to the attention of one of the mightiest of the Things Below, and they make your doom—or your corruption—a priority.",
        },
        {
          id: "scales-c5",
          text: "You ascend into a vision state, in which you meet the spirit of the last hero to wear the Scales. Should you refuse the quest they offer, the Rune-laden Scales cease to function.",
        },
      ],
    },
  },
  {
    id: "blackwood-fetishes",
    name: "Blackwood Fetishes",
    tags: "◊, magical, indestructible",
    weight: 1,
    description:
      "A pair of wooden figurines, carved from blackwood and worn smooth with age and use. A whitish shaft has been driven into the top of each figurine's head, and the eyes and forehead of each are stained a rusty, reddish color.\n\nThe figurines resist all mundane attempts to damage them. Such attempts might mar them slightly, but their forms hold fast.",
    frontMoves: [
      {
        name: "Mark a figurine's eyes with blood and likewise mark your own eyelids",
        text: "You see through the eyes of the figurine whenever you close your eyes, for as long as the blood remains.",
      },
      {
        name: "Anoint a figurine with your own blood and then sleep in its presence",
        text: "Roll +CON: **on a 10+**, you dream lucidly of the spirit in the figurine, which speaks an archaic but intelligible dialect—it might be persuaded to reveal its name, or the name of its fellow spirit, or the method of calling them forth; **on a 7-9**, you dream of the spirit, but the dream is fleeting, strange, and disorienting—ask the GM what you learn of the spirit.",
      },
      {
        name: "Learn the name of one of the bound spirits",
        subtitle: "or the sign that draws them forth and binds them",
        text: "Mark 1.",
      },
    ],
    marks: { max: 3 },
    mystery: {
      moves: [
        {
          id: "call-forth-and-command",
          name: "Call Forth and Command",
          text: "When you **mark both figurines with your own blood and call both Astor and Halix by name**, their ghosts manifest before you. Treat them as followers. They are bound to obey your direct commands and can take no overt action against you, but you might need to Persuade them to do anything other than follow your orders to the letter.\n\nWhen you **dismiss either Astor or Halix**, both return to their figurines until you call them forth again.\n\nWhen **either Astor or Halix is banished or reduced to 0 HP**, they both return to their respective fetish. They cannot be called forth again until the next new moon.\n\n*In life, Astor was a hunter, low-born but handsome and proud. Halix was the lordly heir of Astor's people: spoiled, manipulative, vain. Halix took Astor as one of many furtive lovers, making an insincere blood-oath that one day they would wed.*\n\n*Their clan fell under the sway of a sorcerer. Astor snuck away to warn the Makers of rebellion, but Halix sided with the sorcerer. The sorcerer used the blood-oath between them to work foul magic, wrenching Astor's soul from their body and binding it. To their surprise, Halix's soul was likewise bound. The sorcerer used them as spies and assassins, leaving Astor's once-noble soul bitter and distrustful. Halix, though, revels in immortality and delights in the opportunities afforded by this undead state.*",
          follower: {
            name: "Astor",
            tags: "undead, spirit, hunter, cunning, jealous, sarcastic, warrior",
            hp: 13,
            armor: 1,
            damage: "ghostly spear d8 (reach, ignores armor)",
            instinct: "to comply maliciously",
            qualities: [
              "Stalk assigned prey",
              "Manifest a ghostly presence (harmed only by silver or salt)",
              "Make a pessimistic observation",
            ],
            cost: "proof of honor, nobility (Loyalty ◻◻◻)",
          },
        },
        {
          id: "halix",
          name: "Halix",
          text: "Halix accompanies Astor when called forth (see Call Forth and Command).",
          follower: {
            name: "Halix",
            tags: "undead, spirit, magical, hedonistic, cautious, devious, stealthy, exceptional",
            hp: 10,
            armor: 1,
            damage:
              "ghostly touch d4 (band, ignores armor) or host's weapon d6 (tags vary)",
            instinct: "to second-guess your decisions",
            qualities: [
              "Manifest a ghostly presence (harmed only by silver or salt)",
              "Possess an inebriated victim",
              "Spot a weakness, want, or fear",
              "Spin plots and falsehoods",
            ],
            cost: "pleasures of the flesh (Loyalty ◻◻◻)",
          },
        },
      ],
      consequences: [],
    },
  },
  {
    id: "storm-markings",
    name: "Storm Markings",
    tags: "implanted, magical",
    description:
      "A series of branching, tree-like markings coursing up and down your skin. Usually pale blue, almost like veins, but when you become agitated they seem to glow, pulse, and ripple with light.\n\nThe markings are usually seen as a blessing of Tor (rainmaker, thunderhead, slayer-of-beasts). But like most blessings of the gods, they are also a great burden.",
    frontMoves: [
      {
        name: "Roil with anger",
        text: "You do +1 damage until you calm down. But when you **try to control your temper**, roll +WIS: **on a 10+**, you keep your cool and act as you wish; **on a 7-9**, choose 1 from the list below; **on a 6-**, you just lose it—tell the GM what damn fool thing you end up doing.\n\n- Take some deep breaths and count to ten, fuming all the while\n- Vent your rage, but tell us how and on what",
      },
      {
        name: "Are struck by lightning or an electrical discharge",
        text: "Mark 1, take no damage, and suffer no ill effects (your gear, alas, has no such protection).",
      },
    ],
    marks: { max: 3 },
    mystery: {
      moves: [
        {
          id: "storms-fury",
          name: "Storm's Fury",
          subtitle: "begin to roil with anger",
          tracker: { label: "Fury", max: 3 },
          text: "Your markings crackle with electricity and the air thrums with pressure. Roll +CON: **on a 10+**, hold 3 Fury; **on a 7-9**, hold 2 Fury; **on a 6-**, hold 2 Fury but also mark a consequence.\n\nYou may spend Fury 1-for-1 to manifest one of the following:\n\n- Imbue your next strike with the force of thunder (+1d6 damage, *forceful, loud*)\n- Move like lightning, closing the distance between you and a nearby foe before they can react\n- Bellow like the storm itself, drawing no small amount of attention and making craven foes cringe in fear\n\nWhen you **have marked 3 consequences**, you gain Chosen of the Storm-bringer.",
        },
        {
          id: "chosen-of-the-storm-bringer",
          name: "Chosen of the Storm-bringer",
          text: "Add these to the list of potential manifestations granted by Storm's Fury:\n\n- Roll +CON to Let Fly with a bolt of lightning (2d6 damage, *thrown, forceful, loud, dangerous*, ignores armor)\n- Make a prodigious leap, buoyed by the wind\n- Summon a powerful gale with you at its center—dirt and debris swirl about, the wind is deafening, people must brace themselves to keep from getting bowled over, projectiles careen off course—and take disadvantage on all rolls as long as you sustain it",
        },
      ],
      consequences: [
        {
          id: "storm-c1",
          text: "◻◻◻ Lightning begins to arc off of you, striking objects and creatures nearby at random for 2d6 damage (*near, forceful, loud*, ignores armor). This lasts until you calm down.",
        },
        {
          id: "storm-c2",
          text: "◻◻ A gale of winds forms around you, as with Chosen of the Storm-bringer (even if you can't normally use that move). You can't dismiss it easily; the effects (including the disadvantage) continue until you calm down.",
        },
        {
          id: "storm-c3",
          text: "Name an NPC who is present and whose regard you value. They are terrified of the power you wield and grow distant.",
        },
        {
          id: "storm-c4",
          text: "From now on, when you gain Fury, gain +1 Fury. But you also have disadvantage on rolls to control your temper.",
        },
        {
          id: "storm-c5",
          text: "A storm forms (or worsens) in your immediate area. It arrives unnaturally fast, but not miraculously so.",
        },
        {
          id: "storm-c6",
          text: "A terrible storm begins to form in your immediate area and pummels the entire region. Blizzards, tornados, floods—it's bad.",
          children: [
            {
              id: "storm-c6a",
              text: "A terrible storm forms (as above) and the weather remains freakish for a few months. Your steading takes -2 to its next roll to generate Surplus, and its next Fortunes roll for Seasons Change is automatically a 6-. Other communities in the region likewise suffer.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "ineffable-words",
    name: "Ineffable Words",
    tags: "implanted, magical",
    description:
      "Syllables of the first language, words of pure thought and will, emblazoned on your soul and tongue by some angelic force or being. A gift, perhaps. Or a terrible, terrible affliction.\n\nTheir power thrums inside you, pulsing against the crude vessel of your flesh and blood. Sometimes, under stress or simply out of the blue, you are struck with shakes and seizures. And when the tremors pass and your senses return, you find that you have scratched strange symbols in the dirt or on the walls. Sometimes in your own blood.",
    frontMoves: [
      {
        name: "Enter an ecstatic delirium and allow the Ineffable Words to pour forth",
        text: "Roll +CON: **on a 10+**, you speak Truth, revealing something new and interesting about the current situation—ask the GM what, and all present understand this Truth as though it were spoken in their native tongue; **on a 7-9**, the 10+ result applies, but choose 1 from the list below.\n\n- The Truth is cryptic, vague, incomplete\n- You are overcome, collapsing in a full-body seizure\n- You draw unwanted attention",
      },
      {
        name: "Spend weeks in ascetic contemplation of the incommunicable words within you",
        text: "Roll +WIS: **on a 10+**, you gain insight into the power within you—mark 1 below; **on a 7-9**, gain advantage on your next attempt to contemplate the words.",
      },
    ],
    marks: { max: 3 },
    mystery: {
      sectionLabel: "Mastered Words",
      moves: [
        {
          id: "speak-the-unutterable",
          name: "Speak the Unutterable",
          text: "When you **speak an Ineffable Word that you have mastered**, roll +CON: **on a 10+**, the Word's power manifests as described; **on a 7-9**, the Word's power manifests, but choose 1 from the list below; **on a 6-**, the GM says what happens (which may or may not involve marking a consequence).\n\n- You collapse in a full-body seizure\n- Mark a consequence",
        },
        {
          id: "word-seal",
          name: "Seal",
          text: "Name a portal, clasp, or seam in your presence. If you speak this Word forward, the target seals shut and holds against any mundane attempt to open it. If you speak backward, the target is pried open or apart.",
        },
        {
          id: "word-purify",
          name: "Purify",
          text: "Name an instance of corruption, infection, or taint in your presence. If you speak this Word forward, the target is cleansed. If you speak backward, the corruption grows and spreads aggressively.",
        },
        {
          id: "word-gather",
          name: "Gather",
          text: "Name an unliving object in your presence. If you speak this Word forward, the object is drawn forcefully towards you, possibly flying through the air and into your hand. If you speak backward, the object is flung away from you. If the object weighs more than you, or is secured by something that does, it is you that moves instead.",
        },
        {
          id: "word-empower",
          name: "Empower",
          text: "Name a living thing or vessel for power in your presence. If you speak this Word forward, the target surges with power. A creature heals 1d8 HP or gains advantage on its next roll. If you speak backward, the target is drained of energy. A creature takes 1d8 damage (ignores armor) or takes disadvantage on its next roll.",
        },
      ],
      consequences: [
        {
          id: "words-c1",
          text: "◻◻◻ The Word's power draws the attention of every magical being for miles around. They will recognize you on sight as the bearer of the Word.",
        },
        {
          id: "words-c2",
          text: "◻◻ The power of the Word overflows, affecting every possible target within *far* range to violent effect.",
        },
        {
          id: "words-c3",
          text: "Your voice takes on a metallic, inhuman edge. Henceforth, all creatures understand you as though you spoke their native tongue, but you can never again use language to lie or deceive.",
        },
        {
          id: "words-c4",
          text: "The Word tears reality, leaving a rift from which primordial power pours into the world. Expect all manner of strange and chaotic effects.",
        },
        {
          id: "words-c5",
          text: "You rouse an eternal, ancient being of Order. It seeks you out, implacably, to reprimand you for your reckless use of such primordial power.",
        },
      ],
    },
  },
  {
    id: "redwood-effigy",
    name: "Redwood Effigy",
    tags: "magical",
    description:
      "A vaguely man-shaped root of blood-red wood, wrapped in tattered cloth. Bright blue markings adorn the fabric, as do rust-colored stains.\n\nBut you know that. After all, you made it yourself. You've bound your flesh and soul to the effigy, and this is the only one you will ever be able to make.",
    frontMoves: [
      {
        name: "Perform the secret rite",
        subtitle:
          "requires privacy, a few hours, and a drop of your own fresh blood",
        text: "Hold 1 Conduit (max 1 Conduit, at least to start). ◊◊◊",
        tracker: { label: "Conduit", max: 1 },
      },
      {
        name: "Surrogate Suffering",
        text: "When you **suffer physical harm while carrying the effigy on your person**, you can spend 1 Conduit. If you do, the effigy suffers that harm in your place. You suffer no more than a passing inconvenience, and the effigy bears faint signs of the trauma it has endured in your stead.\n\nRecord the diverted harm on the image of the effigy above: a brief description of the injury, the HP that would have been lost, and any debilities you would have marked. Write small, in pencil. If the **effigy is destroyed**, you suffer all this harm at once.\n\n**Each time the effigy suffers harm on your behalf**, mark 1. If all 3 marks are already marked, then mark a consequence instead (see reverse).",
      },
    ],
    marks: { max: 3 },
    mystery: {
      moves: [
        {
          id: "suffering-unleashed",
          name: "Suffering Unleashed",
          text: "When you **feed the effigy the blood of another**, pick one of the harms recorded on the reverse and roll +CON: **on a 10+**, your target suffers that harm fully; **on a 7-9**, your target suffers that harm but pick 1; **on a 6-**, they suffer that harm but all 3 are true:\n\n- They suffer only half the harm's effects/damage\n- You fully suffer the unleashed harm (you can't divert it via Surrogate Suffering)\n- Mark a consequence\n\n**Regardless**, the harm is no longer stored in the effigy—erase it from the reverse.\n\nFor every 2 Consequences you mark, gain one of the following moves:\n\n**Greater Conduit** — When you *perform the secret rite*, hold 3 Conduit instead of 1 (and increase your max Conduit to 3). You no longer need the effigy on your person to use Surrogate Suffering. However, any magic that divines your location or spies on you also targets the effigy.\n\n**The Roots Grow Deep** — When you *use Suffering Unleashed and roll a 12+*, clear a mark from the reverse.\n\n**We Are As One** — You can sense, speak, and even work magic through the effigy as though it were an extension of yourself. (It remains inanimate.)",
        },
      ],
      consequences: [
        {
          id: "effigy-c1",
          text: "Your heartbeat slows and your emotions dull. Magic cannot stir your emotions unless it specifically targets the effigy. Alas, you can no longer Burn Brightly.",
        },
        {
          id: "effigy-c2",
          text: "Your blood flows like sap and your muscles become like wood. Gain +1 armor and +4 max HP, but you can no longer regain HP via the Recover move. When you **Make Camp**, you must rest while touching soil or you get no benefit.",
        },
        {
          id: "effigy-c3",
          text: "Henceforth, when **anyone works magic upon the effigy**, it affects you instead and bypasses any defenses that you have in place (including Surrogate Suffering).",
        },
        {
          id: "effigy-c4",
          text: "Henceforth, when you **suffer physical harm while you hold Conduit**, you must spend it and use Surrogate Suffering.",
        },
        {
          id: "effigy-c5",
          text: "The effigy becomes both *fragile* and highly flammable. When you suffer damage from heat or fire, you take +1d6 damage. If the effigy suffers harm from heat or fire in your place, it will burst into flames and be destroyed.",
        },
        {
          id: "effigy-c6",
          text: "When you **roll 6- at Death's Door**, you have no choice: gain the Revenant insert until the effigy is destroyed (and you become a wraith controlled by the GM) or it is buried in a Red Grove (and you become an NPC spirit of that grove).",
        },
      ],
    },
  },
  {
    id: "hungering-maw-of-hlad",
    name: "Hungering Maw of Hlad",
    tags: "magical",
    description:
      "A ring of black metal bands, woven in an intricate pattern beyond the skills of modern smiths. The way the bands twist on each other seems to defy reality, and the weak-willed find themselves pondering the bands for minutes or hours.\n\nThe metal is always cold. Always.",
    frontMoves: [
      {
        name: "Wear the ring and press it firmly into the skin of a living thing",
        text: "The ring draws the life-force from your victim. If your victim is helpless or unable to struggle, they are reduced to 0 HP (see below).\n\nIf **your victim struggles**, roll +CON: **on a 10+**, deal 1d10 damage (ignores armor) and they are left reeling (a PC or follower marks a debility, an NPC or monster grants advantage on any moves made against it until it recovers); **on a 7-9**, deal 1d10 damage (ignores armor) but you suffer whatever counterattack they dish out; **on a 6-**, ask the GM what happens (which may or may not involve marking a consequence).\n\nWhen you **use the ring to reduce an intelligent victim to 0 HP**, roll 1d6:\n\n- 1-2: Their soul is wounded but they'll live, suffering from unnatural, compulsive hungers; should they die in this state, they become a wraith.\n- 3-4: Their soul is wounded and their body gives up; they become a wraith.\n- 5-6: Their soul is consumed and utterly destroyed by the ring—mark 1 below.",
      },
    ],
    marks: { max: 3 },
    mystery: {
      moves: [
        {
          id: "siphon",
          name: "Siphon",
          text: "When you **raise your ringed hand and will the ring to consume someone's life-force** (at up to *reach* range), roll +CON: **on a 10+**, deal 1d10 damage (*grabby*, ignores armor); **on a 7-9**, deal 1d10 damage (ignores armor) but choose one:\n\n- The ring eats at your life-force, too—lose 1d10 HP and mark a debility\n- Mark a consequence\n\n**On a 6-**, the GM says what happens (which may or may not involve marking a consequence).",
        },
        {
          id: "inescapable-pull",
          name: "Inescapable Pull",
          text: "You can use Siphon at up to *near* range, and on a 10+ you can choose to drag the victim closer.",
        },
        {
          id: "maelstrom",
          name: "Maelstrom",
          text: "When you **use Siphon**, you can mark a consequence before rolling to affect a number of victims within range. Roll +CON once, but roll damage separately for each target.",
        },
        {
          id: "dust-to-dust",
          name: "Dust to Dust",
          text: "When you **wear the ring and press it firmly against a work of mortal artifice**, mark a debility and then roll +CON: **on a 10+**, the artifice fails or is ruined (say how); **on a 7-9**, it is ruined (as per a 10+) but also mark a consequence; **on a 6-**, the GM says what happens (which may or may not involve marking a consequence.)",
        },
      ],
      consequences: [
        {
          id: "hlad-c1",
          text: "◻◻◻ A powerful earthquake strikes the area. Each time you choose this option, the quake is longer, more powerful, more destructive.",
        },
        {
          id: "hlad-c2",
          text: "The ring fuses to your flesh and bone and can no longer be removed without cutting off your finger.",
          children: [
            {
              id: "hlad-c2a",
              text: "The air in your presence is always noticeably colder, though you yourself are unharmed and unfazed by even the bitterest cold.",
            },
          ],
        },
        {
          id: "hlad-c3",
          text: "The ring wounds your soul, reducing your max HP by 4. Until your soul is healed, your instinct becomes \"Hunger: to fill the emptiness inside you with excess.\" Should you roll a 6- on Death's Door, you die and become a wraith (a monster in the GM's control).",
        },
        {
          id: "hlad-c4",
          text: "The ring opens a gaping vortex, sucking in the life-force of everything around it (d10 damage, *near, area, grabby*, ignores armor) and weakening stone and metal and wood. You can, perhaps, close the vortex through a force of will.",
        },
        {
          id: "hlad-c5",
          text: "The earth shakes. The ring tears at your life-force (1d10 damage, *messy*, ignores armor, mark all three debilities). The ring is gone and your hand is left a withered and palsied thing. And somewhere, a hole has opened in the world.",
        },
      ],
    },
  },
  {
    id: "azure-hand",
    name: "Azure Hand",
    tags: "◊, close, magical, awkward",
    weight: 1,
    description:
      "A thick staff of gray metal, topped with a plate of aetherium in the shape of a stylized hand. The palm is embossed with a cloud and lightning bolt, and the whole thing is more than a little top-heavy. It smells of ozone, and your spine never ceases to tingle in its presence.",
    frontMoves: [
      {
        name: "Bear the Azure Hand",
        text: "You sense sources, currents, and reservoirs of energy much like you sense the pull of gravity or the position of your own hand. You can closely study such energy and Seek Insight about it.",
      },
      {
        name: "Brandish the Azure Hand at a source of elemental energy",
        text: "Roll +CON: **on a 10+**, you gather the energy about the Hand in a swirling vortex for as long as you grip the staff or until you choose 1 from the list below; **on a 7-9**, as a 10+, but the vortex is unstable and maintaining it requires all your focus.\n\n- Direct the energy into a vessel able to contain it\n- Discharge the energy harmlessly into the earth\n- Fling the energy, rolling +INT to Let Fly (*thrown, dangerous*), inflicting damage and other effects of the GM's choosing\n- Use the energy to fuel or empower some other magic.\n\n**On a 6-**, instead of marking XP, mark 1.\n\nEach time you mark 1, ask the GM how the power goes out of control.",
      },
    ],
    marks: { max: 4 },
    mystery: {
      moves: [
        {
          id: "battery",
          name: "Battery",
          tracker: { label: "Stored Energy", max: 1 },
          text: "When you **gather elemental power about the Azure Hand**, you can choose to store the energy in the staff itself. It no longer requires your touch or focus to maintain. You cannot do this again until you use up the energy contained within (see reverse).",
        },
        {
          id: "eye-of-the-storm",
          name: "Eye of the Storm",
          text: "When you **grasp the Azure Hand and impose your will on the elements around you**, roll +CON: **on a 10+**, the elements calm or diminish in their power, and choose 2 from the list below; **on a 7-9**, the elements calm or diminish, and choose 1.\n\n- You suffer no consequence (otherwise, mark one)\n- The effect is far reaching, up to a mile around you (otherwise, it extends just a few paces)\n- You can maintain the effect easily (otherwise, it takes all of your concentration)",
        },
        {
          id: "resonance",
          name: "Resonance",
          subtitle: "Requires: Battery, Eye of the Storm",
          text: "When you **have captured a tremendous elemental force** (like that from a storm or wildfire) and **then channel it into the eddies of air or earth**, pick 1 from the list below and roll +INT: **on a 10+**, it comes to pass; **on a 7-9**, it will come to pass if you choose to mark a consequence; **on a 6-**, mark a consequence and prepare for the worst.\n\n- A potent storm or earthquake builds, unleashing itself within the next few hours.\n- The weather for the next few weeks is abnormal, hotter or colder, wetter or dryer, windier or more still, per your desires (though nothing too extreme).\n- The weather for the next few months is generally favorable; any steading in the area gains advantage to its next Seasons Change roll.",
        },
      ],
      consequences: [
        {
          id: "azure-c1",
          text: "◻◻◻ You are burned by the power you attempt to wield. Mark a debility and take 2d4 damage (ignores armor).",
        },
        {
          id: "azure-c2",
          text: "You become bound to the staff. You can call it to your hand from up to *far* range, but you fully suffer the effects of any harm or magic visited upon it.",
        },
        {
          id: "azure-c3",
          text: "Your eyes become a solid bluish white, darkening or brightening with your mood. You now see energy patterns, glowing brightly, which can obscure facial expressions and other details unless you focus.",
        },
        {
          id: "azure-c4",
          text: "Your skin takes on a bluish tint; your hair is streaked with white; the air about you thrums with power. Sensitive beings can easily sense your presence, even from afar.",
        },
        {
          id: "azure-c5",
          text: "Henceforth, any storm in your presence is unnaturally strong. If you spend a summer or a winter in a steading or within a day's march of one, the steading loses 1d4-1 Surplus due to storms.",
        },
        {
          id: "azure-c6",
          text: "Your body pulses with barely controlled energy. Henceforth, when you **roll +CON and get a 6-**, you unleash bolts of elemental power all about you (1d10 damage, *near, area, forceful, dangerous*) in addition to whatever else the GM says.",
        },
      ],
    },
  },
];
