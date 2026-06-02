import { Icon, List, Text } from '@/components/primitives';
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
    const lines = block.split('\n');
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
