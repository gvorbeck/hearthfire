import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UseDots } from '../UseDots';

describe('UseDots', () => {
  it('renders one button per use', () => {
    render(<UseDots total={3} checked={1} onChange={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('uses a stable noun label and exposes filled state via aria-pressed', () => {
    render(<UseDots total={3} checked={1} onChange={vi.fn()} />);
    // First dot is filled (checked = 1), the rest are empty.
    expect(screen.getByRole('button', { name: 'Use 1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Use 2' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Use 3' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking an empty dot fills up to and including that dot', () => {
    const onChange = vi.fn();
    render(<UseDots total={4} checked={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use 3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('clicking a filled dot clears down to just below it', () => {
    const onChange = vi.fn();
    render(<UseDots total={4} checked={3} onChange={onChange} />);
    // Clicking the 2nd (filled) dot leaves one use filled.
    fireEvent.click(screen.getByRole('button', { name: 'Use 2' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('clicking the only filled dot clears all uses', () => {
    const onChange = vi.fn();
    render(<UseDots total={3} checked={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use 1' }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('clicking the last empty dot fills every use', () => {
    const onChange = vi.fn();
    render(<UseDots total={3} checked={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use 3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not fire onChange while disabled', () => {
    const onChange = vi.fn();
    render(<UseDots total={3} checked={1} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Use 2' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses the provided group label when given', () => {
    render(<UseDots total={2} checked={1} onChange={vi.fn()} label="Rations" />);
    expect(screen.getByRole('group', { name: 'Rations' })).toBeInTheDocument();
  });

  it('falls back to a count summary label when none is provided', () => {
    render(<UseDots total={5} checked={2} onChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Uses: 2 of 5' })).toBeInTheDocument();
  });

  it('uses ariaLabel to override the group name without rendering a visible label', () => {
    render(<UseDots total={2} checked={1} onChange={vi.fn()} ariaLabel="Loyalty" />);
    expect(screen.getByRole('group', { name: 'Loyalty' })).toBeInTheDocument();
    expect(screen.queryByText('Loyalty')).not.toBeInTheDocument();
  });
});
