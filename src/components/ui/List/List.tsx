import clsx from 'clsx';
import { Text } from '../Text/Text';
import styles from './List.module.css';

type ListVariant = 'bullet' | 'numbered' | 'ellipses';

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
      {items.map((item, i) => {
        const isStringItem = typeof item === 'string';
        return (
          <li key={`${prefix}-${i}-${isStringItem ? item : ''}`} className={styles.item}>
            {isStringItem
              ? <Text as="span" font="serif" leading="tight">{item}</Text>
              : item}
          </li>
        );
      })}
    </Tag>
  );
};
