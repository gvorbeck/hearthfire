import type { PlaybookType, RadioOption } from '@/types';

export const INSTINCT_OPTIONS: Partial<Record<PlaybookType, RadioOption[]>> = {
  blessed: [
    { value: 'delight', label: 'DELIGHT', description: 'To find beauty, in even the ugliest things.' },
    { value: 'detachment', label: 'DETACHMENT', description: 'To remain unmoved, to be cold as winter.' },
    { value: 'nurture', label: 'NURTURE', description: 'To help others grow, learn, or improve.' },
    { value: 'preservation', label: 'PRESERVATION', description: 'To protect the natural world.' },
    { value: 'reverence', label: 'REVERENCE', description: 'To honor the spirits and give them their due.' },
  ],
  fox: [
    { value: 'conscience', label: 'CONSCIENCE', description: 'To feel guilty, to try to do right.' },
    { value: 'freedom', label: 'FREEDOM', description: 'To chafe against rules, expectations, obligations.' },
    { value: 'comfort', label: 'COMFORT', description: 'To enjoy yourself and avoid hardship.' },
    { value: 'prestige', label: 'PRESTIGE', description: 'To impress others, to build a name for yourself.' },
    { value: 'trickery', label: 'TRICKERY', description: 'To deceive, misdirect, outthink.' },
  ],
  heavy: [
    { value: 'peace', label: 'PEACE', description: 'To avoid (further) bloodshed or violence.' },
    { value: 'pride', label: 'PRIDE', description: 'To maintain your dignity, to demand respect.' },
    { value: 'recklessness', label: 'RECKLESSNESS', description: 'To act without thought to the consequences.' },
    { value: 'trouble', label: 'TROUBLE', description: 'To stick your nose in where it\'s unwelcome.' },
    { value: 'violence', label: 'VIOLENCE', description: 'To solve problems by force.' },
  ],
  judge: [
    { value: 'ambition', label: 'AMBITION', description: 'To increase your status or influence.' },
    { value: 'dispassion', label: 'DISPASSION', description: 'To disregard emotion or sentiment.' },
    { value: 'harmony', label: 'HARMONY', description: 'To seek a path that makes everyone happy.' },
    { value: 'orthodoxy', label: 'ORTHODOXY', description: 'To strictly adhere to rules and traditions.' },
    { value: 'zeal', label: 'ZEAL', description: 'To judge quickly and without doubt.' },
  ],
  lightbearer: [
    { value: 'charity', label: 'CHARITY', description: 'To go without so that others are better off.' },
    { value: 'hope', label: 'HOPE', description: 'To inspire others in the face of adversity.' },
    { value: 'mercy', label: 'MERCY', description: 'To bring relief or comfort, to give second chances.' },
    { value: 'praise', label: 'PRAISE', description: 'To spread the glory and worship of Helior.' },
    { value: 'righteousness', label: 'RIGHTEOUSNESS', description: 'To refuse to suffer an injustice or a lesser evil.' },
  ],
  marshal: [
    { value: 'authority', label: 'AUTHORITY', description: 'To take charge and throw your weight around.' },
    { value: 'caution', label: 'CAUTION', description: 'To keep everyone safe, to agonize over decisions.' },
    { value: 'drive', label: 'DRIVE', description: 'To take on ever more responsibility.' },
    { value: 'honor', label: 'HONOR', description: 'To keep your word, to follow a moral code.' },
    { value: 'ruthlessness', label: 'RUTHLESSNESS', description: 'To do whatever it takes to win or survive.' },
  ],
  ranger: [
    { value: 'adventure', label: 'ADVENTURE', description: 'To test yourself, to experience new things.' },
    { value: 'independence', label: 'INDEPENDENCE', description: 'To refuse help and push others away.' },
    { value: 'stewardship', label: 'STEWARDSHIP', description: 'To value beasts and natural places over people.' },
    { value: 'tenacity', label: 'TENACITY', description: 'To be stubborn, to persist.' },
    { value: 'wonder', label: 'WONDER', description: 'To marvel at beauty, magnificence, splendor.' },
  ],
  seeker: [
    { value: 'cunning', label: 'CUNNING', description: 'To scheme, manipulate, and plot.' },
    { value: 'curiosity', label: 'CURIOSITY', description: 'To seek answers that maybe you oughtn\'t.' },
    { value: 'hubris', label: 'HUBRIS', description: 'To assume you know best, that you can\'t fail.' },
    { value: 'mystery', label: 'MYSTERY', description: 'To avoid straight answers; to keep secrets.' },
    { value: 'vision', label: 'VISION', description: 'To think big and pursue grandiose goals.' },
  ],
  'would-be-hero': [
    { value: 'defiance', label: 'DEFIANCE', description: 'To refuse to back down, give up, give in.' },
    { value: 'doubt', label: 'DOUBT', description: 'To question yourself, your actions, your worth.' },
    { value: 'earnestness', label: 'EARNESTNESS', description: 'To prove yourself, to yourself and others.' },
    { value: 'optimism', label: 'OPTIMISM', description: 'To assume the best, and that things are simple.' },
    { value: 'sacrifice', label: 'SACRIFICE', description: 'To put the needs/wants of others above your own.' },
  ],
};
