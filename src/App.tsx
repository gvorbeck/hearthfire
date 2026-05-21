import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SiteBanner } from '@/components/primitives';
import styles from '@/App.module.css';

const CURRENT_YEAR = new Date().getFullYear();

const Home = lazy(() => import('@/pages/Home/Home').then((m) => ({ default: m.Home })));
const Game = lazy(() => import('@/pages/Game/Game').then((m) => ({ default: m.Game })));
const GmPlaybook = lazy(() => import('@/pages/GmPlaybook/GmPlaybook').then((m) => ({ default: m.GmPlaybook })));
const CharacterPlaybook = lazy(() => import('@/pages/CharacterPlaybook/CharacterPlaybook').then((m) => ({ default: m.CharacterPlaybook })));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound').then((m) => ({ default: m.NotFound })));

export const App = () => (
  <>
    <SiteBanner>
      <strong>Under Construction</strong> — This app is a work in progress. Data may be lost or reset before June 2026.{' '}
      Found a bug? <a href="https://github.com/gvorbeck/hearthfire/issues" target="_blank" rel="noopener noreferrer">Open an issue on GitHub.</a>
    </SiteBanner>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/game/:id/gm" element={<GmPlaybook />} />
        <Route path="/game/:id/:playbook" element={<CharacterPlaybook />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <footer className={styles.footer}>
      Stonetop is written by Jeremy Strandberg and published by Lampblack &amp; Brimstone.
      Text released under CC BY-SA 4.0. Some concepts derived from Dungeon World by Sage
      LaTorra &amp; Adam Koebel (CC BY).
      <br />&copy; {CURRENT_YEAR}{' '}
      <a href="https://iamgarrett.com" target="_blank" rel="noreferrer">J. Garrett Vorbeck</a>
      {' · '}
      <a href="https://github.com/gvorbeck/hearthfire" target="_blank" rel="noreferrer">GitHub</a>
    </footer>
  </>
);
