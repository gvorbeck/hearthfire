import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button, RuleDivider } from '@/components/primitives';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import type { PlaybookType } from '@/types';
import styles from './CharacterPlaybook.module.css';

export const CharacterPlaybook = () => {
  const { id = '', playbook = '' } = useParams<{ id: string; playbook: string }>();
  const { game, loading, error } = useGame(id);

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`} errorBackLabel="Back to Game">
      {(g) => {
        const playbookOption = PLAYBOOKS.find((p) => p.value === playbook);

        if (!playbookOption) {
          return (
            <main className={styles.centered}>
              <Heading as="h2" size="md">Playbook not found</Heading>
              <Link to={`/game/${id}`}>
                <Button variant="secondary">Back to Game</Button>
              </Link>
            </main>
          );
        }

        const character = g.characters.find((c) => c.playbook === (playbook as PlaybookType));
        const characterName = character?.name?.trim();
        const playbookLabel = `${playbookOption.label} Playbook`;
        const pageTitle = characterName ? `${characterName} — ${playbookLabel}` : playbookLabel;
        const gameName = g.name || DEFAULT_GAME_NAME;

        const crumbs = [
          { label: gameName, to: `/game/${id}` },
          { label: pageTitle },
        ];

        return (
          <main className={styles.page}>
            <div className={styles.header}>
              <Breadcrumb crumbs={crumbs} />
              <Heading as="h1" size="xl" className={styles.title}>{pageTitle}</Heading>
              <RuleDivider className={styles.titleRule} />
            </div>
          </main>
        );
      }}
    </GameGuard>
  );
};
