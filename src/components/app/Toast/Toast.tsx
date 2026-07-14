import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '@/components/ui';
import { Icon } from '@/components/ui';
import { Text } from '@/components/ui';
import { generateId } from '@/lib/id';
import { ToastContext, type ToastVariant } from './ToastContext';
import styles from './Toast.module.css';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting: boolean;
}

const AUTO_DISMISS_MS = 5000;
const EXIT_DURATION_MS = 200;

const ToastEntry = ({
  item,
  onDismiss,
  onPause,
  onResume,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) => {
  const cx = clsx(styles.toast, styles[item.variant], item.exiting && styles.exiting);
  const iconCx = clsx(styles.icon, styles[item.variant]);
  const handleDismissItem = useCallback(() => onDismiss(item.id), [onDismiss, item.id]);
  const handlePause = useCallback(() => onPause(item.id), [onPause, item.id]);
  const handleResume = useCallback(() => onResume(item.id), [onResume, item.id]);
  const iconName = ({ error: 'warning', success: 'check', info: 'info' } as const)[item.variant];
  // Errors interrupt assertively via role="alert" here. Info/success are announced
  // by the persistent polite live region in ToastProvider instead of a role/aria-live
  // on this node — a live region mounted together with its own text isn't reliably
  // announced, so this visual toast stays silent for screen readers by design.
  const isError = item.variant === 'error';

  return (
    <div
      role={isError ? 'alert' : undefined}
      aria-live={isError ? 'assertive' : undefined}
      className={cx}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
    >
      <Icon name={iconName} size="small" className={iconCx} />
      <Text as="span" size="xs" className={styles.body}>{item.message}</Text>
      <Button
        variant="ghost"
        size="sm"
        icon="close"
        className={styles.dismiss}
        onClick={handleDismissItem}
        aria-label="Dismiss notification"
      />
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Persistent polite announcement — mounted once up front (not per-toast) so
  // screen readers pick it up. A live region added to the DOM together with its
  // text isn't reliably announced; this one already exists, so only its text
  // content changes when an info/success toast lands.
  const [announcement, setAnnouncement] = useState('');
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Dedupe key (`variant:message`) per visible toast id, so repeated identical
  // notifications (e.g. one failed save per field while offline) don't stack.
  const visibleKeys = useRef<Map<string, string>>(new Map());

  const startExit = useCallback((id: string) => {
    visibleKeys.current.delete(id);
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, EXIT_DURATION_MS);
    timers.current.set(id, removeTimer);
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const dedupeKey = `${variant}:${message}`;
    for (const [existingId, key] of visibleKeys.current) {
      if (key === dedupeKey) {
        // Same message already showing — restart its dismiss timer so the
        // warning stays up while the condition persists, without stacking.
        const existingTimer = timers.current.get(existingId);
        if (existingTimer) clearTimeout(existingTimer);
        timers.current.set(existingId, setTimeout(() => startExit(existingId), AUTO_DISMISS_MS));
        return;
      }
    }
    const id = generateId();
    visibleKeys.current.set(id, dedupeKey);
    setToasts((prev) => [...prev, { id, message, variant, exiting: false }]);
    const timer = setTimeout(() => startExit(id), AUTO_DISMISS_MS);
    timers.current.set(id, timer);
    // Errors get their own role="alert" on the visual toast, which announces on
    // insertion — routing them through here too would double-announce.
    if (variant !== 'error') {
      // Force a change even if the same message repeats back-to-back, so screen
      // readers re-announce it instead of seeing an unchanged text node.
      setAnnouncement((prev) => (prev === message ? `${message} ` : message));
    }
  }, [startExit]);

  const handleDismiss = useCallback((id: string) => {
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    startExit(id);
  }, [startExit]);

  // WCAG 2.2.1 — pause the auto-dismiss countdown while the user hovers or
  // focuses a toast so it can't vanish mid-read; resume with a fresh timer.
  const pauseToast = useCallback((id: string) => {
    // Don't touch the timer of a toast that's already exiting — once startExit
    // runs it deletes the key here, and the timer under this id is its removal
    // timer. Clearing that would strand the toast in the DOM forever.
    if (!visibleKeys.current.has(id)) return;
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
  }, []);

  const resumeToast = useCallback((id: string) => {
    // Only restart for toasts that are still visible (not already exiting).
    if (!visibleKeys.current.has(id)) return;
    // Clear any existing timer first so rapid focus/blur can't leave concurrent
    // timeouts racing to dismiss the same toast.
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    timers.current.set(id, setTimeout(() => startExit(id), AUTO_DISMISS_MS));
  }, [startExit]);

  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout); };
  }, []);

  // Stable context value — every saving component subscribes to this context,
  // so a fresh object here would redraw them all whenever a toast comes or goes.
  const contextValue = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <>
          <div role="status" aria-live="polite" aria-atomic="true" className={styles.announcer}>
            {announcement}
          </div>
          <div role="region" className={styles.region} aria-label="Notifications">
            {toasts.map((item) => (
              <ToastEntry
                key={item.id}
                item={item}
                onDismiss={handleDismiss}
                onPause={pauseToast}
                onResume={resumeToast}
              />
            ))}
          </div>
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

