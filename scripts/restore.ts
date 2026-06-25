import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

const serviceKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '');
if (!serviceKeyPath || !fs.existsSync(serviceKeyPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account JSON.');
  process.exit(1);
}

const backupFile = process.argv.find((a) => a.endsWith('.json'));
if (!backupFile) {
  console.error('Usage: npm run restore -- ./firestore-backup-<timestamp>.json');
  process.exit(1);
}

const backupPath = path.resolve(backupFile);
if (!fs.existsSync(backupPath)) {
  console.error(`File not found: ${backupPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8')) as ServiceAccount;
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const WRITE = process.argv.includes('--write');

// ---------------------------------------------------------------------------
// Checkpoint — records ids already restored so an interrupted run can resume.
// Keyed to the backup file so resuming a different backup starts clean.
// ---------------------------------------------------------------------------

const CHECKPOINT_PATH = path.resolve(`${backupPath}.restore-checkpoint.json`);

const loadCheckpoint = (): Set<string> => {
  if (!fs.existsSync(CHECKPOINT_PATH)) return new Set();
  try {
    const ids = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8')) as string[];
    return new Set(ids);
  } catch {
    console.warn(`  ⚠ checkpoint at ${CHECKPOINT_PATH} is unreadable — ignoring it.`);
    return new Set();
  }
};

const saveCheckpoint = (done: Set<string>): void => {
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify([...done], null, 2));
};

const clearCheckpoint = (): void => {
  if (fs.existsSync(CHECKPOINT_PATH)) fs.rmSync(CHECKPOINT_PATH);
};

const restore = async () => {
  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to commit)'}`);
  console.log(`Backup file: ${backupPath}\n`);

  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8')) as Record<string, unknown>;
  const ids = Object.keys(data);
  console.log(`Found ${ids.length} documents in backup.\n`);

  const done = WRITE ? loadCheckpoint() : new Set<string>();
  if (WRITE && done.size > 0) {
    console.log(`Resuming: ${done.size} doc(s) already restored in a prior run will be skipped.\n`);
  }
  // Only the docs we haven't already overwritten still hold their original live
  // state worth snapshotting; resumed ids already hold restored data.
  const pending = ids.filter((id) => !done.has(id));

  // Before overwriting anything, snapshot the current live state of exactly the
  // docs we're about to clobber. A stale or partial backup file would otherwise
  // replace live data with no undo path.
  if (WRITE) {
    const safety: Record<string, unknown> = {};
    for (const id of pending) {
      const snap = await db.collection('games').doc(id).get();
      if (snap.exists) safety[id] = snap.data();
    }
    const safetyPath = path.resolve(`./firestore-pre-restore-${Date.now()}.json`);
    fs.writeFileSync(safetyPath, JSON.stringify(safety, null, 2));
    console.log(`Safety snapshot of ${Object.keys(safety).length} live documents written to ${safetyPath}\n`);
  }

  let restored = 0;
  for (const id of ids) {
    if (WRITE) {
      if (done.has(id)) {
        console.log(`  already restored (checkpoint) — skipping: ${id}`);
        continue;
      }
      await db.collection('games').doc(id).set(data[id] as Record<string, unknown>);
      done.add(id);
      saveCheckpoint(done);
      restored++;
      console.log(`  restored: ${id}`);
    } else {
      console.log(`  (dry run) would restore: ${id}`);
    }
  }

  // Clean run — drop the checkpoint so a later restore of this file starts fresh.
  if (WRITE) clearCheckpoint();

  console.log(`\nDone. ${WRITE ? `${restored} documents restored` : `${ids.length} documents would be restored`}.`);
};

restore().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
