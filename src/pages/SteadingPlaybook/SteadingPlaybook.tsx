import { useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { Heading, ScrollToTop, Tabs, RuleDivider } from '@/components/primitives';
import { SteadingResources } from '@/components/Playbook/sections/SteadingResources';
import { SteadingFortifications } from '@/components/Playbook/sections/SteadingFortifications';
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
  const steading = useMemo(() => g.steading ?? {}, [g.steading]);

  const crumbs = useMemo(() => [
    { label: gameName, to: `/game/${id}` },
    { label: 'Steading Playbook' },
  ], [gameName, id]);

  const tabs = useMemo(() => [
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
      ),
    },
    {
      label: 'Improvements',
      content: (
        <div className={styles.layout}>
          <div className={styles.colFull}>
            <PlaybookSection title="Improvements">
              <SteadingImprovements improvements={steading.improvements} gmImprovements={steading.gmImprovements} onSave={updateSteading} />
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
  ], [steading, updateSteading]);

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
