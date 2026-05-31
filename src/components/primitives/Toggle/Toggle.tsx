import { useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Toggle.module.css';

interface ToggleWithLabel extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  'aria-label'?: string;
}

interface ToggleWithAriaLabel extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: never;
  'aria-label': string;
}

type ToggleProps = ToggleWithLabel | ToggleWithAriaLabel;

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
