import '@testing-library/jest-dom';

// jsdom does not implement IntersectionObserver; stub it so ScrollToTop mounts cleanly.
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;
