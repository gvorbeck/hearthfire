import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Game } from './pages/Game/Game';
import { GmPlaybook } from './pages/GmPlaybook/GmPlaybook';
import styles from './App.module.css';

export const App = () => (
  <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/game/:id/gm" element={<GmPlaybook />} />
    </Routes>
    <footer className={styles.footer}>
      Stonetop is written by Jeremy Strandberg and published by Lampblack &amp; Brimstone.
      Text released under CC BY-SA 4.0. Some concepts derived from Dungeon World by Sage
      LaTorra &amp; Adam Koebel (CC BY).
    </footer>
  </>
);
