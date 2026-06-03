import { useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { ScrollToTop, Tabs } from '@/components/ui';
import { PageLayout } from '@/components/app/PageLayout/PageLayout';
import { PlaybookSection } from '@/components/character/PlaybookSection';
import { CoreLoop, GmMoves, Principles, DamageAndDebilities, ContentSection, Threats, IWonder, Expeditions, Sites, Discoveries, Hazards, Monsters, NPCs, Followers, Homefront, FlowOfPlay } from '@/components/gm-playbook/sections';
import { GameGuard } from '@/components/app/GameGuard/GameGuard';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import type { ContentLists, GameSession } from '@/types';
import styles from './GmPlaybook.module.css';

const ReferenceTabContent = () => (
  <div className={styles.layout}>
    <div className={styles.columns}>
      <div className={styles.colLeft}>
        <PlaybookSection title="The Core Loop" collapsible>
          <CoreLoop />
        </PlaybookSection>
        <PlaybookSection title="GM Moves" collapsible>
          <GmMoves />
        </PlaybookSection>
      </div>
      <div className={styles.colRight}>
        <PlaybookSection title="Principles" collapsible>
          <Principles />
        </PlaybookSection>
        <PlaybookSection title="Damage & Debilities" collapsible>
          <DamageAndDebilities />
        </PlaybookSection>
      </div>
    </div>
  </div>
);

const WorldTabContent = () => (
  <div className={styles.layout}>
    <div className={styles.columns}>
      <div className={styles.colLeft}>
        <PlaybookSection title="Expeditions" collapsible>
          <Expeditions />
        </PlaybookSection>
        <PlaybookSection title="Sites" collapsible>
          <Sites />
        </PlaybookSection>
        <PlaybookSection title="Discoveries" collapsible>
          <Discoveries />
        </PlaybookSection>
        <PlaybookSection title="Hazards" collapsible>
          <Hazards />
        </PlaybookSection>
      </div>
      <div className={styles.colRight}>
        <PlaybookSection title="Monsters" collapsible>
          <Monsters />
        </PlaybookSection>
        <PlaybookSection title="NPCs" collapsible>
          <NPCs />
        </PlaybookSection>
        <PlaybookSection title="Followers" collapsible>
          <Followers />
        </PlaybookSection>
        <PlaybookSection title="Homefront" collapsible>
          <Homefront />
        </PlaybookSection>
      </div>
    </div>
  </div>
);

interface GmPlaybookContentProps {
  g: GameSession;
  id: string;
  updateContent: (field: keyof ContentLists, value: string) => Promise<void>;
  updateField: (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => Promise<void>;
}

const GmPlaybookContent = ({ g, id, updateContent, updateField }: GmPlaybookContentProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const gameName = g.name || DEFAULT_GAME_NAME;
  const saveIWonder = useCallback((value: string) => updateField('iWonder', value), [updateField]);

  const crumbs = useMemo(() => [
    { label: gameName, to: `/game/${id}` },
    { label: 'GM Playbook' },
  ], [gameName, id]);

  const tabs = useMemo(() => [
    {
      label: 'Reference',
      content: <ReferenceTabContent />,
    },
    {
      label: 'Session',
      content: (
        <div className={styles.layout}>
          <div className={styles.columns}>
            <div className={styles.colLeft}>
              <PlaybookSection title="Flow of Play" collapsible>
                <FlowOfPlay />
              </PlaybookSection>
              <PlaybookSection title="Content" collapsible>
                <ContentSection content={g.content} onSave={updateContent} />
              </PlaybookSection>
            </div>
            <div className={styles.colRight}>
              <PlaybookSection title="I Wonder…" collapsible>
                <IWonder value={g.iWonder ?? ''} onSave={saveIWonder} />
              </PlaybookSection>
              <PlaybookSection title="Threats" collapsible>
                <Threats />
              </PlaybookSection>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'World',
      content: <WorldTabContent />,
    },
  ], [g.content, g.iWonder, updateContent, saveIWonder]);

  return (
    <PageLayout crumbs={crumbs} title="GM Playbook" gameId={id}>
      <PageMeta
        title={`GM Playbook — ${gameName} — Hearthfire`}
        description={`GM playbook for ${gameName}. Core loop, moves, principles, and session tools.`}
      />
      <ScrollToTop sentinelRef={headerRef} />
      <div ref={headerRef} />
      <Tabs
        aria-label="GM Playbook sections"
        className={styles.tabs}
        tabs={tabs}
      />
    </PageLayout>
  );
};

export const GmPlaybook = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { game, loading, error, updateContent, updateField } = useGame(id);

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`} errorBackLabel="Back to Game">
      {(g) => (
        <GmPlaybookContent
          g={g}
          id={id}
          updateContent={updateContent}
          updateField={updateField}
        />
      )}
    </GameGuard>
  );
};
