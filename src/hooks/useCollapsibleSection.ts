import { useState, useRef, useEffect, useCallback } from 'react';

export const useCollapsibleSection = (isComplete: boolean) => {
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
