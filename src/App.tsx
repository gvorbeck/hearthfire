import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastProvider, ErrorBoundary } from "@/components/app";
import styles from "./App.module.css";

/*
 * Each page is lazy-loaded — its JS bundle is only fetched the first time
 * the user navigates to that route, keeping the initial load fast.
 */
const Home = lazy(() =>
  import("@/pages/Home/Home").then((m) => ({ default: m.Home })),
);
const Game = lazy(() =>
  import("@/pages/Game/Game").then((m) => ({ default: m.Game })),
);
const GmPlaybook = lazy(() =>
  import("@/pages/GmPlaybook/GmPlaybook").then((m) => ({
    default: m.GmPlaybook,
  })),
);
const SteadingPlaybook = lazy(() =>
  import("@/pages/SteadingPlaybook/SteadingPlaybook").then((m) => ({
    default: m.SteadingPlaybook,
  })),
);
const CharacterPlaybook = lazy(() =>
  import("@/pages/CharacterPlaybook/CharacterPlaybook").then((m) => ({
    default: m.CharacterPlaybook,
  })),
);
const NotFound = lazy(() =>
  import("@/pages/NotFound/NotFound").then((m) => ({ default: m.NotFound })),
);

/*
 * App — the root of the entire application.
 *
 * Wraps everything in:
 *   ToastProvider  — makes toast notifications available to every component
 *   ErrorBoundary  — catches JS crashes and shows a fallback UI
 *   Suspense       — shows nothing while a lazy page bundle is loading
 *
 * Route map:
 *   /                        → Home
 *   /game/:id                → Game (party overview)
 *   /game/:id/gm             → GM Playbook
 *   /game/:id/steading       → Steading Playbook
 *   /game/:id/:playbook      → Character Playbook (one per playbook type)
 *   *                        → NotFound (404)
 *
 * SiteBanner, the TopBar wordmark, and the footer are all handled inside
 * PageLayout / PageHeader, so no shared shell wrapper is needed here.
 */
export const App = () => (
  <ToastProvider>
    <ErrorBoundary>
      <Suspense fallback={<div className={styles.srOnly} aria-live="polite" aria-busy="true">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/game/:id/gm" element={<GmPlaybook />} />
          <Route path="/game/:id/steading" element={<SteadingPlaybook />} />
          <Route path="/game/:id/:playbook" element={<CharacterPlaybook />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </ToastProvider>
);
