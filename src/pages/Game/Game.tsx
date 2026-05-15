import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { DEFAULT_GAME_NAME, PLAYBOOKS } from '@/lib/constants';
import { Button, Heading, Stack, Text } from '@/components/primitives';
import { GameIdModal } from '@/components/GameIdModal/GameIdModal';
import { AddCharacterModal } from '@/components/AddCharacterModal/AddCharacterModal';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { GameSession } from '@/types';
import styles from './Game.module.css';

interface LocationState {
  isNew?: boolean;
}

interface GameContentProps {
  g: GameSession;
  id: string;
  showIdModal: boolean;
  showAddCharacter: boolean;
  onCloseIdModal: () => void;
  onCloseAddCharacter: () => void;
  onOpenAddCharacter: () => void;
  onSaveTitle: (name: string) => Promise<void>;
  onAddCharacter: ReturnType<typeof useGame>['addCharacter'];
}

const GameContent = ({
  g,
  id,
  showIdModal,
  showAddCharacter,
  onCloseIdModal,
  onCloseAddCharacter,
  onOpenAddCharacter,
  onSaveTitle,
  onAddCharacter,
}: GameContentProps) => {
  const gameName = g.name || DEFAULT_GAME_NAME;

  return (
    <>
      <PageMeta
        title={`${gameName} — Hearthfire`}
        description={`Party tracker for ${gameName}. Manage characters and GM playbook.`}
      />
      <GameIdModal gameId={id} open={showIdModal} onClose={onCloseIdModal} />
      <AddCharacterModal
        open={showAddCharacter}
        onClose={onCloseAddCharacter}
        existingPlaybooks={g.characters.map((c) => c.playbook)}
        onAdd={onAddCharacter}
      />
      <main className={styles.page}>
        <PageHeader
          crumbs={[{ label: gameName }]}
          title={gameName}
          titleLabel="Edit game name"
          gameId={id}
          onSaveTitle={onSaveTitle}
        />
        <div className={styles.sections}>
          <div className={styles.sectionCharacters}>
            <Heading as="h2" size="label">Characters</Heading>
            {g.characters.length > 0 && (
              <Stack gap={3}>
                {g.characters.map((character) => {
                  const playbookOption = PLAYBOOKS.find((p) => p.value === character.playbook);
                  const playbookLabel = `${playbookOption?.label ?? character.playbook} Playbook`;
                  const characterName = character.name?.trim();
                  const buttonLabel = characterName ? `${characterName} — ${playbookLabel}` : playbookLabel;
                  return (
                    <Link key={character.id} to={`/game/${id}/${character.playbook}`}>
                      <Button variant="secondary" size="xl" fullWidth><span className={styles.characterBtnText}>{buttonLabel}</span></Button>
                    </Link>
                  );
                })}
              </Stack>
            )}
            <Button variant="secondary" size="xl" fullWidth onClick={onOpenAddCharacter}>
              Add Character
            </Button>
          </div>

          <div className={styles.sectionRight}>
            <div className={styles.section}>
              <Heading as="h2" size="label">Stonetop</Heading>
              <div className={styles.placeholder}>
                <Text color="muted" size="sm">Town playbook coming soon</Text>
              </div>
            </div>

            <div className={styles.section}>
              <Heading as="h2" size="label">GM Playbook</Heading>
              <Link to={`/game/${id}/gm`}>
                <Button variant="secondary" size="xl" fullWidth>Open Playbook</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export const Game = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { game, loading, error, updateGameName, addCharacter } = useGame(id);
  const [showIdModal, setShowIdModal] = useState((state as LocationState | null)?.isNew === true);
  const [showAddCharacter, setShowAddCharacter] = useState(false);

  const handleCloseIdModal = () => setShowIdModal(false);
  const handleCloseAddCharacter = () => setShowAddCharacter(false);
  const handleOpenAddCharacter = () => setShowAddCharacter(true);

  return (
    <GameGuard
      loading={loading}
      error={error}
      game={game}
      loadingText="Loading game…"
      notFoundMessage={`No game with ID "${id}" exists.`}
    >
      {(g) => (
        <GameContent
          g={g}
          id={id}
          showIdModal={showIdModal}
          showAddCharacter={showAddCharacter}
          onCloseIdModal={handleCloseIdModal}
          onCloseAddCharacter={handleCloseAddCharacter}
          onOpenAddCharacter={handleOpenAddCharacter}
          onSaveTitle={updateGameName}
          onAddCharacter={addCharacter}
        />
      )}
    </GameGuard>
  );
};
