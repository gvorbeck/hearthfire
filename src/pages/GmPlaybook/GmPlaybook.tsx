import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { Heading, Collapse, RuleDivider } from '@/components/primitives';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { CoreLoop, GmMoves, Principles, DamageAndDebilities, ContentSection, Threats, IWonder, Expeditions, Sites, Discoveries, Hazards, Monsters, NPCs, Followers, Homefront, FlowOfPlay } from '@/components/Playbook/sections';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import styles from './GmPlaybook.module.css';

const SECTIONS = [
  'The core loop',
  'GM moves',
  'Principles',
  'Damage and debilities',
  'Content',
  'Threats',
  'I wonder…',
  'Expeditions',
  'Sites',
  'Discoveries',
  'Hazards',
  'Monsters',
  'NPCs',
  'Followers',
  'Homefront',
  'Flow of play',
];

const STATIC_CONTENT: Partial<Record<string, React.ReactNode>> = {
  'The core loop': <CoreLoop />,
  'GM moves': <GmMoves />,
  'Principles': <Principles />,
  'Damage and debilities': <DamageAndDebilities />,
  'Threats': <Threats />,
  'Expeditions': <Expeditions />,
  'Sites': <Sites />,
  'Discoveries': <Discoveries />,
  'Hazards': <Hazards />,
  'Monsters': <Monsters />,
  'NPCs': <NPCs />,
  'Followers': <Followers />,
  'Homefront': <Homefront />,
  'Flow of play': <FlowOfPlay />,
};

export const GmPlaybook = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { game, loading, error, updateContent, updateField } = useGame(id);
  const saveIWonder = useCallback((v: string) => updateField('iWonder', v), [updateField]);

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`}>
      {(g) => {
        const gameName = g.name || DEFAULT_GAME_NAME;
        const crumbs = [
          { label: gameName, to: `/game/${id}` },
          { label: 'GM Playbook' },
        ];

        const getSectionContent = (section: string): React.ReactNode => {
          if (section === 'Content') return <ContentSection content={g.content} onSave={updateContent} />;
          if (section === 'I wonder…') return <IWonder value={g.iWonder ?? ''} onSave={saveIWonder} />;
          return STATIC_CONTENT[section] ?? <div className={styles.placeholder} />;
        };

        return (
          <main className={styles.page}>
            <div className={styles.header}>
              <Breadcrumb crumbs={crumbs} />
              <Heading as="h1" size="xl" className={styles.title}>GM Playbook</Heading>
              <RuleDivider className={styles.titleRule} />
            </div>
            <div className={styles.sections}>
              {SECTIONS.map(section => (
                <Collapse key={section} label={section}>
                  {getSectionContent(section)}
                </Collapse>
              ))}
            </div>
          </main>
        );
      }}
    </GameGuard>
  );
};
