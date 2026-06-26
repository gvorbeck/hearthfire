import clsx from 'clsx';
import styles from './Spinner.module.css';

interface Props {
  className?: string;
  // Accessible label announced to screen readers; defaults to the common case.
  label?: string;
}

export const Spinner = ({ className, label = 'Loading…' }: Props) => (
  <span className={clsx(styles.root, className)} role="status" aria-label={label} />
);
