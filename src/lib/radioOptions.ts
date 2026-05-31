import type { ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  subtitle?: string;
  detail?: ReactNode;
}
