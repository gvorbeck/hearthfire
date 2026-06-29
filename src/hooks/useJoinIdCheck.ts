import { useState, useEffect, useRef } from 'react';
import { gameIdExists } from '@/lib/game';

export type JoinIdStatus = 'idle' | 'checking' | 'found' | 'notfound' | 'error';

const DEBOUNCE_MS = 1000;

// Live existence check for the Join form. Unlike useGameIdCheck (create), the
// pasted ID is used verbatim — never slugified — and "found" is the good state.
export const useJoinIdCheck = (raw: string) => {
  const [status, setStatus] = useState<JoinIdStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const trimmed = raw.trim();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!trimmed) {
      setStatus('idle');
      return;
    }

    setStatus('checking');

    const ac = new AbortController();
    abortRef.current = ac;

    timerRef.current = setTimeout(async () => {
      if (ac.signal.aborted) return;
      try {
        const exists = await gameIdExists(trimmed);
        if (ac.signal.aborted) return;
        setStatus(exists ? 'found' : 'notfound');
      } catch {
        if (!ac.signal.aborted) setStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timerRef.current!);
      ac.abort();
    };
  }, [trimmed]);

  return { status };
};
