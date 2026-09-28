import * as Crypto from 'expo-crypto';
import { getDb } from './client';
import { seal, open } from './crypto';
import { countWords } from '../lib/dates';

export type Entry = {
  id: string;
  day: string;
  body: string;
  promptId: string | null;
  valence: number | null;
  energy: number | null;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
};

/** Metadata only — what the timeline needs to paint a month without decrypting. */
export type DayMark = {
  day: string;
  valence: number | null;
  energy: number | null;
  wordCount: number;
};

type Row = {
  id: string;
  day: string;
  prompt_id: string | null;
  valence: number | null;
  energy: number | null;
  word_count: number;
  body_cipher: Uint8Array;
  body_nonce: Uint8Array;
  created_at: number;
  updated_at: number;
};

export async function getEntry(day: string): Promise<Entry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM entries WHERE day = ?', day);
  if (!row) return null;

  return {
    id: row.id,
    day: row.day,
    body: await open({ cipher: row.body_cipher, nonce: row.body_nonce }, row.id),
    promptId: row.prompt_id,
    valence: row.valence,
    energy: row.energy,
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * One entry per day, edited in place all day. Called from the composer's
 * debounced autosave, so it has to be cheap and idempotent.
 */
export async function saveEntry(input: {
  day: string;
  body: string;
  promptId: string | null;
  valence: number | null;
  energy: number | null;
}): Promise<string> {
  const db = await getDb();
  const now = Date.now();

  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM entries WHERE day = ?',
    input.day
  );
  const id = existing?.id ?? Crypto.randomUUID();
  const { cipher, nonce } = await seal(input.body, id);
  const words = countWords(input.body);

  if (existing) {
    await db.runAsync(
      `UPDATE entries SET body_cipher = ?, body_nonce = ?, prompt_id = ?, valence = ?,
       energy = ?, word_count = ?, updated_at = ? WHERE id = ?`,
      cipher, nonce, input.promptId, input.valence, input.energy, words, now, id
    );
  } else {
    await db.runAsync(
      `INSERT INTO entries (id, day, created_at, updated_at, prompt_id, valence, energy,
       word_count, body_cipher, body_nonce) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, input.day, now, now, input.promptId, input.valence, input.energy, words, cipher, nonce
    );
  }
  return id;
}

/** Timeline data. Never touches the key. */
export async function getMarks(fromDay: string, toDay: string): Promise<DayMark[]> {
  const db = await getDb();
  return db.getAllAsync<DayMark>(
    `SELECT day, valence, energy, word_count AS wordCount FROM entries
     WHERE day BETWEEN ? AND ? ORDER BY day`,
    fromDay, toDay
  );
}
