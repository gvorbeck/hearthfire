import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './Modal.module.css';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  'aria-labelledby': string;
}

export const Modal = ({ open, onClose, children, className, 'aria-labelledby': labelledBy }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const returnFocusRef = useRef<Element | null>(null);

  // avoids re-registering the keydown listener every time onClose changes identity
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;

    const appRoot = document.getElementById('root');
    if (!appRoot) return;
    appRoot.setAttribute('inert', '');

    returnFocusRef.current = document.activeElement;
    panelRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) { e.preventDefault(); return; }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === panel) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || document.activeElement === panel) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      appRoot.removeAttribute('inert');
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  const handlePanelClick = (e: React.MouseEvent) => e.stopPropagation();

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} role="none">
      <div
        ref={panelRef}
        className={clsx(styles.panel, className)}
        onClick={handlePanelClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
