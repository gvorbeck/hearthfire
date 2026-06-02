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

const backup = async () => {
  const snapshot = await db.collection('games').get();
  const data: Record<string, unknown> = {};
  for (const doc of snapshot.docs) {
    data[doc.id] = doc.data();
  }
  const outPath = path.resolve(`./firestore-backup-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Backed up ${snapshot.size} documents to ${outPath}`);
};

backup().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
