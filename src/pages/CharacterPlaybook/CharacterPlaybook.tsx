import React, { useRef, useCallback, useMemo, useState, useId, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { PLAYBOOKS, DEFAULT_GAME_NAME } from '@/lib/constants';
import { Heading, Button, ScrollToTop, Tabs, tabBadgeClass, Modal, Radio, RadioGroup, Icon, Text } from '@/components/primitives';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Background, RadioSelect, Appearance, Stats, Moves, SpecialPossessions, Introductions, Inventory } from '@/components/CharacterSheet/sections';
import { ArcanaTab } from '@/components/CharacterSheet/sections/Arcana/ArcanaTab';
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
import { RangerAnimalCompanion } from '@/components/CharacterSheet/playbooks/ranger/RangerAnimalCompanion';
import { SeekerCollection } from '@/components/CharacterSheet/playbooks/seeker/SeekerCollection';
import { WouldBeHeroFearAnger } from '@/components/CharacterSheet/playbooks/would-be-hero/WouldBeHeroFearAnger';
import { RevenantInsert } from '@/components/CharacterSheet/playbooks/revenant/RevenantInsert';
import { GhostInsert } from '@/components/CharacterSheet/playbooks/ghost/GhostInsert';
import { ThrallInsert } from '@/components/CharacterSheet/playbooks/thrall/ThrallInsert';
import { FollowersInsert } from '@/components/CharacterSheet/playbooks/followers/FollowersInsert';
import charSheetStyles from '@/components/CharacterSheet/CharacterSheet.module.css';
import type { Character, CharacterData, GameSession, PlaybookType, PlaybookFeatures } from '@/types';
import styles from './CharacterPlaybook.module.css';

type PlaybookSectionComponent = React.ComponentType<{ data: CharacterData | undefined; onSave: (data: Partial<CharacterData>) => Promise<void> }>;
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


const PCPlaybookTab = ({ character, playbookOption, onSave, insertInstinctNote }: { character: Character; playbookOption: (typeof PLAYBOOKS)[number]; onSave: (data: Partial<CharacterData>) => Promise<void>; insertInstinctNote: string | undefined }) => {
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
              {PLAYBOOK_SECTIONS[playbook]!.map(({ key, Component }) => (
                <Component key={key} data={data} onSave={onSave} />
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

type PlaybookTabConfig = {
  id: string;
  label: string;
  render: (data: CharacterData | undefined, onSave: (data: Partial<CharacterData>) => Promise<void>, prosperity: number) => React.ReactNode;
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

const DOG_POSSESSION_IDS = new Set(['mastiffs', 'hounds', 'good-dog']);

const INSERT_OPTIONS = ['Revenant', 'Ghost', 'Thrall', 'Followers'] as const;
type InsertOption = typeof INSERT_OPTIONS[number];

const REMOVE_INSERT_WARNINGS: Partial<Record<InsertOption, string>> = {
  Followers: 'All followers and their data will be permanently lost.',
};

const RemoveInsertModal = ({ open, insert, onClose, onConfirm }: { open: boolean; insert: InsertOption | null; onClose: () => void; onConfirm: () => void }) => {
  const headingId = useId();
  if (!insert) return null;
  const warning = REMOVE_INSERT_WARNINGS[insert];
  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="md" id={headingId}>Remove {insert}?</Heading>
      <Text font="serif" color="muted" className={styles.removeInsertWarning}>
        This will remove the <strong>{insert}</strong> tab from this character sheet.
        {warning && ` ${warning}`}
      </Text>
      <div className={styles.insertActions}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>Remove</Button>
      </div>
    </Modal>
  );
};

const AddInsertModal = ({ open, onClose, onAdd, existingInserts }: { open: boolean; onClose: () => void; onAdd: (insert: InsertOption) => void; existingInserts: string[] }) => {
  const headingId = useId();
  const availableOptions = INSERT_OPTIONS.filter((opt) => !existingInserts.includes(opt));
  const [selected, setSelected] = useState<InsertOption>(() => availableOptions[0] ?? INSERT_OPTIONS[0]);

  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.currentTarget.value as InsertOption);
  }, []);

  const handleAdd = useCallback(() => {
    onAdd(selected);
  }, [onAdd, selected]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="md" id={headingId}>Add an Insert</Heading>
      <RadioGroup legend="Insert type" legendHidden className={styles.insertOptions}>
        {availableOptions.map((opt) => (
          <Radio
            key={opt}
            name="insert-option"
            value={opt}
            label={opt}
            checked={selected === opt}
            onChange={handleSelectChange}
          />
        ))}
      </RadioGroup>
      <div className={styles.insertActions}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAdd}>Add</Button>
      </div>
    </Modal>
  );
};

const resolveStaticTabContent = (
  id: string,
  data: CharacterData | undefined,
  prosperity: number,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
): React.ReactNode => {
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
  const hasAutoAddedFollowersRef = useRef(false);
  const [addTabOpen, setAddTabOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [removeInsert, setRemoveInsert] = useState<InsertOption | null>(null);

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

  // One-shot: auto-add the Followers tab the first time a dog possession is detected.
  // The ref prevents re-triggering if the snapshot fires again before the write lands.
  useEffect(() => {
    if (hasAutoAddedFollowersRef.current) return;
    const possessions = character.data?.specialPossessions ?? {};
    const hasDog = Object.entries(possessions).some(([id, checked]) => checked && DOG_POSSESSION_IDS.has(id));
    if (!hasDog) return;
    const current = character.data?.inserts ?? [];
    if (current.includes('Followers')) return;
    hasAutoAddedFollowersRef.current = true;
    handleSaveCharacterData({ inserts: [...current, 'Followers'] }).catch(() => {});
  }, [character.data?.specialPossessions, character.data?.inserts, handleSaveCharacterData]);

  const handleRequestRemoveInsert = useCallback((insert: InsertOption) => {
    setRemoveInsert(insert);
  }, []);

  const removeInsertHandlers = useMemo(
    () => Object.fromEntries(INSERT_OPTIONS.map((opt) => [opt, () => handleRequestRemoveInsert(opt)])),
    [handleRequestRemoveInsert],
  );

  const handleCloseRemoveInsert = useCallback(() => setRemoveInsert(null), []);

  const handleConfirmRemoveInsert = useCallback(async () => {
    if (!removeInsert) return;
    const next = (character.data?.inserts ?? []).filter((i) => i !== removeInsert);
    const resolved = resolvePlaybookFeatures(character.data);
    const { followers: _removed, ...restFeatures } = resolved;
    const playbookFeatures = removeInsert === 'Followers' ? restFeatures : resolved;
    try {
      await handleSaveCharacterData({ inserts: next, playbookFeatures });
      setActiveIndex(0);
      setRemoveInsert(null);
    } catch {
      setRemoveInsert(null);
    }
  }, [removeInsert, character.data, handleSaveCharacterData]);

  const handleAddInsert = useCallback(async (insert: InsertOption) => {
    const current = character.data?.inserts ?? [];
    if (current.includes(insert)) {
      setAddTabOpen(false);
      return;
    }
    const next = [...current, insert];
    const fixedTabCount = 3 + getPlaybookTabs(character.playbook, character.data).length;
    try {
      await handleSaveCharacterData({ inserts: next });
      setActiveIndex(fixedTabCount + next.length - 1);
    } finally {
      setAddTabOpen(false);
    }
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

  const playbookTabs = getPlaybookTabs(character.playbook, character.data);

  const level = getCharacterLevel(character);
  const features = resolvePlaybookFeatures(character.data);
  const insertInstinctMatch = INSERT_INSTINCT_KEYS.find(({ feature }) => !!features[feature]);
  const insertInstinctNote = insertInstinctMatch ? `Replaced by your ${insertInstinctMatch.label} instinct` : undefined;
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
    if (showInvocationsBadge && invocationsTabIndex !== -1 && i === 3 + invocationsTabIndex) {
      // Fire-and-forget: badge dismissal is best-effort, losing it on failure is acceptable UX
      handleSaveCharacterData(featurePatch(character.data, { lightbearerInvocationsBadgeDismissedAt: level })).catch(() => {});
    }
  }, [showInvocationsBadge, invocationsTabIndex, handleSaveCharacterData, character.data, level]);

  const tabs = useMemo(() => [
    {
      label: 'PC Playbook',
      content: <PCPlaybookTab character={character} playbookOption={playbookOption} onSave={handleSaveCharacterData} insertInstinctNote={insertInstinctNote} />,
    },
    {
      label: 'Inventory',
      content: resolveStaticTabContent('inventory', character.data, prosperity, handleSaveCharacterData),
    },
    {
      label: 'Arcana',
      content: resolveStaticTabContent('arcana', character.data, prosperity, handleSaveCharacterData),
    },
    ...playbookTabs.map(({ id: tabId, label, render }) => ({
      label,
      badge: tabId === 'invocations' && showInvocationsBadge
        ? <span className={tabBadgeClass} aria-label="New Invocation available" />
        : undefined,
      badgeTooltip: tabId === 'invocations' && showInvocationsBadge
        ? 'A new Invocation can be selected'
        : undefined,
      content: render(character.data, handleSaveCharacterData, prosperity),
    })),
    ...(character.data?.inserts ?? []).map((label) => ({
      label,
      content: resolveStaticTabContent(label, character.data, prosperity, handleSaveCharacterData),
      onRemove: INSERT_OPTIONS.includes(label as InsertOption)
        ? removeInsertHandlers[label as InsertOption]
        : undefined,
      removeTooltip: `Remove ${label}`,
    })),
  ], [character, playbookOption, handleSaveCharacterData, playbookTabs, showInvocationsBadge, prosperity, removeInsertHandlers]);

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
          icon={<Icon playbookIcon={character.playbook} />}
          gameId={id}
          onSaveTitle={handleSaveCharacterName}
        />
      </div>
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
      <AddInsertModal key={addTabOpen ? 'open' : 'closed'} open={addTabOpen} onClose={handleCloseAddTab} onAdd={handleAddInsert} existingInserts={character.data?.inserts ?? []} />
      <RemoveInsertModal open={removeInsert !== null} insert={removeInsert} onClose={handleCloseRemoveInsert} onConfirm={handleConfirmRemoveInsert} />
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
  const prosperity = g.steading?.prosperity ?? 0;
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
