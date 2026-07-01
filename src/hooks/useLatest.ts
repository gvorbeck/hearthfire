import { useRef, useInsertionEffect } from 'react';

// Holds the latest value in a stable ref so callbacks/effects can read it via
// `.current` without listing it as a dependency. The write lives in an
// insertion effect (not the render body) so it never mutates a ref during a
// render that React might discard — satisfying react-hooks/refs. This is safe
// because no consumer reads these refs during render; every read happens in a
// post-commit event handler or effect. If a call site ever needs the value
// during render, derive it directly rather than reaching for this ref.
export const useLatest = <T>(value: T) => {
  const ref = useRef(value);
  useInsertionEffect(() => {
    ref.current = value;
  });
  return ref;
};
