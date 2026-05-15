import { Link } from 'react-router-dom';
import clsx from 'clsx';
import styles from './Breadcrumb.module.css';

export interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
  className?: string;
}

export const Breadcrumb = ({ crumbs, className }: BreadcrumbProps) => (
  <nav aria-label="breadcrumb" className={clsx(styles.base, className)}>
    <ol className={styles.list}>
      <li className={styles.item}>
        <Link to="/" className={styles.link}>Home</Link>
      </li>
      {crumbs.map((crumb, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.separator} aria-hidden>›</span>
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
