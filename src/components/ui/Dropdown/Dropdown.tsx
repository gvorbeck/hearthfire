import { type SelectHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Dropdown.module.css";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

export interface DropdownGroup<T extends string> {
  label: string;
  options: DropdownOption<T>[];
}

type DropdownBaseProps<T extends string> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> & {
  id: string;
  value: T | "";
  onChange: (value: T) => void;
  placeholder?: string;
};

type DropdownWithLabel<T extends string> = DropdownBaseProps<T> & {
  label: string;
};

type DropdownWithAriaLabel<T extends string> = DropdownBaseProps<T> & {
  label?: never;
  "aria-label": string;
};

type DropdownFlatProps<T extends string> = (DropdownWithLabel<T> | DropdownWithAriaLabel<T>) & {
  options: DropdownOption<T>[];
  groups?: never;
};

type DropdownGroupedProps<T extends string> = (DropdownWithLabel<T> | DropdownWithAriaLabel<T>) & {
  groups: DropdownGroup<T>[];
  options?: never;
};

type DropdownProps<T extends string> = DropdownFlatProps<T> | DropdownGroupedProps<T>;

export const Dropdown = <T extends string>({
  label,
  id,
  options,
  groups,
  value,
  onChange,
  placeholder = "Select…",
  className,
  ...props
}: DropdownProps<T>) => {
  const selectCx = clsx(styles.select, !value && styles.placeholder, className);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T);
  };

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <select
          id={id}
          className={selectCx}
          value={value}
          onChange={handleChange}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {groups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
        <span className={styles.chevron} aria-hidden="true" />
      </div>
    </div>
  );
};
