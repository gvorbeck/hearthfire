import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '../Tooltip';

const getTip = () => screen.getByRole('tooltip', { hidden: true });

describe('Tooltip touch support', () => {
  it('tapping the anchor toggles the tooltip', () => {
    render(<Tooltip text="Hint">Anchor</Tooltip>);
    const anchor = getTip().parentElement!;

    expect(getTip()).toHaveAttribute('aria-hidden', 'true');

    fireEvent.pointerDown(anchor, { pointerType: 'touch' });
    expect(getTip()).toHaveAttribute('aria-hidden', 'false');

    fireEvent.pointerDown(anchor, { pointerType: 'touch' });
    expect(getTip()).toHaveAttribute('aria-hidden', 'true');
  });

  it('mouse pointerdown does not toggle (hover handles mice)', () => {
    render(<Tooltip text="Hint">Anchor</Tooltip>);
    const anchor = getTip().parentElement!;

    fireEvent.pointerDown(anchor, { pointerType: 'mouse' });
    expect(getTip()).toHaveAttribute('aria-hidden', 'true');
  });

  it('tapping outside dismisses an open tooltip', () => {
    render(<Tooltip text="Hint">Anchor</Tooltip>);
    const anchor = getTip().parentElement!;

    fireEvent.pointerDown(anchor, { pointerType: 'touch' });
    expect(getTip()).toHaveAttribute('aria-hidden', 'false');

    fireEvent.pointerDown(document.body);
    expect(getTip()).toHaveAttribute('aria-hidden', 'true');
  });

  it('Escape dismisses an open tooltip', () => {
    render(<Tooltip text="Hint">Anchor</Tooltip>);
    const anchor = getTip().parentElement!;

    fireEvent.pointerDown(anchor, { pointerType: 'touch' });
    expect(getTip()).toHaveAttribute('aria-hidden', 'false');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(getTip()).toHaveAttribute('aria-hidden', 'true');
  });
});
