import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button } from '@/components/primitives';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Background, Instinct, Appearance, PlaceOfOrigin, Stats, CharacterStats, Moves, SpecialPossessions, Introductions } from '@/components/CharacterSheet/sections';
import { BlessedBackground, BlessedInstinct, BlessedAppearance, BlessedPlaceOfOrigin, BlessedSections } from '@/components/CharacterSheet/playbooks/BlessedSections';
import type { Character, CharacterData, GameSession, PlaybookType } from '@/types';
import styles from './CharacterPlaybook.module.css';

interface PlaybookSectionProps {
  character: Character;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

const BackgroundSection = ({ character, onSave }: PlaybookSectionProps) => {
  switch (character.playbook) {
    case 'blessed': return <BlessedBackground data={character.data} onSave={onSave} />;
    default: return <Background />;
  }
};

const InstinctSection = ({ character, onSave }: PlaybookSectionProps) => {
  switch (character.playbook) {
    case 'blessed': return <BlessedInstinct data={character.data} onSave={onSave} />;
    default: return <Instinct />;
  }
};

const AppearanceSection = ({ character, onSave }: PlaybookSectionProps) => {
  switch (character.playbook) {
    case 'blessed': return <BlessedAppearance data={character.data} onSave={onSave} />;
    default: return <Appearance />;
  }
};

const PlaceOfOriginSection = ({ character, onSave }: PlaybookSectionProps) => {
  switch (character.playbook) {
    case 'blessed': return <BlessedPlaceOfOrigin data={character.data} onSave={onSave} />;
    default: return <PlaceOfOrigin />;
  }
};

const StatsSection = ({ character, onSave }: PlaybookSectionProps) => {
  const playbookOption = PLAYBOOKS.find((p) => p.value === character.playbook);
  if (!playbookOption) return <Stats />;
  return <CharacterStats data={character.data} onSave={onSave} hpMax={playbookOption.hpMax} damage={playbookOption.damage} />;
};

const getTypeSpecificSections = (playbook: PlaybookType): React.ReactNode => {
  switch (playbook) {
    case 'blessed': return <BlessedSections />;
    default: return null;
  }
};

interface ContentProps {
  g: GameSession;
  id: string;
  playbook: PlaybookType;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
}

const CharacterPlaybookContent = ({ g, id, playbook, updateCharacterName, updateCharacterData }: ContentProps) => {
  const playbookOption = PLAYBOOKS.find((p) => p.value === playbook);
  const character = g.characters.find((c) => c.playbook === playbook);

  const handleSaveCharacterData = useCallback(
    (data: Partial<CharacterData>) => updateCharacterData(character?.id ?? '', data),
    [character?.id, updateCharacterData]
  );

  const handleSaveCharacterName = useCallback(
    (name: string) => updateCharacterName(character?.id ?? '', name),
    [character?.id, updateCharacterName]
  );

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

  const typeSpecific = getTypeSpecificSections(character.playbook);

  const pageTitle = characterName
    ? `${characterName} — ${playbookLabel} — Hearthfire`
    : `${playbookLabel} — Hearthfire`;

  return (
    <main className={styles.page}>
      <PageMeta
        title={pageTitle}
        description={`${playbookLabel} for ${gameName}. Track background, stats, moves, and more.`}
      />
      <PageHeader
        crumbs={crumbs}
        title={characterName || playbookLabel}
        titleLabel="Edit character name"
        subtitle={characterName ? playbookLabel : undefined}
        gameId={id}
        onSaveTitle={handleSaveCharacterName}
      />
      <div className={styles.layout}>
        <div className={styles.columns}>
          <div className={styles.colLeft}>
            <BackgroundSection
              character={character}
              onSave={handleSaveCharacterData}
            />
          </div>
          <div className={styles.colRight}>
            <InstinctSection
              character={character}
              onSave={handleSaveCharacterData}
            />
            <AppearanceSection character={character} onSave={handleSaveCharacterData} />
            <PlaceOfOriginSection character={character} onSave={handleSaveCharacterData} />
          </div>
        </div>
        <div className={styles.colFull}><StatsSection character={character} onSave={handleSaveCharacterData} /></div>
        <div className={styles.colFull}>
          <Moves
            playbook={character.playbook}
            data={character.data}
            onSave={handleSaveCharacterData}
            choose={playbookOption.choose}
          />
        </div>
        <div className={styles.colFull}><SpecialPossessions /></div>
        <div className={styles.columns}>
          <div className={styles.colLeft}>
            {typeSpecific}
          </div>
          <div className={styles.colRight}>
            <Introductions />
          </div>
        </div>
      </div>
    </main>
  );
};

export const CharacterPlaybook = () => {
  const { id = '', playbook = '' } = useParams<{ id: string; playbook: string }>();
  const { game, loading, error, updateCharacterName, updateCharacterData } = useGame(id);

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`} errorBackLabel="Back to Game">
      {(g) => (
        <CharacterPlaybookContent
          g={g}
          id={id}
          playbook={playbook as PlaybookType}
          updateCharacterName={updateCharacterName}
          updateCharacterData={updateCharacterData}
        />
      )}
    </GameGuard>
  );
};
