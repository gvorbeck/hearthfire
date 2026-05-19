import { useId, forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

interface BaseProps {
  label?: string;
  id?: string;
  error?: string;
  className?: string;
}

type InputProps = BaseProps & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, id, error, className, multiline, ...props }, ref) => {
    const generatedId = useId();
    const resolvedId = id ?? (label ? generatedId : undefined);
    const cx = clsx(styles.input, error && styles.hasError, className);

    const el = multiline
      ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={resolvedId}
          className={cx}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )
      : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={resolvedId}
          className={cx}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      );

    if (!label) return el;

    return (
      <div className={styles.wrapper}>
        <label htmlFor={resolvedId} className={styles.label}>{label}</label>
        {el}
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);
