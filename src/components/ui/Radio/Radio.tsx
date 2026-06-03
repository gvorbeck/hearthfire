import { useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Radio.module.css';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export const Radio = ({ label, className, ...props }: RadioProps) => {
  const id = useId();
  const cx = clsx(styles.label, className);

  return (
    <label htmlFor={id} className={cx}>
      <input id={id} type="radio" className={styles.input} {...props} />
      <span className={styles.indicator}>
        <span className={styles.dot} />
      </span>
      {label}
    </label>
  );
};
