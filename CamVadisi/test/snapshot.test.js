import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fixture, makeDb, startServer } from './helpers.js';
import { readSnapshot, snapshotPath, writeSnapshot } from '../server/menu.js';

test('anlik goruntu diske yazilir ve geri okunur', () => {
  const db = makeDb();
  fixture(db);

  assert.equal(writeSnapshot(db), true);
  assert.equal(fs.existsSync(snapshotPath()), true);

  const snapshot = readSnapshot();
  assert.equal(snapshot.categories[0].slug, 'mangal');
  db.close();
});

test('veritabani okunamazsa API son iyi hali sunar', async () => {
  const db = makeDb();
  fixture(db);
  writeSnapshot(db);

  const server = await startServer(db);

  // Masadaki QR'da menu misafirin TEK menusudur: veritabani duserse bile bir sey gormeli.
  db.close();

  const response = await fetch(`${server.base}/api/menu`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-menu-source'), 'snapshot');

  const body = await response.json();
  assert.equal(body.categories[0].products.length > 0, true);

  await server.close();
});

test('anlik goruntu yoksa ve veritabani da yoksa 503 doner', async () => {
  const db = makeDb();
  fs.rmSync(snapshotPath(), { force: true });
  const server = await startServer(db);
  db.close();

  const response = await fetch(`${server.base}/api/menu`);
  assert.equal(response.status, 503);

  await server.close();
});
