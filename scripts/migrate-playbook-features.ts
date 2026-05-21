/**
 * One-time migration: promote legacy flat playbook fields on CharacterData into
 * the canonical `playbookFeatures` nested object, then delete the flat fields.
 *
 * Safe write pattern: read the full characters array, patch it in JS, write
 * the whole array back in one operation. Never use dot-notation paths to update
 * array elements — Firestore will silently convert the array to a map.
 *
 * Usage:
 *   npm run migrate:dry    — inspect only, no writes
 *   npm run migrate:write  — commit changes to Firestore
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// ---------------------------------------------------------------------------
// Types (inlined — no @/ alias in script context)
// ---------------------------------------------------------------------------

interface PlaybookFeatures {
  sacredPouchIs?: Record<string, string>;
  sacredPouchTrait?: string;
  earthMotherShrine?: string;
  earthMotherOfferings?: Record<string, boolean>;
  foxTallTales?: Record<string, boolean>;
  heavyViolence?: Record<string, boolean>;
  judgeChronicle?: Record<string, boolean>;
  judgeLawkeeper?: Record<string, boolean>;
  lightbearerPraiseTheDay?: Record<string, boolean>;
  marshalWarStories?: Record<string, boolean>;
  marshalWarStoriesAnswers?: Record<string, string>;
  rangerSomethingWicked?: Record<string, boolean>;
  rangerSomethingWickedAnswers?: Record<string, string>;
  seekerCollection?: Record<string, boolean>;
  seekerCollectionAnswers?: Record<string, string>;
  wouldBeHeroFearAnger?: Record<string, boolean>;
  wouldBeHeroFearAngerAnswers?: Record<string, string>;
  initiateHp?: Record<string, string>;
  initiateLoyalty?: Record<string, number>;
  initiatePicks?: Record<string, Record<string, string>>;
  initiateRites?: Record<string, string>;
}

interface CharacterData extends Record<string, unknown> {
  playbookFeatures?: Record<string, unknown>;
}

interface Character {
  data?: CharacterData;
}

const LEGACY_KEYS: (keyof PlaybookFeatures)[] = [
  'sacredPouchIs',
  'sacredPouchTrait',
  'earthMotherShrine',
  'earthMotherOfferings',
  'foxTallTales',
  'heavyViolence',
  'judgeChronicle',
  'judgeLawkeeper',
  'lightbearerPraiseTheDay',
  'marshalWarStories',
  'marshalWarStoriesAnswers',
  'rangerSomethingWicked',
  'rangerSomethingWickedAnswers',
  'seekerCollection',
  'seekerCollectionAnswers',
  'wouldBeHeroFearAnger',
  'wouldBeHeroFearAngerAnswers',
  'initiateHp',
  'initiateLoyalty',
  'initiatePicks',
  'initiateRites',
];

// ---------------------------------------------------------------------------
// Admin SDK init
// ---------------------------------------------------------------------------

const serviceKeyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '');
if (!serviceKeyPath || !fs.existsSync(serviceKeyPath)) {
  console.error(
    'Set GOOGLE_APPLICATION_CREDENTIALS to the path of your Firebase service account JSON.\n' +
    'Example: GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx ...',
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8')) as ServiceAccount;
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const WRITE = process.argv.includes('--write');

// ---------------------------------------------------------------------------
// Per-character patch (pure JS — no Firestore paths)
// ---------------------------------------------------------------------------

const migrateCharacterData = (data: CharacterData): CharacterData | null => {
  const legacyPresent = LEGACY_KEYS.filter((k) => data[k] !== undefined);
  if (legacyPresent.length === 0) return null;

  // Nested wins over flat (matches resolvePlaybookFeatures behaviour).
  const merged: Record<string, unknown> = { ...(data.playbookFeatures ?? {}) };
  for (const key of legacyPresent) {
    if (merged[key] === undefined) merged[key] = data[key];
  }

  // Build a clean copy of data: playbookFeatures updated, flat keys removed.
  const patched: Record<string, unknown> = { ...data, playbookFeatures: merged };
  for (const key of legacyPresent) {
    delete patched[key];
  }
  return patched as CharacterData;
};

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

const migrate = async () => {
  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to commit)'}\n`);

  const snapshot = await db.collection('games').get();
  let docsInspected = 0;
  let docsNeedingUpdate = 0;
  let docsUpdated = 0;

  for (const doc of snapshot.docs) {
    docsInspected++;
    const game = doc.data() as { characters?: unknown };

    if (!Array.isArray(game.characters)) continue;
    const characters = game.characters as Character[];

    const affectedIndices: number[] = [];
    const updatedCharacters = characters.map((char, i) => {
      if (!char?.data) return char;
      const patched = migrateCharacterData(char.data);
      if (!patched) return char;
      affectedIndices.push(i);
      return { ...char, data: patched };
    });

    if (affectedIndices.length === 0) continue;

    docsNeedingUpdate++;
    console.log(`[${doc.id}] needs migration`);

    if (WRITE) {
      // Write the full array back — never use dot-notation paths on array elements.
      await doc.ref.update({ characters: updatedCharacters });
      docsUpdated++;
      console.log(`  → updated`);
    } else {
      console.log(`  → (dry run) would patch: ${affectedIndices.map((i) => `characters[${i}]`).join(', ')}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Docs inspected:       ${docsInspected}`);
  console.log(`  Docs needing update:  ${docsNeedingUpdate}`);
  if (WRITE) {
    console.log(`  Docs updated:         ${docsUpdated}`);
  }
};

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
