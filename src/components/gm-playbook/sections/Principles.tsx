import { memo } from 'react';
import { List } from '@/components/ui';

export const Principles = memo(() => (
  <List variant="bullet" items={[
    'Follow the rules',
    'Begin and end with the fiction',
    'Address the characters, not the players',
    'Ask questions and build on the answers',
    'Be a fan of the player characters',
    'Embrace the fantastic and the mundane',
    'Exploit the setting guide',
    'Respect your prep',
    'Give your characters life',
    'Think offscreen, too',
    'Bring it home',
    'Let things breathe',
    'Let things burn',
  ]} />
));
