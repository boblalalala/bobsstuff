import { useEffect, useRef, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, ensureAuth } from './firebase';

export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    ensureAuth().then((u) => alive && setUser(u), (e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, []);
  return { user, error };
}

// Live value at a database path. Re-syncs automatically after reconnects.
// Returns undefined until the first snapshot arrives, then the value (null if empty).
export function useDbValue(path) {
  const [value, setValue] = useState(undefined);
  useEffect(() => {
    if (!path || !db) return undefined;
    setValue(undefined);
    return onValue(
      ref(db, path),
      (snap) => setValue(snap.val()),
      (err) => {
        console.warn('Read failed', path, err.message);
        setValue(null);
      },
    );
  }, [path]);
  return value;
}

// true / false once known. Stays true briefly during tiny blips to avoid flicker.
export function useConnected() {
  const [connected, setConnected] = useState(true);
  useEffect(() => {
    if (!db) return undefined;
    let timer = null;
    const unsub = onValue(ref(db, '.info/connected'), (snap) => {
      clearTimeout(timer);
      if (snap.val() === true) setConnected(true);
      else timer = setTimeout(() => setConnected(false), 1500);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);
  return connected;
}

// Milliseconds to add to Date.now() to get the Firebase server's clock.
let serverOffset = 0;
let offsetSubscribed = false;
export function subscribeServerOffset() {
  if (offsetSubscribed || !db) return;
  offsetSubscribed = true;
  onValue(ref(db, '.info/serverTimeOffset'), (snap) => {
    serverOffset = snap.val() || 0;
  });
}
export function serverNow() {
  return Date.now() + serverOffset;
}

// Re-renders every `interval` ms; returns server-adjusted now.
export function useServerNow(interval = 100, enabled = true) {
  subscribeServerOffset();
  const [now, setNow] = useState(serverNow());
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => setNow(serverNow()), interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
  return now;
}

export function usePrevious(value) {
  const r = useRef();
  useEffect(() => {
    r.current = value;
  });
  return r.current;
}
