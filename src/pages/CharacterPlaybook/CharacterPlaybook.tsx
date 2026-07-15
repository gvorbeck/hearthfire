import { useRef, useCallback, useMemo, useInsertionEffect, lazy, Suspense } from 'react';
import { useHashTabs } from '@/hooks/useHashTabs';
import type { ComponentType, ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME, getPlaybook } from '@/lib/constants';
import { Heading, Button, ScrollToTop, Tabs, tabBadgeClass, Icon, Text, PlaybookColumns, Stack, Spinner } from '@/components/ui';
import { AddInsertModal } from './modals/AddInsertModal';
import { RemoveInsertModal } from './modals/RemoveInsertModal';
import { GameGuard } from '@/components/app/GameGuard/GameGuard';
import { PageLayout } from '@/components/app/PageLayout/PageLayout';
import { buildGameNav, type GameNav } from '@/components/app/PageHeader/gameNav';
import { Background, RadioSelect, Appearance, Stats, Moves, SpecialPossessions, Introductions, Inventory } from '@/components/character/sections';
// The Arcana tab pulls in ~2,850 lines of card data plus its panel UI. It's
// only ever shown when the user opens the Arcana tab, so lazy-load it to keep
// that weight out of the initial CharacterPlaybook bundle. Tabs already gates
// mounting on first activation, so the chunk is fetched exactly when needed.
const ArcanaTab = lazy(() =>
  import('@/components/character/sections/Arcana/ArcanaTab').then((m) => ({
    default: m.ArcanaTab,
  })),
);
import { BACKGROUND_OPTIONS, FOX_LIFE_OF_CRIME_BACKGROUND } from '@/lib/characterCreation/backgroundOptions';
import { INSTINCT_OPTIONS } from '@/lib/characterCreation/instinctOptions';
import { APPEARANCE_OPTIONS } from '@/lib/characterCreation/appearanceOptions';
import { PLACE_OF_ORIGIN_OPTIONS } from '@/lib/characterCreation/placeOfOriginOptions';
import { SPECIAL_POSSESSIONS_OPTIONS } from '@/lib/characterCreation/specialPossessionsOptions';
import { INTRODUCTIONS_OPTIONS } from '@/lib/characterCreation/introductionsOptions';
import { featurePatch, resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { getMarkedInstinctOverride } from '@/lib/consequenceActions';
import { useAutoFollowers } from '@/hooks/useAutoFollowers';
import { useInsertTabs, INSERT_OPTIONS, type InsertOption } from '@/hooks/useInsertTabs';
import { computeInvocationBadge } from '@/hooks/useInvocationBadge';
// Each playbook's panel + insert components are lazy-loaded so a character page
// only downloads the active playbook's chunk, not all nine. Lazy calls that
// import from the same per-playbook barrel share a single Rollup chunk, so e.g.
// BlessedSacredPouch and BlessedEarthMother land together in the blessed chunk.
const BlessedInitiatesOfDanu = lazy(() => import('@/components/character/playbooks/blessed').then((m) => ({ default: m.BlessedInitiatesOfDanu })));
const BlessedSacredPouch = lazy(() => import('@/components/character/playbooks/blessed').then((m) => ({ default: m.BlessedSacredPouch })));
const BlessedEarthMother = lazy(() => import('@/components/character/playbooks/blessed').then((m) => ({ default: m.BlessedEarthMother })));
const FoxTallTales = lazy(() => import('@/components/character/playbooks/fox').then((m) => ({ default: m.FoxTallTales })));
const HeavyViolence = lazy(() => import('@/components/character/playbooks/heavy').then((m) => ({ default: m.HeavyViolence })));
const JudgeChronicle = lazy(() => import('@/components/character/playbooks/judge').then((m) => ({ default: m.JudgeChronicle })));
const JudgeLawkeeper = lazy(() => import('@/components/character/playbooks/judge').then((m) => ({ default: m.JudgeLawkeeper })));
const LightbearerPraiseTheDay = lazy(() => import('@/components/character/playbooks/lightbearer').then((m) => ({ default: m.LightbearerPraiseTheDay })));
const LightbearerInvocations = lazy(() => import('@/components/character/playbooks/lightbearer').then((m) => ({ default: m.LightbearerInvocations })));
const MarshalWarStories = lazy(() => import('@/components/character/playbooks/marshal').then((m) => ({ default: m.MarshalWarStories })));
const MarshalCrew = lazy(() => import('@/components/character/playbooks/marshal').then((m) => ({ default: m.MarshalCrew })));
const RangerSomethingWicked = lazy(() => import('@/components/character/playbooks/ranger').then((m) => ({ default: m.RangerSomethingWicked })));
const RangerAnimalCompanion = lazy(() => import('@/components/character/playbooks/ranger').then((m) => ({ default: m.RangerAnimalCompanion })));
const SeekerCollection = lazy(() => import('@/components/character/playbooks/seeker').then((m) => ({ default: m.SeekerCollection })));
const WouldBeHeroFearAnger = lazy(() => import('@/components/character/playbooks/would-be-hero').then((m) => ({ default: m.WouldBeHeroFearAnger })));
const RevenantInsert = lazy(() => import('@/components/character/playbooks/revenant/RevenantInsert').then((m) => ({ default: m.RevenantInsert })));
const GhostInsert = lazy(() => import('@/components/character/playbooks/ghost/GhostInsert').then((m) => ({ default: m.GhostInsert })));
const ThrallInsert = lazy(() => import('@/components/character/playbooks/thrall/ThrallInsert').then((m) => ({ default: m.ThrallInsert })));
const FollowersInsert = lazy(() => import('@/components/character/playbooks/followers/FollowersInsert').then((m) => ({ default: m.FollowersInsert })));
import type { Character, CharacterData, GameSession, LoggedRoll, PlaybookType, PlaybookFeatures } from '@/types';
import type { RollReport } from '@/components/character/Move/RollAffordance';
import { CharacterRollContext } from '@/components/character/Move/CharacterRollContext';
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
          <Suspense fallback={<div className={styles.centered}><Spinner /></div>}>
            <Stack gap={6}>
              {PLAYBOOK_SECTIONS[playbook]!.map(({ key, Component }) => (
                <Component key={key} data={data} onSave={onSave} />
              ))}
            </Stack>
          </Suspense>
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
  nav: GameNav;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
  adjustCharacterStats: (characterId: string, deltas: Partial<Record<'statArmor' | 'statHp', number>>) => Promise<void>;
  logRoll: (roll: LoggedRoll) => Promise<void>;
}

type PlaybookTabConfig = {
  id: string;
  label: string;
  render: (data: CharacterData | undefined, onSave: (data: Partial<CharacterData>) => Promise<void>, prosperity: number) => ReactNode;
  when?: (data: CharacterData | undefined) => boolean;
};

const lazyTab = (node: ReactNode): ReactNode => (
  <Suspense fallback={<div className={styles.centered}><Spinner /></div>}>{node}</Suspense>
);

const PLAYBOOK_TAB_CONFIGS: Partial<Record<PlaybookType, PlaybookTabConfig[]>> = {
  lightbearer: [{ id: 'invocations', label: 'Invocations', render: (data, onSave) => lazyTab(<LightbearerInvocations data={data} onSave={onSave} />) }],
  ranger: [{ id: 'animal-companion', label: 'Animal Companion', render: (data, onSave) => lazyTab(<RangerAnimalCompanion data={data} onSave={onSave} />) }],
  marshal: [{ id: 'crew', label: 'Crew', render: (data, onSave, prosperity) => lazyTab(<MarshalCrew data={data} prosperity={prosperity} onSave={onSave} />) }],
  blessed: [{ id: 'initiates-of-danu', label: 'Initiates of Danu', render: (data, onSave) => lazyTab(<BlessedInitiatesOfDanu data={data} onSave={onSave} />), when: (data) => data?.background === 'initiate' }],
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
  if (id === 'Revenant') return lazyTab(<RevenantInsert data={data} onSave={onSave} />);
  if (id === 'Ghost') return lazyTab(<GhostInsert data={data} onSave={onSave} />);
  if (id === 'Thrall') return lazyTab(<ThrallInsert data={data} onSave={onSave} />);
  if (id === 'Followers') return lazyTab(<FollowersInsert data={data} onSave={onSave} />);
  return null;
};


const CharacterSheet = ({ character, playbookOption, id, gameName, prosperity, nav, updateCharacterName, updateCharacterData, adjustCharacterStats, logRoll }: SheetProps) => {
  const headerRef = useRef<HTMLDivElement>(null);

  // Turn a move roll into a shared-log entry stamped with this character's identity and the current time,
  // then fire-and-forget the write (a dropped log entry is acceptable UX; reportSave surfaces failures).
  const handleRoll = useCallback(
    (moveName: string, report: RollReport) => {
      const createdAt = Date.now();
      const roll: LoggedRoll = {
        id: `${character.id}-${createdAt}`,
        characterId: character.id,
        characterName: character.name?.trim() || '',
        moveName,
        stat: report.stat,
        dice: report.dice,
        mod: report.mod,
        total: report.total,
        mode: report.mode,
        band: report.band,
        createdAt,
      };
      logRoll(roll).catch(() => {});
    },
    [logRoll, character.id, character.name],
  );

  // One roll context for the whole sheet, so every Move — Moves tab, Arcana mysteries, inserts — offers
  // rolling without threading. Memoized so the value reference only changes when the data or callback do.
  const rollContextValue = useMemo(
    () => ({ data: character.data, onRoll: handleRoll }),
    [character.data, handleRoll],
  );

  const handleSaveCharacterData = useCallback(
    (data: Partial<CharacterData>) => updateCharacterData(character.id, data),
    [updateCharacterData, character.id]
  );

  const handleAdjustCharacterStats = useCallback(
    (deltas: Partial<Record<'statArmor' | 'statHp', number>>) => adjustCharacterStats(character.id, deltas),
    [adjustCharacterStats, character.id]
  );

  const handleSaveCharacterName = useCallback(
    (name: string) => updateCharacterName(character.id, name),
    [updateCharacterName, character.id]
  );

  const { data: characterData, playbook } = character;

  useAutoFollowers(characterData?.specialPossessions, characterData?.inserts, handleSaveCharacterData);

  const canAddInsert = (characterData?.inserts ?? []).length < INSERT_OPTIONS.length;
  const characterName = character.name?.trim();
  const playbookLabel = `${playbookOption.label} Playbook`;

  const pageTitle = characterName
    ? `${characterName} — ${playbookLabel} — Hearthfire`
    : `${playbookLabel} — Hearthfire`;

  const playbookTabs = getPlaybookTabs(playbook, characterData);

  const level = getCharacterLevel(character);
  const features = resolvePlaybookFeatures(characterData);
  const insertInstinctMatch = INSERT_INSTINCT_KEYS.find(({ feature }) => !!features[feature]);
  // A marked arcana consequence can replace the Instinct (e.g. the Lidless Orb's "Disgust"); show its
  // text. Falls back to the insert-instinct note. Either way the Instinct section renders read-only.
  const consequenceInstinct = getMarkedInstinctOverride(characterData);
  const insertInstinctNote = consequenceInstinct
    ? `Replaced: ${consequenceInstinct}`
    : insertInstinctMatch
      ? `Replaced by your ${insertInstinctMatch.label} instinct`
      : undefined;

  const showInvocationsBadge = computeInvocationBadge(playbook, level, features);

  // Stable ref so useInsertTabs can call setActiveIndex without being a dep of tabs
  const setActiveIndexRef = useRef<(i: number) => void>(() => {});

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
    useCallback((i: number) => setActiveIndexRef.current(i), []),
  );

  const tabs = useMemo(() => [
    {
      id: 'pc-playbook',
      label: 'PC Playbook',
      content: <PCPlaybookTab playbook={playbook} data={characterData} level={level} playbookOption={playbookOption} onSave={handleSaveCharacterData} insertInstinctNote={insertInstinctNote} />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      content: resolveStaticTabContent('inventory', characterData, prosperity, handleSaveCharacterData),
    },
    {
      id: 'arcana',
      // Rendered directly (not via resolveStaticTabContent) because Arcana alone needs the transactional
      // stat-adjuster for consequence Armor/HP deltas; the other static tabs only take onSave.
      label: 'Arcana',
      content: lazyTab(<ArcanaTab data={characterData} onSave={handleSaveCharacterData} adjustCharacterStats={handleAdjustCharacterStats} />),
    },
    ...playbookTabs.map(({ id: tabId, label, render }) => ({
      id: tabId,
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
      id: label,
      label,
      content: resolveStaticTabContent(label, characterData, prosperity, handleSaveCharacterData),
      onRemove: INSERT_OPTIONS.includes(label as InsertOption)
        ? removeInsertHandlers[label as InsertOption]
        : undefined,
      removeTooltip: `Remove ${label}`,
    })),
  ], [characterData, playbook, level, playbookOption, handleSaveCharacterData, handleAdjustCharacterStats, insertInstinctNote, playbookTabs, showInvocationsBadge, prosperity, removeInsertHandlers]);

  const { activeIndex, setActiveIndex: setActiveIndexFn, handleActiveChange: hashHandleActiveChange } = useHashTabs(tabs);
  // Mirror the latest tab setter into a ref (written post-commit, not during
  // render) so the stable badge-dismiss callback at line ~253 can call it.
  useInsertionEffect(() => {
    setActiveIndexRef.current = setActiveIndexFn;
  });

  const handleActiveChange = useCallback((i: number) => {
    hashHandleActiveChange(i);
    // Derive the absolute index from the built tabs array so adding/removing a
    // leading static tab can't silently break badge dismissal.
    const invocationsTabAbsoluteIndex = tabs.findIndex((t) => t.id === 'invocations');
    if (showInvocationsBadge && invocationsTabAbsoluteIndex !== -1 && i === invocationsTabAbsoluteIndex) {
      // Fire-and-forget: badge dismissal is best-effort, losing it on failure is acceptable UX
      handleSaveCharacterData(featurePatch(characterData, { lightbearerInvocationsBadgeDismissedAt: level })).catch(() => {});
    }
  }, [hashHandleActiveChange, showInvocationsBadge, tabs, handleSaveCharacterData, characterData, level]);

  return (
    <CharacterRollContext.Provider value={rollContextValue}>
    <PageLayout
      title={characterName || playbookLabel}
      titleLabel="Edit character name"
      subtitle={characterName ? playbookLabel : undefined}
      icon={<Icon playbookIcon={playbook} />}
      gameId={id}
      nav={nav}
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
        onAdd={canAddInsert ? handleOpenAddTab : undefined}
      />
      {/* Mounted only while open so per-open UI state resets on each open. */}
      {addTabOpen && (
        <AddInsertModal open={addTabOpen} onClose={handleCloseAddTab} onAdd={handleAddInsert} existingInserts={characterData?.inserts ?? []} />
      )}
      {removeInsert !== null && (
        <RemoveInsertModal open={removeInsert !== null} insert={removeInsert} onClose={handleCloseRemoveInsert} onConfirm={handleConfirmRemoveInsert} />
      )}
    </PageLayout>
    </CharacterRollContext.Provider>
  );
};

const CharacterPlaybookContent = ({ g, id, playbook, updateCharacterName, updateCharacterData, adjustCharacterStats, logRoll }: {
  g: GameSession;
  id: string;
  playbook: PlaybookType;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
  adjustCharacterStats: (characterId: string, deltas: Partial<Record<'statArmor' | 'statHp', number>>) => Promise<void>;
  logRoll: (roll: LoggedRoll) => Promise<void>;
}) => {
  const prosperity = g.steading?.prosperity ?? 0;
  const playbookOption = getPlaybook(playbook);
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

  const nav = buildGameNav(g, id, `/game/${id}/${playbook}`);

  return (
    <CharacterSheet
      character={character}
      playbookOption={playbookOption}
      id={id}
      gameName={g.name || DEFAULT_GAME_NAME}
      prosperity={prosperity}
      nav={nav}
      updateCharacterName={updateCharacterName}
      updateCharacterData={updateCharacterData}
      adjustCharacterStats={adjustCharacterStats}
      logRoll={logRoll}
    />
  );
};

export const CharacterPlaybook = () => {
  const { id = '', playbook = '' } = useParams<{ id: string; playbook: string }>();
  const { game, loading, error, updateCharacterName, updateCharacterData, adjustCharacterStats, logRoll } = useGame(id);

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`} errorBackLabel="Back to Game">
      {(g) => (
        <CharacterPlaybookContent
          g={g}
          id={id}
          playbook={playbook as PlaybookType}
          updateCharacterName={updateCharacterName}
          updateCharacterData={updateCharacterData}
          adjustCharacterStats={adjustCharacterStats}
          logRoll={logRoll}
        />
      )}
    </GameGuard>
  );
};
