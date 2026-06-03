import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { useToast } from '@/components/app';
import type { CharacterData, PlaybookFeatures } from '@/types';

type ConsequenceKey = Extract<{
  [K in keyof PlaybookFeatures]: PlaybookFeatures[K] extends Record<string, boolean> | undefined ? K : never;
}[keyof PlaybookFeatures], string>;

interface ConsequenceLabel {
  id: string;
  label: string;
}

export const useConsequenceCheckboxes = (
  data: CharacterData | undefined,
  saveImmediate: (patch: Partial<PlaybookFeatures>) => Promise<void>,
  consequenceKey: ConsequenceKey,
  labels: ConsequenceLabel[],
  isDisabled?: (id: string, checked: Record<string, boolean>) => boolean,
) => {
  const { addToast } = useToast();
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => (resolvePlaybookFeatures(data)[consequenceKey] as Record<string, boolean> | undefined) ?? {},
  );
  const checkedRef = useLatest(checked);

  useEffect(() => {
    const val = resolvePlaybookFeatures(data)[consequenceKey] as Record<string, boolean> | undefined;
    if (val !== undefined) setChecked(val);
  }, [data, consequenceKey]);

  const handleChange = useCallback((id: string, isChecked: boolean) => {
    const prev = checkedRef.current;
    const next = { ...prev, [id]: isChecked };
    setChecked(next);
    saveImmediate({ [consequenceKey]: next }).catch(() => { setChecked(prev); addToast('Failed to save.', 'error'); });
  }, [saveImmediate, consequenceKey, addToast]);

  const updateChecked = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    const prev = checkedRef.current;
    const next = updater(prev);
    setChecked(next);
    saveImmediate({ [consequenceKey]: next }).catch(() => { setChecked(prev); addToast('Failed to save.', 'error'); });
  }, [saveImmediate, consequenceKey, addToast]);

  const items = useMemo(() => labels.map((c) => ({
    id: c.id,
    label: <span>{parseInlineMarkdown(c.label)}</span>,
    disabled: isDisabled ? isDisabled(c.id, checked) : false,
  })), [labels, checked, isDisabled]);

  return { checked, items, onChange: handleChange, updateChecked };
};
