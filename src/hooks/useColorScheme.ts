import { useState, useEffect, useCallback } from 'react';

type ColorScheme = 'dark' | 'light';

const STORAGE_KEY = 'hearthfire-color-scheme';

const getInitial = (): ColorScheme => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    // localStorage unavailable
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const applyTheme = (scheme: ColorScheme) => {
  if (scheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
};

export const useColorScheme = () => {
  const [scheme, setScheme] = useState<ColorScheme>(getInitial);

  useEffect(() => {
    applyTheme(scheme);
    try {
      localStorage.setItem(STORAGE_KEY, scheme);
    } catch {
      // localStorage unavailable
    }
  }, [scheme]);

  const toggle = useCallback(() => {
    setScheme(s => (s === 'dark' ? 'light' : 'dark'));
  }, []);

  return { scheme, toggle };
};
