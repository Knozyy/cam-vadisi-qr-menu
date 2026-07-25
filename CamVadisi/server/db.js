import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Varsayilan konum Kovan klasor duzeni: <proje>/CamVadisiDatabase/data.db */
export function defaultDbPath() {
  return process.env.DB_PATH || path.join(here, '..', '..', 'CamVadisiDatabase', 'data.db');
}

export function openDb(dbPath = defaultDbPath()) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  if (dbPath !== ':memory:') db.pragma('journal_mode = WAL');
  db.exec(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'));
  return db;
}

export function getSetting(db, key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function setSetting(db, key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).run(key, String(value ?? ''));
}

/** Bir tablonun sonundaki sira numarasi - yeni kayit hep sona eklenir. */
export function nextSortOrder(db, table, whereColumn, whereValue) {
  const sql = whereColumn
    ? `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM ${table} WHERE ${whereColumn} = ?`
    : `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM ${table}`;
  const stmt = db.prepare(sql);
  return (whereColumn ? stmt.get(whereValue) : stmt.get()).next;
}
