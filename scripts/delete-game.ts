import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

const gameId = process.argv[2];
if (!gameId) {
  console.error('Usage: npx ts-node scripts/delete-game.ts <gameId>');
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

const confirm = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
};

const deleteGame = async () => {
  const ref = db.collection('games').doc(gameId);
  const snap = await ref.get();

  if (!snap.exists) {
    console.error(`No game found with ID: ${gameId}`);
    process.exit(1);
  }

  const data = snap.data() as Record<string, unknown>;
  console.log(`Found game: ${data['name'] ?? '(unnamed)'} (${gameId})`);

  const ok = await confirm(`Delete this game? This cannot be undone. [y/N] `);
  if (!ok) {
    console.log('Aborted.');
    process.exit(0);
  }

  await ref.delete();
  console.log(`Deleted game ${gameId}.`);
};

deleteGame().catch((err) => {
  console.error('Delete failed:', err);
  process.exit(1);
});
