import { useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { Heading, ScrollToTop, Tabs, RuleDivider } from '@/components/primitives';
import { TextareaField } from '@/components/Playbook';
import { PlaybookSection } from '@/components/CharacterSheet/PlaybookSection';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import { SteadingStats } from '@/components/Playbook/sections/SteadingStats';
import { SteadingImprovements } from '@/components/Playbook/sections/SteadingImprovements';
import { SteadingAssets } from '@/components/Playbook/sections/SteadingAssets';
import { SteadingNPCs } from '@/components/Playbook/sections/SteadingNPCs';
import { SteadingReference } from '@/components/Playbook/sections/SteadingReference';
import type { GameSession, SteadingData } from '@/types';
import styles from './SteadingPlaybook.module.css';

interface SteadingContentProps {
  g: GameSession;
  id: string;
  updateSteading: (patch: Partial<SteadingData>) => Promise<void>;
}

const SteadingContent = ({ g, id, updateSteading }: SteadingContentProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const gameName = g.name || DEFAULT_GAME_NAME;
  const steading = g.steading ?? {};

  const saveResources = useCallback((value: string) => updateSteading({ resources: value }), [updateSteading]);
  const saveFortifications = useCallback((value: string) => updateSteading({ fortifications: value }), [updateSteading]);

  const crumbs = useMemo(() => [
    { label: gameName, to: `/game/${id}` },
    { label: 'Steading Playbook' },
  ], [gameName, id]);

  const tabs = [
    {
      label: 'Steading',
      content: (
        <div className={styles.layout}>
          <div className={styles.columns}>
            <div className={styles.colLeft}>
              <PlaybookSection title="Stats & Debilities">
                <SteadingStats steading={steading} onSave={updateSteading} />
              </PlaybookSection>
            </div>
            <div className={styles.colRight}>
              <PlaybookSection title="Resources">
                <TextareaField
                  label="Resources"
                  note="(Farming, hunting/trapping, stone from the Old Wall, etc.)"
                  value={steading.resources ?? ''}
                  onSave={saveResources}
                  rows={4}
                />
              </PlaybookSection>
              <PlaybookSection title="Fortifications">
                <TextareaField
                  label="Fortifications"
                  note="(Ringwall, village militia, palisade, etc.)"
                  value={steading.fortifications ?? ''}
                  onSave={saveFortifications}
                  rows={4}
                />
              </PlaybookSection>
              <PlaybookSection title="Assets">
                <SteadingAssets assets={steading.assets} onSave={updateSteading} />
              </PlaybookSection>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Improvements',
      content: (
        <div className={styles.layout}>
          <div className={styles.colFull}>
            <PlaybookSection title="Improvements">
              <SteadingImprovements improvements={steading.improvements} onSave={updateSteading} />
            </PlaybookSection>
          </div>
        </div>
      ),
    },
    {
      label: 'NPCs',
      content: (
        <div className={styles.layout}>
          <div className={styles.columns}>
            <div className={styles.colLeft}>
              <PlaybookSection title="Residents of Stonetop">
                <SteadingNPCs section="residents" npcs={steading.residents} onSave={updateSteading} />
              </PlaybookSection>
            </div>
            <div className={styles.colRight}>
              <PlaybookSection title="Notable Neighbors">
                <SteadingNPCs section="neighbors" npcs={steading.neighbors} onSave={updateSteading} />
              </PlaybookSection>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Reference',
      content: (
        <div className={styles.layout}>
          <div className={styles.colFull}>
            <SteadingReference />
          </div>
        </div>
      ),
    },
  ];

  return (
    <main className={styles.page}>
      <PageMeta
        title={`Steading Playbook — ${gameName} — Hearthfire`}
        description={`Stonetop steading playbook for ${gameName}. Track stats, improvements, assets, and NPCs.`}
      />
      <ScrollToTop sentinelRef={headerRef} />
      <div ref={headerRef} className={styles.header}>
        <Breadcrumb crumbs={crumbs} />
        <Heading as="h1" size="xl" className={styles.title}>Steading Playbook</Heading>
        <RuleDivider className={styles.titleRule} />
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
