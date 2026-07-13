import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddInsertModal } from '../AddInsertModal';

// INSERT_OPTIONS order is ['Revenant', 'Ghost', 'Thrall', 'Followers'].
const noop = () => {};

describe('AddInsertModal', () => {
  it('defaults the selection to the first available insert', () => {
    render(<AddInsertModal open existingInserts={[]} onClose={noop} onAdd={noop} />);
    expect(screen.getByRole('radio', { name: 'Revenant' })).toBeChecked();
  });

  it('omits inserts that already exist and defaults to the first that remains', () => {
    render(<AddInsertModal open existingInserts={['Revenant']} onClose={noop} onAdd={noop} />);
    expect(screen.queryByRole('radio', { name: 'Revenant' })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Ghost' })).toBeChecked();
  });

  it('adds the currently selected insert', async () => {
    const onAdd = vi.fn();
    render(<AddInsertModal open existingInserts={[]} onClose={noop} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Thrall' }));
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith('Thrall');
  });

  // The parent (CharacterPlaybook.tsx) mounts this modal only while open, so the
  // default selection is recomputed from the current availableOptions on each
  // reopen via the mount lifecycle rather than a reset effect. This mirrors that
  // pattern and guards the reset behavior against regression.
  it('recomputes the default selection on reopen as inserts change', async () => {
    const Harness = () => {
      const [open, setOpen] = useState(true);
      const [existing, setExisting] = useState<string[]>([]);
      return (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)}>toggle</button>
          {open && (
            <AddInsertModal
              open
              existingInserts={existing}
              onClose={() => setOpen(false)}
              onAdd={(insert) => {
                setExisting((prev) => [...prev, insert]);
                setOpen(false);
              }}
            />
          )}
        </>
      );
    };
    render(<Harness />);

    // First open: default is Revenant; add it (closes the modal).
    expect(screen.getByRole('radio', { name: 'Revenant' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    // Reopen: Revenant is now taken, so the fresh mount defaults to Ghost — not a
    // stale selection carried over from the prior open.
    await userEvent.click(screen.getByRole('button', { name: /toggle/i }));
    expect(await screen.findByRole('radio', { name: 'Ghost' })).toBeChecked();
    expect(screen.queryByRole('radio', { name: 'Revenant' })).not.toBeInTheDocument();
  });
});
