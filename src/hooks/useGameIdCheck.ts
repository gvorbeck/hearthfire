import { useState, useEffect, useRef } from 'react';
import { gameIdExists, slugifyGameId } from '@/lib/game';

export type IdStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const MIN_LENGTH = 3;
const DEBOUNCE_MS = 1000;

export const useGameIdCheck = (raw: string) => {
  const [status, setStatus] = useState<IdStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const slug = slugifyGameId(raw);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!raw.trim()) {
      // Empty-input branch of a debounced async existence check; fires only on the
      // input transitioning to empty, not a per-render cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle');
      return;
    }

    const currentSlug = slugifyGameId(raw);

    if (currentSlug.length < MIN_LENGTH) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');

    const ac = new AbortController();
    abortRef.current = ac;

    timerRef.current = setTimeout(async () => {
      if (ac.signal.aborted) return;
      try {
        const exists = await gameIdExists(currentSlug);
        if (ac.signal.aborted) return;
        setStatus(exists ? 'taken' : 'available');
      } catch {
        if (!ac.signal.aborted) setStatus('idle');
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timerRef.current!);
      ac.abort();
    };
  }, [raw]);

  return { slug, status };
};
