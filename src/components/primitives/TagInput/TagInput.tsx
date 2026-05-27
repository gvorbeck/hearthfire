import { useState, useRef, useId, useCallback, useEffect, useMemo, memo } from 'react';
import clsx from 'clsx';
import { Button } from '../Button/Button';
import styles from './TagInput.module.css';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

interface TagChipProps {
  tag: string;
  onRemove: (tag: string) => void;
}

const TagChip = memo(({ tag, onRemove }: TagChipProps) => {
  const handleRemove = useCallback(() => onRemove(tag), [tag, onRemove]);
  return (
    <span className={styles.tag}>
      {tag}
      <button
        type="button"
        className={styles.tagRemove}
        onClick={handleRemove}
        aria-label={`Remove trait: ${tag}`}
      >
        ×
      </button>
    </span>
  );
});

interface SuggestionItemProps {
  suggestion: string;
  index: number;
  isActive: boolean;
  listboxId: string;
  onAdd: (tag: string) => void;
}

const SuggestionItem = memo(({ suggestion, index, isActive, listboxId, onAdd }: SuggestionItemProps) => {
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    onAdd(suggestion);
  }, [suggestion, onAdd]);

  const cx = clsx(styles.option, isActive && styles.optionActive);

  return (
    <li
      id={`${listboxId}-option-${index}`}
      role="option"
      aria-selected={isActive}
      className={cx}
      onPointerDown={handlePointerDown}
    >
      {suggestion}
    </li>
  );
});

export const TagInput = ({ label, value, onChange, suggestions = [], placeholder = 'Add trait…', className }: TagInputProps) => {
  const inputId = useId();
  const listboxId = useId();
  const [inputVal, setInputVal] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => suggestions.filter(
      (s) => s.toLowerCase().includes(inputVal.toLowerCase()) && !value.includes(s),
    ),
    [suggestions, inputVal, value],
  );

  const unusedCount = useMemo(
    () => suggestions.filter((s) => !value.includes(s)).length,
    [suggestions, value],
  );

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputVal('');
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, [value, onChange]);

  const removeTag = useCallback((tag: string) => {
    onChange(value.filter((t) => t !== tag));
  }, [value, onChange]);

  const assignRandom = useCallback(() => {
    const unused = suggestions.filter((s) => !value.includes(s));
    if (unused.length === 0) return;
    const pick = unused[Math.floor(Math.random() * unused.length)];
    onChange([...value, pick]);
  }, [suggestions, value, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        addTag(filtered[activeIndex]);
      } else if (inputVal.trim()) {
        addTag(inputVal);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }, [activeIndex, filtered, inputVal, addTag, removeTag, value]);

  const handleFocus = useCallback(() => {
    if (inputVal) setOpen(true);
  }, [inputVal]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const showDropdown = open && filtered.length > 0;
  const cx = clsx(styles.root, className);

  return (
    <div className={cx} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>{label}</label>
      )}
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          {value.map((tag) => (
            <TagChip key={tag} tag={tag} onRemove={removeTag} />
          ))}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className={styles.input}
            value={inputVal}
            placeholder={value.length === 0 ? placeholder : ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          />
        </div>
        {suggestions.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon="dice"
            onClick={assignRandom}
            disabled={unusedCount === 0}
            aria-label="Assign random trait"
          />
        )}
      </div>
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Trait suggestions"
        className={styles.dropdown}
        hidden={!showDropdown}
      >
        {showDropdown && filtered.map((s, i) => (
          <SuggestionItem
            key={s}
            suggestion={s}
            index={i}
            isActive={i === activeIndex}
            listboxId={listboxId}
            onAdd={addTag}
          />
        ))}
      </ul>
    </div>
  );
};
