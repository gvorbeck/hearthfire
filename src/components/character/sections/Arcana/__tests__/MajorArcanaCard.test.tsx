import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { MajorArcanum, ArcanaMajorEntry } from '@/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MajorArcanaCard } from '../MajorArcanaCard';

// A minimal arcanum with a plain dot-tracker unlock path (no inline "[ ]" task block in its
// description) and one granted Mysteries move — the Widening/Cyclic shape from useArcanumGating.test.ts.
const DOT_TRACKER: MajorArcanum = {
  id: 'dot-tracker',
  name: 'Dot Tracker Arcanum',
  description: 'A plain description with no task block.',
  frontTrackers: [{ id: 'marks', label: 'marks', max: 3, role: 'marks' }],
  back: {
    label: 'Mysteries',
    sections: [
      {
        label: 'Moves',
        content: [{ id: 'granted-move', name: 'Granted Move', body: [{ kind: 'para', text: 'Move body.' }] }],
      },
    ],
  },
};

// An arcanum whose description carries an inline "[ ]" task block — the alternate unlock path where
// marksValue is driven by checking off named tasks instead of a bare dot tracker.
const TASK_BLOCK: MajorArcanum = {
  id: 'task-block',
  name: 'Task Block Arcanum',
  description: 'Intro prose.\n\n[ ] First task\n[ ] Second task\n\nOutro prose.',
  frontTrackers: [{ id: 'marks', label: 'marks', max: 2, role: 'marks' }],
  back: {
    label: 'Mysteries',
    sections: [
      {
        label: 'Moves',
        content: [{ id: 'granted-move', name: 'Granted Move', body: [{ kind: 'para', text: 'Move body.' }] }],
      },
    ],
  },
};

// An arcanum with an extra front pool tracker (role undefined) alongside the marks tracker.
const WITH_POOL: MajorArcanum = {
  id: 'with-pool',
  name: 'Pool Arcanum',
  description: 'A plain description.',
  frontTrackers: [
    { id: 'marks', label: 'marks', max: 2, role: 'marks' },
    { id: 'acumen', label: 'Acumen', max: 4 },
  ],
  back: { label: 'Mysteries', sections: [] },
};

// An arcanum with a base move, available before the Mysteries unlock.
const WITH_BASE_MOVE: MajorArcanum = {
  id: 'with-base-move',
  name: 'Base Move Arcanum',
  description: 'A plain description.',
  baseMoves: [{ id: 'base-1', name: 'Cast a Spell', body: [{ kind: 'para', text: 'Base move body.' }] }],
  frontTrackers: [{ id: 'marks', label: 'marks', max: 3, role: 'marks' }],
  back: { label: 'Mysteries', sections: [] },
};

const entryFor = (overrides: Partial<ArcanaMajorEntry> = {}): ArcanaMajorEntry => ({
  id: 'dot-tracker',
  marksValue: 0,
  mysteryMovesChecked: {},
  consequencesMarked: {},
  ...overrides,
});

const noop = () => {};
const noopHandlers = {
  onMarksChange: noop,
  onMysteryMoveToggle: noop,
  onConsequenceToggle: noop,
  onConsequenceTableChoice: noop,
  onTrackerChange: noop,
  onFollowerHpChange: noop,
  onBodyCheckChange: noop,
  onBodyInputChange: noop,
  onMysteryCreatureSave: noop,
  onRemove: noop,
};

describe('MajorArcanaCard unlock — dot tracker path', () => {
  it('hides the Mysteries section before marks reach the unlock threshold', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={DOT_TRACKER}
        entry={entryFor({ marksValue: 2 })}
        {...noopHandlers}
      />,
    );
    expect(screen.queryByText('Granted Move')).not.toBeInTheDocument();
    expect(screen.getByText('2 / 3 marks')).toBeInTheDocument();
  });

  it('reveals the Mysteries section once marks reach the threshold', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={DOT_TRACKER}
        entry={entryFor({ marksValue: 3 })}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText('Granted Move')).toBeInTheDocument();
  });

  it('renders a dot control, not a task checklist, when the description has no task block', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={DOT_TRACKER}
        entry={entryFor()}
        {...noopHandlers}
      />,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});

describe('MajorArcanaCard unlock — inline task block path', () => {
  it('renders one checkbox per task parsed from the description', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={TASK_BLOCK}
        entry={entryFor({ id: 'task-block' })}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('splits prose before and after the task block, and reports progress against consequencesMarked', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={TASK_BLOCK}
        entry={entryFor({ id: 'task-block', marksValue: 1, consequencesMarked: { 'task-0': true } })}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText('Intro prose.')).toBeInTheDocument();
    expect(screen.getByText('Outro prose.')).toBeInTheDocument();
    expect(screen.getByText('1 / 2 tasks completed')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /First task/i })).toBeChecked();
  });

  it('reveals the Mysteries section once every task is marked', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={TASK_BLOCK}
        entry={entryFor({
          id: 'task-block',
          marksValue: 2,
          consequencesMarked: { 'task-0': true, 'task-1': true },
        })}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText('Granted Move')).toBeInTheDocument();
  });

  it('toggles the correct task key on click', () => {
    const onConsequenceToggle = vi.fn();
    renderWithProviders(
      <MajorArcanaCard
        arcanum={TASK_BLOCK}
        entry={entryFor({ id: 'task-block' })}
        {...noopHandlers}
        onConsequenceToggle={onConsequenceToggle}
      />,
    );
    screen.getByRole('checkbox', { name: /Second task/i }).click();
    expect(onConsequenceToggle).toHaveBeenCalledWith('task-1', true);
  });
});

describe('MajorArcanaCard everUnlocked latch', () => {
  it('keeps the Mysteries section revealed even if marks drop back to zero', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={DOT_TRACKER}
        entry={entryFor({ marksValue: 0, everUnlocked: true })}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText('Granted Move')).toBeInTheDocument();
  });
});

describe('MajorArcanaCard front pool trackers', () => {
  it('renders an extra pool tracker alongside the marks tracker', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={WITH_POOL}
        entry={entryFor({ id: 'with-pool', trackerValues: { acumen: 2 } })}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText('0 / 2 marks')).toBeInTheDocument();
    expect(screen.getByText('2 / 4 Acumen')).toBeInTheDocument();
  });
});

describe('MajorArcanaCard base moves', () => {
  it('renders a base move even while the Mysteries are locked', () => {
    renderWithProviders(
      <MajorArcanaCard
        arcanum={WITH_BASE_MOVE}
        entry={entryFor({ id: 'with-base-move', marksValue: 0 })}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText('Cast a Spell')).toBeInTheDocument();
  });
});
