import clsx from 'clsx';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import styles from './List.module.css';

type ListVariant = 'bullet' | 'dash' | 'numbered' | 'ellipses';

interface ListProps {
  variant: ListVariant;
  items: React.ReactNode[];
  className?: string;
}

export const List = ({ variant, items, className }: ListProps) => {
  const Tag = variant === 'numbered' ? 'ol' : 'ul';
  const cx = clsx(styles.list, styles[variant], className);

  return (
    <Tag className={cx}>
      {items.map((item, i) => (
        <li key={`list-item-${variant}-${i}`} className={styles.item}>
          {typeof item === 'string' ? parseInlineMarkdown(item) : item}
        </li>
      ))}
    </Tag>
  );
};
