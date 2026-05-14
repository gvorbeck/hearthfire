import { type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Icon, type IconName, type IconSize } from '../Icon/Icon';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
}

const iconSizeMap: Record<'sm' | 'md' | 'lg', IconSize> = {
  sm: 'small',
  md: 'small',
  lg: 'medium',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonProps) => {
  const cx = clsx(
    styles.base,
    styles[variant],
    styles[size],
    icon && !children && styles.iconOnly,
    className
  );

  return (
    <button className={cx} {...props}>
      {icon && <Icon name={icon} size={iconSizeMap[size]} />}
      {children}
    </button>
  );
};
