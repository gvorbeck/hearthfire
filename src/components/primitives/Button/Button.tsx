import { type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Icon, type IconName, type IconSize } from '../Icon/Icon';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: IconName;
  fullWidth?: boolean;
}

const iconSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', IconSize> = {
  sm: 'small',
  md: 'small',
  lg: 'medium',
  xl: 'large',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) => {
  const cx = clsx(
    styles.base,
    styles[variant],
    styles[size],
    icon && !children && styles.iconOnly,
    fullWidth && styles.fullWidth,
    className
  );

  return (
    <button className={cx} {...props}>
      {icon && <Icon name={icon} size={iconSizeMap[size]} />}
      {children}
    </button>
  );
};
