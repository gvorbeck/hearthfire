import React, { useRef, useCallback, useMemo, useState, useId } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button, ScrollToTop, Tabs, tabBadgeClass, Modal, Radio } from '@/components/primitives';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Background, Instinct, Appearance, PlaceOfOrigin, Stats, Moves, SpecialPossessions, Introductions } from '@/components/CharacterSheet/sections';
import { BACKGROUND_OPTIONS, FOX_LIFE_OF_CRIME_BACKGROUND } from '@/lib/backgroundOptions';
import { INSTINCT_OPTIONS } from '@/lib/instinctOptions';
import { APPEARANCE_OPTIONS } from '@/lib/appearanceOptions';
import { PLACE_OF_ORIGIN_OPTIONS } from '@/lib/placeOfOriginOptions';
import { SPECIAL_POSSESSIONS_OPTIONS } from '@/lib/specialPossessionsOptions';
import { INTRODUCTIONS_OPTIONS } from '@/lib/introductionsOptions';
import { featurePatch, resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { BlessedInitiatesOfDanu } from '@/components/CharacterSheet/playbooks/blessed/BlessedInitiatesOfDanu';
import { BlessedSacredPouch } from '@/components/CharacterSheet/playbooks/blessed/BlessedSacredPouch';
import { BlessedEarthMother } from '@/components/CharacterSheet/playbooks/blessed/BlessedEarthMother';
import { FoxTallTales } from '@/components/CharacterSheet/playbooks/fox/FoxTallTales';
import { HeavyViolence } from '@/components/CharacterSheet/playbooks/heavy/HeavyViolence';
import { JudgeChronicle } from '@/components/CharacterSheet/playbooks/judge/JudgeChronicle';
import { JudgeLawkeeper } from '@/components/CharacterSheet/playbooks/judge/JudgeLawkeeper';
import { LightbearerPraiseTheDay } from '@/components/CharacterSheet/playbooks/lightbearer/LightbearerPraiseTheDay';
import { LightbearerInvocations } from '@/components/CharacterSheet/playbooks/lightbearer/LightbearerInvocations';
import { MarshalWarStories } from '@/components/CharacterSheet/playbooks/marshal/MarshalWarStories';
import { MarshalCrew } from '@/components/CharacterSheet/playbooks/marshal/MarshalCrew';
import { RangerSomethingWicked } from '@/components/CharacterSheet/playbooks/ranger/RangerSomethingWicked';
import { SeekerCollection } from '@/components/CharacterSheet/playbooks/seeker/SeekerCollection';
import { WouldBeHeroFearAnger } from '@/components/CharacterSheet/playbooks/would-be-hero/WouldBeHeroFearAnger';
import charSheetStyles from '@/components/CharacterSheet/CharacterSheet.module.css';
import type { Character, CharacterData, GameSession, PlaybookType } from '@/types';
import styles from './CharacterPlaybook.module.css';

type PlaybookSectionComponent = React.ComponentType<{ data: CharacterData | undefined; onSave: (data: Partial<CharacterData>) => Promise<void> }>;

const PLAYBOOK_SECTIONS: Partial<Record<PlaybookType, PlaybookSectionComponent[]>> = {
  blessed: [BlessedSacredPouch, BlessedEarthMother],
  fox: [FoxTallTales],
  heavy: [HeavyViolence],
  judge: [JudgeChronicle, JudgeLawkeeper],
  lightbearer: [LightbearerPraiseTheDay],
  marshal: [MarshalWarStories],
  ranger: [RangerSomethingWicked],
  seeker: [SeekerCollection],
  'would-be-hero': [WouldBeHeroFearAnger],
};

const WOULD_BE_HERO_SCORE_INSTRUCTION = 'Assign these scores: 1, 0, 0, 0, 0, -1. When a debility is marked, you roll with disadvantage.';

const getCharacterLevel = (character: Character): number => {
  const parsed = parseInt(character.data?.statLevel ?? '', 10);
  return isNaN(parsed) ? character.level : parsed;
};

const PCPlaybookTab = ({ character, playbookOption, onSave }: { character: Character; playbookOption: (typeof PLAYBOOKS)[number]; onSave: (data: Partial<CharacterData>) => Promise<void> }) => {
  const level = getCharacterLevel(character);
  const { playbook, data } = character;

  const foxChooseOverride = playbook === 'fox' && data?.background === FOX_LIFE_OF_CRIME_BACKGROUND
    ? { count: 3, note: '+1 from A Life of Crime' }
    : undefined;

  return (
    <div className={styles.layout}>
      <div className={styles.columns}>
        <div className={styles.colLeft}>
          <Stats
            data={data}
            onSave={onSave}
            hpMax={playbookOption?.hpMax}
            damage={playbookOption?.damage}
            scoreInstruction={playbook === 'would-be-hero' ? WOULD_BE_HERO_SCORE_INSTRUCTION : undefined}
          />
          <Background playbookKey={playbook} options={BACKGROUND_OPTIONS[playbook]} level={level} data={data} onSave={onSave} />
        </div>
        <div className={styles.colRight}>
          <Instinct playbookKey={playbook} options={INSTINCT_OPTIONS[playbook]} data={data} onSave={onSave} />
          <Appearance rows={APPEARANCE_OPTIONS[playbook]} data={data} onSave={onSave} />
          <PlaceOfOrigin options={PLACE_OF_ORIGIN_OPTIONS[playbook]} data={data} onSave={onSave} />
        </div>
      </div>
      <div className={styles.colFull}>
        <Moves playbook={playbook} data={data} onSave={onSave} level={level} />
      </div>
      <div className={styles.colFull}>
        <SpecialPossessions config={SPECIAL_POSSESSIONS_OPTIONS[playbook]} data={data} onSave={onSave} level={level} chooseOverride={foxChooseOverride} />
      </div>
      <div className={styles.columns}>
        <div className={styles.colLeft}>
          {PLAYBOOK_SECTIONS[playbook] && (
            <div className={charSheetStyles.stack}>
              {PLAYBOOK_SECTIONS[playbook]!.map((Section) => (
                <Section key={Section.name} data={data} onSave={onSave} />
              ))}
            </div>
          )}
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
  prosperity: number;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
}

type PlaybookTab = { id: string; label: string; content: React.ReactNode };

const getPlaybookTabs = (playbook: PlaybookType, data: CharacterData | undefined): PlaybookTab[] => {
  const tabs: PlaybookTab[] = [];
  if (playbook === 'lightbearer') tabs.push({ id: 'invocations', label: 'Invocations', content: null });
  if (playbook === 'ranger') tabs.push({ id: 'animal-companion', label: 'Animal Companion', content: null });
  if (playbook === 'marshal') tabs.push({ id: 'crew', label: 'Crew', content: null });
  if (playbook === 'blessed' && data?.background === 'initiate') tabs.push({ id: 'initiates-of-danu', label: 'Initiates of Danu', content: null });
  return tabs;
};

const INSERT_OPTIONS = ['Revenant', 'Ghost', 'Thrall'] as const;
type InsertOption = typeof INSERT_OPTIONS[number];

const AddInsertModal = ({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (insert: InsertOption) => void }) => {
  const headingId = useId();
  const [selected, setSelected] = useState<InsertOption>(INSERT_OPTIONS[0]);

  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.currentTarget.value as InsertOption);
  }, []);

  const handleAdd = useCallback(() => {
    onAdd(selected);
  }, [onAdd, selected]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="md" id={headingId}>Add an Insert</Heading>
      <div className={styles.insertOptions}>
        {INSERT_OPTIONS.map((opt) => (
          <Radio
            key={opt}
            name="insert-option"
            value={opt}
            label={opt}
            checked={selected === opt}
            onChange={handleSelectChange}
          />
        ))}
      </div>
      <div className={styles.insertActions}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAdd}>Add</Button>
      </div>
    </Modal>
  );
};

// Hooks must run unconditionally — split from CharacterPlaybookContent to avoid running hooks after early-return guards.
const CharacterSheet = ({ character, playbookOption, id, gameName, prosperity, updateCharacterName, updateCharacterData }: SheetProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [addTabOpen, setAddTabOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleOpenAddTab = useCallback(() => setAddTabOpen(true), []);
  const handleCloseAddTab = useCallback(() => setAddTabOpen(false), []);

  const handleSaveCharacterData = useCallback(
    (data: Partial<CharacterData>) => updateCharacterData(character.id, data),
    [updateCharacterData, character.id]
  );

  const handleSaveCharacterName = useCallback(
    (name: string) => updateCharacterName(character.id, name),
    [updateCharacterName, character.id]
  );

  const handleAddInsert = useCallback(async (insert: InsertOption) => {
    const current = character.data?.inserts ?? [];
    if (current.includes(insert)) {
      setAddTabOpen(false);
      return;
    }
    const next = [...current, insert];
    const fixedTabCount = 2 + getPlaybookTabs(character.playbook, character.data).length;
    await handleSaveCharacterData({ inserts: next });
    setActiveIndex(fixedTabCount + next.length - 1);
    setAddTabOpen(false);
  }, [character.data, character.playbook, handleSaveCharacterData]);

  const characterName = character.name?.trim();
  const playbookLabel = `${playbookOption.label} Playbook`;

  const pageTitle = characterName
    ? `${characterName} — ${playbookLabel} — Hearthfire`
    : `${playbookLabel} — Hearthfire`;

  const crumbs = useMemo(() => [
    { label: gameName, to: `/game/${id}` },
    { label: playbookLabel },
  ], [gameName, id, playbookLabel]);

  const playbookTabs = useMemo(() =>
    getPlaybookTabs(character.playbook, character.data),
    [character.playbook, character.data]
  );

  const level = getCharacterLevel(character);
  const features = resolvePlaybookFeatures(character.data);
  const knownInvocations = Object.values(features.lightbearerInvocations ?? {}).filter(Boolean).length;
  const invocationsAllowed = 2 + Math.floor(level / 2);
  const dismissedAt = features.lightbearerInvocationsBadgeDismissedAt ?? 0;
  const showInvocationsBadge =
    character.playbook === 'lightbearer' &&
    level > 0 && level % 2 === 0 &&
    knownInvocations < invocationsAllowed &&
    dismissedAt !== level;

  const invocationsTabIndex = playbookTabs.findIndex(({ id }) => id === 'invocations');

  const handleActiveChange = useCallback((i: number) => {
    setActiveIndex(i);
    if (showInvocationsBadge && invocationsTabIndex !== -1 && i === 2 + invocationsTabIndex) {
      handleSaveCharacterData(featurePatch(character.data, { lightbearerInvocationsBadgeDismissedAt: level }));
    }
  }, [showInvocationsBadge, invocationsTabIndex, handleSaveCharacterData, character.data, level]);

  const tabs = useMemo(() => [
    {
      label: 'PC Playbook',
      content: <PCPlaybookTab character={character} playbookOption={playbookOption} onSave={handleSaveCharacterData} />,
    },
    {
      label: 'Inventory',
      content: null,
    },
    ...playbookTabs.map(({ id, label, content }) => ({
      label,
      badge: id === 'invocations' && showInvocationsBadge
        ? <span className={tabBadgeClass} aria-label="New Invocation available" />
        : undefined,
      badgeTooltip: id === 'invocations' && showInvocationsBadge
        ? 'A new Invocation can be selected'
        : undefined,
      content: id === 'initiates-of-danu'
        ? <BlessedInitiatesOfDanu data={character.data} onSave={handleSaveCharacterData} />
        : id === 'invocations'
          ? <LightbearerInvocations data={character.data} onSave={handleSaveCharacterData} />
          : id === 'crew'
            ? <MarshalCrew data={character.data} prosperity={prosperity} onSave={handleSaveCharacterData} />
            : content,
    })),
    ...(character.data?.inserts ?? []).map((label) => ({ label, content: null })),
  ], [character, playbookOption, handleSaveCharacterData, playbookTabs, showInvocationsBadge]);

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
        activeIndex={activeIndex}
        onActiveChange={handleActiveChange}
        onAdd={handleOpenAddTab}
      />
      <AddInsertModal open={addTabOpen} onClose={handleCloseAddTab} onAdd={handleAddInsert} />
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
  const prosperity = g.prosperity ?? 0;
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
      prosperity={prosperity}
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
