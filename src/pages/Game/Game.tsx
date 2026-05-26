import { useState, useId, useCallback, useMemo, memo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { DEFAULT_GAME_NAME, PLAYBOOKS } from '@/lib/constants';
import { Button, Heading, Modal, Stack, Text } from '@/components/primitives';
import { GameIdModal } from '@/components/GameIdModal/GameIdModal';
import { AddCharacterModal } from '@/components/AddCharacterModal/AddCharacterModal';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { Character, GameSession } from '@/types';
import styles from './Game.module.css';

interface LocationState {
  isNew?: boolean;
}

interface RemoveCharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const RemoveCharacterModal = ({ character, onClose, onConfirm }: RemoveCharacterModalProps) => {
  const headingId = useId();
  const [removing, setRemoving] = useState(false);

  const handleConfirm = useCallback(async () => {
    setRemoving(true);
    try {
      await onConfirm();
      setRemoving(false);
      onClose();
    } catch {
      setRemoving(false);
    }
  }, [onConfirm, onClose]);

  const playbookOption = PLAYBOOKS.find((p) => p.value === character?.playbook);
  const playbookLabel = `${playbookOption?.label ?? character?.playbook} Playbook`;
  const characterName = character?.name?.trim();
  const displayName = characterName ? `${characterName} (${playbookLabel})` : playbookLabel;

  return (
    <Modal open={character !== null} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="sm" id={headingId}>Remove character?</Heading>
      <Text size="sm" color="muted">
        <strong>{displayName}</strong> will be permanently removed from this game. All character data will be lost and cannot be recovered.
      </Text>
      <div className={styles.modalActions}>
        <Button variant="ghost" size="md" onClick={onClose} disabled={removing}>Cancel</Button>
        <Button variant="primary" size="md" className={styles.removeBtn} onClick={handleConfirm} disabled={removing}>
          {removing ? 'Removing…' : 'Remove character'}
        </Button>
      </div>
    </Modal>
  );
};

interface CharacterRowProps {
  character: Character;
  gameId: string;
  onRemove: (character: Character) => void;
}

const CharacterRow = memo(({ character, gameId, onRemove }: CharacterRowProps) => {
  const playbookOption = PLAYBOOKS.find((p) => p.value === character.playbook);
  const playbookLabel = `${playbookOption?.label ?? character.playbook} Playbook`;
  const characterName = character.name?.trim();
  const buttonLabel = characterName ? `${characterName} — ${playbookLabel}` : playbookLabel;
  const handleRemove = useCallback(() => onRemove(character), [onRemove, character]);

  return (
    <div className={styles.characterRow}>
      <Link to={`/game/${gameId}/${character.playbook}`} className={styles.characterLink}>
        <Button variant="secondary" size="xl" fullWidth className={styles.characterLinkBtn}>
          <span className={styles.characterBtnText}>{buttonLabel}</span>
        </Button>
      </Link>
      <Button
        variant="ghost"
        icon="trash"
        className={styles.removeCharacterBtn}
        aria-label={`Remove ${buttonLabel}`}
        onClick={handleRemove}
      />
    </div>
  );
});

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
  onRemoveCharacter: ReturnType<typeof useGame>['removeCharacter'];
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
  onRemoveCharacter,
}: GameContentProps) => {
  const gameName = g.name || DEFAULT_GAME_NAME;
  const [removingCharacter, setRemovingCharacter] = useState<Character | null>(null);

  const handleCloseRemoveModal = useCallback(() => setRemovingCharacter(null), []);
  const handleConfirmRemove = useCallback(
    () => onRemoveCharacter(removingCharacter!.id),
    [onRemoveCharacter, removingCharacter],
  );

  const existingPlaybooks = useMemo(() => g.characters.map((c) => c.playbook), [g.characters]);

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
        existingPlaybooks={existingPlaybooks}
        onAdd={onAddCharacter}
      />
      <RemoveCharacterModal
        character={removingCharacter}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
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
                {g.characters.map((character) => (
                  <CharacterRow
                    key={character.id}
                    character={character}
                    gameId={id}
                    onRemove={setRemovingCharacter}
                  />
                ))}
              </Stack>
            )}
            <Button variant="secondary" size="xl" fullWidth onClick={onOpenAddCharacter}>
              Add Character
            </Button>
          </div>

          <div className={styles.sectionRight}>
            <div className={styles.section}>
              <Heading as="h2" size="label">Stonetop</Heading>
              <Link to={`/game/${id}/steading`}>
                <Button variant="secondary" size="xl" fullWidth>Open Steading Playbook</Button>
              </Link>
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
  const { game, loading, error, updateGameName, addCharacter, removeCharacter } = useGame(id);
  const [showIdModal, setShowIdModal] = useState((state as LocationState | null)?.isNew === true);
  const [showAddCharacter, setShowAddCharacter] = useState(false);

  const handleCloseIdModal = useCallback(() => setShowIdModal(false), []);
  const handleCloseAddCharacter = useCallback(() => setShowAddCharacter(false), []);
  const handleOpenAddCharacter = useCallback(() => setShowAddCharacter(true), []);

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
          onRemoveCharacter={removeCharacter}
        />
      )}
    </GameGuard>
  );
};
