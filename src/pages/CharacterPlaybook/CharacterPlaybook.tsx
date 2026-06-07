import { useRef, useCallback, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button, ScrollToTop, Tabs, tabBadgeClass, Icon, Text, PlaybookColumns } from '@/components/ui';
import { AddInsertModal } from './modals/AddInsertModal';
import { RemoveInsertModal } from './modals/RemoveInsertModal';
import { GameGuard } from '@/components/app/GameGuard/GameGuard';
import { PageLayout } from '@/components/app/PageLayout/PageLayout';
import { Background, RadioSelect, Appearance, Stats, Moves, SpecialPossessions, Introductions, Inventory } from '@/components/character/sections';
import { ArcanaTab } from '@/components/character/sections/Arcana/ArcanaTab';
import { BACKGROUND_OPTIONS, FOX_LIFE_OF_CRIME_BACKGROUND } from '@/lib/backgroundOptions';
import { INSTINCT_OPTIONS } from '@/lib/instinctOptions';
import { APPEARANCE_OPTIONS } from '@/lib/appearanceOptions';
import { PLACE_OF_ORIGIN_OPTIONS } from '@/lib/placeOfOriginOptions';
import { SPECIAL_POSSESSIONS_OPTIONS } from '@/lib/specialPossessionsOptions';
import { INTRODUCTIONS_OPTIONS } from '@/lib/introductionsOptions';
import { featurePatch, resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useAutoFollowers } from '@/hooks/useAutoFollowers';
import { useInsertTabs, INSERT_OPTIONS, type InsertOption } from '@/hooks/useInsertTabs';
import { computeInvocationBadge } from '@/hooks/useInvocationBadge';
import {
  BlessedInitiatesOfDanu, BlessedSacredPouch, BlessedEarthMother,
  FoxTallTales,
  HeavyViolence,
  JudgeChronicle, JudgeLawkeeper,
  LightbearerPraiseTheDay, LightbearerInvocations,
  MarshalWarStories, MarshalCrew,
  RangerSomethingWicked, RangerAnimalCompanion,
  SeekerCollection,
  WouldBeHeroFearAnger,
  RevenantInsert, GhostInsert, ThrallInsert, FollowersInsert,
} from '@/components/character/playbooks';
import charSheetStyles from '@/components/character/CharacterSheet.module.css';
import type { Character, CharacterData, GameSession, PlaybookType, PlaybookFeatures } from '@/types';
import styles from './CharacterPlaybook.module.css';

type PlaybookSectionComponent = ComponentType<{ data: CharacterData | undefined; onSave: (data: Partial<CharacterData>) => Promise<void> }>;
type PlaybookSectionEntry = { key: string; Component: PlaybookSectionComponent };

const PLAYBOOK_SECTIONS: Partial<Record<PlaybookType, PlaybookSectionEntry[]>> = {
  blessed: [{ key: 'sacred-pouch', Component: BlessedSacredPouch }, { key: 'earth-mother', Component: BlessedEarthMother }],
  fox: [{ key: 'tall-tales', Component: FoxTallTales }],
  heavy: [{ key: 'violence', Component: HeavyViolence }],
  judge: [{ key: 'chronicle', Component: JudgeChronicle }, { key: 'lawkeeper', Component: JudgeLawkeeper }],
  lightbearer: [{ key: 'praise-the-day', Component: LightbearerPraiseTheDay }],
  marshal: [{ key: 'war-stories', Component: MarshalWarStories }],
  ranger: [{ key: 'something-wicked', Component: RangerSomethingWicked }],
  seeker: [{ key: 'collection', Component: SeekerCollection }],
  'would-be-hero': [{ key: 'fear-anger', Component: WouldBeHeroFearAnger }],
};

const WOULD_BE_HERO_SCORE_INSTRUCTION = 'Assign these scores: 1, 0, 0, 0, 0, -1. When a debility is marked, you roll with disadvantage.';

const getCharacterLevel = (character: Character): number => {
  const parsed = parseInt(character.data?.statLevel ?? '', 10);
  return isNaN(parsed) ? character.level : parsed;
};

const INSERT_INSTINCT_KEYS: { feature: keyof PlaybookFeatures; label: string }[] = [
  { feature: 'revenantInstinct', label: 'Revenant' },
  { feature: 'ghostInstinct', label: 'Ghost' },
  { feature: 'thrallInstinct', label: 'Thrall' },
];


const PCPlaybookTab = ({ playbook, data, level, playbookOption, onSave, insertInstinctNote }: { playbook: PlaybookType; data: CharacterData | undefined; level: number; playbookOption: (typeof PLAYBOOKS)[number]; onSave: (data: Partial<CharacterData>) => Promise<void>; insertInstinctNote: string | undefined }) => {
  const foxChooseOverride = playbook === 'fox' && data?.background === FOX_LIFE_OF_CRIME_BACKGROUND
    ? { count: 3, note: '+1 from A Life of Crime' }
    : undefined;

  const pfgLevels = playbook === 'would-be-hero' ? data?.typeMoveCheckListLevels?.['wbh-potential-for-greatness'] : undefined;
  const pfgDamageUpgrade = !!pfgLevels?.['pfg-damage'];
  const pfgHpUpgrade = !!pfgLevels?.['pfg-hp'];
  const damage = pfgDamageUpgrade ? 'd8' : playbookOption?.damage;
  const hpMax = pfgHpUpgrade ? (playbookOption?.hpMax ?? 0) + 4 : playbookOption?.hpMax;

  return (
    <div className={styles.layout}>
      <PlaybookColumns
        left={<>
          <Stats
            data={data}
            onSave={onSave}
            hpMax={hpMax}
            damage={damage}
            scoreInstruction={playbook === 'would-be-hero' ? WOULD_BE_HERO_SCORE_INSTRUCTION : undefined}
          />
          <Background playbookKey={playbook} options={BACKGROUND_OPTIONS[playbook]} level={level} data={data} onSave={onSave} />
        </>}
        right={<>
          <RadioSelect playbookKey={playbook} options={INSTINCT_OPTIONS[playbook]} data={data} onSave={onSave} overrideNote={insertInstinctNote} />
          <Appearance rows={APPEARANCE_OPTIONS[playbook]} data={data} onSave={onSave} />
          <RadioSelect
            playbookKey={playbook}
            title="Place of Origin"
            options={PLACE_OF_ORIGIN_OPTIONS[playbook]}
            data={data}
            onSave={onSave}
            dataKey="placeOfOrigin"
            noCustom
            instruction="Stonetop is your home, or close enough, but where are you (or your family) from originally? Pick an origin, then choose a matching name or make up your own — edit it in the header above."
          />
        </>}
      />
      <PlaybookColumns full={<Moves playbook={playbook} data={data} onSave={onSave} level={level} />} />
      <PlaybookColumns full={<SpecialPossessions config={SPECIAL_POSSESSIONS_OPTIONS[playbook]} data={data} onSave={onSave} level={level} chooseOverride={foxChooseOverride} />} />
      <PlaybookColumns
        left={PLAYBOOK_SECTIONS[playbook] ? (
          <div className={charSheetStyles.stack}>
            {PLAYBOOK_SECTIONS[playbook]!.map(({ key, Component }) => (
              <Component key={key} data={data} onSave={onSave} />
            ))}
          </div>
        ) : undefined}
        right={<Introductions config={INTRODUCTIONS_OPTIONS[playbook]} data={data} onSave={onSave} />}
      />
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

type PlaybookTabConfig = {
  id: string;
  label: string;
  render: (data: CharacterData | undefined, onSave: (data: Partial<CharacterData>) => Promise<void>, prosperity: number) => ReactNode;
  when?: (data: CharacterData | undefined) => boolean;
};

const PLAYBOOK_TAB_CONFIGS: Partial<Record<PlaybookType, PlaybookTabConfig[]>> = {
  lightbearer: [{ id: 'invocations', label: 'Invocations', render: (data, onSave) => <LightbearerInvocations data={data} onSave={onSave} /> }],
  ranger: [{ id: 'animal-companion', label: 'Animal Companion', render: (data, onSave) => <RangerAnimalCompanion data={data} onSave={onSave} /> }],
  marshal: [{ id: 'crew', label: 'Crew', render: (data, onSave, prosperity) => <MarshalCrew data={data} prosperity={prosperity} onSave={onSave} /> }],
  blessed: [{ id: 'initiates-of-danu', label: 'Initiates of Danu', render: (data, onSave) => <BlessedInitiatesOfDanu data={data} onSave={onSave} />, when: (data) => data?.background === 'initiate' }],
};

const getPlaybookTabs = (playbook: PlaybookType, data: CharacterData | undefined) =>
  (PLAYBOOK_TAB_CONFIGS[playbook] ?? []).filter(({ when }) => !when || when(data));


const resolveStaticTabContent = (
  id: string,
  data: CharacterData | undefined,
  prosperity: number,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
): ReactNode => {
  if (id === 'inventory') return <Inventory data={data} prosperity={prosperity} onSave={onSave} />;
  if (id === 'arcana') return <ArcanaTab data={data} onSave={onSave} />;
  if (id === 'Revenant') return <RevenantInsert data={data} onSave={onSave} />;
  if (id === 'Ghost') return <GhostInsert data={data} onSave={onSave} />;
  if (id === 'Thrall') return <ThrallInsert data={data} onSave={onSave} />;
  if (id === 'Followers') return <FollowersInsert data={data} onSave={onSave} />;
  return null;
};

const CharacterSheet = ({ character, playbookOption, id, gameName, prosperity, updateCharacterName, updateCharacterData }: SheetProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSaveCharacterData = useCallback(
    (data: Partial<CharacterData>) => updateCharacterData(character.id, data),
    [updateCharacterData, character.id]
  );

  const handleSaveCharacterName = useCallback(
    (name: string) => updateCharacterName(character.id, name),
    [updateCharacterName, character.id]
  );

  const { data: characterData, playbook } = character;

  useAutoFollowers(characterData?.specialPossessions, characterData?.inserts, handleSaveCharacterData);

  const {
    addTabOpen,
    removeInsert,
    removeInsertHandlers,
    handleOpenAddTab,
    handleCloseAddTab,
    handleCloseRemoveInsert,
    handleConfirmRemoveInsert,
    handleAddInsert,
  } = useInsertTabs(
    character,
    handleSaveCharacterData,
    (playbookArg, data) => getPlaybookTabs(playbookArg, data).length,
    setActiveIndex,
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

  const playbookTabs = getPlaybookTabs(playbook, characterData);

  const level = getCharacterLevel(character);
  const features = resolvePlaybookFeatures(characterData);
  const insertInstinctMatch = INSERT_INSTINCT_KEYS.find(({ feature }) => !!features[feature]);
  const insertInstinctNote = insertInstinctMatch ? `Replaced by your ${insertInstinctMatch.label} instinct` : undefined;

  const showInvocationsBadge = computeInvocationBadge(playbook, level, features);
  const invocationsTabIndex = playbookTabs.findIndex(({ id }) => id === 'invocations');

  const handleActiveChange = useCallback((i: number) => {
    setActiveIndex(i);
    if (showInvocationsBadge && invocationsTabIndex !== -1 && i === 3 + invocationsTabIndex) {
      // Fire-and-forget: badge dismissal is best-effort, losing it on failure is acceptable UX
      handleSaveCharacterData(featurePatch(characterData, { lightbearerInvocationsBadgeDismissedAt: level })).catch(() => {});
    }
  }, [showInvocationsBadge, invocationsTabIndex, handleSaveCharacterData, characterData, level]);

  const tabs = useMemo(() => [
    {
      label: 'PC Playbook',
      content: <PCPlaybookTab playbook={playbook} data={characterData} level={level} playbookOption={playbookOption} onSave={handleSaveCharacterData} insertInstinctNote={insertInstinctNote} />,
    },
    {
      label: 'Inventory',
      content: resolveStaticTabContent('inventory', characterData, prosperity, handleSaveCharacterData),
    },
    {
      label: 'Arcana',
      content: resolveStaticTabContent('arcana', characterData, prosperity, handleSaveCharacterData),
    },
    ...playbookTabs.map(({ id: tabId, label, render }) => ({
      label,
      badge: tabId === 'invocations' && showInvocationsBadge
        ? <span className={tabBadgeClass} aria-label="New Invocation available" />
        : undefined,
      badgeTooltip: tabId === 'invocations' && showInvocationsBadge
        ? 'A new Invocation can be selected'
        : undefined,
      content: render(characterData, handleSaveCharacterData, prosperity),
    })),
    ...(characterData?.inserts ?? []).map((label) => ({
      label,
      content: resolveStaticTabContent(label, characterData, prosperity, handleSaveCharacterData),
      onRemove: INSERT_OPTIONS.includes(label as InsertOption)
        ? removeInsertHandlers[label as InsertOption]
        : undefined,
      removeTooltip: `Remove ${label}`,
    })),
  ], [characterData, playbook, level, playbookOption, handleSaveCharacterData, insertInstinctNote, playbookTabs, showInvocationsBadge, prosperity, removeInsertHandlers]);

  return (
    <PageLayout
      crumbs={crumbs}
      title={characterName || playbookLabel}
      titleLabel="Edit character name"
      subtitle={characterName ? playbookLabel : undefined}
      icon={<Icon playbookIcon={playbook} />}
      gameId={id}
      onSaveTitle={handleSaveCharacterName}
    >
      <PageMeta
        title={pageTitle}
        description={`${playbookLabel} for ${gameName}. Track background, stats, moves, and more.`}
      />
      <ScrollToTop sentinelRef={headerRef} />
      <div ref={headerRef} />
      {playbookOption.description && (
        <Text font="serif" size="lg" italic className={styles.description}>{playbookOption.description}</Text>
      )}
      <Tabs
        aria-label="Character sections"
        className={styles.tabs}
        tabs={tabs}
        activeIndex={activeIndex}
        onActiveChange={handleActiveChange}
        onAdd={handleOpenAddTab}
      />
      <AddInsertModal open={addTabOpen} onClose={handleCloseAddTab} onAdd={handleAddInsert} existingInserts={characterData?.inserts ?? []} />
      <RemoveInsertModal open={removeInsert !== null} insert={removeInsert} onClose={handleCloseRemoveInsert} onConfirm={handleConfirmRemoveInsert} />
    </PageLayout>
  );
};

const CharacterPlaybookContent = ({ g, id, playbook, updateCharacterName, updateCharacterData }: {
  g: GameSession;
  id: string;
  playbook: PlaybookType;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
}) => {
  const prosperity = g.steading?.prosperity ?? 0;
  const playbookOption = PLAYBOOKS.find((p) => p.value === playbook);
  const character = g.characters.find((c) => c.playbook === playbook);

  if (!playbookOption) {
    return (
      <PageLayout simple>
        <div className={styles.centered}>
          <Heading as="h2" size="md">Playbook not found</Heading>
          <Button as={Link} to={`/game/${id}`} variant="secondary">Back to Game</Button>
        </div>
      </PageLayout>
    );
  }

  if (!character) {
    return (
      <PageLayout simple>
        <div className={styles.centered}>
          <Heading as="h2" size="md">Character not found</Heading>
          <Button as={Link} to={`/game/${id}`} variant="secondary">Back to Game</Button>
        </div>
      </PageLayout>
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
