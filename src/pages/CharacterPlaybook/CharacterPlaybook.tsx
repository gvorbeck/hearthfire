import { useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button, ScrollToTop, Tabs } from '@/components/primitives';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Background, Instinct, Appearance, PlaceOfOrigin, Stats, Moves, SpecialPossessions, Introductions } from '@/components/CharacterSheet/sections';
import { BACKGROUND_OPTIONS } from '@/lib/backgroundOptions';
import { INSTINCT_OPTIONS } from '@/lib/instinctOptions';
import { APPEARANCE_OPTIONS } from '@/lib/appearanceOptions';
import { PLACE_OF_ORIGIN_OPTIONS } from '@/lib/placeOfOriginOptions';
import { SPECIAL_POSSESSIONS_OPTIONS } from '@/lib/specialPossessionsOptions';
import { INTRODUCTIONS_OPTIONS } from '@/lib/introductionsOptions';
import { BlessedSections } from '@/components/CharacterSheet/playbooks/BlessedSections';
import { FoxSections } from '@/components/CharacterSheet/playbooks/FoxSections';
import { HeavySections } from '@/components/CharacterSheet/playbooks/HeavySections';
import { JudgeSections } from '@/components/CharacterSheet/playbooks/JudgeSections';
import { LightbearerSections } from '@/components/CharacterSheet/playbooks/LightbearerSections';
import { MarshalSections } from '@/components/CharacterSheet/playbooks/MarshalSections';
import { RangerSections } from '@/components/CharacterSheet/playbooks/RangerSections';
import { SeekerSections } from '@/components/CharacterSheet/playbooks/SeekerSections';
import { WouldBeHeroSections } from '@/components/CharacterSheet/playbooks/WouldBeHeroSections';
import type { Character, CharacterData, GameSession, PlaybookType } from '@/types';
import styles from './CharacterPlaybook.module.css';

const WOULD_BE_HERO_SCORE_INSTRUCTION = 'Assign these scores: +1, +0, +0, +0, +0, -1. When a debility is marked, you roll with disadvantage.';

const getCharacterLevel = (character: Character): number => {
  const parsed = parseInt(character.data?.statLevel ?? '', 10);
  return isNaN(parsed) ? character.level : parsed;
};

const PCPlaybookTab = ({ character, playbookOption, onSave }: { character: Character; playbookOption: (typeof PLAYBOOKS)[number]; onSave: (data: Partial<CharacterData>) => Promise<void> }) => {
  const level = getCharacterLevel(character);
  const { playbook, data } = character;

  return (
    <div className={styles.layout}>
      <div className={styles.columns}>
        <div className={styles.colLeft}>
          <Background playbookKey={playbook} options={BACKGROUND_OPTIONS[playbook]} level={level} data={data} onSave={onSave} />
        </div>
        <div className={styles.colRight}>
          <Instinct playbookKey={playbook} options={INSTINCT_OPTIONS[playbook]} data={data} onSave={onSave} />
          <Appearance rows={APPEARANCE_OPTIONS[playbook]} data={data} onSave={onSave} />
          <PlaceOfOrigin options={PLACE_OF_ORIGIN_OPTIONS[playbook]} data={data} onSave={onSave} />
        </div>
      </div>
      <div className={styles.colFull}>
        <Stats
          data={data}
          onSave={onSave}
          hpMax={playbookOption?.hpMax}
          damage={playbookOption?.damage}
          scoreInstruction={playbook === 'would-be-hero' ? WOULD_BE_HERO_SCORE_INSTRUCTION : undefined}
        />
      </div>
      <div className={styles.colFull}>
        <Moves playbook={playbook} data={data} onSave={onSave} level={level} />
      </div>
      <div className={styles.colFull}>
        <SpecialPossessions config={SPECIAL_POSSESSIONS_OPTIONS[playbook]} data={data} onSave={onSave} level={level} />
      </div>
      <div className={styles.columns}>
        <div className={styles.colLeft}>
          {playbook === 'blessed' && <BlessedSections data={data} onSave={onSave} />}
          {playbook === 'fox' && <FoxSections data={data} onSave={onSave} />}
          {playbook === 'heavy' && <HeavySections data={data} onSave={onSave} />}
          {playbook === 'judge' && <JudgeSections data={data} onSave={onSave} />}
          {playbook === 'lightbearer' && <LightbearerSections data={data} onSave={onSave} />}
          {playbook === 'marshal' && <MarshalSections data={data} onSave={onSave} />}
          {playbook === 'ranger' && <RangerSections data={data} onSave={onSave} />}
          {playbook === 'seeker' && <SeekerSections data={data} onSave={onSave} />}
          {playbook === 'would-be-hero' && <WouldBeHeroSections data={data} onSave={onSave} />}
        </div>
        <div className={styles.colRight}>
          <Introductions config={INTRODUCTIONS_OPTIONS[playbook]} data={data} onSave={onSave} />
        </div>
      </div>
    </div>
  );
};

interface SheetProps {
  character: Character;
  playbookOption: (typeof PLAYBOOKS)[number];
  id: string;
  gameName: string;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
}

// Separate component so hooks always run before the early-return guards in CharacterPlaybookContent.
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

  const pageTitle = characterName
    ? `${characterName} — ${playbookLabel} — Hearthfire`
    : `${playbookLabel} — Hearthfire`;

  const crumbs = useMemo(() => [
    { label: gameName, to: `/game/${id}` },
    { label: playbookLabel },
  ], [gameName, id, playbookLabel]);

  const tabs = useMemo(() => [
    {
      label: 'PC Playbook',
      content: <PCPlaybookTab character={character} playbookOption={playbookOption} onSave={handleSaveCharacterData} />,
    },
    {
      label: 'Inventory',
      content: null,
    },
  ], [character, playbookOption, handleSaveCharacterData]);

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
      <Tabs aria-label="Character sections" className={styles.tabs} tabs={tabs} />
    </main>
  );
};

const CharacterPlaybookContent = ({ g, id, playbook, updateCharacterName, updateCharacterData }: {
  g: GameSession;
  id: string;
  playbook: PlaybookType;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
}) => {
  const playbookOption = PLAYBOOKS.find((p) => p.value === playbook);
  const character = g.characters.find((c) => c.playbook === playbook);

  if (!playbookOption) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Playbook not found</Heading>
        <Link to={`/game/${id}`}><Button variant="secondary">Back to Game</Button></Link>
      </main>
    );
  }

  if (!character) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Character not found</Heading>
        <Link to={`/game/${id}`}><Button variant="secondary">Back to Game</Button></Link>
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
