/**
 * Recovery script: the migration wrote characters using dot-notation field paths
 * (characters.0.data..., characters.1.data...) which Firestore stored as a plain
 * object {"0": {...}, "1": {...}} instead of preserving the array shape.
 *
 * This script reconstructs the characters array from the numeric object keys
 * and writes it back as a proper Firestore array, restoring the correct shape.
 * It operates on a single targeted game to avoid mutating every doc at once.
 *
 * Usage:
 *   npm run recover:dry -- <gameId>    — inspect only
 *   npm run recover:write -- <gameId>  — commit fix
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

const confirm = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
};

const serviceKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '');
if (!serviceKeyPath || !fs.existsSync(serviceKeyPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account JSON.');
  process.exit(1);
}

const WRITE = process.argv.includes('--write');
const gameId = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
if (!gameId) {
  console.error('Usage: npm run recover:dry -- <gameId>  (add recover:write to commit)');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8')) as ServiceAccount;
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const recover = async () => {
  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to commit)'}`);
  console.log(`Game: ${gameId}\n`);

  const doc = await db.collection('games').doc(gameId).get();
  if (!doc.exists) {
    console.error(`Game ${gameId} not found`);
    process.exit(1);
  }

  const data = doc.data() as { characters?: unknown };
  const chars = data.characters;

  if (!chars || Array.isArray(chars) || typeof chars !== 'object') {
    console.log(`[${doc.id}] characters is not a corrupt object — nothing to recover.`);
    return;
  }

  // characters is a plain object with numeric string keys — convert to array.
  const charMap = chars as Record<string, unknown>;
  const keys = Object.keys(charMap);
  if (keys.length === 0) {
    console.log(`[${doc.id}] characters object is empty — nothing to recover.`);
    return;
  }

  // Only keys that are non-negative integers are real array indices. A stray
  // non-numeric key would make Number() return NaN and corrupt maxIndex, so
  // ignore it and surface it rather than letting it poison the rebuild.
  const indexKeys = keys.filter((k) => /^\d+$/.test(k));
  const ignoredKeys = keys.filter((k) => !/^\d+$/.test(k));
  if (ignoredKeys.length > 0) {
    console.warn(`  ⚠ WARNING: ignoring non-index keys [${ignoredKeys.join(', ')}] — their values will not be recovered.`);
  }
  if (indexKeys.length === 0) {
    console.log(`[${doc.id}] no numeric index keys — nothing to recover.`);
    return;
  }
  const maxIndex = Math.max(...indexKeys.map(Number));
  const recovered: unknown[] = [];
  const gaps: number[] = [];
  for (let i = 0; i <= maxIndex; i++) {
    if (charMap[String(i)] === undefined) gaps.push(i);
    recovered.push(charMap[String(i)] ?? null);
  }

  console.log(`[${doc.id}] corrupt — index keys: [${indexKeys.join(', ')}] → array length ${recovered.length}`);

  // A gap means an index between 0 and maxIndex has no character. The rebuilt
  // array gets a null there, and parseCharacters silently drops it on load —
  // so writing this recovery would lose a character without warning.
  if (gaps.length > 0) {
    console.warn(`  ⚠ WARNING: missing indices [${gaps.join(', ')}] — these become null and will be dropped when the game loads.`);
  }

  if (WRITE) {
    const lossy = gaps.length + ignoredKeys.length;
    if (lossy > 0) {
      const ok = await confirm(`  Write a recovery that drops ${lossy} entr${lossy === 1 ? 'y' : 'ies'}? [y/N] `);
      if (!ok) {
        console.log('  → aborted (data loss not confirmed)');
        return;
      }
    }
    await doc.ref.update({ characters: recovered });
    console.log(`  → restored`);
  } else {
    console.log(`  → (dry run) would restore array of length ${recovered.length}`);
  }

  console.log(`\nDone.`);
};

recover().catch((err) => {
  console.error('Recovery failed:', err);
  process.exit(1);
});
