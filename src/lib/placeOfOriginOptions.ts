import type { PlaybookType } from '@/types';

export type PlaceOfOriginOption = {
  value: string;
  label: string;
  names: string;
};

export type PlaceOfOriginOptions = PlaceOfOriginOption[];

export const PLACE_OF_ORIGIN_OPTIONS: Partial<Record<PlaybookType, PlaceOfOriginOptions>> = {
  blessed: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Arwel, Blodwen, Brynmor, Celyn, Fflur, Gwynn, Tegwen, or Winned',
    },
    {
      value: 'barrier-pass',
      label: 'Barrier Pass',
      names: 'Alagh, Bora, Chambui, Enebish, Jalakai, Kamala, Sechen, or Todogen',
    },
    {
      value: 'the-steplands',
      label: 'The Steplands (Hillfolk)',
      names: 'Bejn, Decla, Franza, Irv, Ivet, Jak, Sibl, or Yez',
    },
    {
      value: 'the-wild',
      label: 'The Wild',
      names: 'Autumn, Badger, Big, Black, Bloody, Brave, Crow, Cub, Dark, Doe, Fang, Fierce, Flower, Gentle, Green, Grim, Hart, Leaf, Little, Lonely, Old, Owl, Pale, Pup, Quick, Quiet, Rain, Red, Sharp, Snake, Snow, Spring, Summer, Tall, Tree, Yellow, White, Wind, Winter, Wolf, Whisper',
    },
  ],
  fox: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Bran, Carwyn, Delyth, Elin, Fion, Geral, Mair, Rannon, Vaughn, or Wynn',
    },
    {
      value: 'barrier-pass',
      label: 'Barrier Pass',
      names: 'Anarba, Batu, Bugadai, Hujaghur, Jigur, Kete, Sarantuya, or Tebengri',
    },
    {
      value: 'gordins-delve',
      label: "Gordin's Delve",
      names: 'Pick a name from any list',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Comyna, Crevan, Fitz, Greagir, Maired, Nainsi, Naiclas, or Saraid',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other point south',
      names: 'Amit, Baz, Dafna, Mahsa, Parviz, Sanaz, Tzofiya, Yaniv',
    },
  ],
  'would-be-hero': [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Anwen, Caradoc, Dafyd, Glenys, Madoc, Morwenna, Siwan, or Wynfor',
    },
    {
      value: 'barrier-pass',
      label: 'Barrier Pass',
      names: 'Bala, Cotota, Ganzorig, Gerelma, Ibahka, Jungshoi, Mukhali, or Taichu',
    },
    {
      value: 'the-steplands',
      label: 'The Steplands (Hillfolk)',
      names: 'Annic, Cosette, Denl, Hugenne, Jag, Marc, Oanz, or Sandre',
    },
    {
      value: 'gordins-delve',
      label: "Gordin's Delve",
      names: 'Pick a name from any list',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Bridin, Clian, Engis, Fearghul, Lan, Neasa, Nill, or Una',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other point south',
      names: 'Chara, Davud, Korina, Omid, Parvaneh, Tamir, Takish, or Yannis',
    },
  ],
  seeker: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Alis, Dylan, Eilwen, Gerlt, Gwenda, Macsen, Mirgan, Owena, Taliesyn, or Twymor',
    },
    {
      value: 'barrier-pass',
      label: 'Barrier Pass',
      names: 'Bayanaganengri, Chakha, Jetei, Moog, Narengawa, Ogul, Ozbeg, or Solongo',
    },
    {
      value: 'the-steplands',
      label: 'The Steplands (Hillfolk)',
      names: 'Anook, Anxo, Dors, Jory, Mari, Padg, Pons, or Silf',
    },
    {
      value: 'gordins-delve',
      label: "Gordin's Delve",
      names: 'Pick a name from any list',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Aiden, Barrfind, Caolan, Ciara, Deirbhile, Moirin, Tiern, or Reamann',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other point south',
      names: 'Dana, Eliana, Erez, Fikri, Isra, Persefoni, Spiro, or Vahid',
    },
  ],
  ranger: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Aran, Bledyn, Branwen, Deryn, Ifur, Meinir, Rhys or Teagan',
    },
    {
      value: 'barrier-pass',
      label: 'Barrier Pass',
      names: 'Anarba, Arslan, Bolormaa, Cirina, Nergui, Nomolun, Saran, or Shigi-Qutuqu',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Asling, Conar, Enna, Flannan, Macha, Mave, Proinsias, or Rowen',
    },
    {
      value: 'the-steplands',
      label: 'The Steplands (Hillfolk)',
      names: 'Bernd, Elown, Irn, Kani, Pol, Nol, Rozn, or Sterin',
    },
    {
      value: 'the-manmarch',
      label: 'The Manmarch',
      names: 'Alfher, Bertrim, Dagmar, Elfrida, Hramn, Meike, Swanhilde, or Wulfrim',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other point south',
      names: 'Ari, Boriz, Dimitra, Gorhan, Nitza, Selen, Todora, or Vasil',
    },
  ],
  marshal: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Bethan, Cadfael, Ffraid, Gwythyr, Llewelyn, Meredith, Rhianna, or Urien',
    },
    {
      value: 'gordins-delve',
      label: "Gordin's Delve",
      names: 'Pick a name from any list',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Brigh, Cathal, Conn, Donal, Fionna, Laith, Talulla, or Torin',
    },
    {
      value: 'the-steplands',
      label: 'The Steplands (Hillfolk)',
      names: 'Adl, Aeln, Clotild, Judoc, Katrn, Mygl, Pirn, or Sera',
    },
    {
      value: 'the-manmarch',
      label: 'The Manmarch',
      names: 'Berkhard, Gerhild, Hartig, Hilde, Sabrinne, Ulrike, Urrsla, or Weillem',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other point south',
      names: 'Ameer, Calixta, Hadar, Kelila, Sulaim, Ursa, or Xandros',
    },
  ],
  lightbearer: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Dai, Eirian, Eurig, Haf, Haul, Hefin, Hulwen, or Tesni',
    },
    {
      value: 'barrier-pass',
      label: 'Barrier Pass',
      names: 'Alaqa, Bat, Dinget, Ghoa, Oyuun, Sidurgu, Temur, or Toragana',
    },
    {
      value: 'gordins-delve',
      label: "Gordin's Delve",
      names: 'Pick a name from any list',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Adfin, Callach, Conlad, Eadna, Fionntan, Niamh, Orlaith, or Sorsha',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other point south',
      names: 'Arash, Azar, Hafiz, Murat, Roshan, Shideh, Zara, or Zohara',
    },
  ],
  judge: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Arianrhod, Caerwyn, Einion, Eleri, Magda, Nerys, Trahaern, or Trefor',
    },
    {
      value: 'barrier-pass',
      label: 'Barrier Pass',
      names: 'Arinasai, Bortachikhan, Khadagan, Khojin, Odval, Usun, Yesui, or Yul',
    },
    {
      value: 'gordins-delve',
      label: "Gordin's Delve",
      names: 'Pick a name from any list',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Briget, Comhall, Elnor, Liadain, Mirdach, Onghus, Somha, or Toal',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other southern town',
      names: 'Abrim, Cassander, Despina, Hypatta, Morecai, Nomika, Sofia, or Yose',
    },
  ],
  heavy: [
    {
      value: 'stonetop',
      label: 'Stonetop',
      names: 'Aerona, Arthfael, Cadmor, Esyllt, Pedr, Rhonwen, Terrwen, or Trystan',
    },
    {
      value: 'gordins-delve',
      label: "Gordin's Delve",
      names: 'Pick a name from any list',
    },
    {
      value: 'marshedge',
      label: 'Marshedge',
      names: 'Aengus, Bairbre, Bronach, Flann, Laughn, Muirdoc, Quinn, or Treasa',
    },
    {
      value: 'the-steplands',
      label: 'The Steplands (Hillfolk)',
      names: 'Andr, Gabrl, Kaetl, Mael, Maela, Par, Ral, or Umbert',
    },
    {
      value: 'the-manmarch',
      label: 'The Manmarch',
      names: 'Bathhilde, Clothar, Ganter, Hiltrude, Ludig, Luise, Modd, or Wiland',
    },
    {
      value: 'lygos-or-south',
      label: 'Lygos or some other point south',
      names: 'Arihl, Akios, Bhadur, Seble, Shahnaz, Shay, Tisi, or Zubin',
    },
  ],
};
