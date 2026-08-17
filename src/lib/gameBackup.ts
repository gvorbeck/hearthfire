import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAMES_COLLECTION } from '@/lib/constants';
import { slugifyGameId } from '@/lib/game';
import { parseGameSession } from '@/lib/gameParsing';
import { isNumber, isPlainObject, isString } from '@/lib/typeGuards';
import { EXPORT_FORMAT, EXPORT_VERSION } from '@/lib/gameBackupFormat';

// Firestore's per-document ceiling is 1 MiB including field-name and encoding overhead.
// The JSON byte length is a close proxy; the margin absorbs the difference so an oversized
// import fails here with an explanation instead of as an opaque `invalid-argument` from
// the server (see INVALID_WRITE_MESSAGE for why that code is ambiguous).
const MAX_PAYLOAD_BYTES = 1_000_000;

export interface GameExportEnvelope {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  gameId: string;
  gameName: string;
  // The game document exactly as Firestore stores it — NOT a parsed GameSession.
  // parseGameSession drops every field it doesn't recognize, so exporting the parsed
  // shape would quietly discard anything written by a newer build or a migration script
  // and hand the player a lossy file labelled "backup".
  game: Record<string, unknown>;
}

export interface ImportSummary {
  characters: number;
  rolls: number;
  hasSteading: boolean;
  bytes: number;
}

export type ImportCheck =
  | { ok: true; envelope: GameExportEnvelope; summary: ImportSummary }
  | { ok: false; error: string };

// Firestore rejects an array whose elements are themselves arrays. Nothing in our schema
// produces one, but a hand-edited file can — and the resulting `invalid-argument` maps to
// a message about document size, which would send the player hunting for the wrong problem.
const hasNestedArray = (v: unknown): boolean => {
  if (Array.isArray(v)) return v.some((item) => Array.isArray(item) || hasNestedArray(item));
  if (isPlainObject(v)) return Object.values(v).some(hasNestedArray);
  return false;
};

// Read the game document unparsed. Every other read in the app goes through
// parseGameSession; this one deliberately doesn't, because a backup has to carry the
// fields the current build doesn't know about too.
export const readRawGame = async (gameId: string): Promise<Record<string, unknown>> => {
  const snap = await getDoc(doc(db, GAMES_COLLECTION, gameId));
  if (!snap.exists()) throw new Error('Game not found — it may have been deleted.');
  return snap.data() as Record<string, unknown>;
};

export const buildEnvelope = (
  gameId: string,
  game: Record<string, unknown>,
  exportedAt = new Date(),
): GameExportEnvelope => ({
  format: EXPORT_FORMAT,
  version: EXPORT_VERSION,
  exportedAt: exportedAt.toISOString(),
  gameId,
  gameName: isString(game.name) ? game.name : '',
  game,
});

// `hearthfire-<slug>-<YYYY-MM-DD>.json`, preferring the game's name over its id so a folder
// of backups is readable at a glance. `suffix` distinguishes the pre-import safety copy.
export const exportFilename = (
  gameId: string,
  gameName: string,
  exportedAt = new Date(),
  suffix?: string,
): string => {
  const slug = slugifyGameId(gameName) || slugifyGameId(gameId) || 'game';
  const date = exportedAt.toISOString().slice(0, 10);
  return `hearthfire-${slug}${suffix ? `-${suffix}` : ''}-${date}.json`;
};

export const downloadJson = (filename: string, payload: unknown): void => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking in the same tick can cancel the download in some browsers; one task is enough.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// Read the live doc, wrap it, and hand the browser a file. Returns the filename so the
// caller can name it in a toast. `suffix` tags the automatic pre-import safety copy.
export const exportGame = async (gameId: string, suffix?: string): Promise<string> => {
  const game = await readRawGame(gameId);
  const exportedAt = new Date();
  const envelope = buildEnvelope(gameId, game, exportedAt);
  const filename = exportFilename(gameId, envelope.gameName, exportedAt, suffix);
  downloadJson(filename, envelope);
  return filename;
};

// Validate an uploaded file before it gets anywhere near a write. Every rejection returns a
// line the player can act on, because the alternative — a half-written game doc — isn't
// recoverable from the UI.
export const readImportFile = (text: string): ImportCheck => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON. Choose a backup file downloaded from Hearthfire." };
  }

  if (!isPlainObject(raw) || raw.format !== EXPORT_FORMAT) {
    return { ok: false, error: "That doesn't look like a Hearthfire game backup. Choose a file downloaded with Export." };
  }

  if (!isNumber(raw.version)) {
    return { ok: false, error: "That backup is missing its version number and can't be read safely." };
  }

  if (raw.version > EXPORT_VERSION) {
    return { ok: false, error: `That backup was made by a newer version of Hearthfire (format v${raw.version}). Reload the page to update, then try again.` };
  }

  if (!isPlainObject(raw.game)) {
    return { ok: false, error: "That backup has no game data in it." };
  }

  const game = raw.game;

  if (hasNestedArray(game)) {
    return { ok: false, error: "That backup contains a value the database can't store (an array inside an array). It may have been edited by hand." };
  }

  const bytes = new TextEncoder().encode(JSON.stringify(game)).length;
  if (bytes > MAX_PAYLOAD_BYTES) {
    return { ok: false, error: `That backup is ${Math.round(bytes / 1024)} KB, over the ${Math.round(MAX_PAYLOAD_BYTES / 1024)} KB limit for a single game. Trim some content from it and try again.` };
  }

  // Doubles as a smoke test and as the source of the confirm dialog's counts: if the app's
  // own parser can't read the payload, importing it would produce a game that won't load.
  let summary: ImportSummary;
  try {
    const parsed = parseGameSession(game, isString(raw.gameId) ? raw.gameId : '');
    summary = {
      characters: parsed.characters.length,
      rolls: parsed.diceRolls?.length ?? 0,
      hasSteading: isPlainObject(game.steading),
      bytes,
    };
  } catch {
    return { ok: false, error: "That backup's contents couldn't be read. The file may be damaged." };
  }

  return {
    ok: true,
    envelope: {
      format: EXPORT_FORMAT,
      version: raw.version,
      exportedAt: isString(raw.exportedAt) ? raw.exportedAt : '',
      gameId: isString(raw.gameId) ? raw.gameId : '',
      gameName: isString(raw.gameName) ? raw.gameName : '',
      game,
    },
    summary,
  };
};
