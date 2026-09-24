import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { firebaseConfig } from '../firebaseConfig';

// Local development against the Firebase emulators: `VITE_EMULATOR=1 npm run dev`
const useEmulator = import.meta.env.VITE_EMULATOR === '1';
const config = useEmulator
  ? { apiKey: 'demo-key', projectId: 'demo-party', databaseURL: 'http://127.0.0.1:9000?ns=demo-party' }
  : firebaseConfig;

export const configMissing = !config.apiKey || config.apiKey.includes('REPLACE_ME');

export const app = configMissing ? null : initializeApp(config);
export const auth = app ? getAuth(app) : null;
export const db = app ? getDatabase(app) : null;

if (useEmulator && app) {
  const host = window.location.hostname;
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectDatabaseEmulator(db, host, 9000);
}

// Resolves with the anonymous user once signed in. Guests never see this happen.
// Each browser profile (and each incognito window) gets its own anonymous uid.
let authPromise = null;
export function ensureAuth() {
  if (!auth) return Promise.reject(new Error('Firebase config missing'));
  if (authPromise) return authPromise;
  authPromise = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user);
      }
    });
    const attempt = () => {
      signInAnonymously(auth).catch(() => setTimeout(attempt, 3000));
    };
    // Give persisted sessions a moment to restore before creating a new user.
    auth.authStateReady().then(() => {
      if (!auth.currentUser) attempt();
    });
  });
  return authPromise;
}
