import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RollAffordance, type StatOption } from '../RollAffordance';
import type { RollBand } from '@/types';

const BANDS: RollBand[] = [
  { label: '10+', min: 10, max: null },
  { label: '7-9', min: 7, max: 9 },
];

const fixDice = () => vi.spyOn(Math, 'random').mockReturnValue(0.5);

afterEach(() => vi.restoreAllMocks());

const OPTIONS: StatOption[] = [
  { stat: 'STR', mod: 2, debilityDisadvantage: false },
  { stat: 'DEX', mod: 1, debilityDisadvantage: false },
  { stat: 'CON', mod: 0, debilityDisadvantage: true },
];

describe('RollAffordance multi-stat picker', () => {
  it('renders a button for each stat option', () => {
    render(
      <RollAffordance
        stat="STR"
        bands={BANDS}
        mod={2}
        debilityDisadvantage={false}
        statOptions={OPTIONS}
      />,
    );
    expect(screen.getByLabelText('Roll +STR')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll +DEX')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll +CON')).toBeInTheDocument();
  });

  it('does not render the single-stat trigger when statOptions is present', () => {
    render(
      <RollAffordance
        stat="STR"
        bands={BANDS}
        mod={2}
        debilityDisadvantage={false}
        statOptions={OPTIONS}
      />,
    );
    expect(screen.queryByLabelText('Re-roll')).not.toBeInTheDocument();
  });

  it('rolls with the clicked stat and reports it', async () => {
    fixDice();
    const onRoll = vi.fn();
    const user = userEvent.setup();
    render(
      <RollAffordance
        stat="STR"
        bands={BANDS}
        mod={2}
        debilityDisadvantage={false}
        statOptions={OPTIONS}
        onRoll={onRoll}
      />,
    );

    await user.click(screen.getByLabelText('Roll +DEX'));
    expect(onRoll).toHaveBeenCalledTimes(1);
    expect(onRoll.mock.calls[0][0]).toMatchObject({ stat: 'DEX', mod: 1 });
  });

  it('marks the clicked stat as active with aria-pressed', async () => {
    fixDice();
    const user = userEvent.setup();
    render(
      <RollAffordance
        stat="STR"
        bands={BANDS}
        mod={2}
        debilityDisadvantage={false}
        statOptions={OPTIONS}
      />,
    );

    expect(screen.getByLabelText('Roll +STR')).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByLabelText('Roll +STR'));
    expect(screen.getByLabelText('Roll +STR')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Roll +DEX')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches active stat and uses the new modifier', async () => {
    fixDice();
    const onRoll = vi.fn();
    const user = userEvent.setup();
    render(
      <RollAffordance
        stat="STR"
        bands={BANDS}
        mod={2}
        debilityDisadvantage={false}
        statOptions={OPTIONS}
        onRoll={onRoll}
      />,
    );

    await user.click(screen.getByLabelText('Roll +STR'));
    expect(onRoll.mock.calls[0][0]).toMatchObject({ stat: 'STR', mod: 2 });

    await user.click(screen.getByLabelText('Roll +DEX'));
    expect(onRoll.mock.calls[1][0]).toMatchObject({ stat: 'DEX', mod: 1 });
    expect(screen.getByLabelText('Roll +DEX')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Roll +STR')).toHaveAttribute('aria-pressed', 'false');
  });

  it('auto-sets disadvantage when switching to a debilitated stat', async () => {
    fixDice();
    const user = userEvent.setup();
    render(
      <RollAffordance
        stat="STR"
        bands={BANDS}
        mod={2}
        debilityDisadvantage={false}
        statOptions={OPTIONS}
      />,
    );

    await user.click(screen.getByLabelText('Roll +STR'));
    expect(screen.getByRole('button', { name: 'Dis' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByLabelText('Roll +CON'));
    expect(screen.getByRole('button', { name: 'Dis' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('resets mode to normal when switching to a non-debilitated stat', async () => {
    fixDice();
    const user = userEvent.setup();
    render(
      <RollAffordance
        stat="STR"
        bands={BANDS}
        mod={2}
        debilityDisadvantage={false}
        statOptions={OPTIONS}
      />,
    );

    await user.click(screen.getByLabelText('Roll +CON'));
    expect(screen.getByRole('button', { name: 'Dis' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByLabelText('Roll +STR'));
    expect(screen.getByLabelText('Normal — 2 dice')).toHaveAttribute('aria-pressed', 'true');
  });

  it('includes the resource in the report for a resource option', async () => {
    fixDice();
    const onRoll = vi.fn();
    const user = userEvent.setup();
    const withResource: StatOption[] = [
      { stat: 'CON', mod: 1, debilityDisadvantage: false },
      { stat: 'nothing', mod: 0, debilityDisadvantage: false, resource: 'Favor' },
    ];
    render(
      <RollAffordance
        stat="CON"
        bands={BANDS}
        mod={1}
        debilityDisadvantage={false}
        statOptions={withResource}
        onRoll={onRoll}
      />,
    );

    await user.click(screen.getByLabelText('Roll +Favor'));
    expect(onRoll.mock.calls[0][0]).toMatchObject({ stat: 'nothing', resource: 'Favor', mod: 0 });
  });
});
