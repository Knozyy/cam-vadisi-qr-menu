import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, login, makeDb, startServer } from './helpers.js';
import { clampRegion } from '../server/images.js';

async function authed(base) {
  const { cookie } = await login(base);
  return (path, options = {}) => fetch(`${base}${path}`, {
    ...options,
    headers: { cookie, 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
}

// ------------------------------------------------------------- kirpma sinirlari

test('kirpma alani goruntu sinirlarina sikistirilir', () => {
  // Panel 3168x1344 goruntude tasan bir alan gonderirse sharp `extract` hata atardi.
  const region = clampRegion({ left: 2500, top: 100, width: 1344, height: 1344 }, 3168, 1344);
  assert.equal(region.left + region.width <= 3168, true);
  assert.equal(region.top + region.height <= 1344, true);
});

test('negatif kirpma koordinati sifira cekilir', () => {
  const region = clampRegion({ left: -50, top: -20, width: 200, height: 200 }, 1000, 800);
  assert.equal(region.left, 0);
  assert.equal(region.top, 0);
});

test('kullanilamaz kirpma alani null doner - kirpma atlanir', () => {
  assert.equal(clampRegion({ left: 0, top: 0, width: 0, height: 0 }, 100, 100), null);
  assert.equal(clampRegion({ left: 0, top: 0, width: 10, height: 10 }, 0, 0), null);
});

// --------------------------------------------------------------- fiyat dogrulama

test('gecersiz varyant fiyati 400 doner (eskiden 500 uretiyordu)', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({
      categoryId: ids.categoryId,
      name: { tr: 'Deneme' },
      variants: [{ name: { tr: 'Yarım' }, price: 'abc' }],
    }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /geçerli bir fiyat/i);

  await server.close();
  db.close();
});

test('negatif varyant fiyati reddedilir', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({
      categoryId: ids.categoryId,
      name: { tr: 'Deneme' },
      variants: [{ name: { tr: 'Yarım' }, price: -100 }],
    }),
  });
  assert.equal(response.status, 400);

  await server.close();
  db.close();
});

test('gecersiz temel fiyat 400 doner', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({ categoryId: ids.categoryId, name: { tr: 'Deneme' }, basePrice: 'bes lira' }),
  });
  assert.equal(response.status, 400);

  await server.close();
  db.close();
});

test('varyantsiz urun basePrice null ile kaydedilebilir', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({ categoryId: ids.categoryId, name: { tr: 'Fiyatsız' }, basePrice: null }),
  });
  assert.equal(response.status, 201);

  await server.close();
  db.close();
});

// ------------------------------------------------------------ yukleme guvenligi

test('SVG yukleme reddedilir - ayni origin XSS yuzeyi olmasin', async () => {
  const db = makeDb();
  const server = await startServer(db);
  const { cookie } = await login(server.base);

  const form = new FormData();
  form.append('image', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], { type: 'image/svg+xml' }), 'x.svg');
  const response = await fetch(`${server.base}/api/admin/upload`, { method: 'POST', headers: { cookie }, body: form });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /JPEG|PNG|WebP/i);

  await server.close();
  db.close();
});
