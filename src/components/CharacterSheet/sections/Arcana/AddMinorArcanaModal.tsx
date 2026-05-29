import { useState, useId, useMemo, useCallback, memo } from 'react';
import clsx from 'clsx';
import { Modal, Heading, Button, Text } from '@/components/primitives';
import { MINOR_ARCANA, type MinorArcanum } from '@/lib/arcanaMinor';
import styles from './AddMinorArcanaModal.module.css';

interface AddMinorArcanaModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (arcanum: MinorArcanum) => void;
  existingIds: string[];
}

interface ArcanaOptionProps {
  arcanum: MinorArcanum;
  isSelected: boolean;
  onSelect: (arcanum: MinorArcanum) => void;
}

const ArcanaOption = memo(({ arcanum, isSelected, onSelect }: ArcanaOptionProps) => {
  const cx = clsx(styles.item, isSelected && styles.itemSelected);
  const handleClick = useCallback(() => onSelect(arcanum), [onSelect, arcanum]);
  return (
    <button
      id={`arcana-option-${arcanum.id}`}
      role="option"
      aria-selected={isSelected}
      className={cx}
      onClick={handleClick}
    >
      <span className={styles.itemName}>{arcanum.name}</span>
      {arcanum.tags && (
        <span className={styles.itemTags}>{arcanum.tags}</span>
      )}
    </button>
  );
});

export const AddMinorArcanaModal = ({
  open,
  onClose,
  onAdd,
  existingIds,
}: AddMinorArcanaModalProps) => {
  const headingId = useId();
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MinorArcanum | null>(null);

  const existing = useMemo(() => new Set(existingIds), [existingIds]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MINOR_ARCANA.filter(
      (a) => !existing.has(a.id) && (q === '' || a.name.toLowerCase().includes(q)),
    );
  }, [query, existing]);

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

  const listCx = clsx(styles.list, results.length === 0 && styles.listEmpty);

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby={headingId} className={styles.modal}>
      <Heading as="h2" size="md" id={headingId}>
        Add Minor Arcanum
      </Heading>

      <div className={styles.searchRow}>
        <label htmlFor={inputId} className={styles.searchLabel}>
          Search
        </label>
        <input
          id={inputId}
          type="search"
          className={styles.searchInput}
          placeholder="e.g. scroll, wolf pelt, cave…"
          value={query}
          onChange={handleQueryChange}
          autoComplete="off"
        />
      </div>

      <div
        className={listCx}
        role="listbox"
        aria-label="Minor arcana"
        aria-activedescendant={selected ? `arcana-option-${selected.id}` : undefined}
      >
        {results.length === 0 ? (
          <Text as="p" size="sm" color="muted" className={styles.empty}>
            {existing.size === MINOR_ARCANA.length
              ? 'All minor arcana have been added.'
              : 'No matches found.'}
          </Text>
        ) : (
          results.map((a) => (
            <ArcanaOption
              key={a.id}
              arcanum={a}
              isSelected={selected?.id === a.id}
              onSelect={setSelected}
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
