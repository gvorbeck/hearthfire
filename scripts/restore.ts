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

const restore = async () => {
  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to commit)'}`);
  console.log(`Backup file: ${backupPath}\n`);

  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8')) as Record<string, unknown>;
  const ids = Object.keys(data);
  console.log(`Found ${ids.length} documents in backup.\n`);

  // Before overwriting anything, snapshot the current live state of exactly the
  // docs we're about to clobber. A stale or partial backup file would otherwise
  // replace live data with no undo path.
  if (WRITE) {
    const safety: Record<string, unknown> = {};
    for (const id of ids) {
      const snap = await db.collection('games').doc(id).get();
      if (snap.exists) safety[id] = snap.data();
    }
    const safetyPath = path.resolve(`./firestore-pre-restore-${Date.now()}.json`);
    fs.writeFileSync(safetyPath, JSON.stringify(safety, null, 2));
    console.log(`Safety snapshot of ${Object.keys(safety).length} live documents written to ${safetyPath}\n`);
  }

  for (const id of ids) {
    if (WRITE) {
      await db.collection('games').doc(id).set(data[id] as Record<string, unknown>);
      console.log(`  restored: ${id}`);
    } else {
      console.log(`  (dry run) would restore: ${id}`);
    }
  }

  console.log(`\nDone. ${ids.length} documents ${WRITE ? 'restored' : 'would be restored'}.`);
};

restore().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
