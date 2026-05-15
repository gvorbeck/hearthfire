import { useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export const Checkbox = ({ label, className, ...props }: CheckboxProps) => {
  const id = useId();
  const cx = clsx(styles.label, className);

  return (
    <label htmlFor={id} className={cx}>
      <input id={id} type="checkbox" className={styles.input} {...props} />
      <span className={styles.indicator}>
        <span className={styles.check} />
      </span>
      {label}
    </label>
  );
};
