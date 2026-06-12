import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button, Heading, Text, Checkbox, Input, Radio, RadioGroup } from '@/components/ui';
import { useToast } from '@/components/app';
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
  const { addToast } = useToast();
  const pendingSlotsRef = useRef(0);

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const [localSlots, setLocalSlots] = useState<GmImprovement[]>(() => gmImprovements ?? []);
  const focusedRef = useRef(false);
  const localSlotsRef = useRef(localSlots);

  useEffect(() => {
    if (!focusedRef.current && pendingSlotsRef.current === 0) {
      const next = gmImprovements ?? [];
      localSlotsRef.current = next;
      setLocalSlots(next);
    }
  }, [gmImprovements]);

  const saveSlots = useCallback((slots: GmImprovement[]) => {
    const prev = localSlotsRef.current;
    pendingSlotsRef.current += 1;
    onSaveRef.current({ gmImprovements: slots })
      .catch(() => { localSlotsRef.current = prev; setLocalSlots(prev); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingSlotsRef.current -= 1; });
  }, [addToast]);

  const handleSlotFocus = useCallback(() => { focusedRef.current = true; }, []);

  const handleSlotChange = useCallback((index: number, patch: Partial<GmImprovement>) => {
    setLocalSlots((prev) => {
      const next = prev.map((s, i) => i === index ? { ...s, ...patch } : s);
      localSlotsRef.current = next;
      return next;
    });
  }, []);

  const handleSlotBlur = useCallback(() => {
    focusedRef.current = false;
    saveSlots(localSlotsRef.current);
  }, [saveSlots]);

  const handleSlotCategoryChange = useCallback((index: number, category: GmImprovement['category']) => {
    const next = localSlotsRef.current.map((s, i) => i === index ? { ...s, category } : s);
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

  const handleSlotCompletedToggle = useCallback((index: number) => {
    const next = localSlotsRef.current.map((s, i) => i === index ? { ...s, completed: !s.completed } : s);
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

  const handleAdd = useCallback(() => {
    const next = [...localSlotsRef.current, makeEmptyGmImprovement()];
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

  const handleRemove = useCallback((index: number) => {
    const next = localSlotsRef.current.filter((_, i) => i !== index);
    localSlotsRef.current = next;
    setLocalSlots(next);
    saveSlots(next);
  }, [saveSlots]);

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
