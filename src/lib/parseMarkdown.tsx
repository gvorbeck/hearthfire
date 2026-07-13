import { Divider } from '@/components/ui/Divider/Divider';
import { Icon } from '@/components/ui/Icon/Icon';
import { List } from '@/components/ui/List/List';
import { Table } from '@/components/ui/Table/Table';
import { Text } from '@/components/ui/Text/Text';
import styles from './parseMarkdown.module.css';

const INLINE_RE = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|◊|◈|◻|on a 10\+|on a 7[-–]9|on a 6[-–]|either way)/i;
const AUTO_BOLD_RE = /^(on a 10\+|on a 7[-–]9|on a 6[-–]|either way)$/i;

export const parseInlineMarkdown = (text: string): React.ReactNode[] =>
  text.split(INLINE_RE).reduce<React.ReactNode[]>((acc, chunk, i) => {
    if (!chunk) return acc;
    if (chunk === '◊') return [...acc, <Icon key={`md-${i}-${chunk}`} name="empty-provisions" size="small" aria-label="provisions" className={styles.inlineIcon} />];
    if (chunk === '◈') return [...acc, <Icon key={`md-${i}-${chunk}`} name="filled-provisions" size="small" aria-label="provisions" className={styles.inlineIcon} />];
    if (chunk === '◻') return [...acc, <span key={`md-${i}-${chunk}`} className={styles.checkbox} aria-label="checkbox" role="img" />];
    if (chunk.startsWith('***')) return [...acc, <strong key={`md-${i}-${chunk.slice(0, 8)}`}><em>{chunk.slice(3, -3)}</em></strong>];
    if (chunk.startsWith('**')) return [...acc, <strong key={`md-${i}-${chunk.slice(0, 8)}`}>{chunk.slice(2, -2)}</strong>];
    if (chunk.startsWith('*')) return [...acc, <em key={`md-${i}-${chunk.slice(0, 8)}`}>{chunk.slice(1, -1)}</em>];
    if (AUTO_BOLD_RE.test(chunk)) return [...acc, <strong key={`md-${i}-${chunk.slice(0, 8)}`}>{chunk}</strong>];
    return [...acc, chunk];
  }, []);

export const parseMarkdown = (markdown: string): React.ReactNode[] => {
  const blocks = markdown.trim().split(/\n\n+/);
  return blocks.map((block, blockIndex) => {
    // A block of only dashes (---) is a horizontal rule, rendered as a Divider like in markdown.
    if (/^-{3,}$/.test(block)) {
      return <Divider key={`block-${blockIndex}-hr`} />;
    }
    const lines = block.split('\n');
    // A GitHub-flavored markdown table: a header row, a `---|---` separator row, then body rows, every
    // line pipe-delimited. Cells split on `|` with the empty edges from surrounding pipes trimmed off.
    const isTable =
      lines.length >= 2 &&
      lines.every((l) => l.includes('|')) &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[1]) &&
      lines[1].includes('-');
    if (isTable) {
      const toCells = (line: string) =>
        line
          .replace(/^\s*\|/, '')
          .replace(/\|\s*$/, '')
          .split('|')
          .map((cell) => cell.trim());
      const [header, , ...bodyLines] = lines;
      const headerCells = toCells(header);
      // Force every body row to the header's column count so a row with too few or too many cells
      // stays aligned rather than rendering a lopsided table.
      const toRow = (cells: string[]) =>
        Array.from({ length: headerCells.length }, (_, c) => cells[c] ?? '');
      return (
        <Table
          key={`block-${blockIndex}-table`}
          columnHeaders={headerCells.map((cell) => parseInlineMarkdown(cell))}
          rows={bodyLines.map((line, rowIndex) => ({
            id: `${blockIndex}-${rowIndex}`,
            cells: toRow(toCells(line)).map((cell) => parseInlineMarkdown(cell)),
          }))}
        />
      );
    }
    const isList = lines.every((l) => l.startsWith('- '));
    if (isList) {
      return (
        <List
          key={`block-${blockIndex}-${block.slice(0, 8)}`}
          variant="bullet"
          items={lines.map((l) => parseInlineMarkdown(l.replace(/^-\s+/, '')))}
        />
      );
    }
    return <Text key={`block-${blockIndex}-${block.slice(0, 8)}`} font="serif" color="muted">{parseInlineMarkdown(block)}</Text>;
  });
};
