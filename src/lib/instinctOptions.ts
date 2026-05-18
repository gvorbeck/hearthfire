import type { PlaybookType } from '@/types';

export interface InstinctOption {
  value: string;
  label: string;
  description: string;
}

export const INSTINCT_OPTIONS: Partial<Record<PlaybookType, InstinctOption[]>> = {
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
};
