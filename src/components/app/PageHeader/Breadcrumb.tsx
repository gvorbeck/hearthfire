import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Crumb } from '@/types';
import styles from './Breadcrumb.module.css';

type BreadcrumbProps = {
  crumbs: Crumb[];
  className?: string;
};

export const Breadcrumb = ({ crumbs, className }: BreadcrumbProps) => {
  const cx = clsx(styles.base, className);
  return (
    <nav aria-label="breadcrumb" className={cx}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link to="/" className={styles.link}>Home</Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.label} className={styles.item}>
            <span className={styles.separator} aria-hidden="true">›</span>
            {crumb.to ? (
              <Link to={crumb.to} className={styles.link}>{crumb.label}</Link>
            ) : (
              <span className={styles.current} aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
