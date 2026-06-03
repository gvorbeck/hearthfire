import '@testing-library/jest-dom';

// jsdom does not implement IntersectionObserver; stub it so ScrollToTop mounts cleanly.
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;

// jsdom does not implement matchMedia; stub it so ThemeToggle mounts cleanly.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }),
});
