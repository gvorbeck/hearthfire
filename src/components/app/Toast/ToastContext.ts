import { createContext, useContext } from 'react';

export type ToastVariant = 'error' | 'info' | 'success';

export interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void;
}

// Context lives apart from the provider component so data hooks can consume
// toasts without importing the UI layer.
export const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

// For shared hooks that may render outside a ToastProvider (e.g. in bare renderHook tests).
export const useToastOptional = (): ToastContextValue | null => useContext(ToastContext);
