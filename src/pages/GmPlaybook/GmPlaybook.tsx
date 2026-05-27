import { useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { ScrollToTop, Tabs } from '@/components/primitives';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { PlaybookSection } from '@/components/CharacterSheet/PlaybookSection';
import { CoreLoop, GmMoves, Principles, DamageAndDebilities, ContentSection, Threats, IWonder, Expeditions, Sites, Discoveries, Hazards, Monsters, NPCs, Followers, Homefront, FlowOfPlay } from '@/components/Playbook/sections';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import type { ContentLists, GameSession } from '@/types';
import styles from './GmPlaybook.module.css';

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

  const crumbs = [
    { label: gameName, to: `/game/${id}` },
    { label: 'GM Playbook' },
  ];

  const tabs = [
    {
      label: 'Reference',
      content: (
        <div className={styles.layout}>
          <div className={styles.columns}>
            <div className={styles.colLeft}>
              <PlaybookSection title="The Core Loop">
                <CoreLoop />
              </PlaybookSection>
              <PlaybookSection title="GM Moves">
                <GmMoves />
              </PlaybookSection>
            </div>
            <div className={styles.colRight}>
              <PlaybookSection title="Principles">
                <Principles />
              </PlaybookSection>
              <PlaybookSection title="Damage & Debilities">
                <DamageAndDebilities />
              </PlaybookSection>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Session',
      content: (
        <div className={styles.layout}>
          <div className={styles.columns}>
            <div className={styles.colLeft}>
              <PlaybookSection title="Flow of Play">
                <FlowOfPlay />
              </PlaybookSection>
              <PlaybookSection title="Content">
                <ContentSection content={g.content} onSave={updateContent} />
              </PlaybookSection>
            </div>
            <div className={styles.colRight}>
              <PlaybookSection title="I Wonder…">
                <IWonder value={g.iWonder ?? ''} onSave={saveIWonder} />
              </PlaybookSection>
              <PlaybookSection title="Threats">
                <Threats />
              </PlaybookSection>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'World',
      content: (
        <div className={styles.layout}>
          <div className={styles.columns}>
            <div className={styles.colLeft}>
              <PlaybookSection title="Expeditions">
                <Expeditions />
              </PlaybookSection>
              <PlaybookSection title="Sites">
                <Sites />
              </PlaybookSection>
              <PlaybookSection title="Discoveries">
                <Discoveries />
              </PlaybookSection>
              <PlaybookSection title="Hazards">
                <Hazards />
              </PlaybookSection>
            </div>
            <div className={styles.colRight}>
              <PlaybookSection title="Monsters">
                <Monsters />
              </PlaybookSection>
              <PlaybookSection title="NPCs">
                <NPCs />
              </PlaybookSection>
              <PlaybookSection title="Followers">
                <Followers />
              </PlaybookSection>
              <PlaybookSection title="Homefront">
                <Homefront />
              </PlaybookSection>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <main className={styles.page}>
      <PageMeta
        title={`GM Playbook — ${gameName} — Hearthfire`}
        description={`GM playbook for ${gameName}. Core loop, moves, principles, and session tools.`}
      />
      <ScrollToTop sentinelRef={headerRef} />
      <div ref={headerRef}>
        <PageHeader
          crumbs={crumbs}
          title="GM Playbook"
          gameId={id}
        />
      </div>
      <Tabs
        aria-label="GM Playbook sections"
        className={styles.tabs}
        tabs={tabs}
      />
    </main>
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
