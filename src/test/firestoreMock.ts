import { vi } from 'vitest';

// In-memory Firestore stand-in. Hooks and src/lib/game.ts import the real
// firebase/firestore functions (doc/getDoc/updateDoc/runTransaction/onSnapshot/
// addDoc/collection/arrayUnion); this module backs all of them with a plain Map
// so tests run without a real Firebase connection or emulator.
//
// Usage — at the top of a test file, before importing the code under test:
//
//   vi.mock('firebase/firestore', () => firestoreMockModule());
//   import { firestoreStore } from '@/test/firestoreMock';
//
// then seed/inspect docs via firestoreStore between renders.

type DocData = Record<string, unknown>;

// path -> document data. A missing key means the doc does not exist.
const docs = new Map<string, DocData>();

// path -> set of snapshot listeners registered through onSnapshot.
type Listener = (snap: ReturnType<typeof makeSnapshot>) => void;
const listeners = new Map<string, Set<Listener>>();

const makeSnapshot = (path: string) => {
  const data = docs.get(path);
  const id = path.split('/').pop() ?? path;
  return {
    id,
    exists: () => data !== undefined,
    // Return a structural clone so callers can't mutate the store in place,
    // mirroring Firestore's snapshot semantics.
    data: () => (data === undefined ? undefined : structuredClone(data)),
  };
};

const emit = (path: string) => {
  const snap = makeSnapshot(path);
  listeners.get(path)?.forEach((l) => l(snap));
};

// A doc/collection reference is just its path plus a discriminator; the mocked
// firebase/firestore functions read `.path` off whatever they're handed.
interface Ref {
  path: string;
  __kind: 'doc' | 'collection';
}

const arrayUnionMarker = Symbol('arrayUnion');
interface ArrayUnionOp {
  [arrayUnionMarker]: true;
  values: unknown[];
}

// Apply an updateDoc payload onto a target object, honoring `a.b.c` dot-paths
// (Firestore's nested-field syntax) and arrayUnion sentinels.
const applyUpdate = (target: DocData, payload: DocData): DocData => {
  const next = structuredClone(target);
  for (const [key, value] of Object.entries(payload)) {
    if (value && typeof value === 'object' && (value as ArrayUnionOp)[arrayUnionMarker]) {
      const existing = Array.isArray(next[key]) ? (next[key] as unknown[]) : [];
      next[key] = [...existing, ...(value as ArrayUnionOp).values];
      continue;
    }
    if (key.includes('.')) {
      const parts = key.split('.');
      let cursor = next as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (typeof cursor[part] !== 'object' || cursor[part] === null) cursor[part] = {};
        cursor = cursor[part] as Record<string, unknown>;
      }
      cursor[parts[parts.length - 1]] = value;
      continue;
    }
    next[key] = value;
  }
  return next;
};

// Direct access to the store for seeding and asserting in tests.
export const firestoreStore = {
  reset() {
    docs.clear();
    listeners.clear();
  },
  set(path: string, data: DocData) {
    docs.set(path, structuredClone(data));
    emit(path);
  },
  get(path: string): DocData | undefined {
    const data = docs.get(path);
    return data === undefined ? undefined : structuredClone(data);
  },
  has(path: string): boolean {
    return docs.has(path);
  },
  delete(path: string) {
    docs.delete(path);
    emit(path);
  },
};

// Build the object passed to vi.mock('firebase/firestore', ...). Spies are
// fresh per call so a beforeEach can re-mock cleanly if desired.
export const firestoreMockModule = () => {
  let autoId = 0;

  const doc = vi.fn((_db: unknown, collectionPath: string, id: string): Ref => ({
    path: `${collectionPath}/${id}`,
    __kind: 'doc',
  }));

  const collection = vi.fn((_db: unknown, path: string): Ref => ({
    path,
    __kind: 'collection',
  }));

  const getDoc = vi.fn(async (ref: Ref) => makeSnapshot(ref.path));

  const updateDoc = vi.fn(async (ref: Ref, payload: DocData) => {
    const existing = docs.get(ref.path);
    if (existing === undefined) throw new Error(`No document to update: ${ref.path}`);
    docs.set(ref.path, applyUpdate(existing, payload));
    emit(ref.path);
  });

  const setDoc = vi.fn(async (ref: Ref, data: DocData) => {
    docs.set(ref.path, structuredClone(data));
    emit(ref.path);
  });

  const addDoc = vi.fn(async (ref: Ref, data: DocData) => {
    const id = `auto-${++autoId}`;
    const path = `${ref.path}/${id}`;
    docs.set(path, structuredClone(data));
    emit(path);
    return { id, path };
  });

  const onSnapshot = vi.fn(
    (ref: Ref, onNext: Listener, _onError?: (e: Error) => void) => {
      let set = listeners.get(ref.path);
      if (!set) {
        set = new Set();
        listeners.set(ref.path, set);
      }
      set.add(onNext);
      // Fire once synchronously with the current state, matching Firestore's
      // initial-snapshot behavior.
      onNext(makeSnapshot(ref.path));
      return () => {
        set!.delete(onNext);
      };
    },
  );

  // Minimal transaction implementation: get() reads current state, set()/update()
  // mutate the store. No real isolation, but enough to exercise read-modify-write
  // logic (withCharacters, createGameWithId) deterministically.
  const runTransaction = vi.fn(async (_db: unknown, updater: (tx: Transaction) => Promise<void>) => {
    const tx: Transaction = {
      get: async (ref: Ref) => makeSnapshot(ref.path),
      set: (ref: Ref, data: DocData) => {
        docs.set(ref.path, structuredClone(data));
        emit(ref.path);
      },
      update: (ref: Ref, payload: DocData) => {
        const existing = docs.get(ref.path) ?? {};
        docs.set(ref.path, applyUpdate(existing, payload));
        emit(ref.path);
      },
    };
    await updater(tx);
  });

  const arrayUnion = vi.fn((...values: unknown[]): ArrayUnionOp => ({
    [arrayUnionMarker]: true,
    values,
  }));

  // src/lib/firebase.ts calls initializeFirestore at import time; return a dummy
  // db so that module loads under the same firebase/firestore mock. Tests should
  // also mock 'firebase/app' (vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }))).
  const initializeFirestore = vi.fn(() => ({}));
  const persistentLocalCache = vi.fn((options: unknown) => options);
  const persistentMultipleTabManager = vi.fn(() => ({}));

  return {
    doc,
    collection,
    getDoc,
    updateDoc,
    setDoc,
    addDoc,
    onSnapshot,
    runTransaction,
    arrayUnion,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
  };
};

interface Transaction {
  get: (ref: Ref) => Promise<ReturnType<typeof makeSnapshot>>;
  set: (ref: Ref, data: DocData) => void;
  update: (ref: Ref, payload: DocData) => void;
}
