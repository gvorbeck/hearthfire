import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Move } from '../Move';
import { CharacterRollContext } from '../CharacterRollContext';
import type { CharacterData, MoveDefinition } from '@/types';

const rollableMove: MoveDefinition = {
  id: 'test-rollable',
  name: 'Test Rollable',
  body: [
    { kind: 'para', text: 'When you do the thing, roll +WIS.' },
    { kind: 'list', items: ['On a 10+, great.', 'On a 7-9, okay.'] },
  ],
};

const renderInSheet = (ui: ReactElement) =>
  render(
    <CharacterRollContext.Provider
      value={{ data: {} as CharacterData, onRoll: vi.fn() }}
    >
      {ui}
    </CharacterRollContext.Provider>,
  );

const noop = () => {};

describe('Move roll affordance gating', () => {
  // Regression: basic / special / follower moves render with no `selection` prop — they are always
  // the character's — but were treated as "unselected" and lost their roll button entirely.
  it('shows the roll button on a display-only move (no selection control)', () => {
    renderInSheet(<Move title={rollableMove.name} move={rollableMove} />);
    expect(screen.getByLabelText('Roll +WIS')).toBeInTheDocument();
  });

  it('hides the roll button on a selectable move that has not been chosen', () => {
    renderInSheet(
      <Move
        title={rollableMove.name}
        move={rollableMove}
        selection={{
          selected: false,
          onSelectChange: noop,
          takesChecked: 0,
          onTakesChange: noop,
        }}
      />,
    );
    expect(screen.queryByLabelText('Roll +WIS')).not.toBeInTheDocument();
  });

  it('shows the roll button once a selectable move is chosen', () => {
    renderInSheet(
      <Move
        title={rollableMove.name}
        move={rollableMove}
        selection={{
          selected: true,
          onSelectChange: noop,
          takesChecked: 0,
          onTakesChange: noop,
        }}
      />,
    );
    expect(screen.getByLabelText('Roll +WIS')).toBeInTheDocument();
  });

  // An arcana grant whose Consequence threshold isn't met renders display-only (no selection box) with
  // a requirement note — it must stay unrollable even though it has no selection control.
  it('hides the roll button on a display-only move with unmet requirements', () => {
    renderInSheet(
      <Move
        title={rollableMove.name}
        move={rollableMove}
        requirement={['Requires 3 Consequences']}
      />,
    );
    expect(screen.queryByLabelText('Roll +WIS')).not.toBeInTheDocument();
  });

  it('shows no roll button outside a character sheet (no roll context)', () => {
    render(<Move title={rollableMove.name} move={rollableMove} />);
    expect(screen.queryByLabelText('Roll +WIS')).not.toBeInTheDocument();
  });

  // A move rolling against something the sheet can't read still gets a button — it rolls from 0 and the
  // player dials the resource in on the stepper.
  it('labels a resource roll by its resource', () => {
    const resourceMove: MoveDefinition = {
      id: 'test-resource',
      name: 'Test Resource',
      body: [{ kind: 'para', text: 'When you sell a special item, roll +Prosperity: on a 10+, great.' }],
    };
    renderInSheet(<Move title={resourceMove.name} move={resourceMove} />);
    expect(screen.getByLabelText('Roll +Prosperity')).toBeInTheDocument();
  });
});

describe('Move multi-stat roll', () => {
  const multiStatMove: MoveDefinition = {
    id: 'defy-danger',
    name: 'Defy Danger',
    body: [
      { kind: 'para', text: 'When **danger looms**, roll...' },
      {
        kind: 'list',
        items: [
          '+STR to power through',
          '+DEX to employ speed',
          '+CON to endure',
          '+INT to apply expertise',
          '+WIS to exert willpower',
          '+CHA to charm',
        ],
      },
      { kind: 'para', text: 'On a 10+, great; on a 7-9, cost.' },
    ],
  };

  it('renders a stat button for each option', () => {
    renderInSheet(<Move title={multiStatMove.name} move={multiStatMove} />);
    expect(screen.getByLabelText('Roll +STR')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll +DEX')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll +CON')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll +INT')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll +WIS')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll +CHA')).toBeInTheDocument();
  });

  it('renders two buttons for an "or" move', () => {
    const orMove: MoveDefinition = {
      id: 'heavy-death',
      name: "Death's Door",
      body: [
        {
          kind: 'para',
          text: "When you **are at Death's Door**, you can roll +CON or +nothing. On a 7-9, recover.",
        },
      ],
    };
    renderInSheet(<Move title={orMove.name} move={orMove} />);
    expect(screen.getByLabelText('Roll +CON')).toBeInTheDocument();
    // +nothing renders without a label, so the aria-label is just "Roll"
    expect(screen.getByLabelText('Roll')).toBeInTheDocument();
  });
});
