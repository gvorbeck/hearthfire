import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RollLog } from '../RollLog';
import type { LoggedRoll } from '@/types';

const roll = (overrides: Partial<LoggedRoll>): LoggedRoll => ({
  id: 'r1',
  characterId: 'c1',
  characterName: 'Roller',
  moveName: 'Move A',
  stat: 'WIS',
  dice: [4, 3],
  mod: 1,
  total: 8,
  mode: 'normal',
  band: '7-9',
  createdAt: 1,
  ...overrides,
});

describe('RollLog', () => {
  it('shows an empty-state message when there are no rolls', () => {
    render(<RollLog rolls={[]} />);
    expect(screen.getByText('No rolls yet.')).toBeInTheDocument();
  });

  it('formats the dice expression with a positive modifier', () => {
    render(<RollLog rolls={[roll({ dice: [4, 3], mod: 1, total: 8 })]} />);
    expect(screen.getByText('4+3+1 =')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('formats a negative modifier with its sign', () => {
    render(<RollLog rolls={[roll({ dice: [5, 2], mod: -1, total: 6, band: '6-' })]} />);
    expect(screen.getByText('5+2-1 =')).toBeInTheDocument();
  });

  it('omits the modifier entirely when it is zero (a +nothing roll)', () => {
    render(<RollLog rolls={[roll({ stat: 'nothing', dice: [6, 5], mod: 0, total: 11, band: '10+' })]} />);
    // No trailing "+0"/"-0"; just the two dice.
    expect(screen.getByText('6+5 =')).toBeInTheDocument();
  });

  it('labels the stat, but shows none for a +nothing roll', () => {
    const { rerender } = render(<RollLog rolls={[roll({ stat: 'WIS', moveName: 'Move A' })]} />);
    expect(screen.getByText(/Move A \+WIS/)).toBeInTheDocument();
    rerender(<RollLog rolls={[roll({ stat: 'nothing', moveName: 'Move B' })]} />);
    expect(screen.getByText('Move B', { exact: false }).textContent).not.toContain('+');
  });

  it('marks advantage and disadvantage rolls', () => {
    const { rerender } = render(<RollLog rolls={[roll({ mode: 'adv' })]} />);
    expect(screen.getByText(/\(adv\)/)).toBeInTheDocument();
    rerender(<RollLog rolls={[roll({ mode: 'dis' })]} />);
    expect(screen.getByText(/\(dis\)/)).toBeInTheDocument();
  });

  it('shows the outcome band and hides it when absent', () => {
    const { rerender } = render(<RollLog rolls={[roll({ band: '10+' })]} />);
    expect(screen.getByText('(10+)')).toBeInTheDocument();
    rerender(<RollLog rolls={[roll({ band: null })]} />);
    expect(screen.queryByText(/\(10\+\)/)).not.toBeInTheDocument();
  });

  it('renders the newest roll first (the doc stores oldest-first)', () => {
    const older = roll({ id: 'old', characterName: 'First', createdAt: 1 });
    const newer = roll({ id: 'new', characterName: 'Second', createdAt: 2 });
    render(<RollLog rolls={[older, newer]} />);
    const names = screen.getAllByText(/First|Second/).map((el) => el.textContent);
    expect(names[0]).toBe('Second');
    expect(names[1]).toBe('First');
  });

  it('falls back to "Someone" when a roll has no character name', () => {
    render(<RollLog rolls={[roll({ characterName: '' })]} />);
    expect(screen.getByText('Someone')).toBeInTheDocument();
  });
});
