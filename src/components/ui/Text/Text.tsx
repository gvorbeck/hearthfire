import { type ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import styles from './Text.module.css';

interface TextProps extends ComponentPropsWithoutRef<'span'> {
  as?: 'p' | 'span' | 'li';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'muted' | 'tertiary' | 'accent';
  font?: 'sans' | 'serif';
  weight?: 'normal' | 'semibold' | 'bold';
  leading?: 'tight' | 'normal' | 'loose';
  italic?: boolean;
}

export const Text = ({
  as: Tag = 'p',
  size = 'sm',
  color = 'default',
  font = 'sans',
  weight = 'normal',
  italic = false,
  leading,
  className,
  children,
  ...props
}: TextProps) => {
  const cx = clsx(
    styles.base,
    styles[size],
    styles[color],
    styles[font],
    weight === 'semibold' && styles.semibold,
    weight === 'bold' && styles.bold,
    italic && styles.italic,
    leading === 'tight' && styles.leadingTight,
    leading === 'normal' && styles.leadingNormal,
    leading === 'loose' && styles.leadingLoose,
    className,
  );

  return <Tag className={cx} {...props}>{children}</Tag>;
};
