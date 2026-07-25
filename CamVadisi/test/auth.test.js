import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, login, makeDb, startServer } from './helpers.js';

test('dogru sifre httpOnly cerez birakir', async () => {
  const db = makeDb();
  const server = await startServer(db);

  const { response, cookie } = await login(server.base);
  assert.equal(response.status, 200);
  assert.match(cookie, /cv_token=/);

  const raw = response.headers.getSetCookie().join(';');
  assert.match(raw, /HttpOnly/i, 'cerez JavaScript tarafindan okunamamali');
  assert.match(raw, /SameSite=Lax/i);

  await server.close();
  db.close();
});

test('yanlis sifre 401 doner', async () => {
  const db = makeDb();
  const server = await startServer(db);
  const { response } = await login(server.base, 'yanlis');
  assert.equal(response.status, 401);
  await server.close();
  db.close();
});

test('bes basarisiz denemeden sonra IP kilitlenir', async () => {
  const db = makeDb();
  const server = await startServer(db);

  for (let i = 0; i < 5; i += 1) {
    const { response } = await login(server.base, 'yanlis');
    assert.equal(response.status, 401, `${i + 1}. deneme 401 olmali`);
  }

  // Kilit acikken DOGRU sifre bile kabul edilmemeli
  const { response } = await login(server.base);
  assert.equal(response.status, 429);
  const body = await response.json();
  assert.match(body.error, /dakika/);

  await server.close();
  db.close();
});

test('korumali uc nokta cerezsiz 401 doner', async () => {
  const db = makeDb();
  fixture(db);
  const server = await startServer(db);

  const response = await fetch(`${server.base}/api/admin/menu`);
  assert.equal(response.status, 401);

  await server.close();
  db.close();
});

test('gecerli cerezle korumali uc nokta acilir', async () => {
  const db = makeDb();
  fixture(db);
  const server = await startServer(db);

  const { cookie } = await login(server.base);
  const response = await fetch(`${server.base}/api/admin/menu`, { headers: { cookie } });
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.categories.length, 2, 'panel gizli kategoriyi de gormeli');

  await server.close();
  db.close();
});
