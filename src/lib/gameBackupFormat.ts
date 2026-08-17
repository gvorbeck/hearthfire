// The backup file's format contract, kept in its own module with no imports so both the
// app (src/lib/gameBackup.ts) and the Node restore script (scripts/restore.ts) can read
// the same values. Anything that pulls in firebase/ or import.meta.env can't be imported
// from scripts/, which is why these two don't live alongside the rest of the export code.

// Marks a file as ours. Import refuses anything without this string rather than writing
// an arbitrary JSON blob straight into the game doc.
export const EXPORT_FORMAT = 'hearthfire-game-export';

// Bump only on a breaking change to the envelope. Import accepts this version and older;
// a file claiming a newer one was written by a build that knows something this one
// doesn't, so we refuse it rather than guess at the shape.
export const EXPORT_VERSION = 1;
