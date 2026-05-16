import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import styles from '@/App.module.css';

const Home = lazy(() => import('@/pages/Home/Home').then((m) => ({ default: m.Home })));
const Game = lazy(() => import('@/pages/Game/Game').then((m) => ({ default: m.Game })));
const GmPlaybook = lazy(() => import('@/pages/GmPlaybook/GmPlaybook').then((m) => ({ default: m.GmPlaybook })));
const CharacterPlaybook = lazy(() => import('@/pages/CharacterPlaybook/CharacterPlaybook').then((m) => ({ default: m.CharacterPlaybook })));

export const App = () => (
  <>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/game/:id/gm" element={<GmPlaybook />} />
        <Route path="/game/:id/:playbook" element={<CharacterPlaybook />} />
      </Routes>
    </Suspense>
    <footer className={styles.footer}>
      Stonetop is written by Jeremy Strandberg and published by Lampblack &amp; Brimstone.
      Text released under CC BY-SA 4.0. Some concepts derived from Dungeon World by Sage
      LaTorra &amp; Adam Koebel (CC BY).
      <br />&copy; {new Date().getFullYear()}{' '}
      <a href="https://iamgarrett.com" target="_blank" rel="noreferrer">J. Garrett Vorbeck</a>
    </footer>
  </>
);
