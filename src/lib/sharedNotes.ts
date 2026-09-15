import { generateId } from './id';

// Identifies this browser tab as a notes-lock holder. There's no auth, so a lock can only say
// "this tab", not "this person" — two tabs open by the same player are two different typists.
export const NOTES_CLIENT_ID = generateId();

// The lock is held until this long after the typist's last change; the save happens at the same moment.
export const NOTES_IDLE_MS = 10_000;

// While typing, the holder re-stamps the lock at most this often so other tabs know it's still alive.
export const NOTES_HEARTBEAT_MS = 4_000;

// A lock that hasn't been re-stamped for this long is treated as abandoned (tab closed, connection
// dropped). Comfortably more than one heartbeat, so a live typist is never mistaken for a dead one.
export const NOTES_STALE_MS = 15_000;
