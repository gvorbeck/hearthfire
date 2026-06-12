import { Fieldset } from '../Fieldset/Fieldset';

interface RadioGroupProps {
  legend: string;
  legendHidden?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup = ({ legend, legendHidden = false, children, className }: RadioGroupProps) => (
  <Fieldset legend={legend} legendHidden={legendHidden} className={className}>
    {children}
  </Fieldset>
);
