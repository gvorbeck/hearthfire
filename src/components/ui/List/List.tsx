import clsx from 'clsx';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import styles from './List.module.css';

type ListVariant = 'bullet' | 'dash' | 'numbered' | 'ellipses';

interface ListProps {
  variant: ListVariant;
  items: React.ReactNode[];
  keyPrefix?: string;
  className?: string;
}

export const List = ({ variant, items, keyPrefix, className }: ListProps) => {
  const Tag = variant === 'numbered' ? 'ol' : 'ul';
  const cx = clsx(styles.list, styles[variant], className);
  const prefix = keyPrefix ?? `list-item-${variant}`;

  return (
    <Tag className={cx}>
      {items.map((item, i) => (
        <li key={`${prefix}-${i}`} className={styles.item}>
          {typeof item === 'string' ? parseInlineMarkdown(item) : item}
        </li>
      ))}
    </Tag>
  );
};
