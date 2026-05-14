import { type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export const Input = ({ label, id, error, className, ...props }: InputProps) => {
  const inputCx = clsx(styles.input, error && styles.hasError, className);

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input id={id} className={inputCx} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
