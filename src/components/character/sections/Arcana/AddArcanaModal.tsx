import { useState, useId, useMemo, useCallback, memo } from 'react';
import clsx from 'clsx';
import { Modal, Heading, Button, Text } from '@/components/ui';
import styles from './AddArcanaModal.module.css';

interface ArcanaItem {
  id: string;
  name: string;
  tags?: string;
}

interface AddArcanaModalProps<T extends ArcanaItem> {
  open: boolean;
  onClose: () => void;
  onAdd: (item: T) => void;
  items: T[];
  existingIds: string[];
  title: string;
  noun: string;
  placeholder: string;
}

interface ArcanaOptionProps<T extends ArcanaItem> {
  item: T;
  isSelected: boolean;
  onSelect: (item: T) => void;
  idPrefix: string;
}

const ArcanaOption = memo(
  <T extends ArcanaItem>({ item, isSelected, onSelect, idPrefix }: ArcanaOptionProps<T>) => {
    const cx = clsx(styles.item, isSelected && styles.itemSelected);
    const handleClick = useCallback(() => onSelect(item), [onSelect, item]);
    return (
      <div
        id={`${idPrefix}-${item.id}`}
        role="option"
        aria-selected={isSelected}
        className={cx}
        onClick={handleClick}
      >
        <span className={styles.itemName}>{item.name}</span>
        {item.tags && <span className={styles.itemTags}>{item.tags}</span>}
      </div>
    );
  },
) as <T extends ArcanaItem>(props: ArcanaOptionProps<T>) => React.ReactElement;

export const AddArcanaModal = <T extends ArcanaItem>({
  open,
  onClose,
  onAdd,
  items,
  existingIds,
  title,
  noun,
  placeholder,
}: AddArcanaModalProps<T>) => {
  const headingId = useId();
  const inputId = useId();
  const idPrefix = useId();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<T | null>(null);

  const existing = useMemo(() => new Set(existingIds), [existingIds]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (a) => !existing.has(a.id) && (q === '' || a.name.toLowerCase().includes(q)),
    );
  }, [query, existing, items]);

  const handleAdd = useCallback(() => {
    if (!selected) return;
    onAdd(selected);
    setQuery('');
    setSelected(null);
  }, [selected, onAdd]);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelected(null);
    onClose();
  }, [onClose]);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelected(null);
  }, []);

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;
      const currentIndex = selected ? results.findIndex((a) => a.id === selected.id) : -1;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = results[(currentIndex + 1) % results.length];
        setSelected(next);
        document.getElementById(`${idPrefix}-${next.id}`)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = results[(currentIndex - 1 + results.length) % results.length];
        setSelected(prev);
        document.getElementById(`${idPrefix}-${prev.id}`)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setSelected(results[0]);
        document.getElementById(`${idPrefix}-${results[0].id}`)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'End') {
        e.preventDefault();
        const last = results[results.length - 1];
        setSelected(last);
        document.getElementById(`${idPrefix}-${last.id}`)?.scrollIntoView({ block: 'nearest' });
      }
    },
    [results, selected, idPrefix],
  );

  const listCx = clsx(styles.list, results.length === 0 && styles.listEmpty);
  const allAdded = existing.size === items.length;

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby={headingId} className={styles.modal}>
      <Heading as="h2" size="md" id={headingId}>
        {title}
      </Heading>

      <div className={styles.searchRow}>
        <label htmlFor={inputId} className={styles.searchLabel}>
          Search
        </label>
        <input
          id={inputId}
          type="search"
          className={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChange={handleQueryChange}
          autoComplete="off"
        />
      </div>

      <div
        className={listCx}
        role="listbox"
        aria-label={title}
        aria-activedescendant={selected ? `${idPrefix}-${selected.id}` : undefined}
        tabIndex={0}
        onKeyDown={handleListKeyDown}
      >
        {results.length === 0 ? (
          <Text color="muted" className={styles.empty}>
            {allAdded ? `All ${noun} have been added.` : 'No matches found.'}
          </Text>
        ) : (
          results.map((a) => (
            <ArcanaOption
              key={a.id}
              item={a}
              isSelected={selected?.id === a.id}
              onSelect={setSelected}
              idPrefix={idPrefix}
            />
          ))
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAdd} disabled={!selected}>
          Add
        </Button>
      </div>
    </Modal>
  );
};
