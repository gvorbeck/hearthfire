import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { parseInlineMarkdown } from '../parseMarkdown';

const Wrapper = ({ text }: { text: string }) => <>{parseInlineMarkdown(text)}</>;

describe('parseInlineMarkdown', () => {
  it('renders **bold** as a <strong> element', () => {
    render(<Wrapper text="Roll **+STR**" />);
    expect(screen.getByText('+STR').tagName).toBe('STRONG');
  });

  it('renders *italic* as an <em> element', () => {
    render(<Wrapper text="See *page 42*" />);
    expect(screen.getByText('page 42').tagName).toBe('EM');
  });

  it('auto-bolds "on a 10+" without explicit markers', () => {
    render(<Wrapper text="on a 10+" />);
    expect(screen.getByText('on a 10+').tagName).toBe('STRONG');
  });

  it('renders ***bolditalic*** as nested <strong><em>', () => {
    render(<Wrapper text="***big***" />);
    const em = screen.getByText('big');
    expect(em.tagName).toBe('EM');
    expect(em.parentElement?.tagName).toBe('STRONG');
  });

  it('renders the ◊ empty-provisions icon with an accessible label', () => {
    render(<Wrapper text="Spend ◊ to eat" />);
    expect(screen.getByLabelText('provisions')).toBeInTheDocument();
    // Surrounding text is preserved as separate chunks.
    expect(screen.getByText(/Spend/)).toBeInTheDocument();
    expect(screen.getByText(/to eat/)).toBeInTheDocument();
  });

  it('renders the ◈ filled-provisions icon', () => {
    const { container } = render(<Wrapper text="◈" />);
    expect(container.querySelector('[aria-label="provisions"]')).toBeInTheDocument();
  });

  it('renders the ◻ checkbox marker', () => {
    render(<Wrapper text="◻" />);
    expect(screen.getByLabelText('checkbox')).toBeInTheDocument();
  });

  it('handles adjacent emphasis spans within one string', () => {
    render(<Wrapper text="**a** and *b*" />);
    expect(screen.getByText('a').tagName).toBe('STRONG');
    expect(screen.getByText('b').tagName).toBe('EM');
    expect(screen.getByText(/and/)).toBeInTheDocument();
  });

  it('returns no nodes for an empty string', () => {
    expect(parseInlineMarkdown('')).toEqual([]);
  });

  it('leaves plain text without markers untouched', () => {
    expect(parseInlineMarkdown('just words')).toEqual(['just words']);
  });
});
