import { useId, forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

interface BaseProps {
  label?: string;
  note?: string;
  id?: string;
  error?: string;
  className?: string;
}

type InputProps = BaseProps & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, note, id, error, className, multiline, ...props }, ref) => {
    const generatedId = useId();
    const resolvedId = id ?? generatedId;
    const errorId = error ? `${generatedId}-error` : undefined;
    const cx = clsx(styles.input, error && styles.hasError, className);

    const el = multiline
      ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={resolvedId}
          className={cx}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          aria-describedby={errorId}
        />
      )
      : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={resolvedId}
          className={cx}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
          aria-describedby={errorId}
        />
      );

    if (!label) {
      return (
        <>
          {el}
          {error && <span id={errorId} className={styles.error}>{error}</span>}
        </>
      );
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.labelRow}>
          <label htmlFor={resolvedId} className={styles.label}>{label}</label>
          {note && <span className={styles.note}>{note}</span>}
        </div>
        {el}
        {error && <span id={errorId} className={styles.error}>{error}</span>}
      </div>
    );
  }
);
