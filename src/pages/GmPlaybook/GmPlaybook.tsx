import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
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
  const saveIWonder = useCallback((value: string) => updateField('iWonder', value), [updateField]);

  const getSectionContent = (
    section: string,
    g: NonNullable<typeof game>,
    onSaveContent: typeof updateContent,
    onSaveIWonder: typeof saveIWonder,
  ): React.ReactNode => {
    if (section === 'Content') return <ContentSection content={g.content} onSave={onSaveContent} />;
    if (section === 'I wonder…') return <IWonder value={g.iWonder ?? ''} onSave={onSaveIWonder} />;
    return STATIC_CONTENT[section] ?? <div className={styles.placeholder} />;
  };

  return (
    <GameGuard loading={loading} error={error} game={game} errorBackTo={`/game/${id}`} errorBackLabel="Back to Game">
      {(g) => {
        const gameName = g.name || DEFAULT_GAME_NAME;
        const crumbs = [
          { label: gameName, to: `/game/${id}` },
          { label: 'GM Playbook' },
        ];

        return (
          <main className={styles.page}>
            <PageMeta
              title={`GM Playbook — ${gameName} — Hearthfire`}
              description={`GM playbook for ${gameName}. Core loop, moves, principles, and session tools.`}
            />
            <div className={styles.header}>
              <Breadcrumb crumbs={crumbs} />
              <Heading as="h1" size="xl" className={styles.title}>GM Playbook</Heading>
              <RuleDivider className={styles.titleRule} />
            </div>
            <div className={styles.sections}>
              {SECTIONS.map(section => (
                <Collapse key={section} label={section}>
                  {getSectionContent(section, g, updateContent, saveIWonder)}
                </Collapse>
              ))}
            </div>
          </main>
        );
      }}
    </GameGuard>
  );
};
