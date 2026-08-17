import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firestoreMockModule, firestoreStore } from '@/test/firestoreMock';

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }));
vi.mock('firebase/firestore', () => firestoreMockModule());

// The parser is written to never throw, so the "contents couldn't be read" branch is
// unreachable through real data. Wrap it so one test can force the failure it guards.
const parseState = vi.hoisted(() => ({ throws: false }));
vi.mock('@/lib/gameParsing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/gameParsing')>();
  return {
    ...actual,
    parseGameSession: (raw: Record<string, unknown>, id: string) => {
      if (parseState.throws) throw new Error('forced parse failure');
      return actual.parseGameSession(raw, id);
    },
  };
});

import { EXPORT_FORMAT, EXPORT_VERSION } from '../gameBackupFormat';
import {
  buildEnvelope,
  exportFilename,
  exportGame,
  readImportFile,
  readRawGame,
} from '../gameBackup';

const EXPORTED_AT = new Date('2026-08-17T14:30:00.000Z');

const character = (id: string, name: string) => ({
  id,
  name,
  playbook: 'blessed',
  level: 3,
  data: { str: 1 },
});

const roll = (id: string) => ({
  id,
  characterId: 'char-1',
  createdAt: 1_700_000_000_000,
  stat: 'STR',
  mode: 'normal',
  dice: [3, 4],
  mod: 1,
  total: 8,
});

const gameDoc = (overrides: Record<string, unknown> = {}) => ({
  name: 'The Long Winter',
  createdAt: 1_700_000_000_000,
  characters: [character('char-1', 'Alder')],
  ...overrides,
});

const envelopeFor = (game: Record<string, unknown>, overrides: Record<string, unknown> = {}) => ({
  format: EXPORT_FORMAT,
  version: EXPORT_VERSION,
  exportedAt: EXPORTED_AT.toISOString(),
  gameId: 'long-winter',
  gameName: 'The Long Winter',
  game,
  ...overrides,
});

beforeEach(() => {
  firestoreStore.reset();
  parseState.throws = false;
});

describe('buildEnvelope', () => {
  it('wraps the raw doc without reshaping it', () => {
    const game = gameDoc();
    const envelope = buildEnvelope('long-winter', game, EXPORTED_AT);

    expect(envelope).toEqual({
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      exportedAt: '2026-08-17T14:30:00.000Z',
      gameId: 'long-winter',
      gameName: 'The Long Winter',
      game,
    });
  });

  it('falls back to an empty name when the doc has no usable one', () => {
    expect(buildEnvelope('g1', { name: 42 }, EXPORTED_AT).gameName).toBe('');
    expect(buildEnvelope('g1', {}, EXPORTED_AT).gameName).toBe('');
  });
});

describe('exportFilename', () => {
  it('prefers the game name, slugified, over the id', () => {
    expect(exportFilename('long-winter', 'The Long Winter!', EXPORTED_AT))
      .toBe('hearthfire-the-long-winter-2026-08-17.json');
  });

  it('falls back to the id when the name is empty or unslugifiable', () => {
    expect(exportFilename('long-winter', '', EXPORTED_AT)).toBe('hearthfire-long-winter-2026-08-17.json');
    expect(exportFilename('long-winter', '!!!', EXPORTED_AT)).toBe('hearthfire-long-winter-2026-08-17.json');
  });

  it('falls back to "game" when neither name nor id slugifies', () => {
    expect(exportFilename('!!!', '!!!', EXPORTED_AT)).toBe('hearthfire-game-2026-08-17.json');
  });

  it('tags the file with a suffix when one is given', () => {
    expect(exportFilename('long-winter', 'The Long Winter', EXPORTED_AT, 'before-import'))
      .toBe('hearthfire-the-long-winter-before-import-2026-08-17.json');
  });
});

describe('readRawGame', () => {
  it('returns the document verbatim, including fields the parser would drop', async () => {
    const raw = gameDoc({ someFutureField: { nested: true }, threats: 'Ogres' });
    firestoreStore.set('games/long-winter', raw);

    await expect(readRawGame('long-winter')).resolves.toEqual(raw);
  });

  it('throws when the game does not exist', async () => {
    await expect(readRawGame('missing')).rejects.toThrow('Game not found');
  });
});

describe('exportGame', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let click: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:mock');
    revokeObjectURL = vi.fn();
    // jsdom implements neither of these, and the anchor click would try to navigate.
    // Defined on URL directly rather than via stubGlobal so the cleanup below can remove
    // them again — stubGlobal would restore the same mutated URL object.
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
    click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
    click.mockRestore();
  });

  it('downloads a named file and leaves nothing in the DOM', async () => {
    firestoreStore.set('games/long-winter', gameDoc({ someFutureField: 'kept' }));

    const filename = await exportGame('long-winter');

    expect(filename).toMatch(/^hearthfire-the-long-winter-\d{4}-\d{2}-\d{2}\.json$/);
    expect(click).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(document.querySelector('a')).toBeNull();
  });

  it('round-trips through readImportFile with unknown fields intact', async () => {
    const raw = gameDoc({ someFutureField: { nested: [1, 2] } });
    firestoreStore.set('games/long-winter', raw);

    await exportGame('long-winter');

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const check = readImportFile(await blob.text());

    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.envelope.gameId).toBe('long-winter');
    expect(check.envelope.game).toEqual(raw);
  });

  it('applies the suffix to the safety copy', async () => {
    firestoreStore.set('games/long-winter', gameDoc());

    await expect(exportGame('long-winter', 'before-import'))
      .resolves.toMatch(/^hearthfire-the-long-winter-before-import-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('does not download anything when the game is missing', async () => {
    await expect(exportGame('missing')).rejects.toThrow('Game not found');
    expect(click).not.toHaveBeenCalled();
  });
});

describe('readImportFile — rejections', () => {
  it('rejects invalid JSON', () => {
    const check = readImportFile('{ not json');
    expect(check).toEqual({ ok: false, error: expect.stringContaining("isn't valid JSON") });
  });

  it('rejects a JSON value that is not an object', () => {
    expect(readImportFile('[]').ok).toBe(false);
    expect(readImportFile('"hearthfire-game-export"').ok).toBe(false);
    expect(readImportFile('null').ok).toBe(false);
  });

  it('rejects a file with a missing or wrong format marker', () => {
    const game = gameDoc();
    expect(readImportFile(JSON.stringify({ version: 1, game })).ok).toBe(false);
    const wrong = readImportFile(JSON.stringify(envelopeFor(game, { format: 'something-else' })));
    expect(wrong).toEqual({ ok: false, error: expect.stringContaining("doesn't look like a Hearthfire game backup") });
  });

  it('rejects a non-numeric version', () => {
    const check = readImportFile(JSON.stringify(envelopeFor(gameDoc(), { version: '1' })));
    expect(check).toEqual({ ok: false, error: expect.stringContaining('missing its version number') });
  });

  it('rejects a version newer than this build understands', () => {
    const check = readImportFile(JSON.stringify(envelopeFor(gameDoc(), { version: EXPORT_VERSION + 1 })));
    expect(check).toEqual({ ok: false, error: expect.stringContaining(`format v${EXPORT_VERSION + 1}`) });
  });

  it('accepts an older version', () => {
    const check = readImportFile(JSON.stringify(envelopeFor(gameDoc(), { version: 0 })));
    expect(check.ok).toBe(true);
    if (check.ok) expect(check.envelope.version).toBe(0);
  });

  it('rejects a missing or non-object game payload', () => {
    expect(readImportFile(JSON.stringify(envelopeFor(gameDoc(), { game: undefined }))).ok).toBe(false);
    const arrayGame = readImportFile(JSON.stringify(envelopeFor(gameDoc(), { game: [] })));
    expect(arrayGame).toEqual({ ok: false, error: expect.stringContaining('no game data') });
  });

  it('rejects an array nested inside an array, however deep', () => {
    const shallow = readImportFile(JSON.stringify(envelopeFor({ tags: [['a']] })));
    expect(shallow).toEqual({ ok: false, error: expect.stringContaining('array inside an array') });

    const deep = readImportFile(JSON.stringify(envelopeFor(gameDoc({
      characters: [character('char-1', 'Alder'), { id: 'c2', gear: [{ parts: [[1]] }] }],
    }))));
    expect(deep.ok).toBe(false);
  });

  it('rejects a payload over the Firestore document ceiling', () => {
    const check = readImportFile(JSON.stringify(envelopeFor(gameDoc({ threats: 'x'.repeat(1_000_001) }))));
    expect(check).toEqual({ ok: false, error: expect.stringContaining('KB limit for a single game') });
  });

  it('rejects a payload the app parser cannot read', () => {
    parseState.throws = true;
    const check = readImportFile(JSON.stringify(envelopeFor(gameDoc())));
    expect(check).toEqual({ ok: false, error: expect.stringContaining("couldn't be read") });
  });
});

describe('readImportFile — success', () => {
  it('summarizes the payload for the confirm dialog', () => {
    const game = gameDoc({
      characters: [character('char-1', 'Alder'), character('char-2', 'Bram')],
      diceRolls: [roll('r1'), roll('r2'), roll('r3')],
      steading: { size: 'village' },
    });
    const text = JSON.stringify(envelopeFor(game));

    const check = readImportFile(text);

    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.summary).toEqual({
      characters: 2,
      rolls: 3,
      hasSteading: true,
      bytes: new TextEncoder().encode(JSON.stringify(game)).length,
    });
  });

  it('reports zero counts and no steading for a bare game', () => {
    const check = readImportFile(JSON.stringify(envelopeFor({ name: 'Empty' })));

    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.summary.characters).toBe(0);
    expect(check.summary.rolls).toBe(0);
    expect(check.summary.hasSteading).toBe(false);
  });

  it('does not count malformed characters or rolls the parser drops', () => {
    const check = readImportFile(JSON.stringify(envelopeFor(gameDoc({
      characters: [character('char-1', 'Alder'), { id: 'c2', name: 'No playbook' }],
      diceRolls: [roll('r1'), { id: 'r2' }],
    }))));

    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.summary.characters).toBe(1);
    expect(check.summary.rolls).toBe(1);
  });

  it('carries the raw game through untouched, including unknown fields', () => {
    const game = gameDoc({ someFutureField: { nested: true } });
    const check = readImportFile(JSON.stringify(envelopeFor(game)));

    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.envelope.game).toEqual(game);
  });

  it('defaults missing envelope metadata to empty strings rather than failing', () => {
    const check = readImportFile(JSON.stringify({
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      game: gameDoc(),
    }));

    expect(check.ok).toBe(true);
    if (!check.ok) return;
    expect(check.envelope.exportedAt).toBe('');
    expect(check.envelope.gameId).toBe('');
    expect(check.envelope.gameName).toBe('');
  });
});
