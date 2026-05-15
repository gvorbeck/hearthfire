import { useId, type InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export const Checkbox = ({ label, className: _className, ...props }: CheckboxProps) => {
  const id = useId();

  return (
    <label htmlFor={id} className={styles.label}>
      <input id={id} type="checkbox" className={styles.input} {...props} />
      <span className={styles.indicator}>
        <span className={styles.check} />
      </span>
      {label}
    </label>
  );
};
