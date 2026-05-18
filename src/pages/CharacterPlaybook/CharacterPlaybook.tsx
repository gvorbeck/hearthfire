import { useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button, ScrollToTop, Tabs } from '@/components/primitives';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Background, Instinct, Appearance, PlaceOfOrigin, Stats, CharacterStats, Moves, SpecialPossessions, Introductions } from '@/components/CharacterSheet/sections';
import { BACKGROUND_OPTIONS } from '@/lib/backgroundOptions';
import { INSTINCT_OPTIONS } from '@/lib/instinctOptions';
import { BlessedAppearance, BlessedPlaceOfOrigin, BlessedSections, BlessedSpecialPossessions, BlessedIntroductions } from '@/components/CharacterSheet/playbooks/BlessedSections';
import type { Character, CharacterData, GameSession, PlaybookType } from '@/types';
import styles from './CharacterPlaybook.module.css';

const getCharacterLevel = (character: Character): number => {
  const parsed = parseInt(character.data?.statLevel ?? '', 10);
  return isNaN(parsed) ? character.level : parsed;
};

interface PlaybookSectionProps {
  character: Character;
  level: number;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

const BackgroundSection = ({ character, level, onSave }: PlaybookSectionProps) => {
  const options = BACKGROUND_OPTIONS[character.playbook];
  return <Background playbookKey={character.playbook} options={options} level={level} data={character.data} onSave={onSave} />;
};

const InstinctSection = ({ character, onSave }: PlaybookSectionProps) => {
  const options = INSTINCT_OPTIONS[character.playbook];
  return <Instinct playbookKey={character.playbook} options={options} data={character.data} onSave={onSave} />;
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

const SpecialPossessionsSection = ({ character, level, onSave }: PlaybookSectionProps) => {
  switch (character.playbook) {
    case 'blessed': return (
      <BlessedSpecialPossessions
        data={character.data}
        onSave={onSave}
        sacredPouchStock={character.data?.sacredPouchStock ?? 0}
        onStockChange={(n) => onSave({ sacredPouchStock: n })}
        level={level}
      />
    );
    default: return <SpecialPossessions />;
  }
};

const TypeSpecificSections = ({ character, onSave }: PlaybookSectionProps) => {
  switch (character.playbook) {
    case 'blessed': return <BlessedSections data={character.data} onSave={onSave} />;
    default: return null;
  }
};

const IntroductionsSection = ({ character, onSave }: PlaybookSectionProps) => {
  switch (character.playbook) {
    case 'blessed': return <BlessedIntroductions data={character.data} onSave={onSave} />;
    default: return <Introductions />;
  }
};

const PCPlaybookTab = ({ character, onSave }: Omit<PlaybookSectionProps, 'level'>) => {
  const level = getCharacterLevel(character);
  return (
    <div className={styles.layout}>
      <div className={styles.columns}>
        <div className={styles.colLeft}>
          <BackgroundSection character={character} level={level} onSave={onSave} />
        </div>
        <div className={styles.colRight}>
          <InstinctSection character={character} level={level} onSave={onSave} />
          <AppearanceSection character={character} level={level} onSave={onSave} />
          <PlaceOfOriginSection character={character} level={level} onSave={onSave} />
        </div>
      </div>
      <div className={styles.colFull}><StatsSection character={character} level={level} onSave={onSave} /></div>
      <div className={styles.colFull}>
        <Moves
          playbook={character.playbook}
          data={character.data}
          onSave={onSave}
          level={level}
        />
      </div>
      <div className={styles.colFull}><SpecialPossessionsSection character={character} level={level} onSave={onSave} /></div>
      <div className={styles.columns}>
        <div className={styles.colLeft}>
          <TypeSpecificSections character={character} level={level} onSave={onSave} />
        </div>
        <div className={styles.colRight}>
          <IntroductionsSection character={character} level={level} onSave={onSave} />
        </div>
      </div>
    </div>
  );
};

interface ContentProps {
  g: GameSession;
  id: string;
  playbook: PlaybookType;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
}

interface SheetProps {
  character: Character;
  playbookOption: (typeof PLAYBOOKS)[number];
  id: string;
  gameName: string;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
}

// Separate component so hooks are always called unconditionally (no early returns above them).
const CharacterSheet = ({ character, playbookOption, id, gameName, updateCharacterName, updateCharacterData }: SheetProps) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const handleSaveCharacterData = useCallback(
    (data: Partial<CharacterData>) => updateCharacterData(character.id, data),
    [updateCharacterData, character.id]
  );

  const handleSaveCharacterName = useCallback(
    (name: string) => updateCharacterName(character.id, name),
    [updateCharacterName, character.id]
  );

  const characterName = character.name?.trim();
  const playbookLabel = `${playbookOption.label} Playbook`;

  const crumbs = useMemo(() => [
    { label: gameName, to: `/game/${id}` },
    { label: playbookLabel },
  ], [gameName, id, playbookLabel]);

  const pageTitle = characterName
    ? `${characterName} — ${playbookLabel} — Hearthfire`
    : `${playbookLabel} — Hearthfire`;

  const tabs = useMemo(() => [
    {
      label: 'PC Playbook',
      content: <PCPlaybookTab character={character} onSave={handleSaveCharacterData} />,
    },
    {
      label: 'Inventory',
      content: null,
    },
  ], [character, handleSaveCharacterData]);

  return (
    <main className={styles.page}>
      <PageMeta
        title={pageTitle}
        description={`${playbookLabel} for ${gameName}. Track background, stats, moves, and more.`}
      />
      <ScrollToTop sentinelRef={headerRef} />
      <div ref={headerRef}>
        <PageHeader
          crumbs={crumbs}
          title={characterName || playbookLabel}
          titleLabel="Edit character name"
          subtitle={characterName ? playbookLabel : undefined}
          gameId={id}
          onSaveTitle={handleSaveCharacterName}
        />
      </div>
      {playbookOption.description && (
        <p className={styles.description}>{playbookOption.description}</p>
      )}
      <Tabs
        aria-label="Character sections"
        className={styles.tabs}
        tabs={tabs}
      />
    </main>
  );
};

const CharacterPlaybookContent = ({ g, id, playbook, updateCharacterName, updateCharacterData }: ContentProps) => {
  const playbookOption = PLAYBOOKS.find((p) => p.value === playbook);
  const character = g.characters.find((c) => c.playbook === playbook);

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

  return (
    <CharacterSheet
      character={character}
      playbookOption={playbookOption}
      id={id}
      gameName={g.name || DEFAULT_GAME_NAME}
      updateCharacterName={updateCharacterName}
      updateCharacterData={updateCharacterData}
    />
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
