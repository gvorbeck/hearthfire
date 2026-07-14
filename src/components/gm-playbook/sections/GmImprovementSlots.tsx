import { useCallback, useRef } from 'react';
import clsx from 'clsx';
import { Button, Heading, Text, Checkbox, Input, Radio, RadioGroup } from '@/components/ui';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import type { SteadingData, GmImprovement } from '@/types';
import { makeEmptyGmImprovement } from './steadingImprovementsData';
import card from './improvementCard.module.css';
import styles from './GmImprovementSlots.module.css';

interface GmImprovementCardProps {
  slot: GmImprovement;
  index: number;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (index: number, patch: Partial<GmImprovement>) => void;
  onCategoryChange: (index: number, category: GmImprovement['category']) => void;
  onCompletedToggle: (index: number) => void;
  onRemove: (index: number) => void;
}

const GmImprovementCard = ({ slot, index, onFocus, onBlur, onChange, onCategoryChange, onCompletedToggle, onRemove }: GmImprovementCardProps) => {
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(index, { title: e.target.value }), [index, onChange]);
  const handleSummaryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(index, { summary: e.target.value }), [index, onChange]);
  const handleRequirementsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(index, { requirements: e.target.value }), [index, onChange]);
  const handleEffectsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(index, { effects: e.target.value }), [index, onChange]);
  const handleCategoryResource = useCallback(() => onCategoryChange(index, 'resource'), [index, onCategoryChange]);
  const handleCategoryFortification = useCallback(() => onCategoryChange(index, 'fortification'), [index, onCategoryChange]);
  const handleCategoryAsset = useCallback(() => onCategoryChange(index, 'asset'), [index, onCategoryChange]);
  const handleCompletedToggle = useCallback(() => onCompletedToggle(index), [index, onCompletedToggle]);
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

  const slotCx = clsx(card.item, styles.gmItem, slot.completed && card.itemCompleted);

  return (
    <div className={slotCx}>
      <div className={card.itemHeader}>
        <Checkbox
          checked={slot.completed}
          onChange={handleCompletedToggle}
          className={card.itemCheckbox}
        />
        <Input
          aria-label="Improvement name"
          className={styles.gmTitleInput}
          value={slot.title}
          placeholder="IMPROVEMENT"
          onFocus={onFocus}
          onChange={handleTitleChange}
          onBlur={onBlur}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          aria-label="Remove improvement"
          onClick={handleRemove}
        />
      </div>
      <Input
        multiline
        aria-label="Summary"
        className={styles.gmTextarea}
        value={slot.summary}
        placeholder="Summary"
        rows={2}
        onFocus={onFocus}
        onChange={handleSummaryChange}
        onBlur={onBlur}
      />
      <RadioGroup legend="Category" legendHidden className={styles.categoryRow}>
        <Radio
          name={`gm-improvement-category-${slot.id}`}
          value="resource"
          label="Resource"
          className={styles.categoryRadio}
          checked={slot.category === 'resource'}
          onChange={handleCategoryResource}
        />
        <Radio
          name={`gm-improvement-category-${slot.id}`}
          value="fortification"
          label="Fortification"
          className={styles.categoryRadio}
          checked={slot.category === 'fortification'}
          onChange={handleCategoryFortification}
        />
        <Radio
          name={`gm-improvement-category-${slot.id}`}
          value="asset"
          label="Asset"
          className={styles.categoryRadio}
          checked={slot.category === 'asset'}
          onChange={handleCategoryAsset}
        />
      </RadioGroup>
      <div className={card.section}>
        <Heading as="h4" size="label">Requirements</Heading>
        <Input
          multiline
          aria-label="Requirements"
          className={styles.gmTextarea}
          value={slot.requirements}
          placeholder="Requirements"
          rows={3}
          onFocus={onFocus}
          onChange={handleRequirementsChange}
          onBlur={onBlur}
        />
      </div>
      <div className={card.section}>
        <Heading as="h4" size="label">Effects</Heading>
        <Input
          multiline
          aria-label="Effects"
          className={styles.gmTextarea}
          value={slot.effects}
          placeholder="Effects"
          rows={3}
          onFocus={onFocus}
          onChange={handleEffectsChange}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
};

interface GmImprovementSlotsProps {
  gmImprovements: GmImprovement[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const GmImprovementSlots = ({ gmImprovements, onSave }: GmImprovementSlotsProps) => {
  const {
    value: localSlots,
    ref: localSlotsRef,
    setValue: setLocalSlots,
    save: saveSlots,
    pendingRef,
  } = useOptimisticField<GmImprovement[], [removedId?: string]>(
    gmImprovements ?? [],
    (slots, removedId) => onSave({
      gmImprovements: slots,
      ...(removedId ? { removedGmImprovementIds: [removedId] } : {}),
    }),
  );

  // A text field's edits aren't written until blur, so while one is focused we must
  // defer remote echoes that would clobber the in-flight typing. This is a separate
  // concern from the hook's save-pending gate: a category/completed toggle saves
  // *while* a title field is still focused, and that save's settlement clears the
  // hook's pendingRef — which would drop the focus gate and let an echo through.
  // So we keep an independent focusedRef and re-pin pendingRef true whenever it
  // could have been cleared while a field is still focused. This focus-scoped gate
  // is the one place that intentionally diverges from the shared pattern.
  const focusedRef = useRef(false);
  const holdSyncWhileFocused = useCallback(() => {
    if (focusedRef.current) pendingRef.current = true;
  }, [pendingRef]);

  const handleSlotFocus = useCallback(() => {
    focusedRef.current = true;
    pendingRef.current = true;
  }, [pendingRef]);

  // Optimistic-only update while typing; the write is deferred to blur.
  const handleSlotChange = useCallback((index: number, patch: Partial<GmImprovement>) => {
    setLocalSlots((prev) => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
  }, [setLocalSlots]);

  const handleSlotBlur = useCallback(() => {
    focusedRef.current = false;
    saveSlots(localSlotsRef.current);
  }, [saveSlots, localSlotsRef]);

  // Category/completed toggles can fire while a title field is still focused; after
  // their save settles (clearing the hook's pendingRef) re-pin the focus gate.
  const handleSlotCategoryChange = useCallback((index: number, category: GmImprovement['category']) => {
    saveSlots((prev) => prev.map((s, i) => i === index ? { ...s, category } : s)).finally(holdSyncWhileFocused);
  }, [saveSlots, holdSyncWhileFocused]);

  const handleSlotCompletedToggle = useCallback((index: number) => {
    saveSlots((prev) => prev.map((s, i) => i === index ? { ...s, completed: !s.completed } : s)).finally(holdSyncWhileFocused);
  }, [saveSlots, holdSyncWhileFocused]);

  const handleAdd = useCallback(() => {
    saveSlots((prev) => [...prev, makeEmptyGmImprovement()]).finally(holdSyncWhileFocused);
  }, [saveSlots, holdSyncWhileFocused]);

  const handleRemove = useCallback((index: number) => {
    const removedId = localSlotsRef.current[index]?.id;
    saveSlots((prev) => prev.filter((_, i) => i !== index), removedId).finally(holdSyncWhileFocused);
  }, [saveSlots, holdSyncWhileFocused, localSlotsRef]);

  return (
    <div className={styles.gmSlots}>
      <Heading as="h3" size="sm">Other improvements</Heading>
      <Text size="xs" color="muted">Additional possible improvements to Stonetop, revealed by the GM.</Text>
      {localSlots.length > 0 && (
        <div className={styles.gmGrid}>
          {localSlots.map((slot, i) => (
            <GmImprovementCard
              key={slot.id}
              slot={slot}
              index={i}
              onFocus={handleSlotFocus}
              onBlur={handleSlotBlur}
              onChange={handleSlotChange}
              onCategoryChange={handleSlotCategoryChange}
              onCompletedToggle={handleSlotCompletedToggle}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        icon="plus"
        onClick={handleAdd}
      >
        Add improvement
      </Button>
    </div>
  );
};
