import { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Text.module.css';

interface TextProps {
  as?: 'p' | 'span' | 'label' | 'li';
  size?: 'sm' | 'md' | 'lg';
  color?: 'muted' | 'default' | 'accent';
  className?: string;
  children: ReactNode;
}

export const Text = ({
  as: Tag = 'p',
  size = 'md',
  color = 'default',
  className,
  children,
}: TextProps) => {
  const cx = clsx(styles.base, styles[size], styles[color], className);

  return <Tag className={cx}>{children}</Tag>;
};
