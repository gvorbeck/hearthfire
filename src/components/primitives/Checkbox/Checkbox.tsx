import { useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Icon } from '../Icon/Icon';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  variant?: 'default' | 'provision';
  weight?: 1 | 2;
}

export const Checkbox = ({ label, className, variant = 'default', weight = 1, ...props }: CheckboxProps) => {
  const id = useId();
  const cx = clsx(styles.label, variant === 'provision' && styles.labelProvision, className);
  const iconName = props.checked ? 'filled-provisions' : 'empty-provisions';
  const iconCx = clsx(styles.provisionIcon, props.checked && styles.provisionIconChecked);

  return (
    <label htmlFor={id} className={cx}>
      <input id={id} type="checkbox" className={styles.input} {...props} />
      {variant === 'provision' ? (
        <span className={styles.provisionIcons}>
          {Array.from({ length: weight }, (_, i) => (
            <Icon key={i} name={iconName} size="small" className={iconCx} />
          ))}
        </span>
      ) : (
        <span className={styles.indicator}>
          <span className={styles.check} />
        </span>
      )}
      {label}
    </label>
  );
};
