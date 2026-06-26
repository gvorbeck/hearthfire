import type { GameSession } from '@/types';
import type { DropdownGroup } from '@/components/ui';
import { getPlaybook } from '@/lib/constants';

/*
 * The header "switch" dropdown navigates by route path, so each option's value
 * IS the destination path. A page identifies its own option with a matching
 * `current` path so the select shows where you are.
 */
export interface GameNav {
  groups: DropdownGroup<string>[];
  current: string;
}

/*
 * buildGameNav — turn a loaded GameSession into the lateral-navigation option
 * list shown in the header. Groups the party characters together, then the
 * GM and Steading playbooks, so a GM can jump to any sibling page in one hop.
 *
 * `current` is the route path of the page being rendered; it must match one of
 * the option values for the select to reflect the active destination.
 */
export const buildGameNav = (game: GameSession, id: string, current: string): GameNav => {
  const base = `/game/${id}`;

  const characterOptions = game.characters.map((c) => {
    const playbookLabel = getPlaybook(c.playbook)?.label ?? c.playbook;
    const name = c.name?.trim();
    return {
      value: `${base}/${c.playbook}`,
      label: name ? `${name} — ${playbookLabel}` : playbookLabel,
    };
  });

  const groups: DropdownGroup<string>[] = [];
  if (characterOptions.length > 0) {
    groups.push({ label: 'Characters', options: characterOptions });
  }
  groups.push({
    label: 'Playbooks',
    options: [
      { value: `${base}/gm`, label: 'GM Playbook' },
      { value: `${base}/steading`, label: 'Steading Playbook' },
    ],
  });

  return { groups, current };
};
