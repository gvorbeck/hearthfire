import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RepeaterField } from '../RepeaterField';

// RepeaterField debounces text edits (1500ms) and flushes immediately on blur,
// check, weight, and remove. Fake timers let us drive the debounce deterministically,
// matching the useDebouncedSave test pattern.
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('RepeaterField (plain)', () => {
  it('adding a row appends an empty item and saves the new list', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <RepeaterField items={['apple']} addLabel="Add item" itemLabel="Item" onSave={onSave} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);

    // Type into the new (second) row and let the debounce land.
    await act(async () => {
      fireEvent.change(inputs[1], { target: { value: 'banana' } });
      vi.advanceTimersByTime(1500);
    });

    expect(onSave).toHaveBeenLastCalledWith(['apple', 'banana']);
  });

  it('removing a row drops the correct item by identity, not index', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <RepeaterField items={['one', 'two', 'three']} addLabel="Add" itemLabel="Item" onSave={onSave} />,
    );

    // Remove the middle row; remove flushes immediately (no timer needed).
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Remove item 2' }));
    });

    expect(onSave).toHaveBeenCalledWith(['one', 'three']);
  });

  it('editing a field propagates the change upward', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <RepeaterField items={['draft']} addLabel="Add" itemLabel="Item" onSave={onSave} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'final' } });
      vi.advanceTimersByTime(1500);
    });

    expect(onSave).toHaveBeenCalledWith(['final']);
  });

  it('trims whitespace on blur', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <RepeaterField items={['x']} addLabel="Add" itemLabel="Item" onSave={onSave} />,
    );

    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: '  padded  ' } });
      fireEvent.blur(input);
    });

    expect(onSave).toHaveBeenLastCalledWith(['padded']);
  });
});

describe('RepeaterField (checked)', () => {
  const items = [
    { checked: false, text: 'rations' },
    { checked: true, text: 'rope' },
  ];

  it('toggling a checkbox flips the correct item and saves immediately', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <RepeaterField variant="checked" items={items} addLabel="Add" itemLabel="Provision" onSave={onSave} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('checkbox', { name: /mark provision 1 as carried/i }));
    });

    expect(onSave).toHaveBeenCalledWith([
      { checked: true, text: 'rations' },
      { checked: true, text: 'rope' },
    ]);
  });

  it('reordering preserves values (incoming props replace local rows)', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    // A plain rerender (no intervening edit) means local state still matches the
    // last save, so the external-update guard accepts the reordered props.
    const { rerender } = render(
      <RepeaterField variant="checked" items={items} addLabel="Add" itemLabel="Provision" onSave={onSave} />,
    );

    const reordered = [items[1], items[0]];
    rerender(
      <RepeaterField variant="checked" items={reordered} addLabel="Add" itemLabel="Provision" onSave={onSave} />,
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('rope');
    expect(inputs[1]).toHaveValue('rations');
  });
});

describe('RepeaterField (checked-weight)', () => {
  it('changing weight updates the correct item and saves immediately', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const items = [{ checked: false, text: 'tent', weight: 1 as const }];
    render(
      <RepeaterField variant="checked-weight" items={items} addLabel="Add" itemLabel="Gear" onSave={onSave} />,
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox', { name: /gear 1 weight/i }), { target: { value: '2' } });
    });

    expect(onSave).toHaveBeenCalledWith([{ checked: false, text: 'tent', weight: 2 }]);
  });
});
