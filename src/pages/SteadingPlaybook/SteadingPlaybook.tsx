import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { ScrollToTop, Tabs, Dropdown, Button } from '@/components/ui';
import type { DropdownGroup } from '@/components/ui';
import { PageHeader } from '@/components/app/PageHeader/PageHeader';
import { SteadingResources } from '@/components/gm-playbook/sections/SteadingResources';
import { SteadingFortifications } from '@/components/gm-playbook/sections/SteadingFortifications';
import { PlaybookSection } from '@/components/character/PlaybookSection';
import { GameGuard } from '@/components/app/GameGuard/GameGuard';
import { DEFAULT_GAME_NAME, PLAYBOOKS } from '@/lib/constants';
import { SteadingStats } from '@/components/gm-playbook/sections/SteadingStats';
import { SteadingImprovements } from '@/components/gm-playbook/sections/SteadingImprovements';
import { SteadingAssets } from '@/components/gm-playbook/sections/SteadingAssets';
import { SteadingNPCs } from '@/components/gm-playbook/sections/SteadingNPCs';
import { SteadingReference } from '@/components/gm-playbook/sections/SteadingReference';
import type { GameSession, SteadingData, SteadingNPC } from '@/types';
import styles from './SteadingPlaybook.module.css';

interface SteadingContentProps {
  g: GameSession;
  id: string;
  updateSteading: (patch: Partial<SteadingData>) => Promise<void>;
}

interface NpcFilterRowProps {
  g: GameSession;
  npcFilter: string;
  onFilterChange: (value: string) => void;
}

const NpcFilterRow = ({ g, npcFilter, onFilterChange }: NpcFilterRowProps) => {
  const groups = useMemo(
    () => buildFilterGroups(g),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g.characters, g.steading?.residents, g.steading?.neighbors],
  );
  if (groups.length === 0) return null;
  return (
    <div className={styles.npcFilterRow}>
      <Dropdown
        id="npc-relationship-filter"
        groups={groups}
        value={npcFilter}
        onChange={onFilterChange}
        placeholder="Filter by relationship…"
        className={styles.npcFilterDropdown}
      />
      {npcFilter && (
        <Button variant="ghost" size="sm" className={styles.npcFilterClear} onClick={() => onFilterChange('')}>
          Clear filter
        </Button>
      )}
    </div>
  );
};

const buildFilterGroups = (g: GameSession): DropdownGroup<string>[] => {
  const residents = g.steading?.residents ?? [];
  const neighbors = g.steading?.neighbors ?? [];
  const allNpcs: SteadingNPC[] = [...residents, ...neighbors];
  const referencedIds = new Set(
    allNpcs.flatMap((n) => (n.relationships ?? []).map((r) => r.targetId).filter(Boolean)),
  );

  const pcs = g.characters
    .filter((c) => referencedIds.has(c.id))
    .map((c) => ({ value: c.id, label: `${c.name} (${PLAYBOOKS.find((p) => p.value === c.playbook)?.label ?? c.playbook})` }));
  const residentOpts = residents
    .filter((r) => referencedIds.has(r.id))
    .map((r) => ({ value: r.id, label: r.name }));
  const neighborOpts = neighbors
    .filter((n) => referencedIds.has(n.id))
    .map((n) => ({ value: n.id, label: n.name }));

  const groups: DropdownGroup<string>[] = [];
  if (pcs.length > 0) groups.push({ label: 'Player Characters', options: pcs });
  if (residentOpts.length > 0) groups.push({ label: 'Stonetop Residents', options: residentOpts });
  if (neighborOpts.length > 0) groups.push({ label: 'Notable Neighbors', options: neighborOpts });
  return groups;
};

interface SteadingTabProps {
  steading: Partial<SteadingData>;
  updateSteading: (patch: Partial<SteadingData>) => Promise<void>;
}

const SteadingTab = ({ steading, updateSteading }: SteadingTabProps) => (
  <div className={styles.layout}>
    <div className={styles.columns}>
      <div className={styles.colLeft}>
        <PlaybookSection title="Stats & Debilities">
          <SteadingStats steading={steading} onSave={updateSteading} />
        </PlaybookSection>
      </div>
      <div className={styles.colRight}>
        <PlaybookSection title="Resources">
          <SteadingResources
            resources={steading.resources}
            improvements={steading.improvements}
            gmImprovements={steading.gmImprovements}
            onSave={updateSteading}
          />
        </PlaybookSection>
        <PlaybookSection title="Fortifications">
          <SteadingFortifications
            fortifications={steading.fortifications}
            improvements={steading.improvements}
            gmImprovements={steading.gmImprovements}
            onSave={updateSteading}
          />
        </PlaybookSection>
        <PlaybookSection title="Assets">
          <SteadingAssets steading={steading} onSave={updateSteading} />
        </PlaybookSection>
      </div>
    </div>
  </div>
);

const ImprovementsTab = ({ steading, updateSteading }: SteadingTabProps) => (
  <div className={styles.layout}>
    <div className={styles.colFull}>
      <PlaybookSection title="Improvements">
        <SteadingImprovements improvements={steading.improvements} gmImprovements={steading.gmImprovements} onSave={updateSteading} />
      </PlaybookSection>
    </div>
  </div>
);

interface NpcsTabProps {
  g: GameSession;
  steading: Partial<SteadingData>;
  updateSteading: (patch: Partial<SteadingData>) => Promise<void>;
  npcFilter: string;
  onFilterChange: (value: string) => void;
}

const NpcsTab = ({ g, steading, updateSteading, npcFilter, onFilterChange }: NpcsTabProps) => (
  <div className={styles.layout}>
    <NpcFilterRow g={g} npcFilter={npcFilter} onFilterChange={onFilterChange} />
    <div className={styles.columns}>
      <div className={styles.colLeft}>
        <PlaybookSection title="Residents of Stonetop">
          <SteadingNPCs section="residents" npcs={steading.residents} onSave={updateSteading} game={g} filterTargetId={npcFilter} />
        </PlaybookSection>
      </div>
      <div className={styles.colRight}>
        <PlaybookSection title="Notable Neighbors">
          <SteadingNPCs section="neighbors" npcs={steading.neighbors} onSave={updateSteading} game={g} filterTargetId={npcFilter} />
        </PlaybookSection>
      </div>
    </div>
  </div>
);

const ReferenceTab = ({ steading, updateSteading }: SteadingTabProps) => (
  <div className={styles.layout}>
    <div className={styles.colFull}>
      <SteadingReference placesOfInterest={steading.placesOfInterest} onSave={updateSteading} />
    </div>
  </div>
);

const SteadingContent = ({ g, id, updateSteading }: SteadingContentProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const gameName = g.name || DEFAULT_GAME_NAME;
  const steading = g.steading ?? {};
  const [npcFilter, setNpcFilter] = useState('');

  const crumbs = useMemo(() => [
    { label: gameName, to: `/game/${id}` },
    { label: 'Steading Playbook' },
  ], [gameName, id]);

  const tabs = useMemo(() => [
    {
      label: 'Steading',
      content: <SteadingTab steading={steading} updateSteading={updateSteading} />,
    },
    {
      label: 'Improvements',
      content: <ImprovementsTab steading={steading} updateSteading={updateSteading} />,
    },
    {
      label: 'NPCs',
      content: <NpcsTab g={g} steading={steading} updateSteading={updateSteading} npcFilter={npcFilter} onFilterChange={setNpcFilter} />,
    },
    {
      label: 'Reference',
      content: <ReferenceTab steading={steading} updateSteading={updateSteading} />,
    },
  ], [g.characters, steading, updateSteading, npcFilter]);

  return (
    <main className={styles.page}>
      <PageMeta
        title={`Steading Playbook — ${gameName} — Hearthfire`}
        description={`Stonetop steading playbook for ${gameName}. Track stats, improvements, assets, and NPCs.`}
      />
      <ScrollToTop sentinelRef={headerRef} />
      <div ref={headerRef}>
        <PageHeader crumbs={crumbs} title="Steading Playbook" gameId={id} />
      </div>
      <Tabs
        aria-label="Steading sections"
        className={styles.tabs}
        tabs={tabs}
      />
    </main>
  );
};

export const SteadingPlaybook = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { game, loading, error, updateSteading } = useGame(id);

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`} errorBackLabel="Back to Game">
      {(g) => (
        <SteadingContent g={g} id={id} updateSteading={updateSteading} />
      )}
    </GameGuard>
  );
};
