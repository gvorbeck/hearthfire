import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiceRoller } from '../DiceRoller';

const setup = () => {
  const onRoll = vi.fn().mockResolvedValue(undefined);
  render(<DiceRoller rollerId="c1" rollerName="Aerin" onRoll={onRoll} />);
  return { onRoll, user: userEvent.setup() };
};

describe('DiceRoller', () => {
  it('exposes the open state on the tab', async () => {
    const { user } = setup();
    const tab = screen.getByRole('button', { name: 'Dice' });
    expect(tab).toHaveAttribute('aria-expanded', 'false');
    await user.click(tab);
    expect(tab).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape', async () => {
    const { user } = setup();
    const tab = screen.getByRole('button', { name: 'Dice' });
    await user.click(tab);
    await user.keyboard('{Escape}');
    expect(tab).toHaveAttribute('aria-expanded', 'false');
    expect(tab).toHaveFocus();
  });

  it('builds notation from die buttons, stacking repeats of the same die', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Dice' }));
    const field = screen.getByLabelText('Dice notation');
    await user.click(screen.getByRole('button', { name: 'd6' }));
    expect(field).toHaveValue('d6');
    await user.click(screen.getByRole('button', { name: 'd6' }));
    expect(field).toHaveValue('2d6');
    await user.click(screen.getByRole('button', { name: 'd8' }));
    expect(field).toHaveValue('2d6+d8');
    await user.click(screen.getByRole('button', { name: 'd8' }));
    expect(field).toHaveValue('2d6+2d8');
  });

  it('nudges the flat modifier up and down, removing it at zero', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Dice' }));
    const field = screen.getByLabelText('Dice notation');
    await user.type(field, '2d6');
    await user.click(screen.getByRole('button', { name: /add 1/i }));
    expect(field).toHaveValue('2d6+1');
    await user.click(screen.getByRole('button', { name: /subtract 1/i }));
    expect(field).toHaveValue('2d6');
    await user.click(screen.getByRole('button', { name: /subtract 1/i }));
    expect(field).toHaveValue('2d6-1');
  });

  it('rolls typed notation on Enter, shows the result, and logs it', async () => {
    const { user, onRoll } = setup();
    await user.click(screen.getByRole('button', { name: 'Dice' }));
    await user.type(screen.getByLabelText('Dice notation'), '2d6+1{Enter}');

    expect(onRoll).toHaveBeenCalledTimes(1);
    const logged = onRoll.mock.calls[0][0];
    expect(logged).toMatchObject({
      characterId: 'c1',
      characterName: 'Aerin',
      notation: '2d6+1',
      stat: 'nothing',
      band: null,
    });
    expect(logged.total).toBeGreaterThanOrEqual(3);
    expect(logged.total).toBeLessThanOrEqual(13);
    expect(logged.breakdown).toMatch(/^\[\d, \d\] \+ 1$/);
  });

  it('shows an inline error for bad notation and logs nothing', async () => {
    const { user, onRoll } = setup();
    await user.click(screen.getByRole('button', { name: 'Dice' }));
    await user.type(screen.getByLabelText('Dice notation'), '2d{Enter}');
    expect(screen.getByText(/sides/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Dice notation')).toHaveAttribute('aria-invalid', 'true');
    expect(onRoll).not.toHaveBeenCalled();
  });

  it('closes from the close button and returns focus to the tab', async () => {
    const { user } = setup();
    const tab = screen.getByRole('button', { name: 'Dice' });
    await user.click(tab);
    await user.click(screen.getByRole('button', { name: 'Close dice roller' }));
    expect(tab).toHaveAttribute('aria-expanded', 'false');
    expect(tab).toHaveFocus();
  });

  it('reloads an earlier roll into the field when tapped', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Dice' }));
    const field = screen.getByLabelText('Dice notation');
    await user.type(field, '1d4{Enter}');
    await user.clear(field);
    await user.type(field, '1d6{Enter}');
    await user.click(screen.getByRole('button', { name: /Reuse 1d4/ }));
    expect(field).toHaveValue('1d4');
  });

  it('still shows the result when logging the roll fails', async () => {
    const onRoll = vi.fn().mockRejectedValue(new Error('offline'));
    render(<DiceRoller rollerId="c1" rollerName="Aerin" onRoll={onRoll} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Dice' }));
    await user.type(screen.getByLabelText('Dice notation'), '1d6{Enter}');
    expect(onRoll).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('1d6').length).toBeGreaterThan(0);
  });
});
