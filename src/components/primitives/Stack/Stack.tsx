import { type ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import styles from './Stack.module.css';

interface StackProps extends ComponentPropsWithoutRef<'div'> {
  direction?: 'row' | 'column';
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const Stack = ({
  direction = 'column',
  gap = 4,
  align = 'stretch',
  className,
  children,
  ...rest
}: StackProps) => {
  const cx = clsx(
    styles.base,
    styles[direction],
    gap !== undefined && styles[`gap-${gap}`],
    styles[`align-${align}`],
    className
  );

  return <div className={cx} {...rest}>{children}</div>;
};
