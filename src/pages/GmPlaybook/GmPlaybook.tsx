import { useCallback, useMemo, useRef } from 'react';
import { useHashTabs } from '@/hooks/useHashTabs';
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { useGame } from '@/hooks/useGame';
import { ScrollToTop, Tabs, PlaybookColumns } from '@/components/ui';
import { PageLayout } from '@/components/app/PageLayout/PageLayout';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import { CoreLoop, GmMoves, Principles, DamageAndDebilities, ContentSection, Threats, IWonder, Expeditions, Sites, Discoveries, Hazards, Monsters, NPCs, Followers, Homefront, FlowOfPlay, MoveSearch } from '@/components/gm-playbook/sections';
import { GameGuard } from '@/components/app/GameGuard/GameGuard';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import type { ContentLists, GameSession } from '@/types';
import styles from './GmPlaybook.module.css';

const ReferenceTabContent = () => (
  <PlaybookColumns
    left={<>
      <PlaybookSection title="The Core Loop" collapsible>
        <CoreLoop />
      </PlaybookSection>
      <PlaybookSection title="GM Moves" collapsible>
        <GmMoves />
      </PlaybookSection>
    </>}
    right={<>
      <PlaybookSection title="Principles" collapsible>
        <Principles />
      </PlaybookSection>
      <PlaybookSection title="Damage & Debilities" collapsible>
        <DamageAndDebilities />
      </PlaybookSection>
    </>}
  />
);

const WorldTabContent = () => (
  <PlaybookColumns
    left={<>
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
    </>}
    right={<>
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
    </>}
  />
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
      id: 'reference',
      label: 'Reference',
      content: <ReferenceTabContent />,
    },
    {
      id: 'session',
      label: 'Session',
      content: (
        <PlaybookColumns
          left={<>
            <PlaybookSection title="Flow of Play" collapsible>
              <FlowOfPlay />
            </PlaybookSection>
            <PlaybookSection title="Content" collapsible>
              <ContentSection content={g.content} onSave={updateContent} />
            </PlaybookSection>
          </>}
          right={<>
            <PlaybookSection title="I Wonder…" collapsible>
              <IWonder value={g.iWonder ?? ''} onSave={saveIWonder} />
            </PlaybookSection>
            <PlaybookSection title="Threats" collapsible>
              <Threats />
            </PlaybookSection>
          </>}
        />
      ),
    },
    {
      id: 'world',
      label: 'World',
      content: <WorldTabContent />,
    },
    {
      id: 'move-search',
      label: 'Move Search',
      content: <MoveSearch />,
    },
  ], [g.content, g.iWonder, updateContent, saveIWonder]);

  const { activeIndex, handleActiveChange } = useHashTabs(tabs);

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
        activeIndex={activeIndex}
        onActiveChange={handleActiveChange}
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
