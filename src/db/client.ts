import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS entries (
     id          TEXT PRIMARY KEY NOT NULL,
     day         TEXT NOT NULL UNIQUE,
     created_at  INTEGER NOT NULL,
     updated_at  INTEGER NOT NULL,
     prompt_id   TEXT,
     valence     INTEGER,
     energy      INTEGER,
     word_count  INTEGER NOT NULL DEFAULT 0,
     body_cipher BLOB NOT NULL,
     body_nonce  BLOB NOT NULL
   );
   CREATE INDEX IF NOT EXISTS entries_day ON entries(day);

   CREATE TABLE IF NOT EXISTS reflections (
     id          TEXT PRIMARY KEY NOT NULL,
     entry_id    TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
     body_cipher BLOB NOT NULL,
     body_nonce  BLOB NOT NULL,
     model       TEXT,
     created_at  INTEGER NOT NULL
   );

   CREATE TABLE IF NOT EXISTS weekly_summaries (
     id          TEXT PRIMARY KEY NOT NULL,
     week_of     TEXT NOT NULL UNIQUE,
     body_cipher BLOB NOT NULL,
     body_nonce  BLOB NOT NULL,
     entry_count INTEGER NOT NULL,
     created_at  INTEGER NOT NULL
   );

   /* No content is ever stored here — only that the support card was shown. */
   CREATE TABLE IF NOT EXISTS safety_events (
     id         TEXT PRIMARY KEY NOT NULL,
     day        TEXT NOT NULL,
     created_at INTEGER NOT NULL
   );

   CREATE TABLE IF NOT EXISTS settings (
     key   TEXT PRIMARY KEY NOT NULL,
     value TEXT
   );`,
];

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('longhand.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const { user_version: version } = (await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  )) ?? { user_version: 0 };

  for (let i = version; i < MIGRATIONS.length; i++) {
    await db.execAsync(MIGRATIONS[i]);
  }
  if (version < MIGRATIONS.length) {
    await db.execAsync(`PRAGMA user_version = ${MIGRATIONS.length}`);
  }
  return db;
}
