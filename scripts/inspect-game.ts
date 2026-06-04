import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

const serviceKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '');
if (!serviceKeyPath || !fs.existsSync(serviceKeyPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account JSON.');
  process.exit(1);
}

const gameId = process.argv[2];
if (!gameId) {
  console.error('Usage: tsx scripts/inspect-game.ts <gameId>');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8')) as ServiceAccount;
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const inspect = async () => {
  const snap = await db.collection('games').doc(gameId).get();
  if (!snap.exists) {
    console.error(`Game ${gameId} not found`);
    process.exit(1);
  }
  const data = snap.data() as Record<string, unknown>;

  const backupPath = path.resolve(`./game-${gameId}-backup.json`);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`\nBackup written: ${backupPath}`);

  console.log('\n=== TOP-LEVEL KEYS ===');
  for (const [k, v] of Object.entries(data)) {
    const t = Array.isArray(v) ? `array(${(v as unknown[]).length})` : typeof v;
    console.log(`  ${k}: ${t}`);
  }

  const steading = data.steading as Record<string, unknown> | undefined;
  if (steading && typeof steading === 'object') {
    console.log('\n=== steading KEYS ===');
    for (const [k, v] of Object.entries(steading)) {
      const t = Array.isArray(v) ? `array(${(v as unknown[]).length})` : typeof v;
      console.log(`  steading.${k}: ${t}`);
    }
    if (Array.isArray(steading.residents)) {
      console.log('\n=== steading.residents ===');
      console.log(JSON.stringify(steading.residents, null, 2));
    }
    if (Array.isArray(steading.neighbors)) {
      console.log('\n=== steading.neighbors ===');
      console.log(JSON.stringify(steading.neighbors, null, 2));
    }
  } else {
    console.log('\n  (no steading key found — checking top-level for NPC-like fields)');
    const npcLike = Object.entries(data).filter(([k]) =>
      k === 'residents' || k === 'neighbors' || k === 'npcs' || k === 'npc'
    );
    if (npcLike.length) {
      console.log('  Found top-level NPC fields:', npcLike.map(([k]) => k).join(', '));
      console.log(JSON.stringify(Object.fromEntries(npcLike), null, 2));
    }
  }
};

inspect().catch((err) => {
  console.error('Inspect failed:', err);
  process.exit(1);
});
