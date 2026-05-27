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
});
