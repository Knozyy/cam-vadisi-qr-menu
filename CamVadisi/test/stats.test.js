import assert from 'node:assert/strict';
import test from 'node:test';
import { login, makeDb, startServer } from './helpers.js';

/**
 * Sayac tekillestirmesi ISTEMCI tarafinda (localStorage, 4 saatlik pencere) yapilir;
 * sunucu her istegi sayar. Buradaki testler sunucu sozlesmesini korur: gecerli tur
 * kontrolu, sayacin birikmesi ve sifirlama.
 */

test('ayni olay iki kez gelirse sunucu ikisini de sayar (tekillestirme istemcide)', async () => {
  const db = makeDb();
  const server = await startServer(db);

  for (let i = 0; i < 3; i += 1) {
    const response = await fetch(`${server.base}/api/stats/view`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'open', value: '' }),
    });
    assert.equal(response.status, 204);
  }

  const row = db.prepare("SELECT count FROM visit_stats WHERE kind='open'").get();
  assert.equal(row.count, 3, 'sunucu gelen her istegi sayar');

  await server.close();
  db.close();
});

test('kategori sayaci kaydedilir', async () => {
  const db = makeDb();
  const server = await startServer(db);

  await fetch(`${server.base}/api/stats/view`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'category', value: 'mangal' }),
  });

  const row = db.prepare("SELECT count FROM visit_stats WHERE kind='category' AND value='mangal'").get();
  assert.equal(row.count, 1);

  await server.close();
  db.close();
});

test('deger 40 karakterde kirpilir - sisirme girisimi engellenir', async () => {
  const db = makeDb();
  const server = await startServer(db);

  await fetch(`${server.base}/api/stats/view`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'category', value: 'x'.repeat(500) }),
  });

  const row = db.prepare("SELECT value FROM visit_stats WHERE kind='category'").get();
  assert.equal(row.value.length, 40);

  await server.close();
  db.close();
});

test('sifirlama tum sayaclari siler, menu verisine dokunmaz', async () => {
  const db = makeDb();
  db.prepare(
    `INSERT INTO categories (slug, sort_order, name) VALUES ('mangal', 0, 'Mangal')`,
  ).run();
  const server = await startServer(db);

  await fetch(`${server.base}/api/stats/view`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'open', value: '' }),
  });

  const { cookie } = await login(server.base);
  const response = await fetch(`${server.base}/api/admin/stats`, { method: 'DELETE', headers: { cookie } });
  assert.equal(response.status, 200);

  assert.equal(db.prepare('SELECT COUNT(*) AS c FROM visit_stats').get().c, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS c FROM categories').get().c, 1, 'menü verisi korunmalı');

  await server.close();
  db.close();
});

test('sifirlama giris gerektirir', async () => {
  const db = makeDb();
  const server = await startServer(db);

  const response = await fetch(`${server.base}/api/admin/stats`, { method: 'DELETE' });
  assert.equal(response.status, 401);

  await server.close();
  db.close();
});
