import { useState, useCallback, useRef, useEffect } from 'react';

interface TabWithId {
  id: string;
  [key: string]: unknown;
}

// This hook owns the first "&"-delimited hash segment (the tab id); later segments belong to a tab's
// own nested state (e.g. ArcanaTab's "#arcana&major" sub-tab). Match against the first segment only.
const tabSegment = () => window.location.hash.slice(1).split('&')[0];

export const useHashTabs = (tabs: TabWithId[]) => {
  const hashResolved = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Resolve hash → index once after mount, when tabs are available
  useEffect(() => {
    if (hashResolved.current || tabs.length === 0) return;
    const hash = tabSegment();
    if (hash) {
      const idx = tabs.findIndex((t) => t.id === hash);
      if (idx !== -1) setActiveIndex(idx);
    }
    hashResolved.current = true;
  // tabs identity is stable (useMemo in callers); run once after first non-empty render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length > 0]);

  // Sync activeIndex when the hash changes outside our own writes — e.g. the
  // browser back/forward buttons navigating between tabs.
  useEffect(() => {
    const onHashChange = () => {
      const idx = tabs.findIndex((t) => t.id === tabSegment());
      if (idx !== -1) setActiveIndex(idx);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [tabs]);

  const handleActiveChange = useCallback((i: number) => {
    setActiveIndex(i);
    window.location.hash = tabs[i]?.id ?? '';
  }, [tabs]);

  return { activeIndex, setActiveIndex, handleActiveChange };
};
