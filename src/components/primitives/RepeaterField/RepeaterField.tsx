import { useState, useEffect, useRef, useCallback, useId, memo } from 'react';
import clsx from 'clsx';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import styles from './RepeaterField.module.css';

interface BaseItem {
  id: number;
  text: string;
}

interface PlainItem extends BaseItem { variant: 'plain' }
interface CheckedItem extends BaseItem { variant: 'checked'; checked: boolean }
interface WeightedItem extends BaseItem { variant: 'checked-weight'; checked: boolean; weight: 1 | 2 }

type LocalItem = PlainItem | CheckedItem | WeightedItem;

const toLocalPlain = (values: string[], startId: number): PlainItem[] =>
  values.map((text, i) => ({ id: startId + i, variant: 'plain', text }));

const toLocalChecked = (
  values: { checked: boolean; text: string }[],
  startId: number,
): CheckedItem[] =>
  values.map((v, i) => ({ id: startId + i, variant: 'checked', checked: v.checked, text: v.text }));

const toLocalWeighted = (
  values: { checked: boolean; text: string; weight: 1 | 2 }[],
  startId: number,
): WeightedItem[] =>
  values.map((v, i) => ({ id: startId + i, variant: 'checked-weight', checked: v.checked, text: v.text, weight: v.weight }));

interface RowProps {
  item: LocalItem;
  position: number;
  itemLabel: string;
  isFocusTarget: boolean;
  onFocusConsumed: () => void;
  onTextChange: (id: number, text: string) => void;
  onTextBlur: (id: number) => void;
  onCheckedChange: (id: number, checked: boolean) => void;
  onWeightChange: (id: number, weight: 1 | 2) => void;
  onRemove: (id: number) => void;
}

const Row = memo(({
  item, position, itemLabel, isFocusTarget, onFocusConsumed,
  onTextChange, onTextBlur, onCheckedChange, onWeightChange, onRemove,
}: RowProps) => {
  const checkId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasCheckbox = item.variant === 'checked' || item.variant === 'checked-weight';
  const hasWeight = item.variant === 'checked-weight';
  const checked = hasCheckbox ? (item as CheckedItem).checked : false;
  const weight = hasWeight ? (item as WeightedItem).weight : 1;

  useEffect(() => {
    if (isFocusTarget && inputRef.current) {
      inputRef.current.focus();
      onFocusConsumed();
    }
  }, [isFocusTarget, onFocusConsumed]);

  const handleChecked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(item.id, e.target.checked),
    [item.id, onCheckedChange],
  );
  const handleText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onTextChange(item.id, e.target.value),
    [item.id, onTextChange],
  );
  const handleBlur = useCallback(() => onTextBlur(item.id), [item.id, onTextBlur]);
  const handleWeight = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onWeightChange(item.id, Number(e.target.value) as 1 | 2),
    [item.id, onWeightChange],
  );
  const handleRemove = useCallback(() => onRemove(item.id), [item.id, onRemove]);

  return (
    <li className={styles.item}>
      {hasCheckbox ? (
        <span className={clsx(styles.provisionWrap, weight === 2 && styles.provisionWrapDouble)}>
          <input
            type="checkbox"
            id={checkId}
            className={styles.provisionInput}
            checked={checked}
            aria-label={`Mark ${itemLabel.toLowerCase()} ${position} as carried`}
            onChange={handleChecked}
          />
          <label htmlFor={checkId} className={styles.provisionLabel} aria-hidden="true">
            {Array.from({ length: weight }, (_, i) => (
              <span key={`provision-icon-${i}`} className={clsx(styles.provisionIcon, checked && styles.provisionIconChecked)}>
                <Icon name={checked ? 'filled-provisions' : 'empty-provisions'} size="small" />
              </span>
            ))}
          </label>
        </span>
      ) : (
        <span className={styles.bullet} aria-hidden="true">☉</span>
      )}

      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={item.text}
        placeholder="Item…"
        aria-label={`${itemLabel} ${position}`}
        onChange={handleText}
        onBlur={handleBlur}
      />

      {hasWeight && (
        <select
          className={styles.weightSelect}
          value={weight}
          aria-label={`${itemLabel} ${position} weight`}
          onChange={handleWeight}
        >
          <option value={1}>1 load</option>
          <option value={2}>2 load</option>
        </select>
      )}

      <Button
        variant="ghost"
        size="sm"
        icon="close"
        onClick={handleRemove}
        aria-label={`Remove ${itemLabel.toLowerCase()} ${position}`}
        className={styles.removeBtn}
      />
    </li>
  );
});

interface BaseProps {
  addLabel: string;
  itemLabel: string;
}

interface PlainProps extends BaseProps {
  variant?: never;
  items: string[];
  onSave: (items: string[]) => Promise<void>;
}

interface CheckedProps extends BaseProps {
  variant: 'checked';
  items: { checked: boolean; text: string }[];
  onSave: (items: { checked: boolean; text: string }[]) => Promise<void>;
}

interface CheckedWeightProps extends BaseProps {
  variant: 'checked-weight';
  items: { checked: boolean; text: string; weight: 1 | 2 }[];
  onSave: (items: { checked: boolean; text: string; weight: 1 | 2 }[]) => Promise<void>;
}

type RepeaterFieldProps = PlainProps | CheckedProps | CheckedWeightProps;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySaveFn = (items: any[]) => Promise<void>;

export const RepeaterField = (props: RepeaterFieldProps) => {
  const { addLabel, itemLabel } = props;

  const nextId = useRef(props.items.length);
  const onSaveRef = useRef<AnySaveFn>(props.onSave as AnySaveFn);
  onSaveRef.current = props.onSave as AnySaveFn;

  const variantRef = useRef(props.variant);

  const itemsToLocal = useCallback((items: RepeaterFieldProps['items'], startId: number): LocalItem[] => {
    if (variantRef.current === 'checked') return toLocalChecked(items as { checked: boolean; text: string }[], startId);
    if (variantRef.current === 'checked-weight') return toLocalWeighted(items as { checked: boolean; text: string; weight: 1 | 2 }[], startId);
    return toLocalPlain(items as string[], startId);
  }, []);

  const toValues = useCallback((rows: LocalItem[]) => {
    if (variantRef.current === 'checked')
      return rows.map((r) => ({ checked: (r as CheckedItem).checked, text: r.text }));
    if (variantRef.current === 'checked-weight')
      return rows.map((r) => ({ checked: (r as WeightedItem).checked, text: r.text, weight: (r as WeightedItem).weight }));
    return rows.map((r) => r.text);
  }, []);

  const [local, setLocal] = useState<LocalItem[]>(() => itemsToLocal(props.items, 0));
  const [pendingFocusId, setPendingFocusId] = useState<number | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(props.items));

  // Guard: only accept external updates when local state matches last save (no in-flight edits).
  useEffect(() => {
    const incoming = JSON.stringify(props.items);
    if (incoming === lastSavedRef.current) return;
    const localKey = JSON.stringify(toValues(local));
    if (localKey !== lastSavedRef.current) return;
    lastSavedRef.current = incoming;
    // Advance nextId past the incoming length to avoid reusing IDs from prior local additions.
    nextId.current = Math.max(nextId.current, props.items.length);
    setLocal(itemsToLocal(props.items, 0));
  // itemsToLocal and toValues are stable; props.items identity drives this effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.items]);

  const wrappedSave = useCallback(async (rows: LocalItem[]) => {
    const values = toValues(rows);
    const key = JSON.stringify(values);
    lastSavedRef.current = key;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onSaveRef.current(values as any[]);
  }, [toValues]);

  const { onChange: debouncedChange, flush } = useDebouncedSave(wrappedSave, 1500);

  const handleTextChange = useCallback((id: number, text: string) => {
    setLocal((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, text } : r);
      debouncedChange(next);
      return next;
    });
  }, [debouncedChange]);

  const handleTextBlur = useCallback((id: number) => {
    setLocal((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, text: r.text.trim() } : r);
      flush(next);
      return next;
    });
  }, [flush]);

  const handleCheckedChange = useCallback((id: number, checked: boolean) => {
    setLocal((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, checked } : r);
      flush(next);
      return next;
    });
  }, [flush]);

  const handleWeightChange = useCallback((id: number, weight: 1 | 2) => {
    setLocal((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, weight } : r);
      flush(next);
      return next;
    });
  }, [flush]);

  const handleAdd = useCallback(() => {
    const id = nextId.current++;
    setPendingFocusId(id);
    setLocal((prev) => {
      // variantRef.current never changes after mount; reading it here is safe.
      const newItem: LocalItem = variantRef.current === 'checked'
        ? { id, variant: 'checked', checked: false, text: '' }
        : variantRef.current === 'checked-weight'
          ? { id, variant: 'checked-weight', checked: false, text: '', weight: 1 }
          : { id, variant: 'plain', text: '' };
      return [...prev, newItem];
    });
  }, []);

  const handleRemove = useCallback((id: number) => {
    setLocal((prev) => {
      const next = prev.filter((r) => r.id !== id);
      flush(next);
      return next;
    });
  }, [flush]);

  const handleFocusConsumed = useCallback(() => setPendingFocusId(null), []);

  return (
    <>
      {local.length > 0 && (
        <ul className={styles.list} aria-label={addLabel}>
          {local.map((item, i) => (
            <Row
              key={item.id}
              item={item}
              position={i + 1}
              itemLabel={itemLabel}
              isFocusTarget={pendingFocusId === item.id}
              onFocusConsumed={handleFocusConsumed}
              onTextChange={handleTextChange}
              onTextBlur={handleTextBlur}
              onCheckedChange={handleCheckedChange}
              onWeightChange={handleWeightChange}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}
      <Button
        variant="ghost"
        size="sm"
        icon="plus"
        onClick={handleAdd}
        className={clsx(styles.addBtn, styles.addBtnOffset)}
      >
        {addLabel}
      </Button>
    </>
  );
};
