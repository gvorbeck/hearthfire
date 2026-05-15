import { useId, type InputHTMLAttributes } from 'react';
import styles from './Radio.module.css';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export const Radio = ({ label, className: _className, ...props }: RadioProps) => {
  const id = useId();

  return (
    <label htmlFor={id} className={styles.label}>
      <input id={id} type="radio" className={styles.input} {...props} />
      <span className={styles.indicator}>
        <span className={styles.dot} />
      </span>
      {label}
    </label>
  );
};
