import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button } from '@/components/primitives';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { GameSession } from '@/types';
import type { PlaybookType } from '@/types';
import styles from './CharacterPlaybook.module.css';

interface ContentProps {
  g: GameSession;
  id: string;
  playbook: string;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
}

const CharacterPlaybookContent = ({ g, id, playbook, updateCharacterName }: ContentProps) => {
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

  if (!character) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Character not found</Heading>
        <Link to={`/game/${id}`}>
          <Button variant="secondary">Back to Game</Button>
        </Link>
      </main>
    );
  }

  const characterName = character.name?.trim();
  const playbookLabel = `${playbookOption.label} Playbook`;
  const gameName = g.name || DEFAULT_GAME_NAME;

  const crumbs = [
    { label: gameName, to: `/game/${id}` },
    { label: playbookLabel },
  ];

  const saveCharacterName = (name: string) => updateCharacterName(character.id, name);

  return (
    <main className={styles.page}>
      <PageHeader
        crumbs={crumbs}
        title={characterName || playbookLabel}
        titleLabel="Edit character name"
        subtitle={characterName ? playbookLabel : undefined}
        gameId={id}
        onSaveTitle={saveCharacterName}
      />
    </main>
  );
};

export const CharacterPlaybook = () => {
  const { id = '', playbook = '' } = useParams<{ id: string; playbook: string }>();
  const { game, loading, error, updateCharacterName } = useGame(id);

  const handleUpdateCharacterName = useCallback(
    (characterId: string, name: string) => updateCharacterName(characterId, name),
    [updateCharacterName]
  );

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`} errorBackLabel="Back to Game">
      {(g) => (
        <CharacterPlaybookContent
          g={g}
          id={id}
          playbook={playbook}
          updateCharacterName={handleUpdateCharacterName}
        />
      )}
    </GameGuard>
  );
};
