import { useState, useEffect, useCallback } from 'react';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
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
  saveImmediate: (patch: Partial<PlaybookFeatures>) => void,
  consequenceKey: ConsequenceKey,
  labels: ConsequenceLabel[],
  isDisabled?: (id: string, checked: Record<string, boolean>) => boolean,
) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => (resolvePlaybookFeatures(data)[consequenceKey] as Record<string, boolean> | undefined) ?? {},
  );

  useEffect(() => {
    const val = resolvePlaybookFeatures(data)[consequenceKey] as Record<string, boolean> | undefined;
    if (val !== undefined) setChecked(val);
  }, [data, consequenceKey]);

  const handleChange = useCallback((id: string, isChecked: boolean) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: isChecked };
      saveImmediate({ [consequenceKey]: next });
      return next;
    });
  }, [saveImmediate, consequenceKey]);

  const updateChecked = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    setChecked((prev) => {
      const next = updater(prev);
      saveImmediate({ [consequenceKey]: next });
      return next;
    });
  }, [saveImmediate, consequenceKey]);

  const items = labels.map((c) => ({
    id: c.id,
    label: <span>{parseInlineMarkdown(c.label)}</span>,
    disabled: isDisabled ? isDisabled(c.id, checked) : false,
  }));

  return { checked, items, onChange: handleChange, updateChecked };
};
