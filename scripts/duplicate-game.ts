import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

const sourceId = process.argv[2];
if (!sourceId) {
  console.error('Usage: tsx scripts/duplicate-game.ts <sourceGameId> [newGameId]');
  process.exit(1);
}

const serviceKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '');
if (!serviceKeyPath || !fs.existsSync(serviceKeyPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account JSON.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8')) as ServiceAccount;
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const duplicate = async () => {
  const srcRef = db.collection('games').doc(sourceId);
  const snap = await srcRef.get();
  if (!snap.exists) {
    console.error(`No game found with ID: ${sourceId}`);
    process.exit(1);
  }

  const data = snap.data() as Record<string, unknown>;
  console.log(`Source game: ${data['name'] ?? '(unnamed)'} (${sourceId})`);

  // If a target ID was supplied, use it; otherwise let Firestore mint a new one.
  const destRef = process.argv[3]
    ? db.collection('games').doc(process.argv[3])
    : db.collection('games').doc();

  // Refuse to clobber an existing doc — this is a copy, not an overwrite.
  const existing = await destRef.get();
  if (existing.exists) {
    console.error(`Target game ${destRef.id} already exists — refusing to overwrite.`);
    process.exit(1);
  }

  const copy = { ...data, name: `${data['name'] ?? 'Stonetop Game'} (copy)` };
  await destRef.set(copy);

  console.log(`\nDuplicated to game ${destRef.id}`);
  console.log(`Open at: /game/${destRef.id}`);
};

duplicate().catch((err) => {
  console.error('Duplicate failed:', err);
  process.exit(1);
});
