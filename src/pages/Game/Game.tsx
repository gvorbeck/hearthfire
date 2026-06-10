import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import clsx from 'clsx';
import { useParams, Link, useLocation } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { DEFAULT_GAME_NAME, getPlaybook, PLAYBOOKS } from '@/lib/constants';
import { Button, Heading, Icon, Stack, Text } from '@/components/ui';
import { GameIdModal } from './modals/GameIdModal';
import { AddCharacterModal } from './modals/AddCharacterModal';
import { RemoveCharacterModal } from './modals/RemoveCharacterModal';
import { GameGuard } from '@/components/app/GameGuard/GameGuard';
import { PageLayout } from '@/components/app/PageLayout/PageLayout';
import type { Character, GameSession } from '@/types';
import styles from './Game.module.css';

interface LocationState {
  isNew?: boolean;
}


interface CharacterRowProps {
  character: Character;
  gameId: string;
  showGrip: boolean;
  isDragging: boolean;
  onRemove: (character: Character) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const CharacterRow = memo(({ character, gameId, showGrip, isDragging, onRemove, onDragStart, onDragOver, onDrop, onDragEnd }: CharacterRowProps) => {
  const playbookOption = getPlaybook(character.playbook);
  const playbookLabel = `${playbookOption?.label ?? character.playbook} Playbook`;
  const characterName = character.name?.trim();
  const buttonLabel = characterName ? `${characterName} — ${playbookLabel}` : playbookLabel;
  const handleRemove = useCallback(() => onRemove(character), [onRemove, character]);
  const handleDragStart = useCallback((e: React.DragEvent) => onDragStart(e, character.id), [onDragStart, character.id]);
  const handleDragOver = useCallback((e: React.DragEvent) => onDragOver(e, character.id), [onDragOver, character.id]);
  const rowCx = clsx(styles.characterRow, isDragging && styles.dragging);
  const linkCx = clsx(styles.characterLink, styles.characterLinkBtn);

  return (
    <div
      role="listitem"
      className={rowCx}
      draggable={showGrip}
      aria-label={showGrip ? `${buttonLabel}, drag to reorder` : buttonLabel}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {showGrip && (
        <span className={styles.gripHandle} aria-hidden="true">
          <Icon name="grip" size="small" />
        </span>
      )}
      <Button as={Link} to={`/game/${gameId}/${character.playbook}`} variant="secondary" size="xl" fullWidth className={linkCx}>
        <span className={styles.characterBtnText}>{buttonLabel}</span>
      </Button>
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
  onReorderCharacters: ReturnType<typeof useGame>['reorderCharacters'];
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
  onReorderCharacters,
}: GameContentProps) => {
  const gameName = g.name || DEFAULT_GAME_NAME;
  const [removingCharacter, setRemovingCharacter] = useState<Character | null>(null);
  const [orderedCharacters, setOrderedCharacters] = useState<Character[]>(g.characters);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const orderedCharactersRef = useRef<Character[]>(g.characters);

  useEffect(() => {
    if (!draggingIdRef.current) setOrderedCharacters(g.characters);
  }, [g.characters]);

  const handleRemoveCharacter = useCallback((character: Character) => setRemovingCharacter(character), []);
  const handleCloseRemoveModal = useCallback(() => setRemovingCharacter(null), []);
  const handleConfirmRemove = useCallback(
    () => {
      if (!removingCharacter) return Promise.resolve();
      return onRemoveCharacter(removingCharacter.id);
    },
    [onRemoveCharacter, removingCharacter],
  );

  const existingPlaybooks = useMemo(() => g.characters.map((c) => c.playbook), [g.characters]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    draggingIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();

    // Auto-scroll when dragging within 80px of the viewport top or bottom edge.
    const SCROLL_ZONE = 80;
    const SCROLL_SPEED = 8;
    const { clientY } = e;
    if (clientY < SCROLL_ZONE) {
      window.scrollBy(0, -SCROLL_SPEED);
    } else if (clientY > window.innerHeight - SCROLL_ZONE) {
      window.scrollBy(0, SCROLL_SPEED);
    }

    if (draggingIdRef.current === id) return;
    setOrderedCharacters((prev) => {
      const from = prev.findIndex((c) => c.id === draggingIdRef.current);
      const to = prev.findIndex((c) => c.id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      next.splice(to, 0, next.splice(from, 1)[0]);
      orderedCharactersRef.current = next;
      return next;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnd = useCallback(() => {
    draggingIdRef.current = null;
    setDraggingId(null);
    onReorderCharacters(orderedCharactersRef.current);
  }, [onReorderCharacters]);

  const showGrip = orderedCharacters.length > 1;

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
        open={!!removingCharacter}
        character={removingCharacter}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
      />
      <PageLayout
        crumbs={[{ label: gameName }]}
        title={gameName}
        titleLabel="Edit game name"
        gameId={id}
        onSaveTitle={onSaveTitle}
      >
        <div className={styles.sections}>
          <div className={styles.sectionCharacters}>
            <Heading as="h2" size="label">Characters</Heading>
            {orderedCharacters.length === 0 ? (
              <div className={styles.placeholder}>
                <Text color="muted">Your party roster is empty. Add a character to get started.</Text>
              </div>
            ) : (
              <Stack gap={3} role="list">
                {orderedCharacters.map((character) => (
                  <CharacterRow
                    key={character.id}
                    character={character}
                    gameId={id}
                    showGrip={showGrip}
                    isDragging={draggingId === character.id}
                    onRemove={handleRemoveCharacter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </Stack>
            )}
            <Button variant="secondary" size="xl" fullWidth onClick={onOpenAddCharacter} disabled={existingPlaybooks.length >= PLAYBOOKS.length}>
              Add Character Playbook
            </Button>
          </div>

          <div className={styles.sectionRight}>
            <div className={styles.section}>
              <Heading as="h2" size="label">Stonetop</Heading>
              <Button as={Link} to={`/game/${id}/steading`} variant="secondary" size="xl" fullWidth>Open Steading Playbook</Button>
            </div>

            <div className={styles.section}>
              <Heading as="h2" size="label">GM Playbook</Heading>
              <Button as={Link} to={`/game/${id}/gm`} variant="secondary" size="xl" fullWidth>Open GM Playbook</Button>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export const Game = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { game, loading, error, updateGameName, addCharacter, removeCharacter, reorderCharacters } = useGame(id);
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
          onReorderCharacters={reorderCharacters}
        />
      )}
    </GameGuard>
  );
};
