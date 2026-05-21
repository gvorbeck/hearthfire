/**
 * Recovery script: the migration wrote characters using dot-notation field paths
 * (characters.0.data..., characters.1.data...) which Firestore stored as a plain
 * object {"0": {...}, "1": {...}} instead of preserving the array shape.
 *
 * This script reconstructs the characters array from the numeric object keys
 * and writes it back as a proper Firestore array, restoring the correct shape.
 *
 * Usage:
 *   npm run recover:dry    — inspect only
 *   npm run recover:write  — commit fixes
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

const serviceKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '');
if (!serviceKeyPath || !fs.existsSync(serviceKeyPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account JSON.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8')) as ServiceAccount;
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const WRITE = process.argv.includes('--write');

const recover = async () => {
  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to commit)'}\n`);

  const snapshot = await db.collection('games').get();
  let docsInspected = 0;
  let docsNeedingRecovery = 0;
  let docsRecovered = 0;

  for (const doc of snapshot.docs) {
    docsInspected++;
    const data = doc.data() as { characters?: unknown };
    const chars = data.characters;

    if (!chars || Array.isArray(chars) || typeof chars !== 'object') continue;

    // characters is a plain object with numeric string keys — convert to array.
    const charMap = chars as Record<string, unknown>;
    const keys = Object.keys(charMap);
    if (keys.length === 0) continue;
    const maxIndex = Math.max(...keys.map(Number));
    const recovered: unknown[] = [];
    for (let i = 0; i <= maxIndex; i++) {
      recovered.push(charMap[String(i)] ?? null);
    }

    docsNeedingRecovery++;
    console.log(`[${doc.id}] corrupt — keys: [${Object.keys(charMap).join(', ')}] → array length ${recovered.length}`);

    if (WRITE) {
      await doc.ref.update({ characters: recovered });
      docsRecovered++;
      console.log(`  → restored`);
    } else {
      console.log(`  → (dry run) would restore array of length ${recovered.length}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Docs inspected:       ${docsInspected}`);
  console.log(`  Docs needing recovery: ${docsNeedingRecovery}`);
  if (WRITE) {
    console.log(`  Docs recovered:       ${docsRecovered}`);
  }
};

recover().catch((err) => {
  console.error('Recovery failed:', err);
  process.exit(1);
});
