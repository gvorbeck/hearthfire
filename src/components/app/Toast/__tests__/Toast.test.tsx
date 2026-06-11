import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider } from '../Toast';
import { useToast } from '../ToastContext';

const Trigger = ({ message }: { message: string }) => {
  const { addToast } = useToast();
  return <button onClick={() => addToast(message, 'error')}>{message}</button>;
};

describe('ToastProvider', () => {
  it('shows an identical message only once while it is visible', () => {
    render(
      <ToastProvider>
        <Trigger message="Save failed" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save failed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save failed' }));
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('a repeated message keeps the existing toast on screen longer', () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <Trigger message="Save failed" />
        </ToastProvider>
      );
      const button = screen.getByRole('button', { name: 'Save failed' });

      fireEvent.click(button);
      act(() => { vi.advanceTimersByTime(4000); });

      // The repeat at 4s restarts the 5s dismiss timer, so the toast is still
      // up at 8s — without the reset it would have dismissed at 5s.
      fireEvent.click(button);
      act(() => { vi.advanceTimersByTime(4000); });
      expect(screen.getAllByRole('alert')).toHaveLength(1);

      act(() => { vi.advanceTimersByTime(1500); });
      expect(screen.queryByRole('alert')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('still shows distinct messages alongside each other', () => {
    render(
      <ToastProvider>
        <Trigger message="Save failed" />
        <Trigger message="Other problem" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save failed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Other problem' }));
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });
});
