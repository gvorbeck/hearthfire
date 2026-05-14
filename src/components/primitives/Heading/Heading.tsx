import { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Heading.module.css';

interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: 'xl' | 'lg' | 'md' | 'sm';
  className?: string;
  children: ReactNode;
}

export const Heading = ({
  as: Tag = 'h2',
  size = 'lg',
  className,
  children,
}: HeadingProps) => {
  const cx = clsx(styles.base, styles[size], className);

  return <Tag className={cx}>{children}</Tag>;
};
