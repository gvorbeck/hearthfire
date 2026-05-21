import { useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Toggle.module.css';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Toggle = ({ label, className, ...props }: ToggleProps) => {
  const id = useId();
  const cx = clsx(styles.label, className);

  return (
    <label htmlFor={id} className={cx}>
      <input id={id} type="checkbox" role="switch" className={styles.input} {...props} />
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      {label}
    </label>
  );
};
