import clsx from 'clsx';
import styles from './Divider.module.css';

export const Divider = ({ className }: { className?: string }) => <hr className={clsx(styles.root, className)} />;
