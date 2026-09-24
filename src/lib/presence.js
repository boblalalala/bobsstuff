import { onDisconnect, onValue, ref, serverTimestamp, update } from 'firebase/database';
import { db } from './firebase';

// Marks this player online while connected; the server flips it offline if the
// connection drops (phone locks, app switch, signal loss). Re-arms on every reconnect.
export function startPresence(uid) {
  const meRef = ref(db, `players/${uid}`);
  return onValue(ref(db, '.info/connected'), (snap) => {
    if (snap.val() !== true) return;
    onDisconnect(meRef)
      .update({ online: false, lastSeen: serverTimestamp() })
      .then(() => update(meRef, { online: true, lastSeen: serverTimestamp() }))
      .catch(() => {});
  });
}
