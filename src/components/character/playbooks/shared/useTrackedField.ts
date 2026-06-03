import { useState, useCallback } from 'react';
import { useLatest } from '@/hooks/useLatest';
import type { PlaybookFeatures } from '@/types';

export const useTrackedField = (
  initialValue: string,
  fieldKey: keyof PlaybookFeatures,
  saveDebounced: (patch: Partial<PlaybookFeatures>) => void,
  flushDebounce: (patch: Partial<PlaybookFeatures>) => void,
) => {
  const [value, setValue] = useState(initialValue);
  const valueRef = useLatest(value);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    saveDebounced({ [fieldKey]: val });
  }, [fieldKey, saveDebounced]);
  const handleBlur = useCallback(() => {
    flushDebounce({ [fieldKey]: valueRef.current });
  }, [fieldKey, flushDebounce]);
  return { value, setValue, handleChange, handleBlur };
};
