import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '../Tabs';

const TABS = [
  { id: 'one', label: 'One', content: <p>First panel</p> },
  { id: 'two', label: 'Two', content: <p>Second panel</p> },
  { id: 'three', label: 'Three', content: <p>Third panel</p> },
];

const getTab = (name: string) => screen.getByRole('tab', { name });

describe('Tabs', () => {
  it('clicking a tab shows its panel and hides the others', () => {
    render(<Tabs tabs={TABS} aria-label="Example" />);

    expect(getTab('One')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('First panel')).toBeInTheDocument();

    fireEvent.click(getTab('Two'));

    expect(getTab('Two')).toHaveAttribute('aria-selected', 'true');
    expect(getTab('One')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Second panel')).toBeInTheDocument();
  });

  it('arrow keys move between tabs', () => {
    render(<Tabs tabs={TABS} aria-label="Example" />);

    fireEvent.keyDown(getTab('One'), { key: 'ArrowRight' });
    expect(getTab('Two')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(getTab('Two'), { key: 'ArrowLeft' });
    expect(getTab('One')).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter and Space activate the focused tab', () => {
    render(<Tabs tabs={TABS} aria-label="Example" />);

    fireEvent.keyDown(getTab('Two'), { key: 'Enter' });
    expect(getTab('Two')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(getTab('Three'), { key: ' ' });
    expect(getTab('Three')).toHaveAttribute('aria-selected', 'true');
  });
});
