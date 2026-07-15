import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Each Firebase config field maps to the env var it reads from. This is the
// single source of truth: the config and the missing-var check both derive
// from it, so adding a field only means editing one place.
// See .env.example for the required keys.
const configToEnvVar = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const;

const firebaseConfig = Object.fromEntries(
  Object.entries(configToEnvVar).map(([key, envVar]) => [
    key,
    import.meta.env[envVar],
  ]),
);

// Fail loud at startup if any required var is missing, rather than letting
// undefined config values surface as opaque Firestore errors later.
const missingVars = Object.entries(configToEnvVar)
  .filter(([key]) => !firebaseConfig[key])
  .map(([, envVar]) => envVar);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase env vars: ${missingVars.join(', ')}. ` +
      'See .env.example for the required keys.',
  );
}

const app = initializeApp(firebaseConfig);

// Persistent local cache lets writes queue offline and snapshots serve from
// cache; multi-tab manager coordinates it across tabs, since players commonly
// keep several character sheets open at once.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
