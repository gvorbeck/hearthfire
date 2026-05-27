export const STONETOP_NAMES_STR = 'Aderyn, Aeronwen, Afanen, Afon, Alun, Andras, Aneirin, Awstin, Bedwyr, Berwyn, Betrys, Braith, Briallen, Bronwen, Bryn, Cadi, Cadoc, Cadwygan, Caron, Cefin, Ceinwen, Ceridwyn, Cerys, Colwyn, Deiniol, Dilwen, Dylis, Eifion, Eirlys, Eluned, Emrys, Enfys, Eurwen, Gaenor, Garet, Gethin, Glyndir, Heledd, Hywel, Ifan, Iorwerth, Iwan, Leuca, Lewela, Linos, Mado, Maldwyn, Malon, Mared, Marged, Martyn, Meirion, Menwen, Mererid, Neirin, Nia, Ofydd, Olwyn, Owain, Padrig, Parry, Pryce, Pryder, Rheinal, Rhisiart, Rhosyn, Rydderch, Sawyl, Siana, Sioned, Talfryn, Tegid, Tiwlip, Tomos, Tudyr, Winifred, Yorath';
export const MARSHEDGE_NAMES_STR = 'Abben, Ailen, Brin, Brogan, Catlin, Coln, Daedre, Dermos, Ennin, Finnen, Gilor, Isbeal, Kiran, Lile, Lim, Mathuin, Mirne, Noren, Owan, Ragan, Renan, Seadha, Seann, Tierney, Ulliam';
export const HILLFOLK_NAMES_STR = 'Adm, Blej, Cirl, Davth, Elst, Gwilm, Gwenl, Henri, Ines, Jenfir, Jown, Juda, Kiln, Laurl, Loic, Merrn, Maikl, Nanzl, Nolwn, Quent, Reegn, Ropr, Sabi, Stren, Yanz';
export const SOUTHERN_NAMES_STR = 'Agatte, Aref, Alix, Baraz, Canan, Darya, Demetra, Elene, Elios, Fotios, Faruza, Golza, Iasos, Iona, Kyriakos, Marika, Maayan, Osher, Natasa, Nivola, Rinat, Stamat, Thecla, Zhaleh';
export const MANMARCH_NAMES_STR = 'Alther, Bathhilde, Berkhard, Bertrim, Clothar, Dagmar, Elfrida, Ganter, Gerhild, Hartig, Hilde, Hiltrude, Hramn, Ludig, Luise, Meike, Modd, Sabrinne, Swanhilde, Ulrike, Urrsla, Weillem, Wiland, Wulfrim';
export const BARRIER_PASS_NAMES_STR = 'Choden, Dawa, Dorji, Duga, Jamya, Kunza, Lhamo, Norbu, Nyado, Passan, Sonam, Tashi, Tenzi, Tseri, Wanchu, Yonta';

const ALL_NAMES = [
  STONETOP_NAMES_STR,
  MARSHEDGE_NAMES_STR,
  HILLFOLK_NAMES_STR,
  SOUTHERN_NAMES_STR,
  MANMARCH_NAMES_STR,
  BARRIER_PASS_NAMES_STR,
].flatMap((s) => s.split(', '));

export const randomNpcName = () => ALL_NAMES[Math.floor(Math.random() * ALL_NAMES.length)];
