import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './PlaybookColumns.module.css';

interface PlaybookColumnsProps {
  left?: ReactNode;
  right?: ReactNode;
  full?: ReactNode;
  className?: string;
}

export const PlaybookColumns = ({ left, right, full, className }: PlaybookColumnsProps) => {
  if (full !== undefined) {
    const cx = clsx(styles.full, className);
    return <div className={cx}>{full}</div>;
  }
  const cx = clsx(styles.columns, className);
  return (
    <div className={cx}>
      {left !== undefined && <div className={styles.col}>{left}</div>}
      {right !== undefined && <div className={styles.col}>{right}</div>}
    </div>
  );
};
