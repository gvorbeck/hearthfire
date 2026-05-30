import clsx from 'clsx';
import styles from './RadioGroup.module.css';

interface RadioGroupProps {
  legend: string;
  legendHidden?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup = ({ legend, legendHidden = false, children, className }: RadioGroupProps) => {
  const rootCx = clsx(styles.root, className);
  const legendCx = clsx(styles.legend, legendHidden && styles.legendVisuallyHidden);
  return (
    <fieldset className={rootCx}>
      <legend className={legendCx}>{legend}</legend>
      {children}
    </fieldset>
  );
};
