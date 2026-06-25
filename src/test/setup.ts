import '@testing-library/jest-dom';
import { vi } from 'vitest';

// firebase.ts throws at import time if any VITE_FIREBASE_* var is missing.
// CI has no .env, so stub dummy values here to let modules import cleanly.
// Tests never hit real Firebase — Firestore is mocked (see firestoreMock.ts).
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'test-sender-id');
vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id');

// jsdom does not implement IntersectionObserver; stub it so ScrollToTop mounts cleanly.
globalThis.IntersectionObserver = class {
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
