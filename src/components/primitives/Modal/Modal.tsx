import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  'aria-labelledby'?: string;
}

export const Modal = ({ open, onClose, children, className, 'aria-labelledby': labelledBy }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  // keeps ref current so the keydown effect sees the latest onClose without re-registering the listener
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;

    panelRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
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
