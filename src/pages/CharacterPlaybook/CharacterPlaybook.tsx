import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button } from '@/components/primitives';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Background, Instinct, Appearance, PlaceOfOrigin, Stats, Moves, SpecialPossessions, Introductions } from '@/components/CharacterSheet/sections';
import { BlessedSections } from '@/components/CharacterSheet/playbooks/BlessedSections';
import type { GameSession, PlaybookType } from '@/types';
import styles from './CharacterPlaybook.module.css';

const getTypeSpecificSections = (playbook: PlaybookType): React.ReactNode => {
  switch (playbook) {
    case 'blessed': return <BlessedSections />;
    default: return null;
  }
};

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
  const typeSpecific = getTypeSpecificSections(character.playbook);

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
      <div className={styles.grid}>
        <div className={styles.colLeft}><Background /></div>
        <div className={styles.colRight}><Instinct /></div>
        <div className={styles.colRight}><Appearance /></div>
        <div className={styles.colRight}><PlaceOfOrigin /></div>
        <div className={styles.colFull}><Stats /></div>
        <div className={styles.colFull}><Moves /></div>
        <div className={styles.colFull}><SpecialPossessions /></div>
        {typeSpecific && <div className={styles.colLeft}>{typeSpecific}</div>}
        <div className={styles.colRight}><Introductions /></div>
      </div>
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
