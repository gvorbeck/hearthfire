import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PageLayout } from '../PageLayout';

const diceRoller = { rollerId: 'gm', rollerName: 'GM', onRoll: vi.fn().mockResolvedValue(undefined) };

describe('PageLayout dice roller', () => {
  it('mounts the roller when the page passes diceRoller', () => {
    renderWithProviders(<PageLayout title="Test" gameId="g1" diceRoller={diceRoller}>body</PageLayout>);
    expect(screen.getByRole('button', { name: 'Dice' })).toBeInTheDocument();
  });

  it('leaves it out otherwise', () => {
    renderWithProviders(<PageLayout title="Test" gameId="g1">body</PageLayout>);
    expect(screen.queryByRole('button', { name: 'Dice' })).not.toBeInTheDocument();
  });

  it('never shows it in simple mode', () => {
    renderWithProviders(<PageLayout simple>body</PageLayout>);
    expect(screen.queryByRole('button', { name: 'Dice' })).not.toBeInTheDocument();
  });
});
