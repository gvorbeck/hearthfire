import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { RelationshipRepeater } from '../RelationshipRepeater';
import type { DropdownGroup } from '@/components/ui';
import type { RelTarget } from '../npcData';
import type { NpcRelationship } from '@/types';

const groups: DropdownGroup<RelTarget>[] = [
  {
    label: 'Stonetop Residents',
    options: [
      { value: 'resident::r1', label: 'Ada' },
      { value: 'resident::r2', label: 'Bram' },
    ],
  },
];

const linked = (targetId: string): NpcRelationship => ({
  id: `rel-${targetId}`,
  type: 'rival',
  targetId,
  targetKind: 'resident',
});

const blank: NpcRelationship = { id: 'rel-blank', type: '', targetId: '', targetKind: 'pc' };

const addButton = () => screen.getByRole('button', { name: 'Add relationship' });

describe('RelationshipRepeater — Add relationship button', () => {
  it('is enabled when there are unlinked characters and no blank row', () => {
    render(<RelationshipRepeater relationships={[linked('r1')]} groups={groups} onChange={vi.fn()} />);
    expect(addButton()).toBeEnabled();
  });

  it('is disabled once every character is already linked', () => {
    render(
      <RelationshipRepeater relationships={[linked('r1'), linked('r2')]} groups={groups} onChange={vi.fn()} />,
    );
    expect(addButton()).toBeDisabled();
  });

  it('is disabled while a blank row still needs a target', () => {
    render(<RelationshipRepeater relationships={[blank]} groups={groups} onChange={vi.fn()} />);
    expect(addButton()).toBeDisabled();
  });
});

describe('RelationshipRepeater — target options', () => {
  it("hides a character another row already links to, keeping the row's own selection", () => {
    render(
      <RelationshipRepeater
        relationships={[linked('r1'), linked('r2')]}
        groups={groups}
        onChange={vi.fn()}
      />,
    );
    const [row1, row2] = screen.getAllByRole('combobox');
    // Row 1 links Ada (r1): its dropdown keeps Ada but drops Bram (taken by row 2).
    expect(within(row1).queryByRole('option', { name: 'Ada' })).toBeInTheDocument();
    expect(within(row1).queryByRole('option', { name: 'Bram' })).not.toBeInTheDocument();
    // Row 2 links Bram (r2): mirror image.
    expect(within(row2).queryByRole('option', { name: 'Bram' })).toBeInTheDocument();
    expect(within(row2).queryByRole('option', { name: 'Ada' })).not.toBeInTheDocument();
  });
});
