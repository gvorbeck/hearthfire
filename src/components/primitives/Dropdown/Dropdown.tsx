import { type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Dropdown.module.css';

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label: string;
  id: string;
  options: DropdownOption<T>[];
  value: T | '';
  onChange: (value: T) => void;
  placeholder?: string;
}

export const Dropdown = <T extends string>({
  label,
  id,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  className,
  ...props
}: DropdownProps<T>) => {
  const selectCx = clsx(styles.select, !value && styles.placeholder, className);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T);
  };

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.selectWrapper}>
        <select id={id} className={selectCx} value={value} onChange={handleChange} {...props}>
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true" />
      </div>
    </div>
  );
};
