import { vi } from 'vitest';

// Captures addToast calls without mounting the real ToastProvider, whose
// auto-dismiss setTimeout would never fire (and so hang teardown) under fake
// timers. Use with:
//
//   vi.mock('@/components/app', () => toastModuleMock());
//   vi.mock('@/components/app/Toast/ToastContext', () => toastModuleMock());
//   import { addToastSpy } from '@/test/toastMock';
//
// addToastSpy records every (message, variant) so error-toast paths stay testable.
export const addToastSpy = vi.fn();

const value = { addToast: addToastSpy };

export const toastModuleMock = () => ({
  useToast: () => value,
  useToastOptional: () => value,
  // ToastProvider is referenced by some barrels; a passthrough keeps imports happy.
  ToastProvider: ({ children }: { children: unknown }) => children,
});
