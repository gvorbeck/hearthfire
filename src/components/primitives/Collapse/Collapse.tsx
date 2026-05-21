import { useState, useId, type ReactNode } from 'react';
import clsx from 'clsx';
import { Icon } from '../Icon/Icon';
import styles from './Collapse.module.css';

interface CollapseProps {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const Collapse = ({ label, defaultOpen = false, children, className, action }: CollapseProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const cx = clsx(styles.root, open && styles.open, className);
  const handleToggle = () => setOpen(v => !v);

  return (
    <div className={cx}>
      <button
        className={styles.trigger}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={id}
      >
        <span className={styles.label}>{label}</span>
        {action && (
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className={styles.action}
          >
            {action}
          </div>
        )}
        <Icon name="chevron-down" size="small" className={styles.chevron} aria-hidden="true" />
      </button>
      <div id={id} className={styles.body} hidden={!open}>
        {children}
      </div>
    </div>
  );
};
