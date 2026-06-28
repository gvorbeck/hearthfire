import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

// Modal reads #root to apply `inert` to the rest of the app while open, and
// restores focus to whatever was focused before it opened. Both behaviors need a
// real #root and a real focusable trigger in the document, so we build them here.
let root: HTMLDivElement;

beforeEach(() => {
  root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
});

afterEach(() => {
  root.remove();
});

const Dialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Modal open={open} onClose={onClose} aria-labelledby="title">
    <h2 id="title">Settings</h2>
    <button>First</button>
    <button>Last</button>
  </Modal>
);

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Dialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders its contents in a labelled dialog when open', () => {
    render(<Dialog open onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'title');
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('makes the rest of the app inert while open and restores it on close', () => {
    const { rerender } = render(<Dialog open onClose={vi.fn()} />);
    expect(root.hasAttribute('inert')).toBe(true);
    rerender(<Dialog open={false} onClose={vi.fn()} />);
    expect(root.hasAttribute('inert')).toBe(false);
  });

  it('moves focus into the dialog when it opens', () => {
    render(<Dialog open onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} />);
    // The backdrop is the dialog's parent; clicking the panel itself must not close.
    await userEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when content inside the dialog is clicked', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} />);
    await userEvent.click(screen.getByText('Settings'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps Tab focus inside the dialog, wrapping from last back to first', async () => {
    render(<Dialog open onClose={vi.fn()} />);
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });

    last.focus();
    await userEvent.tab();
    expect(first).toHaveFocus();
  });

  it('wraps Shift+Tab from first back to last', async () => {
    render(<Dialog open onClose={vi.fn()} />);
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });

    first.focus();
    await userEvent.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it('restores focus to the previously focused element when it closes', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(trigger).toHaveFocus();

    const { rerender } = render(<Dialog open onClose={vi.fn()} />);
    rerender(<Dialog open={false} onClose={vi.fn()} />);

    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
