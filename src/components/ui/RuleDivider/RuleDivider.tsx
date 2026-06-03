import clsx from 'clsx';
import styles from './RuleDivider.module.css';

interface RuleDividerProps {
  className?: string;
}

export const RuleDivider = ({ className }: RuleDividerProps) => (
  <div className={clsx(styles.root, className)}>
    <span className={styles.diamond} />
  </div>
);
