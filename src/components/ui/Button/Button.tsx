import { type ReactNode, type ElementType, type ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import { Icon, type IconName, type IconSize } from '../Icon/Icon';
import styles from './Button.module.css';

type ButtonOwnProps<E extends ElementType> = {
  as?: E;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: IconName;
  children?: ReactNode;
  className?: string;
};

type ButtonWithIconOnly<E extends ElementType> = ButtonOwnProps<E> & Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps<E>> & { icon: IconName; children?: never; 'aria-label': string };
type ButtonWithChildren<E extends ElementType> = ButtonOwnProps<E> & Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps<E>> & { icon?: IconName; children: ReactNode };

export type ButtonProps<E extends ElementType = 'button'> = ButtonWithIconOnly<E> | ButtonWithChildren<E>;

const iconSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', IconSize> = {
  sm: 'small',
  md: 'small',
  lg: 'medium',
  xl: 'large',
};

export const Button = <E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps<E>) => {
  const Tag = (as ?? 'button') as ElementType;
  const cx = clsx(
    styles.base,
    styles[variant],
    styles[size],
    icon && !children && styles.iconOnly,
    fullWidth && styles.fullWidth,
    className
  );

  return (
    <Tag className={cx} {...(props as ComponentPropsWithoutRef<typeof Tag>)}>
      {icon && <Icon name={icon} size={iconSizeMap[size]} />}
      {children}
    </Tag>
  );
};
