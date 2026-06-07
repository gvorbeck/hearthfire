import { useState, useRef, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';

interface UseCollapsibleSectionReturn {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  handleToggleCollapse: () => void;
}

export const useCollapsibleSection = (isComplete: boolean): UseCollapsibleSectionReturn => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitializedCollapse = useRef(false);

  useEffect(() => {
    if (isComplete && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [isComplete]);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  return { isCollapsed, setIsCollapsed, handleToggleCollapse };
};
