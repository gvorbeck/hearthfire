import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SaveStatusProvider } from '../SaveStatusProvider';
import { SaveStatus } from '../SaveStatus';
import { useSaveStatus } from '../SaveStatusContext';

// A tiny consumer that lets the test drive the provider the way useGame does.
let api: ReturnType<typeof useSaveStatus>;
const Capture = () => {
  api = useSaveStatus();
  return null;
};

const renderWithProvider = () =>
  render(
    <SaveStatusProvider>
      <SaveStatus />
      <Capture />
    </SaveStatusProvider>,
  );

describe('SaveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rolls the relative time forward on its own timer', () => {
    renderWithProvider();
    act(() => { api.reportSaveStart(); });
    act(() => { api.reportSaveSettled(true); });
    expect(screen.getByText(/Saved · just now/)).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(12 * 60 * 1000); });
    expect(screen.getByText(/Saved · 12m ago/)).toBeInTheDocument();
  });

  it('resets to "just now" when a new save lands while already showing "saved"', () => {
    renderWithProvider();
    act(() => { api.reportSaveStart(); });
    act(() => { api.reportSaveSettled(true); });

    // Sit on "saved" for 12 minutes so the label has rolled forward.
    act(() => { vi.advanceTimersByTime(12 * 60 * 1000); });
    expect(screen.getByText(/Saved · 12m ago/)).toBeInTheDocument();

    // A new save lands. lastSavedAt changes; the label must reset to "just now".
    act(() => { api.reportSaveStart(); });
    act(() => { api.reportSaveSettled(true); });
    expect(screen.getByText(/Saved · just now/)).toBeInTheDocument();
  });
});
