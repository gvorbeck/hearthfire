import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { MinorArcanum } from '@/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MinorArcanaCard } from '../MinorArcanaCard';

// Stable base props so each test only overrides what it's exercising.
const baseArcanum = (overrides: Partial<MinorArcanum> = {}): MinorArcanum => ({
  id: 'test-1',
  name: 'Test arcanum',
  description: 'A test description.',
  requirements: ['…first requirement.', '…second requirement.'],
  move: { name: 'Test Move', text: 'Move text.' },
  ...overrides,
});

const noop = () => {};

describe('MinorArcanaCard unlock — default count', () => {
  it('stays locked until every requirement is checked', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={baseArcanum()}
        requirementsChecked={{ req0: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.queryByText('Test Move')).not.toBeInTheDocument();
  });

  it('unlocks once every requirement is checked', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={baseArcanum()}
        requirementsChecked={{ req0: true, req1: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText('Test Move')).toBeInTheDocument();
  });
});

describe('MinorArcanaCard unlock — requirementsUnlockAt', () => {
  // Modeled on ids 2/3/14 in minor.ts: an either/or pair where checking just one unlocks.
  const arcanum = baseArcanum({ requirementsUnlockAt: 1 });

  it('stays locked with nothing checked', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{}}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.queryByText('Test Move')).not.toBeInTheDocument();
  });

  it('unlocks once the threshold count is reached, regardless of which box', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ req1: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText('Test Move')).toBeInTheDocument();
  });
});

describe('MinorArcanaCard unlock — unlockGroups', () => {
  // Modeled on id 44 ("A silvery glass bottle") in minor.ts: item 0 alone, OR both items 1 and 2.
  const arcanum = baseArcanum({
    requirements: ['…find a teacher.', '…fill the bottle.', '…drink the contents.'],
    unlockGroups: [[0], [1, 2]],
  });

  it('unlocks when the single-item group is satisfied', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ req0: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText('Test Move')).toBeInTheDocument();
  });

  it('unlocks when the two-item group is fully satisfied', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ req1: true, req2: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText('Test Move')).toBeInTheDocument();
  });

  it('stays locked on only the last item of the two-item group', () => {
    // The exact bug this data shape was built to prevent: item 2 alone is not a valid path.
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ req2: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.queryByText('Test Move')).not.toBeInTheDocument();
  });

  it('stays locked on only the first item of the two-item group', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ req1: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.queryByText('Test Move')).not.toBeInTheDocument();
  });
});

describe('MinorArcanaCard requirementsDivider', () => {
  // Modeled on id 26 ("A strange skull and antlers"): "or…" rendered above the second requirement.
  const arcanum = baseArcanum({
    requirements: ['…learn the name.', '…use the move to call it up.'],
    requirementsDivider: { index: 1, text: 'or…' },
  });

  it('renders the divider text exactly once', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{}}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getAllByText('or…')).toHaveLength(1);
  });

  it('positions the divider before the requirement at its index, not the first', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{}}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    const container = screen.getByText('or…').closest('div');
    const text = container?.textContent ?? '';
    const dividerIndex = text.indexOf('or…');
    const secondReqIndex = text.indexOf('…use the move to call it up.');
    const firstReqIndex = text.indexOf('…learn the name.');
    expect(firstReqIndex).toBeLessThan(dividerIndex);
    expect(dividerIndex).toBeLessThan(secondReqIndex);
  });

  it('does not render a divider when none is configured', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={baseArcanum()}
        requirementsChecked={{}}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.queryByText('or…')).not.toBeInTheDocument();
  });
});

describe('MinorArcanaCard requirementsNote', () => {
  // Modeled on id 18 ("A path in the woods"): a trailing caveat, not a checkbox.
  const arcanum = baseArcanum({
    requirementsNote: 'Should multiple people attempt this, only one can succeed.',
  });

  it('renders the note as prose, not as an additional checkbox', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{}}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(
      screen.getByText('Should multiple people attempt this, only one can succeed.'),
    ).toBeInTheDocument();
    // 2 requirements in baseArcanum() => exactly 2 checkboxes; the note must not add a third.
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('is excluded from unlock counting', () => {
    // Both real requirements checked; the note is not a checkbox so it can't block unlock.
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ req0: true, req1: true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText('Test Move')).toBeInTheDocument();
  });
});

describe('MinorArcanaCard requirementRepeats', () => {
  // Modeled on id 58 ("A mummified hand"): the third requirement is one string but three
  // independently-checkable nights.
  const arcanum = baseArcanum({
    requirements: [
      '…learn the name.',
      '…learn the words of power.',
      '…on three separate nights, soak a crystal in blood.',
    ],
    requirementRepeats: { 2: 3 },
  });

  it('renders three checkboxes for the repeated requirement, one text label', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{}}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    // 1 + 1 + 3 repeated slots = 5 checkboxes total, but the requirement text appears once.
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(
      screen.getAllByText('…on three separate nights, soak a crystal in blood.'),
    ).toHaveLength(1);
  });

  it('stays locked until all repeated slots are checked, not just one', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ req0: true, req1: true, 'req2-0': true, 'req2-1': true }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.queryByText('Test Move')).not.toBeInTheDocument();
  });

  it('unlocks once every repeated slot plus the plain requirements are checked', () => {
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{
          req0: true,
          req1: true,
          'req2-0': true,
          'req2-1': true,
          'req2-2': true,
        }}
        onToggleRequirement={noop}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    expect(screen.getByText('Test Move')).toBeInTheDocument();
  });

  it('toggles the correct repeated-slot key on click, independent of its siblings', () => {
    const onToggleRequirement = vi.fn();
    renderWithProviders(
      <MinorArcanaCard
        arcanum={arcanum}
        requirementsChecked={{ 'req2-0': true }}
        onToggleRequirement={onToggleRequirement}
        onTrackerChange={noop}
        onFollowerHpChange={noop}
        onRemove={noop}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // req0, req1, req2-0 (checked), req2-1, req2-2 — click the second night's box.
    checkboxes[3].click();
    expect(onToggleRequirement).toHaveBeenCalledWith('req2-1', true);
  });
});
