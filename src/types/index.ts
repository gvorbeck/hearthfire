export type PlaybookType =
  | 'blessed'
  | 'fox'
  | 'heavy'
  | 'judge'
  | 'lightbearer'
  | 'marshal'
  | 'ranger'
  | 'seeker'
  | 'would-be-hero';

export interface Character {
  id: string;
  name: string;
  playbook: PlaybookType;
  level: number;
}

export interface GameSession {
  id: string;
  createdAt: number;
  characters: Character[];
}
