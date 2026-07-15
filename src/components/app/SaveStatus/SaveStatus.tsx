import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Button, Icon, Text } from '@/components/ui';
import { useSaveStatusOptional } from './SaveStatusContext';
import styles from './SaveStatus.module.css';

// Coarse buckets are enough for an ambient indicator — under a minute reads as
// "just now", then minutes, then hours. Avoids second-by-second churn.
const formatRelative = (savedAt: number, now: number): string => {
  const seconds = Math.max(0, Math.round((now - savedAt) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

/*
 * SaveStatus — ambient, always-glanceable save indicator. Renders as a sticky
 * pill fixed to the bottom-left corner so it stays visible no matter how far
 * the user has scrolled down a long character sheet.
 *
 * Reads the app-wide SaveStatusProvider and shows one of:
 *   saving → spinner + "Saving…"
 *   saved  → check + "Saved · <relative time>"
 *   idle   → pill fades out (no save has happened this session)
 *
 * The relative time refreshes on a 15s tick while a save is shown, so a sheet
 * left open keeps reading "Saved · 5m ago" rather than freezing at "just now".
 *
 * Rendered with role="status" / aria-live="polite" so screen readers announce
 * the transition without stealing focus. Failures stay with the error Toast.
 */
export const SaveStatus = () => {
  const ctx = useSaveStatusOptional();
  const status = ctx?.status ?? 'idle';
  const lastSavedAt = ctx?.lastSavedAt ?? null;
  // The clock the relative time is measured against. Re-stamped whenever a new
  // save lands (lastSavedAt changes) so the label resets to "just now", and on a
  // 15s timer so it then rolls forward to "1m ago" on its own.
  const [now, setNow] = useState(() => Date.now());
  // The lastSavedAt value the user dismissed. The pill stays hidden until the
  // next save lands (lastSavedAt changes) or a save is in flight again.
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'saved') return;
    // Seed the clock when a save lands, then let the interval roll it forward.
    // `now` is wall-clock time — not derivable from props — and this fires once
    // per save transition (user-paced), not a per-render cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [status, lastSavedAt]);

  const isSaving = status === 'saving';
  const label = isSaving
    ? 'Saving…'
    : lastSavedAt !== null
      ? `Saved · ${formatRelative(lastSavedAt, now)}`
      : 'Saved';
  const isDismissed = status === 'saved' && lastSavedAt === dismissedAt;
  const isIdle = !ctx || status === 'idle' || isDismissed;
  const cx = clsx(styles.root, !isIdle && styles.visible);

  // The role="status" live region is always mounted so screen readers announce
  // the first "Saving…" — a region added to the DOM together with its text is
  // not reliably announced. When idle the pill fades out and its content empties.
  return (
    <span className={cx} role="status" aria-live="polite" aria-hidden={isIdle}>
      {isIdle ? null : (
        <>
          {isSaving ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <Icon name="check" size="small" className={styles.icon} aria-hidden="true" />
          )}
          <Text as="span" size="xs" color={isSaving ? 'default' : 'muted'}>
            {label}
          </Text>
          {!isSaving && (
            <Button
              variant="ghost"
              icon="close"
              className={styles.dismiss}
              onClick={() => setDismissedAt(lastSavedAt)}
              aria-label="Dismiss saved indicator"
            />
          )}
        </>
      )}
    </span>
  );
};
