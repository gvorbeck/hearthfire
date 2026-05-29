export interface ArcanaFollower {
  name: string;
  tags: string;
  hp: number;
  hpCount?: number;
  armor?: number;
  damage?: string;
  instinct: string;
  qualities?: string[];
  cost?: string;
}

export interface ArcanaMove {
  name: string;
  subtitle?: string;
  tracker?: { label: string; max: number };
  text: string;
  follower?: ArcanaFollower;
}

export interface MinorArcanum {
  id: string;
  name: string;
  tags?: string;
  provisions?: number;
  description: string;
  requirements: string[];
  move: ArcanaMove;
}

export const MINOR_ARCANA: MinorArcanum[] = [
  {
    id: '1',
    name: 'An old scroll case',
    tags: 'fragile',
    provisions: 1,
    description: 'A leather scroll case, cracked and age-worn. Inside is a tattered letter and a pair of small, bluish ingots. It\'s a letter, in an older Hillfolk dialect, from an apprentice to their master. It describes a mental exercise to draw latent power from aetherium.\n\nYou can learn **Laoj Daveth\'s Galvanic Infusion** from the scroll, but…',
    requirements: [
      '…you must translate the letter.',
      '…it\'ll take a few weeks of dedicated study.',
      '…you\'ll use up one of the aetherium ingots (or another source of aetherium).',
      '…you risk electrocuting yourself and/or using up the other ingot.',
    ],
    move: {
      name: 'Laoj Daveth\'s Galvanic Infusion',
      text: 'When you **touch a piece of aetherium and draw its power into yourself**, roll +CON: **on a 7+**, you absorb the power and gain 1d8 HP (even if this puts you above your max HP); **but on a 7-9**, the aetherium is drained and crumbles into a chalky mass of verdigris.\n\nThe spell lasts until you dismiss it or until you roll a 6- on any move. While it lasts, you need not sleep and remain highly alert and focused—gain advantage on any rolls with WIS.\n\nIf you remain awake for more than a few days, your body grows ever more exhausted and you risk hallucination, paranoia, and addiction.\n\nWhen *the spell ends*, you lose 1d8 HP.',
    },
  },
  {
    id: '2',
    name: 'A folktale',
    description: 'There\'s this old tale, about an old herb tender from Marshedge that tricks a fen-troll into eating an enchanted seedpod. She promises to go get the troll more food if he promises to then let her go. Of course, the troll breaks his word and tries to eat her, but the seedpod bursts into a mass of gwir-nettles when he does.\n\nYou can learn the secret of the enchanted seedpods, but need one of the following:',
    requirements: [
      'A Marshedge herbalist, steeped in lore, to teach you the ritual',
      'The spirit of a gwir-nettle, friendly or bound, to reveal the secrets of its birth',
    ],
    move: {
      name: 'Truth Seeds',
      text: 'When you **soak a pair of gwir-nettle seedpods in your own blood, whisper secrets over them, and say the words of power**, they become truth seeds (*magical*).\n\nWhen you and another **each eat a truth seed and make promises to each other**, the seeds stay in your guts and ensure that the promises are kept.\n\nWhen you **break your promise**, the truth seed in your gut sprouts violently into a full-grown gwir-nettle, dealing 1d10+3 damage with advantage (*messy*, ignores armor) and now you\'ve got a gwir-nettle growing out of you.\n\nIf the **other party breaks their promise**, they suffer the same fate.',
    },
  },
  {
    id: '3',
    name: 'A small, strange book',
    tags: 'fragile',
    description: 'A small manual written on what appears to be sheets of supple leaves. It is written in the common script but in a strangely poetic sequence of nonsense syllables.\n\nThe manual reveals the recipe for an elderberry wine that brims with Fae magic, but to learn the recipe, you either…',
    requirements: [
      '…need help from a Fae poet, or perhaps one of the Forest Folk;',
      '…risk getting the recipe wrong, poisoning or cursing whoever drinks the wine you brew.',
    ],
    move: {
      name: 'Old Mother\'s Wine',
      tracker: { label: 'Lost memories', max: 6 },
      text: 'When you **sacrifice a memory to a berry-laden elder tree**, tell us what you gave up. Mark 1 lost memory and roll 1d6; if you roll less than your lost memories, change your instinct and clear your marks.\n\nWhen you **harvest the berries and spend a season making wine from them**, gain a skin of Old Mother\'s Wine (5 uses, *magical*).\n\nWhen you **get tipsy on Old Mother\'s Wine**, expend a use. For a night and a day, your eyes are open to Fae magic, meaning:\n\n- You see the truth behind Fae illusions and glamours\n- You are immune to Fae enchantments\n- You can freely enter Fae domains and walk the Fae paths\n- Time passes normally for you while in Fae domains',
    },
  },
  {
    id: '4',
    name: 'A giant\'s dormitory',
    tags: 'magical',
    description: 'In a ruin of the Stone Lords is an old dwelling that bears the psychic imprint of its inhabitant, a stoneshaper of some considerable skill.\n\nWhen you *enter the dormitory*, you are overcome with a vision of this student inventing his first spell. You can learn this spell, but…',
    requirements: [
      '…you must have some talent for magic.',
      '…it will take weeks of repeated exposure and study.',
      '…you risk lasting harm to your physique and health.',
    ],
    move: {
      name: 'Aalz Galt\'s Sudden Sinkhole',
      text: 'When you **sing a rumbling note and focus your will upon a point of earth or stone**, mark a debility and roll +INT:\n\n**On a 10+**, the earth or stone that you focus on remains intact, but the earth or stone beneath it crumbles, dissolves, and flows away, creating an empty pocket about as wide as your arms can encircle and about as deep as you are tall. The surface seems stable, but is prone to crack or break under stress.\n\n**On a 7-9**, the song works as above, but it siphons even more energy from your body. Mark another debility and take 2d4 damage (ignores armor).',
    },
  },
  {
    id: '5',
    name: 'Carvings in a cave',
    description: 'At the bottom of a sinkhole is a limestone cave. A moldering skeleton slumps against one wall, showing signs of having been hanged. Yet carved into the cave walls are runes, caked over with mineral deposits.\n\nYou can study the runes and learn the secrets they contain, but…',
    requirements: [
      '…you must carefully restore the runes over a few weeks of work.',
      '…you risk ruining them as you work.',
      '…you must decipher the old writings, which are similar to Stone Lord runes.',
      '…it will then take a few days of study.',
    ],
    move: {
      name: 'Shell Game of Souls',
      subtitle: 'Souls (max CON)',
      tracker: { label: 'Souls', max: 3 },
      text: 'When you **touch a dying, intelligent being, speak their name and words of binding**, roll +INT: **on a 10+**, you bind their soul to your flesh; **on a 7-9**, you bind their soul but weaken yours—reduce your max HP by 1d4+1.\n\nYour flesh can bind a number of souls equal to your CON. They manifest in dreams and struggle for control when your mind or body are weak. Write their names here:\n\nWhen you **roll a 6- on Death\'s Door**, you can release a bound soul to go through the Last Door in your place. If you do, you survive as if you rolled a 7-9. Your body, though, still bears the marks of that which would have killed you.',
    },
  },
  {
    id: '6',
    name: 'A half-buried plaque',
    tags: 'cumbersome, magical',
    provisions: 2,
    description: 'A bronze plate poking out of the soil, somewhere in the Flats or near the Dread River. It\'s dented, a bit warped, with Maker-runes and esoteric diagrams etched into the surface. How the heck did it end up here?\n\nThe plate contains the workings of a spell, which you can learn but…',
    requirements: [
      '…you must first dig up & clean the plate.',
      '…you must decipher the Maker-runes.',
      '…it\'ll take a few weeks of study.',
      '…you risk harm to your voice, your hearing, and/or your neighbors as you practice.',
    ],
    move: {
      name: 'Thunderous Bellow',
      text: 'When you **channel the storm primeval and utter a thunderous bellow**, take 1d6 damage (ignores armor) and roll +CON: **on a 10+**, everyone nearby (except you) must choose 2; **on a 7-9**, everyone nearby (except you) must choose 1.\n\n- Drop what they\'re carrying and cover their ears\n- Be deafened and disoriented for a few moments\n- Stagger a few steps away from you',
    },
  },
  {
    id: '7',
    name: 'Runes around a ruined hall',
    tags: 'magical',
    description: 'In a ruined citadel of the Forge Lords, the grand hall lies empty. The throne is melted slag. The ceiling is shattered. The pillars are scorched and cracked. But intact around the outside of the room are a series of flowing runes. Close study reveals them to involve both fire and privacy.\n\nThe runes repeat themselves and can be copied, but…',
    requirements: [
      '…it takes a few hours of careful work.',
      '…you risk a transcription error, but to what effect?',
    ],
    move: {
      name: 'The Fiery Veil',
      text: 'When you **precisely inscribe the flowing runes of the fiery veil along the outside of an area**, the area is warded for as long as the runes remain intact.\n\nWhen anyone **tries to scry on the warded area from afar, or view it from the spirit realm**, they see only a curtain of fire. If they insist on peering through the curtain, they are burned for 1d10 damage (advantage, ignores armor) and appear to those inside as a ghostly image wreathed in flames.',
    },
  },
  {
    id: '8',
    name: 'A grim peat mound',
    description: 'Not far from Marshedge, a ways into Ferrier\'s Fen, lies a peat mound where no birds nest and flowers will not bloom. Since the town\'s founding, the people of Marshedge have buried certain criminals here, alive.\n\nOver the years, the land has birthed a spirit that hungers for the dying breaths of the condemned (*Book II*, page 85). It is young and eager, and can be set to work upon criminals, but only if you…',
    requirements: [
      '…find a way to communicate with it.',
      '…convince it that you will use its mark only to condemn the guilty.',
    ],
    move: {
      name: 'The Tomb-bog\'s Mark',
      text: 'When you **use mud from the tomb-bog to mark someone with the sign of Aratis and pronounce them guilty of a crime**, you can place a geas upon them. Phrase it as one of the following:\n\n- You must never again ____.\n- Henceforth, you must always seek to ____ when you have the chance.\n\nShould they **fail to follow the geas**, their life is forfeit and the tomb-bog spirit will track them down and smother them.\n\nShould they **prove themselves innocent to the tomb-bog spirit**, your life is forfeit instead.',
    },
  },
  {
    id: '9',
    name: 'A richly woven rug',
    tags: 'magical',
    provisions: 2,
    description: 'About 4 feet by 7 feet unfurled, woven with stylized patterns of fire and flame. Flickering Maker-runes can be seen in the weaving, always out of focus but hinting at power.\n\nYou can unlock the secrets of this rug, but you must first…',
    requirements: [
      '…be marked by fire, losing yourself to the panic or pain of burning.',
      '…then, spend weeks in meditation upon the rug and studying the now-clear runes.',
      '…allow yourself to be burned by a terrible flame, refusing to cry out and mastering your fear.',
    ],
    move: {
      name: 'Fear of the Flame',
      tracker: { label: 'Heat', max: 6 },
      text: 'When you **spend an hour or so on the rug, meditating on the fear of fire that all natural things possess**, you hold Terror and mark 1 Heat.\n\n**Terror**: When you **unleash the Terror you hold**, all who see you fear you as they would fear the flame primeval, until you dismiss the effect.\n\nWhen you **dismiss the effect**, roll 1d6. If the roll is less than your Heat, then clear all your Heat and you painfully manifest a permanent sign of your connection to the flames: a blistered scar, reddish skin, glowing eyes, a sulfurous smell, etc.\n\nWhen **a season passes without you unleashing Terror**, reduce your Heat by 1.',
    },
  },
  {
    id: '10',
    name: 'A tattered mantle',
    tags: 'warm, magical',
    provisions: 1,
    description: 'Found on a skeleton that has been stripped clean of flesh and that bears what can only be described as bite marks all along its bones. Close inspection of the mantle reveals sigils woven in silvery thread and human teeth sewn into the fringe like decorative beads.\n\nYou can unlock the power of this mantle by…',
    requirements: [
      '…wearing it for three days and three long, long nights, suffering through the nightmares.',
      '…bringing to heel the slavering wraiths that are tethered to it.',
    ],
    move: {
      name: 'Mantle Wraiths',
      text: 'When you **let slip the wraiths tethered to the mantle**, treat them as followers. They are loathe to return to the mantle; you must spend their Loyalty or Persuade them.',
      follower: {
        name: 'Mantle wraiths',
        tags: 'Group (3), spirit, undead, terrifying, vicious',
        hp: 13,
        hpCount: 3,
        armor: 1,
        damage: 'life drain d8 (*band*, ignores armor)',
        instinct: 'to run rampant',
        qualities: [
          'powerless in daylight',
          'Whisper their longings to the wearer',
          'Manifest a form of shadow and cold (harmed only by silver and salt)',
          'Hurl themselves at the living',
          'Suck the vitality from their prey',
        ],
        cost: 'souls feasted upon (Loyalty ◯◯◯)',
      },
    },
  },
  {
    id: '11',
    name: 'Rune-etched pillars',
    tags: 'magical',
    description: 'Deep under a giant, ruined fort is a vaulted chamber, once a storeroom but looted long, long ago. A giant skeleton lies just inside, face-down, its skull and ribs staved in.\n\nFour pillars support the roof, carved with a series of huge runes that thrum with power. You can unlock their secrets, but…',
    requirements: [
      '…you must spend a few days studying the runes and memorizing their sequence.',
      '…you must meditate for a few weeks on the magic that infuses them.',
      '…you risk triggering the spell contained in the runes, and collapsing the entire structure.',
    ],
    move: {
      name: 'Shattering Words of Aalz Childric',
      text: 'When you **carve the shattering words of Aalz Childric into stone or rock**, designate a key word or phrase.\n\nWhen you or another **speaks the key word or phrase and wills the spell to trigger**, you roll +CON: **on a 10+**, the rune-carved stone shatters and is immediately reduced to rubble; **on a 7-9**, the stone cracks and buckles, slowly breaking apart into a number of pieces.',
    },
  },
  {
    id: '12',
    name: 'A huge wooden sphere',
    tags: 'immobile',
    description: 'Half-buried and largely overgrown, about 4 feet across and weighing hundreds of pounds. It is strangely well preserved and adorned with intricate pictograms. A handful of other spheres rot nearby.\n\nThe pictograms depict some sort of recipe, which you can learn but you must…',
    requirements: [
      '…first dig up and clean the sphere.',
      '…spend weeks studying the glyphs.',
      '…acquire some fresh ffyrnig root.',
      '…acquire the bile of a wild boar.',
      '…you risk getting the recipe wrong, and lethally so.',
    ],
    move: {
      name: 'Ffyrnig Tonic',
      text: 'When you **pickle fresh ffyrnig root in a suspension of boar bile for two full moons**, it becomes a skin of ffyrnig tonic (3 uses, *magical*).\n\nWhen you **take a draught of ffyrnig tonic**, pick 1:\n\n- Regain HP equal to ½ half your max\n- Clear a debility\n\nAlso, you have advantage on your next roll to take bold, physical action. But until you take such an action, you have disadvantage on any rolls that require patience, care, or thoughtfulness.\n\nWhen you **drink a second draught of ffyrnig tonic before getting a good night\'s sleep**, it has no effect other than to make you ill (mark a debility).',
    },
  },
  {
    id: '13',
    name: 'A scroll & a bone flute',
    tags: 'magical',
    provisions: 1,
    description: 'A scroll, written in a cramped hand and seemingly nonsensical script, with a series of graph-like diagrams. It is accompanied by a flute of bone (from a human arm?). The notes reveal themselves to be a cipher; the graph is perhaps the notation for a song.\n\nYou can unlock the secrets of the scroll and flute, but…',
    requirements: [
      '…you must first decipher the notes, which will take a few weeks of effort.',
      '…the first time you use the flute, you risk getting the music wrong and aggravating the dool spirit.',
    ],
    move: {
      name: 'Song of the Dool Trees',
      text: 'When you **stand among dool trees and play the proper tune on a flute of a murderer\'s bone**, you summon a dool spirit and bind it to your service. Treat it as a follower. Only one dool spirit will serve you at a time.',
      follower: {
        name: 'Dool spirit',
        tags: 'Spirit, terrifying, stealthy, devious',
        hp: 13,
        armor: 1,
        damage: 'feast on fear d6 (*hand*, *close*, ignores armor, disadvantage)',
        instinct: 'to take things too far',
        qualities: [
          'powerless in bright light',
          'Sense a victim\'s doubt and worries',
          'Shape sound and shadow to unnerve and frighten',
          'Manifest as its victim\'s fears (harmed only by one who masters their fear)',
        ],
        cost: 'new, exquisite fears (Loyalty ◯◯◯)',
      },
    },
  },
  {
    id: '14',
    name: 'A clear, natural pool',
    description: 'High in the hills, a stream of snowmelt fills a deep pool in the rocks before flowing on. At the bottom of the pool is a large deposit of lodestone. Rusted old blades (many sized for giants) can be seen clinging to the lodestone.\n\nThere is magic here; to unlock its secrets, either…',
    requirements: [
      '…spend a week or so experimenting at the pool, then roll +INT: on a 10+, you figure it out; on a 7-9, no luck; on a 6-, you are interrupted by danger;',
      '…get a firsthand account of the pool\'s powers in use.',
    ],
    move: {
      name: 'Ward of Still Waters',
      tracker: { label: 'Strain', max: 7 },
      text: 'When you **cut yourself with iron or steel and toss the blooded metal into the pool**, you form a bond with the waters. So long as you carry a vial of the pool\'s water on your person, you are protected by the ward of still waters.\n\nWhen you are so protected and **subject to magic that attempts to sense or affect your thoughts, actions, or emotions**, the magic targets the still waters of the pool instead—possibly befuddling the magic\'s source.\n\nEach time the ward of still waters protects you, mark 1 Strain and then roll 1d6. If your roll is less than your current Strain, the water you carry loses its potency. When you **return to the pool and renew your bond**, clear all Strain.',
    },
  },
  {
    id: '15',
    name: 'An oversized codex',
    tags: 'immobile, fragile',
    description: 'A book, about 2 feet by 3 feet, just over 6 inches tall when closed. The cover is made of silvery cedarwood planks. The sheets are made of fine vellum, stretched from the hides of some enormous beast.\n\nThe pages are full of calligraphy, large and precise, with many diagrams showing meditative poses and strange geometric patterns related to heat, water, and ice.\n\nTo unlock the codex\'s mysteries, you must…',
    requirements: [
      '…decipher the script, written in a form of the Rime Lords\' alphabet.',
      '…spend months studying the text and practicing the techniques therein.',
      '…risk permanently damaging your health as you master them.',
    ],
    move: {
      name: 'Ice Weaving',
      text: 'When you **will dark ice to form**, lose 1 HP, +1 HP for each of the following you desire:\n\n- It\'s enough to make a small wall or encase a person (else, it\'s ◇◇ at most)\n- It\'s hard as stone\n- It\'s solid to spirits, able to block/harm/hinder them\n\nThen, roll +CON: **on a 10+**, pick 2; **on a 7-9**, pick 1, or pick 2 and lose 2 more HP.\n\n- It forms quickly, even violently (else, it takes minutes, even hours)\n- It forms at up to *near* range (else, it forms at only *hand* range)\n- Its shape is as intricate as you can imagine (else, it\'s just a crude block)\n\nThe ice persists until it\'s broken, melted by intense heat, or you let it melt. You cannot regain the spent HP while it persists.',
    },
  },
  {
    id: '16',
    name: 'A chain of rusty locks',
    tags: 'magical',
    provisions: 1,
    description: 'A chain, six links long, each link hung with a corroded bronze padlock. 1d4+1 locks bear a stylized face, frozen in a rusty grimace. The keys to these locks are lost to the ages.\n\nWhen you **hold one of the face-adorned locks and look into its eyes**, you can hear the voice of the departed soul bound within: hateful, desperate, pleading to be set free.\n\nYou can master these locks by…',
    requirements: [
      '…convincing one of the shades to reveal how it was captured.',
      '…convincing a shade to reveal what happens when a lock is opened.',
      '…finding a way to open the locks.',
    ],
    move: {
      name: 'The Six Locks of Sajua',
      tracker: { label: 'Disturbance', max: 7 },
      text: 'When you **smear the blood of the dying onto an open Lock of Sajua and then close the lock**, roll +CON: **on a 10+**, their soul is bound in the lock; **on a 7-9**, their soul is bound, but all mundane metal in your presence rusts or tarnishes, corrodes and weakens.\n\nWhen you **extract a promise from a bound soul and then open the lock that binds it**, the soul is compelled to fulfill the letter of its promise before it goes its own way. Tell the GM to treat it as a ghost (though not necessarily as a follower); the open lock serves as its tether, at least for now.\n\nEach time you release a soul, mark 1 Disturbance and roll 1d6. If you roll less than your Disturbance, you hear the call of the Pale Hunter in the distance. Expect a visit soon.',
    },
  },
  {
    id: '17',
    name: 'A gold ring',
    tags: 'magical',
    description: 'This simple, golden band catches the light and shines, even in darkness. Its very presence fills goodly people with peace and hope, and servants of darkness with jealous hate.\n\nYou can unlock the secrets of this ring, but must first…',
    requirements: [
      '…wear the ring continuously for 40 days, witnessing the sunrise each day.',
      '…perform an act of charity while wearing the ring, one that changes the recipient\'s life.',
      '…participate in the devout and proper worship of Helior.',
    ],
    move: {
      name: 'Helior\'s Shining Ring',
      tracker: { label: 'Daylight', max: 3 },
      text: 'When you **spend the better part of a day wearing the ring and worshipping Helior in full sunlight**, hold 1 Daylight.\n\nWhen you **wear the ring in shadows or darkness and spend 1 Daylight**, the ring shines forth with holy light (*near*, *area*) that is painful for creatures of darkness to look at. It glows for a few hours, until you extinguish it, or until another effect (like the Lightbearer\'s Invocations) uses up its fuel or snuffs it out.\n\nAlas, the ring also shines like a psychic beacon while it shines, alerting servants of darkness for miles around to your presence and location.',
    },
  },
  {
    id: '18',
    name: 'A path in the woods',
    description: 'Deep in the Great Wood sits a stone, carved with the crude pictograms of the Forest Folk, showing a trail fraught with trials and leading to great power.\n\nIf you **set forth upon the trail at midsummer**, you can unlock its mysteries, but you must…',
    requirements: [
      '…follow the twisting paths in silence, until you spy the White Hart.',
      '…chase the Hart for miles and miles, until it leads you to the Tree of Nerth.',
      '…wrestle the strange serpent that lives in the tree (*Book II*, page 371), crushing the life from it and eating its still-warm heart.',
      'Should multiple people follow the path on a given midsummer, only one of them can reach the Tree of Nerth.',
    ],
    move: {
      name: 'Nerth Serpent\'s Vigor',
      tracker: { label: 'Vitality', max: 3 },
      text: 'When you **crush the life from the Nerth Serpent and devour its still-warm heart**, hold 3 Vitality. While you hold Vitality, you age very slowly.\n\nSpend Vitality 1-for-1 to:\n\n- Shrug off a poison, sickness, or curse\n- Survive a lethal wound or injury\n- Recover fully from a permanent injury or impairment (with a few days\' rest)\n- Perform a feat of extraordinary strength, prowess, or endurance\n\nEach time you spend Vitality, you manifest a permanent mark of the wild (antlers, hide-like skin, animal eyes, etc.) or such a mark becomes more pronounced. Tell us what it is.',
    },
  },
  {
    id: '19',
    name: 'A giant oak leaf',
    tags: 'magical',
    provisions: 1,
    description: 'About 6 feet long, waxy and rigid, shimmering with golden iridescence. Is this truly a leaf from the Golden Oak?\n\nYou can turn the leaf into a wondrous cloak, but to do so you must…',
    requirements: [
      '…learn the secrets of its making (from a Fae, a spirit of the wild, or perhaps a favored servant of Danu).',
      '…tan the leaf with a mix of lime-water, crow guano, the brain of a cave bear, and your own blood.',
      '…have it fitted to your exact measurements by a tailor of *exceptional* skill.',
    ],
    move: {
      name: 'Goldleaf Cloak',
      subtitle: '◇, warm, magical',
      text: 'When you **wear a goldleaf cloak that you have tanned yourself and that has been fitted to your exact measurements**, then all of these are true:\n\n- You are immune to effects that drain, steal, or snuff out your vitality, energy, or life force.\n- You are immune to effects that calm or dampen your emotions.\n- You are surrounded by a constant golden glow (*band*, *area*), making it nearly impossible to hide.\n\nWhen you **die and are buried in the earth, wrapped in your goldleaf cloak**, you return to life as if you were buried at the roots of the Golden Oak. Your cloak, however, rots away to mulch and tatters.',
    },
  },
  {
    id: '20',
    name: 'A time-worn missive',
    tags: 'fragile',
    description: 'A letter on faded, pocked papyrus, written in an archaic form of Southern. It invites "Boas" to visit by way of "your nearest portal," with instructions and a circle of arcane sigils. "Ask for Calcus when you arrive."\n\nTo unlock the mysteries of these portals, you must…',
    requirements: [
      '…translate the archaic dialect.',
      '…find a portal (other than the one depicted in the missive).',
      '…determine how to "invoke the axiom of local contagion."',
      '…acquire a ◇ pouch of powdered cinnabar (1d4+8 uses, Value 2).',
      '…attempt casting the spell the first time, and risk miscasting it.',
    ],
    move: {
      name: 'Opening the Way',
      subtitle: '◇ pouch of powdered cinnabar (◯◯◯ ◯◯◯ ◯◯◯ uses, Value 2)',
      text: 'When you **use ink of powdered cinnabar to carefully trace the sigils of one portal inside the permanent sigils of another, and then invoke the axiom of local contagion**, a passage opens between the portals and remains until you leave their presence or dismiss the axiom. The sigils you drew then vanish. Passage through the portals is usually safe and instantaneous.\n\nWhen you **stand before one portal and hold the sigils of another portal perfectly in your mind**, mark a debility to manifest those sigils as lines of glowing light. When you **then invoke the axiom of local contagion**, roll +INT: **on a 10+**, the portals open, but close as soon as your focus falters; **on a 7-9**, as a 10+ but only if you mark another debility; **on a 6-**, mark a debility and pass out from the strain.',
    },
  },
  {
    id: '21',
    name: 'A strange pendant',
    tags: 'magical',
    description: 'A strange charm on a simple leather cord, like a scale of some shimmering material. It\'s cold and clammy to the touch. When you first put it on, everyone nearby shivers from cold. Soon thereafter, you start to hear the raspy, inhaling whispers.\n\nTo unlock the secrets of the pendant…',
    requirements: [
      '…wear it ceaselessly for a lunar cycle, answering its questions honestly.',
      '…hold yourself underwater until you risk drowning.',
      '…drown another person, and offer their last gasps to the pendant.',
    ],
    move: {
      name: 'The Drowning Scale',
      tracker: { label: 'Breath', max: 3 },
      text: 'When you **lean over a dying person, suck out their final breath, and breathe it into the pendant**, roll +CON: **on a 10+**, hold +1 Breath; **on a 7-9**, pick 1:\n\n- Hold 1 Breath, but it tears at your lungs; mark *miserable* and suffer a nasty coughing fit.\n- The pendant greedily sucks in the last breath, grows colder, and sighs; you, alas, gain no benefit.\n\nSo long as you hold Breath, you are unfazed and unharmed by extreme cold. Spend 1 Breath to go without air for as long as an hour.\n\nWhen you **remove the pendant**, lose any Breath you hold.',
    },
  },
  {
    id: '22',
    name: 'A timeless vault',
    tags: 'magical',
    description: 'High in the hills or mountains, a pair of massive stone doors are set into the hillside. The markings outside are faded and covered in lichen. The doors aren\'t locked; one lies a bit ajar. Inside, the vault and its contents are untouched by time, free of dust or mold. Clearly some magic is afoot.\n\nTo unlock the secrets of this place\'s stasis…',
    requirements: [
      '…find and reveal the hidden runes that anchor the magic.',
      '…spend a few hours copying them, risking an error.',
      '…spend weeks tracing the runes on objects, until they gleam silver and vanish.',
    ],
    move: {
      name: 'Preserving Runes',
      text: 'When you **trace the runes along the inside of a room or container**, they gleam silver and fade, preserving the contents from dust, spoilage, rust, etc. Lose 1 HP, plus 1 HP for each of the following that are true:\n\n- The container/room is more than a few feet long in any dimension\n- The container is portable (else, the effect ends if it is moved)\n- The effect lasts indefinitely, as long as the runes are intact (else, it starts when the room/container is sealed and ends when it is unsealed)\n\nOnce the runes are in place, roll +CON: **on a 10+**, you regain the lost HP normally; **on a 7-9**, you can\'t regain the lost HP until a season passes *or* the effect ends, whichever comes first; **on a 6-**, you can\'t regain the lost HP until the effect ends and then a season passes (and don\'t mark XP).',
    },
  },
  {
    id: '23',
    name: 'A sealed cave',
    tags: 'magical',
    description: 'High in the hills or mountains, one can find a bricked-over cave mouth. Inside lie dozens of corpses, preserved for centuries by the cold. Many have malformations in the jaw, oversized teeth, elongated fingers that taper to claws. Few show signs of violence; they appear to have just laid down and died.\n\nIndeed, the looping glyphs carved all over the cave walls sap your will to struggle, to fight, to do much of… anything. You can learn their mysteries, but…',
    requirements: [
      '…it\'ll take days of careful transcription, haunted by morose shades.',
      '…you risk succumbing to the ennui of the place.',
    ],
    move: {
      name: 'Peacebond',
      text: 'When you **mark a place with the peace-bond glyphs**, violence (even to defend oneself) is suppressed in the area as long as the glyphs remain. The longer one stays in a peacebonded area, and the more tightly woven the glyphs are, the greater the effect.\n\nWhen you **attempt to commit violence within a peacebonded area, or to harm the peacebond glyphs themselves**, you hesitate.\n\nIf you **will yourself to continue**, lose 1d4 HP and roll +WIS: **on a 10+**, go for it; **on a 7-9**, you act but have disadvantage on any rolls to commit violence (including damage); **on a 6-**, you fail to act and mark *dazed*.',
    },
  },
  {
    id: '24',
    name: 'A... key?',
    tags: 'magical, terrifying',
    description: 'Secreted away in some Makers\' trove is a gleaming white thing, like a key, I guess, but not a specific key, more like the *idea* of keyness. Hurts to look right at it; makes you aware of your own dying flesh.\n\nYou don\'t unlock this key\'s mysteries, so much as it unlocks you. But only if you…',
    requirements: [
      '…master your fear and force yourself to touch it.',
      '…hold tight as it wracks your mind and soul, refusing to let go.',
      '…spend a few weeks dealing with terrible migraines and flashes of color, learning to calm and control your mind\'s new eye.',
    ],
    move: {
      name: 'The Eye, Opened',
      text: 'When you **spend a few minutes quietly meditating and opening your mind\'s eye**, it appears on your forehead as a shining point of light. Base matter and energy are dim and colorless to you, but you see minds and auras in luminous detail.\n\nWhile your **mind\'s eye is open**, you can ask the GM "What thinking entities are present here?" and get an honest answer.\n\nWhen you **Seek Insight while your mind\'s eye is open**, the questions you can ask become these instead:\n\n- Are they lying or trying to mislead?\n- What are they really feeling right now?\n- What do they intend to do?\n- What here are they most afraid of?\n- Is something controlling their mind, emotions, or actions, and if so, what?',
    },
  },
  {
    id: '25',
    name: 'A crumbling arch',
    tags: 'magical',
    description: 'On a rare dry spot in Ferrier\'s Fen, besieged by foulness, is an ancient arch that still—improbably—stands. Lichen and moss grow thick and healthy, but the keystone remains clear, engraved with a sigil that makes the eyes water and that drives evil away.\n\nYou can learn the secrets of the sanctifying mark, but to do so you must…',
    requirements: [
      '…purify yourself in fresh, clean water.',
      '…calm your mind, gaze upon the sigil, and roll +WIS: on a 10+, the sigil becomes clear; on a 7-9, the sigil will become clear after a few more days in contemplation; on a 6-, the sigil is beyond your ability to learn.',
      '…spend a few days memorizing and practicing the sigil.',
    ],
    move: {
      name: 'Sanctifying Mark',
      text: 'When you **mark an object with the sigil of sanctification**, it repels beings of darkness, chaos, and death. Each time you place the mark, part of you (eyes, hair, skin, tongue, etc.) becomes paler, eventually turning a shocking white.\n\nWhen a **being of darkness, chaos, or death first tests the power of your mark**, roll +INT: **on a 10+**, all such creatures are kept at bay so long as your mark remains inviolate; **on a 7-9**, such creatures feel the urge to flee and are held back for now, but powerful entities can force themselves to ignore it.',
    },
  },
  {
    id: '26',
    name: 'A strange skull and antlers',
    tags: 'immobile, magical',
    description: 'A skull, the size of a horse\'s head but clearly not a horse—nor a drake, nor a wolf, nor a bear. For none of those beasts would bear such mighty antlers as those affixed to this skull. Looking closely, one sees the whorls and twists of ancient glyphs carved into the bone. Those in its presence often feel a draft, as if someone left a door ajar.\n\nTo unlock the secrets of this relic, you…',
    requirements: [
      '…must learn the name of the shade whose skull this was;',
      '…use the Blessed\'s Call the Spirits move to call up the shade.',
    ],
    move: {
      name: 'The Green Lord\'s Shade',
      text: 'When you **make an offering of good liquor, fresh fruit, or fresh-cooked meat and call up the shade of the skull**, it manifests before you in shadows.\n\nThe shade knows much about ancient times, the Green Lords, and their workings. It has no power, but can answer questions. Before it does, it will demand the right to "ride" you and experience the pleasures of living. (**Instinct** to fulfill its increasingly specific longings.)\n\nWhile it rides you, the shade communicates only through impulse and desire. When it **compels you to act against your wishes**, mark XP if you comply. If you resist, you are Defying Danger.',
    },
  },
  {
    id: '27',
    name: 'A stretched vellum',
    tags: 'fragile',
    provisions: 2,
    description: 'Stretched taut on a wooden frame, this old vellum is filled with the intricate and looping glyphs of the Green Lords. Drawings show creatures changing to have traits of other beasts. It seems to be the foundation for some sort of spell.\n\nTo unlock its mysteries and learn the spell, you must…',
    requirements: [
      '…decipher the Green Lords\' glyphs.',
      '…spend a few weeks studying and pondering them.',
      '…experiment on a beast of at least *small* size, like a goat, pig, or hound. You risk killing, crippling, or horribly mutating the beast, and possibly driving it mad.',
    ],
    move: {
      name: 'Chimeric Transmogrification',
      text: 'When you **hold forth a bit of one beast (fur, bone, etc.) and speak the words of chimeric transmogrification upon another**, roll +INT: **on a 10+**, the spell works; **on a 7-9**, the spell works but only if you mark a debility.\n\nWhen **the spell works**, roll 1d10+CON. If your roll **equals or exceeds the target\'s current HP**, name a feature of the beast you hold—the target\'s form twists and buckles, gaining that feature until they sleep for a few hours. The experience is disorienting and alarming; most beasts and people will panic. If you roll **less than the target\'s current HP**, their form twists and buckles alarmingly for a few seconds, but they fight off the transformation. **Either way**, the bit of the beast you hold is lost, shriveling away to nothing.',
    },
  },
  {
    id: '28',
    name: 'A patch of rainbow moss',
    tags: 'magical',
    description: 'In the Great Wood, one can find a copse of many different types of tree, the light dim beneath their canopy and the ground knobbly with interwoven roots. At the center: a patch of thick, multi-hued moss.\n\nTo unlock the mysteries of this place, you must…',
    requirements: [
      '…lie down in the moss and let its tendrils fuse with your skin.',
      '…let your consciousness drift into the forest itself, at the risk of losing yourself or drawing the ire of hostile spirits.',
      '…spend weeks visiting the moss, setting your mind adrift, learning to perceive the world through the forest\'s senses.',
    ],
    move: {
      name: 'The Sylvan Web',
      text: 'When you **lie down in the rainbow moss and cast your mind into the Great Wood**, say what you are looking for and roll +WIS: **on a 10+**, pick 3; **on a 7-9**, pick 1.\n\n- You learn the location of your quarry\n- You get a sense of your quarry\'s recent activities, or the activity surrounding it\n- You discover something unexpected about the forest, or that which can be found within it (ask the GM what you learn)\n- You spend only an hour or so adrift (else, you spend all day)\n\nWhatever you learn, it is limited by and filtered through the senses the forest.',
    },
  },
  {
    id: '29',
    name: 'A cloak, richly embroidered',
    tags: 'magical, warm',
    provisions: 1,
    description: 'An exquisitely fine wool, dyed a pale blue-gray and embroidered with stylized clouds. The edge boasts blue-white runes stitched with aetherium wire. It feels damp, smells of rain and ozone, and flutters in a breeze that isn\'t there.\n\nWhen you **don the cloak**, you become aware of the presence bound within, thrumming and impatient. To unlock the mysteries of the cloak, you must…',
    requirements: [
      '…learn the name of the bound spirit.',
      '…decipher the word of command, embroidered in ancient Maker-script.',
      '…bend the spirit to your will, risking its (destructive) escape.',
    ],
    move: {
      name: 'Flying Cloak',
      text: 'When you **wear the cloak and speak the word of command**, the storm-spirit in the cloak springs to life and obeys you as a follower. It never wants to land; you must spend its Loyalty or Persuade it.',
      follower: {
        name: 'The Spirit in the Cloak',
        tags: 'Spirit, magical, proud, mute',
        hp: 13,
        armor: 1,
        damage: 'lashing wind, rain, debris d6 (*near*, *area*)',
        instinct: 'to "not hear" your commands',
        qualities: [
          'Bear its master aloft on a cushion of swirling winds',
          'Manifest a storm as it flies',
          'Wreak havoc on its surroundings',
          'Fling lightning from a raging storm, d10+3 (*far*, *forceful*, *reload*)',
        ],
        cost: 'flying about for hours (Loyalty ◯◯◯)',
      },
    },
  },
  {
    id: '30',
    name: 'A beaded satchel',
    tags: 'magical',
    provisions: 1,
    description: 'Made of thick, stiff leather and decorated with impossibly fine beadwork. The pattern shows a fruit-laden tree sheltering various game and produce and grains. The specifics often change when you aren\'t looking.\n\nThe satchel is home to a number of spirits of autumn and plenty. To unlock the satchel\'s secrets and gain the spirits\' aid, you must…',
    requirements: [
      '…imbibe a prodigious, dangerous quantity of alcohol.',
      '…while thoroughly drunk, commune with the tethered spirits (**Instinct** to be genuinely, awkwardly caring and giving) and win their friendship.',
      '…feed the satchel 1 Surplus of freshly harvested foodstuffs (which shouldn\'t possibly fit, but does).',
    ],
    move: {
      name: 'Satchel of Plenty',
      text: 'When you **feed the satchel 1 Surplus of freshly harvested foodstuffs**, it fits even though it should not. Until next autumn\'s harvest, the satchel will provide 1 use of provisions each day. They are fresh and nourishing, but different each time (and not at all what you fed the satchel).\n\n**1d6 Today\'s food is...**\n1 — Actively unpleasant, needs cooking\n2 — Bland but tolerable, needs cooking\n3 — Delicious, needs cooking\n4 — Actively unpleasant, ready to eat\n5 — Bland but tolerable, ready to eat\n6 — Delicious, ready to eat\n\nWhen you **draw more than 1 use of provisions from the satchel in a given day**, it provides up to 10 uses but will produce no more until you feed it again next autumn.',
    },
  },
  {
    id: '31',
    name: 'A cracked flute',
    tags: 'crude, magical',
    provisions: 1,
    description: 'A long, thick flute carved of redwood, with a thin but visible crack along the underside. It easily catches the wind and makes a piping sound. Anyone who plays a few notes on the flute can tell there\'s some magic here.\n\nWhen you **spend a few days practicing, playing the flute where the wind can hear you**, roll +CHA: on a 10+, mark 1 circle; on a 7-9, mark 1 circle, but you summon an irate zephyr spirit; on a 6-, you make no progress but do manage to summon an irate zephyr.\n\n◯◯◯\n\nWhen you **mark all three circles**, you unlock the mysteries of the flute.',
    requirements: [
      'When you **mark all three circles**, you unlock the mysteries of the flute.',
    ],
    move: {
      name: 'Dancing Wind Spirit',
      text: 'When you **play a tune to make the wind itself dance**, the andalau (zephyr spirit) tied to the flute manifests. Treat it as a follower; it holds 1 Loyalty to start. When you **dismiss the spirit while it holds no Loyalty**, the flute splits and falls apart; the andalau is set free.',
      follower: {
        name: 'The Andalau of the Flute',
        tags: 'Spirit, tiny, stealthy, mischievous',
        hp: 8,
        armor: 0,
        damage: 'none',
        instinct: 'to play and frolic',
        qualities: [
          'Manifest as a fluttering gust of wind (harmed only by salt)',
          'Deliver a whispery message',
          'Flit things about (dust, leaves, etc.)',
          'Annoy or spook someone',
        ],
        cost: 'entertainment (Loyalty ◯◯◯)',
      },
    },
  },
  {
    id: '32',
    name: 'A wolf pelt',
    tags: 'magical, warm',
    description: 'It must have been a majestic beast, finely preserved with pale stones for eyes and a clip to wear it like a hooded cape. But no matter how you scrub, the red stains never come off its teeth.\n\nThe pelt is home to a powerful spirit, not just of a wolf but of The Hunt itself. To unlock its secrets, you must…',
    requirements: [
      '…hunt a beast by moonlight, alone, while wearing the pelt.',
      '…tear out its liver with your bare hands or teeth and eat it, raw.',
    ],
    move: {
      name: 'Call of the Hunt',
      text: 'When you **howl at the rising moon, face smeared in blood and wearing only the pelt**, you take on the aspect of a wolf and call a pack to your side. Name your quarry and roll…\n\n… +1 if you have their scent;\n… +1 if they are alone, but -1 if not; and\n… -1 if they would not fear a pack of wolves.\n\n**On 7+**, you corner your prey and deal 2d6+4 damage (*messy*) before the pack disperses and you cast off your wolf-self; **on a 10+**, also pick 1; **on a 7-9**, also pick 2.\n\n- Your pack savages one or more innocents\n- You suffer 2d6+4 *messy* damage yourself\n- Your instinct becomes "to act like a bloodthirsty wolf" until you Level Up.\n\n**On a 6-**, your prey eludes you and you must still pick 2 from the list above.',
    },
  },
  {
    id: '33',
    name: 'A sunken tablet',
    tags: 'immobile',
    description: 'A big old chunk of stone, maybe 5 feet across, covered in mud and algae. There are Maker-runes on it, barely visible. Runes for the earth, and spirits, and rejuvenation.\n\nThe tablet reveals the workings for a ritual, which you can learn if you…',
    requirements: [
      '…extract the tablet from the muck.',
      '…carefully clean it.',
      '…decipher the Maker-runes.',
      '…study the runes for a few weeks.',
      '…practice casting the spell, at the risk of harming the nearby soil or waking something dangerous from the earth.',
    ],
    move: {
      name: 'Convocation of the Soil',
      text: 'When you **spill your blood on the soil and speak the words of convocation**, the spirits of the soil will stir and wake, filling the soil with life and energy and nutrients.\n\nWhen you **cast this spell on the fields in early spring, spilling a scary amount of your blood**, mark all three debilities and lose all but 1 HP. If the steading spends 1 Surplus to plant in the fallow fields, this autumn\'s harvest will generate 1d4+1 extra Surplus.\n\nHowever, you must roll +WIS: **on a 10+**, there is no consequence; **on a 7-9**, before midsummer, you must water the soil with the lifeblood of a large, healthy beast (like a horse, mule, wisent, or aurochs) or else the extra crops will fail and the extra Surplus will be lost; **on a 6-**, the spell works but you stir some dangerous spirit or growth from the soil, or set free some evil imprisoned in the earth.',
    },
  },
  {
    id: '34',
    name: 'A rusty cauldron',
    tags: 'immobile, magical',
    description: 'Big enough for a grown man to crawl inside, pitted and scratched, engraved with whorly rune-like patterns. The whole thing is caked with rust. At least, you hope that\'s rust.\n\nThe thing has a sinister feel, and you can sense its power. To unlock the cauldron\'s mysteries, you must…',
    requirements: [
      '…thoroughly scrub the rust from the cauldron.',
      '…spend seven nights sleeping in the cauldron, dreaming foul dreams, marking a debility each time.',
      '…boil the bones of a beast that you honestly loved or valued, mixing in some of your fresh blood.',
      '…bring the wretched thing that arises under your control.',
    ],
    move: {
      name: 'Unliving Chimera',
      text: 'When you **boil the bones of beasts in the cauldron and stir in your own fresh blood**, mark up to 3 debilities. An unliving chimera rises from the cauldron. Treat it as a follower, with a tag for each beast whose bones you used (*bear-like*, *owl-like*, etc.).\n\nFor each debility you marked, pick 1:\n- It is stable (else, it falls apart in a day)\n- It is not *clumsy*\n- Replace its instinct with "to shun light"',
      follower: {
        name: 'Unliving chimera',
        tags: 'Undead, construct, terrifying, clumsy',
        hp: 3,
        armor: 4,
        damage: 'varies d6 (*band*, maybe others)',
        instinct: 'to get confused and lash out',
        qualities: [
          'Do something one of its component beasts could do',
          'Moan, wretchedly and disturbingly',
        ],
        cost: 'lots of fresh blood (Loyalty ◯◯◯)',
      },
    },
  },
  {
    id: '35',
    name: 'A large wooden jar',
    tags: 'cumbersome, fragile, magical',
    provisions: 2,
    description: '30 inches tall and carved of yew, with a lid shaped like a horned lion and sealed with wax. Its surface is cracked and speared with shards of red crystal. When you touch it, you can feel great annoyance and just a hint of fear.\n\nTo unlock the jar\'s mysteries, you must…',
    requirements: [
      '…wash its surface with your own fresh blood (lose 1d10 HP and mark a debility).',
      '…commune with the spirit of the haughty Green Lord to whom this jar is bound.',
      '…learn to use the red crystals to torment the Green Lord\'s spirit.',
      '…convince the bound Green Lord spirit to change your form.',
      'If **the jar is opened**, all its magic is lost.',
    ],
    move: {
      name: 'Impudent Polymorph',
      tracker: { label: 'Ire', max: 9 },
      text: 'When you **interrupt the idyllic afterlife of the Green Lord bound to the jar and demand that it change your form**, describe the change and pick as many as you dare:\n\n- The change lasts as long as you like (else, it lasts till you get a 6- on a move)\n- The change is quick and easy (else, it takes minutes or even hours)\n- You adapt to the new form quickly (else, mark a debility)\n- Pick 2 of your stats; swap their values until the change ends\n\nThen roll +CHA: **on a 10+**, the spirit works the change, just as you asked; **on a 7-9**, it works the change, but you gain Ire equal to the number of choices you\'ve made; **on a 6-**, the spirit rebels and wracks your body, dealing 1d10 damage per Ire you hold. If you survive, clear all Ire.',
    },
  },
  {
    id: '36',
    name: 'A makerglass chime',
    tags: 'indestructible, magical, loud, dangerous',
    provisions: 2,
    description: 'A cylinder about 4 feet long and 3 inches wide, the glass surprisingly thin. It rings with a rich, sonorous chime when struck softly. When struck firmly, the sound is almost deafening and causes a rippling pattern to appear on the surface of nearby stone, crystal, or mundane glass.\n\nThe chime is a powerful tool, if you can unlock its secrets. To do so…',
    requirements: [
      '…grasp it firmly and deliver a solid, mighty blow, rolling +CON: on a 10+, you\'ve got it; on a 7-9, mark a debility and you\'ll need to try again; on a 6-, ask the GM what goes terribly wrong.',
      '…spend a week or so learning to control the ringing chime.',
      '…you risk permanent harm to your hearing and major damage to anything nearby while you practice.',
    ],
    move: {
      name: 'Make Pliant the Stone',
      text: 'When you **strike the chime forcefully and will yourself to maintain your grip upon it**, mark a debility and roll +CON.\n\n**On a 10+**, you maintain control and the chime will ring for about a minute. While it rings, any stone, crystal, or glass you touch with the chime becomes soft and malleable, easily shaped and molded. The longer the contact, the more the material becomes pliant. It regains its hardness when the ringing stops, but keeps its current shape.\n\n**On a 7-9**, pick 1:\n\n- Maintain control as per a 10+, but you must pour yourself into the effort—mark another debility\n- Realize that you can\'t control it and dampen the chime before it causes any harm (say how)',
    },
  },
  {
    id: '37',
    name: 'A fine ceramic urn',
    tags: 'beautiful, fragile, magical',
    provisions: 1,
    description: 'A jar of fine pottery, the size of a small cookpot. Its glaze is a wondrous blend of patterns and sheens. The lid fits snugly, though it\'s clumsy to manipulate and tricky to open once closed. You get the feeling it was made for much bigger hands than yours.\n\nTo unlock the secrets of the urn, you must…',
    requirements: [
      '…commune with the chthonic spirit that dwells within (**Instinct** to hoard secrets).',
      '…convince it to teach you both the secret recipe and song required to make its magic work.',
      '…acquire the reagents required for the recipe (Value 1).',
      '…manage to sing the secret song for a day and night, without pause.',
    ],
    move: {
      name: 'Plaster of Joining',
      tracker: { label: 'Uses', max: 3 },
      text: 'When you **pour water, a pinch of blood, and special reagents (Value 1) into the urn and sing over it for a full day and night**, the urn gains 1 use (3 uses max) of plaster.\n\nWhen you **use the plaster to join two or more pieces of stone, rock, or crystal** and let the plaster set for a few hours, the pieces will fuse together. Different materials will show a natural, gradient seam. Similar materials will fuse together seamlessly.\n\nA single use of the plaster can cover an area up to a few inches wide and tall. Multiple uses can join together larger pieces of stone. Unused plaster will last indefinitely as long as the urn stays sealed.',
    },
  },
  {
    id: '38',
    name: 'A length of prayer beads',
    tags: 'magical, beautiful',
    provisions: 1,
    description: 'A cord almost 10 feet long, strung with bronze beads. Each bead is carved with a different glyph and a figure in a unique meditative pose. If you run your fingers along the beads, you feel a sense of stillness—but also a merciless weight of judgement.\n\nTo unlock the secrets of the prayer beads, you must…',
    requirements: [
      '…decipher the Rime Lord glyphs embossed upon the beads.',
      '…learn the meditative chants that accompany the beads (from a trove of knowledge or someone who knows).',
      '…spend a season in isolation, naked and fasting, meditating with the prayer beads, risking illness, accident, and misadventure.',
    ],
    move: {
      name: 'Cold Mind, Iron Body',
      tracker: { label: 'Preparation', max: 3 },
      text: 'When you **Bolster by spending downtime in isolation, fasting, and meditation with the prayer beads**, hold Preparation (as per the Bolster move).\n\nWhile you **hold at least 1 Preparation**, you require only an hour of sleep each night, can endure cold weather without *warm* clothing, and need not consume supplies or provisions when traveling or making camp. After about ten days of such hard living, lose 1 Preparation.\n\nAlso, you can spend 1 Preparation to:\n\n- Add +1 to any roll, after it is made (maximum +1 per roll)\n- Clear a debility, or refuse to mark one\n- Perform a feat of extreme endurance\n- Ignore harm from a source of elemental energy (fire, cold, lightning, etc.)',
    },
  },
  {
    id: '39',
    name: 'A beautiful scroll',
    tags: 'beautiful, fragile',
    provisions: 1,
    description: 'Inside a case of carved ivory rests a scroll made of fine, almost gauzy wool. It is full of glyphs and diagrams, imprinted with rich dyes of red and black and yellow. The diagrams seem to depict some sort of meditative practice, resulting in some kind of familiar spirit?\n\nTo unlock the mysteries of this scroll, you must…',
    requirements: [
      '…have some talent for magic.',
      '…decipher the Rime Lord glyphs.',
      '…spend a few months practicing the meditative techniques it describes.',
      '…describe and name the tiny spirit-construct that you wish to create:',
      '…permanently sacrifice 2 HP to invest the tulpa with "life."',
    ],
    move: {
      name: 'Little Friend',
      text: 'You have created a tulpa, which you treat as a follower. Pick 2 additional tags, an instinct, 2 additional moves, and its cost.',
      follower: {
        name: 'Tulpa',
        tags: 'Spirit, construct, tiny, naive, eager',
        hp: 8,
        armor: 0,
        damage: '1d4 (if that)',
        instinct: 'to play / to learn / to flaunt',
        qualities: [
          'Manifest a form of dust/snow/vapor',
          'Produce light (*area*, *reach*)',
          'Carry/manipulate a ◇ item',
          'Deliver a message',
          'Spy on someone/something',
        ],
        cost: 'respect given / new experiences / comfort/compassion (Loyalty ◯◯◯)',
      },
    },
  },
  {
    id: '40',
    name: 'A gold butter lamp',
    tags: 'magical, beautiful, reach, area',
    provisions: 2,
    description: 'An oversized, highly decorated lamp, shaped like a chalice with a wide cup, like those lamps they use up north to burn mammoth-butter in their rituals.\n\nIt\'s worth a fortune (Value 4), but there\'s more to this lamp than meets the eye. To unlock its secrets, you must…',
    requirements: [
      '…consult with a disciple of the Rime Lords (or one of their troves of lore) to learn the recipe and mantra that makes the lamp work.',
      '…acquire the special ingredients for the clarified mammoth-butter to be burned in the lamp (Value 1).',
      '…risk drawing the attention of one or more wraiths when you first light the lamp and utter the incantation.',
    ],
    move: {
      name: 'Revealing Light',
      text: 'When you **spend a day preparing the special ingredients (Value 1) according to the secret recipe**, you create a ◇ jar of magic butter (◯◯◯ ◯◯ hours).\n\nWhen you **light the lamp using the magic butter and intone the mantra**, the lamp gives off a pale, heatless light so long as you continue to chant. Within this light:\n\n- Active spirits are visible, even if they are not manifest\n- Illusions, glamours, and veils are stripped away\n- Shapechangers can be seen for what they truly are\n- Hidden things radiate a bright aura\n- Lies spoken are visible as black smoke that lingers near the ground\n\nAlas, the light draws the ire of any wraiths (or other hungry undead spirits) nearby.',
    },
  },
  {
    id: '41',
    name: 'A ragged fur cloak',
    tags: 'warm, magical',
    provisions: 1,
    description: 'The hide of some unknown, black-furred beast. Its bristles are stiff and the air nearby is always chill.\n\nWhen you **don the cloak**, you can tolerate even the bitterest cold and can see in darkest shadow, but bright light hurts your eyes and the warmth of even a campfire is almost too much to bear.\n\nThere\'s more to this ragged fur, to be sure. To unlock its secrets, you must…',
    requirements: [
      '…wear it continuously for seven days and seven nights.',
      '…stalk a warm-blooded beast on a moonless night, smearing its blood on the fur.',
      '…suffer (or self-inflict) a grievous wound while wearing the fur, drenching it in your own fresh blood.',
    ],
    move: {
      name: 'Darkwalker Cloak',
      tracker: { label: 'Charges', max: 4 },
      text: 'When you **open your own veins and drench the fur with your own fresh blood**, lose 1d8 HP and mark a debility. If the cloak holds no Charges, it gains 1d4 Charges. The scars from the wound are bright white and never fade.\n\nWhen you **suffer a blow or physical injury while wearing the Darkwalker Cloak**, it loses 1 Charge and you transform into a cloud of shadow. You suffer no harm after all and can flit and fly about for a few seconds before reforming. Everything you touch while in this shadowy form is laced with hoarfrost. This effect does not trigger if the fur has no Charges.\n\nWhen **direct sunlight or holy light touch the Darkwalker Cloak**, or **anyone but you dons it**, it loses all its Charges.',
    },
  },
  {
    id: '42',
    name: 'A creepy cave',
    description: 'There\'s a cave somewhere—somewhere that the light never shines—where the walls are roiling formations, slick and wet, glinting with veins of red crystal that no longer glows. The stone undulates in the flickering torchlight. Yes, yes, that must be it… a trick of the light, nothing more.\n\nThe cave bears the lingering taint of a Thing Below, but has been cut off from its power. To unlock its secrets, you must…',
    requirements: [
      '…learn the name of the Thing Below that once corrupted this place.',
      '…stay here in absolute darkness for at least a full day, despite the nightmares and hallucinations that try your soul.',
      '…bring a still-living, warm-blooded being to the cave and spill its life\'s blood on the stones while intoning the name of the Thing Below that once touched this unholy place.',
    ],
    move: {
      name: 'The Flesh Is Like Clay',
      text: 'When you **cruelly kill a warm-blooded being in the cave**, one of similar size to yourself, and **smear both its blood and yours upon the stones**, mark 1:\n\n- Gain unholy resilience: increase your max HP by 2 and gain +1 armor against anything but bronze.\n- Gain one of your victim\'s physical traits (their strength, their speed, their looks, their strong heart, etc.).\n- Heal yourself of a permanent injury (regrowing a limb, removing a scar, fixing a bad knee, etc.).\n\n*Each time you use this power*, mark all three debilities. With each use, some of the red crystal vanishes from the cave. After the third use, the crystal and the cave\'s power are gone.',
    },
  },
  {
    id: '43',
    name: 'A disturbing mask',
    tags: 'magical',
    description: 'This stiff, leathery mask looks a bit like melted wax. A large pearlescent sphere is embedded in the forehead. It seems to whisper as you move to put it on.\n\nThere\'s more to this mask than meets the eye. To unlock its secrets, you must…',
    requirements: [
      '…don the mask while alone, and wear it unseen for a night and a day.',
      '…watch someone unnoticed for a few hours, while you wear the mask.',
      '…tell the mask a secret, something no one else knows about you (tell the GM and other players what it is).',
      '…tell the mask another person\'s secret, something that you\'ve promised never to tell (tell the GM and other players what it is).',
    ],
    move: {
      name: 'Fetch\'s Mask',
      tracker: { label: 'Ken', max: 3 },
      text: 'When you **wear the mask and eat someone\'s hair, blood, fingernail, etc.**, you and the mask become their flawless double until the next sunrise or you remove the mask.\n\nWhen you **interact with an NPC known to whoever\'s visage you wear**, roll +CHA: **on a 10+**, hold 3 Ken; **on a 7-9**, hold 1 Ken; **on a 6-**, they are deeply suspicious. While interacting with them, spend Ken 1-for-1 to ask the GM:\n\n- What do they expect me to do/say?\n- What do they hope/want from me?\n- What secret do I keep from them?\n\nWhen you **remove the mask after wearing someone\'s visage**, roll +CON: **on a 10+**, it hurts but comes off okay; **on a 7-9**, your face is raw and painful, mark a debility; **on a 6-**, lose 1d4 HP, mark a debility, and the mask leaves lasting, distinctive scars.',
    },
  },
  {
    id: '44',
    name: 'A silvery glass bottle',
    tags: 'fragile, magical',
    provisions: 1,
    description: 'About 10 inches tall, tapered at the top, made of old warped glass that\'s shot through with silvery streaks, like the trails that slugs leave. The patterns in the glass seem different each time you look, almost shifting as you watch. It makes you eyes water, your head spin.\n\nYou can unlock the secrets of this old glass bottle, but you must either…',
    requirements: [
      '…find one who knows its workings, and get them to teach you;',
      '…fill the bottle with spring-water and hallucinogenic mushrooms, and let it steep in the dark for a fortnight.',
      '…drink the contents and risk learning nothing as you suffer through the sickness and the nightmares.',
    ],
    move: {
      name: 'Witch Bottle',
      tracker: { label: 'Sway', max: 3 },
      text: 'When you **tie strands of someone\'s hair around an item that they made or owned, set them afire, and drop them still-burning into the empty bottle**, hold 3 Sway over them. The cinders continue to burn and glow until the Sway is gone. Spend 1 Sway while speaking their true name to…\n\n- Twist their senses, making them perceive something untrue\n- Plague them with nightmares until they wash in rain or snow\n- Cause an emotion in their heart to swell, possibly overwhelming them\n\nIf the person you currently hold Sway over finds and breaks the Witch Bottle, you will yourself suffer all the torments you have ever inflicted with it.',
    },
  },
  {
    id: '45',
    name: 'A vellum scroll',
    tags: 'fragile',
    provisions: 1,
    description: 'A remarkably supple scroll, given its age, found in an ivory tube. It bears writing in a strange alphabet, penned in a dark red ink. There are diagrams, too. You think it might be some sort of recipe? Or spell? Maybe both?\n\nTo unlock the secrets of this scroll, you must…',
    requirements: [
      '…determine the scroll\'s origin and be able to read the author\'s language.',
      '…break the cipher in which the recipe is encoded.',
      '…acquire the recipe\'s unusual and unsavory ingredients (Value 1).',
      '…spend a few days practicing the incantation, risking a mistake on your first attempt, with potentially disastrous results.',
    ],
    move: {
      name: 'Wishing Candles',
      tracker: { label: 'Uses', max: 5 },
      text: 'When you **spend a few days following the unsavory recipe from the scroll** (Value 1), gain 1d4+1 Wishing Candles.\n\nWhen you **burn a Wishing Candle and utter the ugly incantation**, say what you wish to acquire: it will come into your possession soon. Roll the Die of Fate to learn the cost. If it was an item of Value 1 or less, roll twice and take your pick.\n\n**1d6 Cost**\n1 — The crops fail/2d4 Surplus is lost\n2 — One of the village\'s resources or assets is lost/stolen/ruined/etc.\n3 — A neighbor takes seriously ill or suffers a freak accident/loss\n4 — Weird events plague the village; panic looms\n5-6 — No cost to speak of, this time',
    },
  },
  {
    id: '46',
    name: 'A whispering... word?',
    tags: 'magical, immobile, terrifying',
    description: 'Hidden from the sun, in a ring of runes, there is a… word?… floating in the air. Squiggling and wriggling, yearning to be free, it whispers promises of power. But the runes around it fill you with dread.\n\nTo unlock its secrets, you must…',
    requirements: [
      '…master your fear, forcing yourself to grasp it and take it inside of you.',
      '…hold tight as it wracks your body and soul, attempting to unmake you (2d6 damage, *messy*, ignores armor).',
      '…spend weeks in isolation, wrapping your mind around the dread word that now lives in your head.',
      '…risk corrupting your locale and destroying your possessions or anything else nearby as you practice speaking the dread word aloud.',
    ],
    move: {
      name: 'Baleful Utterance',
      text: 'When you **speak the dread word**, name an object that your voice can reach—it shatters, unravels, or is otherwise unmade.\n\nThen roll +CON: **on a 10+**, pick 1; **on a 7-9**, pick 1 and the GM picks another; **on a 6-**, pick 1 in addition to whatever else the GM says; **regardless**, if the item you destroyed was *indestructible*, pick 1 more.\n\n- Your throat burns and your tongue blisters; mark *miserable* and you can barely whisper for a few days.\n- Your ears and those of all who heard the word start bleeding (1d4 damage, ignores armor, temporarily deafened).\n- 1d4 other objects of the GM\'s choice also shatter/unravel/are unmade.\n- This place is corrupted by the Things Below; if already corrupted, it gets worse; otherwise, it is now a shunned place, a place of disquiet and unease.',
    },
  },
  {
    id: '47',
    name: 'A corroded spearhead',
    tags: 'magical',
    provisions: 1,
    description: 'Hidden away in some vault or cave or Maker-ruin is a length of copper, heavily corroded and coated with chunks of verdigris. If you squint, you vaguely make out the shape of a spearhead. Oh, and are those the faint traces of runes?\n\nTo unlock the secrets of this ancient weapon, you must…',
    requirements: [
      '…carefully clean away the corrosion with proper chemics, without destroying the runes as you do so.',
      '…decipher the runes and how they are meant to be charged.',
      '…infuse the restored spearhead with lightning.',
      '…mount the spearhead on a shaft of birchwood.',
      '…soak the spearhead in your own blood, to claim its power as yours.',
    ],
    move: {
      name: 'Aetherium Spear',
      subtitle: '◇, close, thrown, magical, +1 damage',
      text: 'When you **Clash with the aetherium spear and get a 7+**, you can mark a debility to blast your foe with lightning, dealing +1d6 damage (*forceful*, *loud*).\n\nWhen you **point the aetherium spear at your foes and bellow a thunderous warcry**, mark a debility and unleash a blast of lightning (*far*, *area*, *forceful*, *loud*, *dangerous*), rolling +STR to Let Fly instead of +DEX (and you cannot choose to deplete ammo). **On a 6-**, in addition to whatever else the GM says, the spearhead is drained of power and the birchwood shaft is reduced to cinders—clear the last 3 check boxes on the front of this card.',
    },
  },
  {
    id: '48',
    name: 'A copper-banded staff',
    tags: 'magical',
    provisions: 1,
    description: 'A short staff, about 4 feet tall, tapering towards the tip and made of blackened oak with a strange metallic sheen. A dozen bands adorn it, made of corroded copper, caked in verdigris and crumbling away in spots. The bands are embossed with runes of power, some of them worn away or obscured.\n\nThe staff still tingles with power. To unlock its mysteries you must…',
    requirements: [
      '…figure out the shape of the missing and damaged runes.',
      '…replace the bands with new ones of rune-embossed aetherium.',
      '…hold fast as lightning courses through the staff, attuning to its magic (you risk serious burns or at least flinching and letting go).',
      '…spend a few days practicing with the charged-up staff.',
    ],
    move: {
      name: 'Staff of Magnetism',
      tracker: { label: 'Charge', max: 3 },
      text: 'When **lightning courses through the staff**, it holds 3 Charge (max 3).\n\nWhen **the staff holds Charge and you focus your will and senses through it**, you can sense iron, steel, cobalt, and nickel within *near* range and move such objects slowly and awkwardly. You can manipulate only items that you could lift with one hand.\n\nWhen you **tap into the power stored within the staff**, pick 1:\n\n- Extend its effects up to *far* range\n- Move items quickly and suddenly, fast enough to attack or defend (*dangerous*)\n- Manipulate an object of considerable mass, as much as you can deadlift\n\nEach time you tap into the staff\'s power, roll 1d6. If you roll higher than the staff\'s current Charge, it loses 1 Charge.',
    },
  },
  {
    id: '49',
    name: 'An odd conveyance',
    tags: 'large, magical, fragile',
    description: 'It\'s like two of those canoes they use in Marshedge, but bigger and with big fins at the back. They\'re linked with timbers and a platform set on top. One canoe boasts a tall spire, snapped in half, a torn triangle of cloth still attached. Much of the wood is rotted. The canoes are banded in aetherium, weighed down with stones.\n\nYou suspect this is some sort of vehicle, but to unlock its mysteries you…',
    requirements: [
      '…need a skilled carpenteer, good timber (Value 2), a new sail (Value 1), and a season spent on repairs.',
      '…risk damaging it further, and/or having it/the aetherium float away.',
      '…must attune to the aetherium, so as to control how much it hovers.',
      '…and another must spend a season learning to sail the thing, risking injury and damage to the craft.',
    ],
    move: {
      name: 'Groundskimmer',
      subtitle: 'large, magical, dangerous, requires a crew of 2',
      text: 'The groundskimmer can carry about as much as a fully-loaded wagon. When you **grasp the tiller and focus**, you can adjust how much the craft\'s aetherium repels the earth. When you **properly adjust it to match its current load**, it hovers a few feet above the earth and can sail across the landscape. In a good wind at a safe pace, it can cover the breadth of the Flats in ~8 hours. Sailing into the wind is much slower, and requires a zig-zag course.\n\nBad weather, high speed, flying too high, rough terrain, dodging obstacles, damage, impact, and sudden changes in load all involve Defying Danger (by you/your crew/your passengers). Sailing the Great Wood is impossible (too dense). Going offroad in the Steplands, Foothills, or mountains is suicidal; even sticking to the Makers\' Roads in those regions is dangerous.',
    },
  },
  {
    id: '50',
    name: 'A bow with no string',
    tags: 'magical',
    provisions: 1,
    description: 'A short flatbow made of pale blue metal, rigid and gracefully curved even though it\'s unstrung. There aren\'t even hooks where you *could* attach a string.\n\nIt seems to be of little use, but there is more to this bow than meets the eye. To unlock its mysteries, you must…',
    requirements: [
      '…acquire a glove of aetherium, properly attuned to the bow.',
      '…learn the secret word that activates the bow.',
      '…charge the bow with lightning, risking harm to the bow or yourself.',
      '…spend a few weeks practicing, risking all manner of collateral damage in the process.',
    ],
    move: {
      name: 'Thunderbolt Bow',
      subtitle: '◇, far, forceful, magical, loud, reload, ignores armor',
      text: 'When you **speak the secret word**, the bow activates and hums ominously. When you then **wear the aetherium glove and grasp where the string should be**, a crackling line of lightning appears between the horns.\n\nWhen you **draw back the lightning**, a thunderbolt forms where an arrow should be. It manifests over the course of a deep breath, after which you can Let Fly.\n\nYou must charge the bow with lightning to replenish its ammo.\n\nWhen you **draw back the lightning for at least ten deep breathes**, depelete your ammo. Your next shot deals +1d4 damage (+*area*, +*dangerous*), but if you roll snake eyes to Let Fly, the bow explodes (3d6 damage, *reach*, *area*, *forceful*, *loud*).',
    },
  },
  {
    id: '51',
    name: 'A metal man',
    tags: 'magical, fragile',
    description: 'A bronze statue, but not really a statue, more like bits of armor cleverly joined around a skeleton of interlocking pipes. And the "chest" is less a breastplate than a little potbelly stove. Intricate runes are barely visible under the thing\'s patina. It\'s dented, cracked, and torn apart, but a careful search will turn up all the pieces.\n\nThis is clearly no mere statue, but to unlock its mysteries you need to…',
    requirements: [
      '…repair the body, taking a full season for an *exceptional* smith (Value 3).',
      '…spend a few weeks repairing the runes, risking a mistake that makes them ineffective or unstable.',
      '…convince your own hearth\'s spirit to inhabit the stove and animate the construct.',
    ],
    move: {
      name: 'Bronze Protector',
      tracker: { label: 'Readiness', max: 4 },
      text: 'As long as **fire burns in the stove-like chest**, the hearth spirit will animate the construct. Treat it as a follower.',
      follower: {
        name: 'Bronze protector',
        tags: 'Construct, spirit, durable, vigilant, overbearing, mute, gullible',
        hp: 13,
        armor: 3,
        damage: 'pummel 1d8 (*band*)',
        instinct: 'to be overzealous in guarding you',
        qualities: [
          'fireproof; holds +1 Readiness on a 7+ to Defend; requires a smithy and tools to regain HP',
          'Loom menacingly, belching smoke',
          'Start fires, cause collateral damage',
          'Run low on fuel',
        ],
        cost: 'profuse gratitude (Loyalty: ◯◯◯)',
      },
    },
  },
  {
    id: '52',
    name: 'A prospector\'s tale',
    description: '"An Ustrina once offered me a mirror, a flawless thing framed in gold. It showed me, but… a better me, you see? They said who made it, one of the Forge Lords, I think? Said she \'poured her Sublime Words into it,\' whatever that means. I couldn\'t pay their price. But I\'ll never forget that mirror, or how it made me feel."\n\nThat old man turned up dead, but you suspect there\'s some truth to his story. To unlock its mysteries, you must…',
    requirements: [
      '…be proficient with some art or craft (pottery, weaving, smithing, etc.).',
      '…find an Ustrina able and willing to teach you the Sublime Words.',
      '…spend a season studying with the Ustrina, practicing the Words.',
      '…risk never mastering the Words, or permanently harming your voice.',
    ],
    move: {
      name: 'Sublime Words',
      subtitle: '◯ raspy voice, ◯ coughing fits, ◯ mute',
      text: 'When you **spend supplies (Value 2) and a full season a-crafting, chanting the Sublime Words all the while**, roll +WIS. No matter what, you\'ve damaged your voice (mark a status above) but made a thing of true beauty (Value 4). **On a 10+**, pick 1, or 2 and further damage your voice; **on a 7-9**, pick 1 and further damage your voice.\n\n- Its beauty will persist through the ages\n- It eases pain and lifts grief\n- It inspires others to better themselves\n\n**On a 6-**, it stokes greed in those who see it and fear in those who own it, worse if those qualities were already there. Expect bloodshed.\n\nWhen you **rest your voice for a season** (no shouting, little talking, not using the Sublime Words), clear one status above.',
    },
  },
  {
    id: '53',
    name: 'A rusty steel blade',
    tags: 'close, crude',
    provisions: 1,
    description: 'It was clearly once a fine, fine blade. The steel holds a pattern of rune-like sworls, at least where the rust hasn\'t taken over. The hilt is blackened, with hints of leather wrappings that long ago burned away. The metal is hot to the touch, like it\'s been left out for hours in the summer sun.\n\nTo unlock the mysteries of this weapon, you must…',
    requirements: [
      '…restore the blade, which requires access to a smithy, a few weeks of work, and no small amount of skill.',
      '…commune with the spirit of fire within the steel (**Instinct** to seek glory), and convince it that you are worthy to wield the blade.',
      '…acquire a scabbard that can withstand the fire and heat of a forge.',
    ],
    move: {
      name: 'Flaming Sword',
      subtitle: '◇, close, beautiful, +1 damage, 1 piercing',
      tracker: { label: 'Blaze', max: 4 },
      text: 'When you **call on the fire spirit within**, the blade erupts in flames (+*magical*, +*dangerous*) and casts light (*reach*, *area*). The hilt gets hot; wear thick gloves!\n\nWhen you **Clash with the Flaming Sword**, after you resolve the move and deal damage, increase the Blaze die one step.\n\nWhen you **roll to make a move while wielding the sword**, take damage equal to the Blaze die (ignores armor).\n\nWhen you **deal damage with the sword**, add the Blaze die.\n\nWhen you **sheathe the sword**, the fire goes out and cannot be relit until the Blaze die is nil. Reduce the Blaze die once each hour.',
    },
  },
  {
    id: '54',
    name: 'A runic branding iron',
    tags: 'magical',
    provisions: 1,
    description: 'Found in the workshop of some Forge Lord, still held in a vice-clamp. The head is a runic shape, 6 by 6 inches, with smaller runes etched into its surface. Or at least, most of its surface. A few inches are blank, the work clearly unfinished.\n\nTo unlock the mysteries of this iron and claim its power as your own, you must…',
    requirements: [
      '…decipher the meaning of the runes, and identify the missing ones.',
      '…finish the etchings, risking an error that will make the next step fail.',
      '…heat the iron red-hot and let yourself be branded (lose 3d6 HP), the runes fading from the iron and searing themselves upon your soul.',
      '…allow the wound to heal and scar, without the aid of any magic.',
    ],
    move: {
      name: 'Searing Touch',
      text: 'When you **call up the fire from your soul and pour it into your hands**, roll +CON: **on a 7+**, your hands blaze like white-hot iron (see below); **but on a 10+**, first pick 1; **and on a 7-9**, first pick 2:\n\n- It takes minutes of intense focus\n- It burns your life force; lose 2d4 HP\n- The pain is terrible; mark a debility\n\n**On a 6-**, whatever else the GM says, you cannot do this again until you Convalesce.\n\nWhile your **hands are ablaze**, your touch deals 1d10 damage (*band*, *messy*, *dangerous*, 1 piercing), sets fire to wood, boils water, heats metal. Your hands are unharmed by the heat, but your gear and the rest of your body has no such protection. Be careful.\n\nYour hands blaze as long as you maintain your focus, up to a minute or maybe two.',
    },
  },
  {
    id: '55',
    name: 'A silvery signet ring',
    tags: 'magical, beautiful',
    description: 'A ring of white metal, untarnished and gleaming, a single glyph carved into the bezel. The symbol squirms under your gaze, like it exists in more dimensions than you can perceive. The ring fits you perfectly, of course.\n\nTo unlock the ring\'s mysteries, you must…',
    requirements: [
      '…spend a season wearing the ring and contemplating the glyph.',
      '…get used to the headaches & nausea that come from wearing the ring.',
      '…spend 1 of your follower\'s Loyalty to charge the ring.',
      '…attempt to influence one of your followers with the ring, at the risk of failing to ever master its power and/or alienating your follower(s).',
    ],
    move: {
      name: 'Sigil of Authority',
      tracker: { label: 'Authority', max: 3 },
      text: 'When you **Strengthen Your Bond** with a member of your community, you can choose to hold +1 Authority (max 3) in lieu of your follower holding +1 Loyalty. If you **remove the ring**, lose all Authority.\n\nWhen you **Persuade your follower(s) while holding Authority**, you have advantage.\n\nYou can spend Authority 1-for-1 to:\n\n- Wrap yourself in majesty for up to a few minutes, drawing all attention, cowing the weak-willed, and speaking in a voice that all can hear (*far*, *area*)\n- Will someone in your presence to do as you wish, attempting to Persuade them without words\n- Have one of your nearby followers suffer an attack on your behalf, as if they held Readiness from Defending',
    },
  },
  {
    id: '56',
    name: 'A fine drinking horn',
    tags: 'beautiful, magical',
    provisions: 1,
    description: 'You got it off a stranger. Like, maybe on a bet, or in a contest, or as a gift in return for some kindness. Or maybe you took it without his consent? Regardless, he seemed a bit coy about the horn, almost glad to let you have it. And just before you parted ways, you noticed the missing finger on his left hand.\n\nSince then, the horn has seemed to call to you, daring you to drink heavily from it. To unlock its mysteries, you must…',
    requirements: [
      '…fill it with whisky or a similarly potent spirit.',
      '…drink the contents in a single pull (mark *dazed*).',
      '…risk blacking out, acting the fool, or at least marking more debilities.',
      '…survive the storm you summon as a result (see reverse).',
    ],
    move: {
      name: 'Horn of Storms',
      text: 'When you **get yourself good and drunk from the horn**, mark a debility. You call up a storm, centered on your location. Roll four d4s. For each additional debility you mark, roll an extra d4. **Until the storm passes**, you can\'t clear debilities.\n\nAssign one d4 to each of the following:\n\n____ **Onset**: 1 = next day; 2-3 = in a few hours; 4 = within the hour.\n____ **Intensity**: 1 = dangerous to be out in; 2-3 = damages weak structures; 4 = lays waste to weak structures and damages sturdy ones.\n____ **Reach**: 1 = a mile or so; 2-3 = a dozen miles or so; 4 = dozens or scores of miles.\n____ **Duration** (once it gets going): 1 = less than an hour; 2-3 = a few hours; 4 = a day or so.',
    },
  },
  {
    id: '57',
    name: 'A vein of milky crystal',
    tags: 'magical, beautiful, immobile',
    description: 'Found in a cave, a mountain, or some rocky outcrop, likely considered sacred by the locals. It looks like cloudy white quartz, but glows faintly at night.\n\nYou can unlock the mysteries of this vein and craft a talisman against the undead, but to do so you must…',
    requirements: [
      '…personally extract a large ◇ hunk of crystal (Value 1) from the vein.',
      '…have a gemcutter shape and polish it into a perfect sphere (a Value 1 job).',
      '…learn the sacred words for imbuing a moonstone with light and then calling that light forth.',
      '…spend three nights under the full moon, speaking the sacred words, risking a mistake that ruins the moonstone or at least wastes your efforts this month.',
    ],
    move: {
      name: 'Moonstone',
      subtitle: '◇, beautiful, magical, fragile',
      tracker: { label: 'hours', max: 5 },
      text: 'When you **spend a night beneath the full moon**, directing its light into the moonstone, it gains 1 hour of light (max 5).\n\nWhen you **hold the moonstone aloft in darkness and utter a sacred word**, it shines with pale white light (*area*, *near*) that shows no color, only shape and texture. The light reveals the undead, even spirits that have yet to manifest and entities masked by magic or disguise.\n\nWhen **the moonstone is your only light source and you shout the proper word**, it blazes with silvery light and all undead in range take 1d6 damage per hour of light remaining (ignores armor). The moonstone then goes dark, its light expended until you charge it again.',
    },
  },
  {
    id: '58',
    name: 'A mummified hand',
    tags: 'magical, fragile',
    provisions: 1,
    description: 'Found in an engraved lead box, this grisly relic is adorned with three golden rings (Value 2). Each ring has an empty setting, as though it was meant to hold a stone. Only dark, rust-like flakes remain.\n\nThe hand still thrums with unholy vitality. To unlock its mysteries, you must…',
    requirements: [
      '…learn the name of the sorcerer whose hand this was.',
      '…learn the words of power and the process below.',
      '…on three separate nights, soak a different piece of red crystal (Value 1) in a bowl of your own fresh blood (5 HP, mark a debility), chanting words of power throughout the night, and then set the still-dripping crystal in one of the rings that adorn the hand.',
    ],
    move: {
      name: 'Hand of Aals Sannan',
      text: 'When you (and only you) **touch the hand and speak the name of Aals Sannan**, all three crystals dim and the power of the long-dead sorcerer infuses you. Reset your HP to max, clear your debilities, and heal any problematic wounds (if you were dying, you no longer are). Also, mark one:\n\n- Part of your look changes, to be more like Aals Sannan.\n- Your instinct changes, to something more cynical/manipulative/ambitious.\n- Your heart hardens towards someone you care about, so that you see them now as only a tool or a threat.\n\nWhen **all three have been marked**, the three crystals crumble to dust. Clear all three marks but their effects remain. Also, clear the last three check boxes on the front of this card. Until you replace all three crystals, you can\'t use this arcanum.',
    },
  },
  {
    id: '59',
    name: 'A redwood basin',
    tags: 'magical, beautiful',
    provisions: 2,
    description: 'A wide, shallow bowl carved with flowers and thorny vines, twining through skulls of deer and other beasts. The pattern shifts when you aren\'t looking; it\'s never exactly the same twice.\n\nTo unlock the mysteries of the basin, you must…',
    requirements: [
      '…befriend the spirit of life and vitality that dwells within.',
      '…learn from a Fae how to pour years of your life into the basin.',
      '…fill the basin with a few years of your life.',
      'When you **mark the last requirement and unlock this arcanum**, mark your current age on the other side. Then trigger the Bittersweet Elixir move.',
    ],
    move: {
      name: 'Bittersweet Elixir',
      subtitle: '◯ youthful, ◯ mature, ◯ elderly',
      text: 'When you **fill the basin with a few years of your life**, it becomes a draught of honey and regret. Either mark the next age above (and update your look) as the lost years catch up with you, or mark one of the following (your choice):\n\n- Your mood shifts, dramatically (how?)\n- You see the Last Door (what\'s it like?)\n- Reduce STR, DEX, or CON by 1\n- You have less than a year to live\n\nWhen someone **drinks down all of the bittersweet elixir, straight from the basin**, they pick 1:\n\n- Regain all HP, clear all debilities, and heal any active problematic wounds\n- Purge themselves of all poison/disease\n- Fully recover from a permanent injury by next season\'s end, or sooner',
    },
  },
  {
    id: '60',
    name: 'A humble broom',
    tags: 'magical, crude',
    provisions: 1,
    description: 'Just a well-worn stick of rowan wood, in need of some new bristles. You wouldn\'t give it another thought. Except… when you hold it, and sweep with it, you find yourself humming a half-remembered tune.\n\nClearly, there is more to this broom than meets the eye. To unlock its mysteries, you must…',
    requirements: [
      '…find a Fae who can hear the broom\'s song in its entirety.',
      '…convince them to teach you the broom\'s song in full.',
      '…use the broom at least once a day for a whole season, singing the lullaby as you do.',
      '…risk falling into a lasting, timeless sleep as you practice the lullaby.',
    ],
    move: {
      name: 'The Broom\'s Lullaby',
      subtitle: 'magical, area, near',
      text: 'When you **start sweeping an area as you softly sing the lullaby**, roll +CHA: **on a 7+**, those who see and hear you stop to watch and listen, at least for a bit, entranced or confused or bemused as fits their nature and the circumstances. They snap out of it if harmed or threatened. **Also, on a 10+**, you can hold their attention for the length of the lullaby, as long as no one is harmed or threatened.\n\nWhen you **sing the full lullaby, sweeping all the while**, roll +CHA: **on a 10+**, all who hear you fall into a deep sleep and will be prone to dismiss this as just a dream; **on a 7-9**, all who hear you start to nod off or lapse into a light, jerking sleep, but they will certainly remember this when they come to; **on a 6-**, at least one of your audience snaps to and realizes just how weird this all is.',
    },
  },
  {
    id: '61',
    name: 'A stone idol',
    tags: 'crude, magical',
    provisions: 1,
    description: 'Found at the back of some cave or grotto, obscured by roots and rubble, surrounded by desiccated, rotting offerings. A crude squat thing with a possum\'s sneering face, a thorny tail, and flowers for its ears.\n\nThe idol is, in fact, a narcissistic little Fae, stuck (hiding? stubbornly ensconced?) in the form of a stone idol. To unlock its "mysteries" and benefit from its patronage, you must…',
    requirements: [
      '…restore the shrine, while suffering the abuse of its angry little god.',
      '…extract the idol from the stone and rubble in which it\'s embedded, at the risk of damaging/insulting it.',
      '…trick the idol into accepting an offering that puts it in your lasting debt. A Surplus worth of food and/or whisky ought to be enough.',
    ],
    move: {
      name: 'The Angry Little God',
      text: 'When you **put the idol in a prominent place and beseech it to attend its humble servant**, it wakes (but is still inert). Treat it as a follower, though it hardly considers itself one.',
      follower: {
        name: 'All-mighty Thistlewisk',
        tags: 'Fae, tiny, magical, devious, arrogant',
        hp: 15,
        armor: 6,
        damage: 'void touch 1d10 w/advantage (*band*, *grabby*, ignores armor)',
        instinct: 'to heap abuse on its worshippers',
        qualities: [
          'inert; disembodied voice',
          'Make unreasonable demands',
          'Consume the essence of foodstuffs',
          'Sense one\'s idle thoughts/memories',
          'Weave powerful illusions and hallucinations (*near*, *area*)',
          'Grow bored/huffy and go to sleep',
        ],
        cost: 'obeisance and ever-larger offerings of food (Loyalty: ◯◯◯)',
      },
    },
  },
  {
    id: '62',
    name: 'A treasure map',
    tags: 'fragile',
    description: 'A tattered scrap of parchment. It shows a path from a particular set of standing stones: through a marsh, up a river, to a place behind a waterfall, then through a forest of sword-sharp trees. Forest Folk glyphs are scrawled all about, but at the end: a silver tree, and X marks the spot.\n\nTo unlock the map\'s mysteries and claim the prize at the end, you must…',
    requirements: [
      '…find the standing stones that mark the start of the path.',
      '…follow the map to the waterfall.',
      '…enter the Fae domain beyond.',
      '…navigate the sword-tree forest.',
      '…risk falling under the soporific spell of the silver tree.',
      '…claim a branch from the silver tree.',
      '…make it home again.',
    ],
    move: {
      name: 'The Silver Branch',
      subtitle: '◇, magical, beautiful',
      text: 'A few feet long, laden with white flowers and jingling golden fruits. Surprisingly sturdy, and stays fresh indefinitely unless its powers are used. Only one such branch can leave the Fae domain at a time.\n\nWhen you **jingle the silver branch**, all who hear it (*reach*, *area* except you) are filled with bliss and forget their woes for a few hours. Roll +CHA: **on a 10+**, pick 1; **on a 7-9**, pick 1 and the GM picks another; **on a 6-**, all 3.\n\n- The branch starts to fade; if already fading, it goes bare, its powers gone\n- Some (GM\'s choice of who) are blissed out for days or weeks, growing weak and wretched in the meantime\n- Some (GM\'s choice of who) become obsessed with hearing it jingle again',
    },
  },
  {
    id: '63',
    name: 'An oversized crown',
    tags: 'beautiful, magical, fireproof',
    provisions: 1,
    description: 'A circlet of black, glossy metal set with eight spires of aetherium. It\'s sized for a head maybe twice as large as yours, and is always a bit chill to the touch. Even cast into the hottest furnace, it will not melt nor even heat.\n\nWhen you **touch the crown with bare flesh and open your mind**, you can speak to the primordial spirit to which the crown is attuned. But to fully unlock the mysteries of this crown, you must…',
    requirements: [
      '…risk your sense of self as you commune with this spirit of the void.',
      '…learn the Words of Being, which will force the spirit to manifest.',
      '…learn the Words of Unbeing, which will send the spirit home.',
      '…convince the spirit to manifest and then successfully dismiss it.',
    ],
    move: {
      name: 'Void Elemental',
      tracker: { label: 'Loyalty', max: 3 },
      text: 'When you **touch the crown and speak the Words of Being**, the spirit manifests. Treat it as a follower, with 3 Loyalty to start (it can never gain more). When you **touch the crown and chant the Words of Unbeing**, the spirit can return to the void—if it wants.',
      follower: {
        name: 'Void elemental',
        tags: 'Spirit, primordial, confused, angry',
        hp: 15,
        armor: 1,
        damage: 'void touch 1d10 w/advantage (*band*, *grabby*, ignores armor)',
        instinct: 'to rage at all the noise and chaos',
        qualities: [
          'immune to most harm',
          'Manifest as a black hole in reality',
          'Snuff out a source of energy',
          'Become confused, unsure what to do',
        ],
        cost: 'Loyalty ◯◯◯',
      },
    },
  },
  {
    id: '64',
    name: 'A metal puzzle box',
    tags: 'indestructible',
    provisions: 1,
    description: 'A 6" cube of dull gray metal, covered in hinges, knobs, dials, sliders, levers, and the like. A thing of mad genius, resisting all attempts to open it by brute force.\n\nTo unlock its mysteries, you must…',
    requirements: [
      '…roll +INT to open the box: on a 10+, it takes a few days of fiddling; on a 7-9, it takes a few obsessive weeks; on a 6-, it\'s beyond you.',
      '…spend a season deciphering the symbols etched along the inside.',
      '…risk never being able to decipher the symbols, and/or developing some mental quirk as you do so.',
      '…commune with a primordial spirit and learn the Silent Words from it.',
      '…spend a few weeks practicing the spell, risking all sorts of harm and collateral damage.',
    ],
    move: {
      name: 'Runes of Creation',
      text: 'When you **carefully inscribe an object with the runes of creation**, pick 1 desired effect:\n\n- It will flow into any shape you imagine\n- It will become *indestructible*\n- It will become *beautiful*\n- It will blaze with terrible heat (1d10 damage, *messy*), if only for a moment\n\nWhen you **speak the Silent Word that completes the spell** (*far* range) mark a debility as elemental forces flow through you into the object. The effect works, but roll +CON: **on a 10+**, pick 1; **on a 7-9**, pick 1 and the GM picks another; **on a 6-**, all 3.\n\n- Mark another debility & lose 1d10 HP\n- The elements run amok, triggering a fire/earthquake/avalanche/storm/etc.\n- The effect lasts only while you focus on it, and then the object is damaged in a manner of the GM\'s choosing',
    },
  },
];
