import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { parseInlineMarkdown, parseMarkdown } from '../parseMarkdown';

const Wrapper = ({ text }: { text: string }) => <>{parseInlineMarkdown(text)}</>;
const Block = ({ text }: { text: string }) => <>{parseMarkdown(text)}</>;

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

describe('parseMarkdown tables', () => {
  const table = '| 1d6 | effect |\n| --- | --- |\n| 1-2 | wounded |\n| 3-4 | worse |';

  it('renders a GFM table block as a <table> with headers and cells', () => {
    render(<Block text={table} />);
    const el = screen.getByRole('table');
    expect(el.tagName).toBe('TABLE');
    expect(screen.getByRole('columnheader', { name: '1d6' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'effect' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1-2' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'wounded' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'worse' })).toBeInTheDocument();
  });

  it('does not treat a bullet list as a table', () => {
    render(<Block text={'- one\n- two'} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('does not treat prose containing a stray pipe as a table', () => {
    render(<Block text={'a | b is just prose'} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders inline formatting inside table cells and headers', () => {
    render(<Block text={'| **roll** | effect |\n| --- | --- |\n| 10+ | *good* |'} />);
    expect(screen.getByText('roll').tagName).toBe('STRONG');
    expect(screen.getByText('good').tagName).toBe('EM');
  });

  it('pads a row with too few cells so the table stays aligned', () => {
    render(<Block text={'| a | b |\n| --- | --- |\n| only-one |'} />);
    const bodyRow = screen.getByRole('cell', { name: 'only-one' }).closest('tr')!;
    expect(bodyRow.querySelectorAll('td')).toHaveLength(2);
  });
});
