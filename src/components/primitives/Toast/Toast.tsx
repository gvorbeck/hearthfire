import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import styles from './Toast.module.css';

type ToastVariant = 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting: boolean;
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;
const EXIT_DURATION_MS = 200;

const ToastEntry = ({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) => {
  const cx = clsx(styles.toast, styles[item.variant], item.exiting && styles.exiting);
  const iconCx = clsx(styles.icon, styles[item.variant]);
  const handleDismissItem = useCallback(() => onDismiss(item.id), [onDismiss, item.id]);

  return (
    <div role="alert" className={cx}>
      <span className={iconCx}>
        <Icon name={item.variant === 'error' ? 'warning' : 'check'} size="small" />
      </span>
      <span className={styles.body}>
        <Text as="span" size="xs">{item.message}</Text>
      </span>
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
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const startExit = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, EXIT_DURATION_MS);
    timers.current.set(id, removeTimer);
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'error') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant, exiting: false }]);
    const timer = setTimeout(() => startExit(id), AUTO_DISMISS_MS);
    timers.current.set(id, timer);
  }, [startExit]);

  const handleDismiss = useCallback((id: string) => {
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    startExit(id);
  }, [startExit]);

  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout); };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div role="region" className={styles.region} aria-label="Notifications">
          {toasts.map((item) => (
            <ToastEntry key={item.id} item={item} onDismiss={handleDismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
