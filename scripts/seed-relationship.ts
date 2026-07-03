import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// One-off helper to seed a reciprocal (two-way) relationship between two NPCs so
// the Relationship Map's overlapping-label fix (#235) can be verified by hand.
//
// preferRest forces the Admin SDK onto the HTTPS/REST transport instead of gRPC.
// gRPC ignores NODE_EXTRA_CA_CERTS, so behind a TLS-inspecting proxy (Zscaler)
// its connection fails with "unable to get local issuer certificate"; the REST
// transport honors the env var and gets through.
const serviceKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '');
if (!serviceKeyPath || !fs.existsSync(serviceKeyPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account JSON.');
  process.exit(1);
}

const gameId = process.argv[2];
if (!gameId) {
  console.error('Usage: tsx scripts/seed-relationship.ts <gameId> [--write]');
  process.exit(1);
}
const write = process.argv.includes('--write');

const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8')) as ServiceAccount;
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
db.settings({ preferRest: true });

// Stable ids so re-running is idempotent — a second run rewrites the same two
// NPCs rather than piling on duplicates.
const ADA_ID = 'seed-npc-ada';
const BRAM_ID = 'seed-npc-bram';
const ADA_REL_ID = 'seed-rel-ada-bram';
const BRAM_REL_ID = 'seed-rel-bram-ada';

const seed = async () => {
  const ref = db.collection('games').doc(gameId);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`Game ${gameId} not found`);
    process.exit(1);
  }
  const data = snap.data() as Record<string, unknown>;

  const backupPath = path.resolve(`./game-${gameId}-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`Backup written: ${backupPath}`);

  const steading = (data.steading as Record<string, unknown> | undefined) ?? {};
  const existing = Array.isArray(steading.residents)
    ? (steading.residents as Record<string, unknown>[])
    : [];

  // Two NPCs pointing at each other: different relationship labels so the fix is
  // obvious — before it, "Rival" and "Friend" would stack on the same midpoint.
  const ada = {
    id: ADA_ID,
    name: 'Ada',
    relationships: [{ id: ADA_REL_ID, type: 'Rival', targetId: BRAM_ID, targetKind: 'resident' }],
  };
  const bram = {
    id: BRAM_ID,
    name: 'Bram',
    relationships: [{ id: BRAM_REL_ID, type: 'Friend', targetId: ADA_ID, targetKind: 'resident' }],
  };

  // Drop any prior seed run, then append fresh — keeps every other resident as-is.
  const residents = [
    ...existing.filter((r) => r.id !== ADA_ID && r.id !== BRAM_ID),
    ada,
    bram,
  ];
  const nextSteading = { ...steading, residents };

  if (!write) {
    console.log('\n(dry run — pass --write to apply) Resulting steading.residents:');
    console.log(JSON.stringify(residents, null, 2));
    return;
  }

  // Rewrite the whole steading object, never dot-notation into the array — a
  // path like `steading.residents.0` would be read as a literal field name and
  // corrupt the doc.
  await ref.update({ steading: nextSteading });
  console.log(`\nWrote reciprocal relationship (Ada⇄Bram) to game ${gameId}.`);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
