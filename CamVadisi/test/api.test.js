import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, login, makeDb, startServer } from './helpers.js';

async function authed(base) {
  const { cookie } = await login(base);
  return (path, options = {}) => fetch(`${base}${path}`, {
    ...options,
    headers: { cookie, 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
}

test('GET /api/menu tek cagrida menuyu doner ve ETag verir', async () => {
  const db = makeDb();
  fixture(db);
  const server = await startServer(db);

  const response = await fetch(`${server.base}/api/menu`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-menu-source'), 'db');
  const etag = response.headers.get('etag');
  assert.ok(etag, 'ETag basligi olmali');

  const body = await response.json();
  assert.equal(body.categories.length, 1);
  assert.ok(body.settings, 'ayarlar ayni yanitta gelmeli');

  await server.close();
  db.close();
});

test('degismemis menu 304 doner - zayif sebekede bant genisligi harcanmaz', async () => {
  const db = makeDb();
  fixture(db);
  const server = await startServer(db);

  const first = await fetch(`${server.base}/api/menu`);
  const etag = first.headers.get('etag');

  const second = await fetch(`${server.base}/api/menu`, { headers: { 'if-none-match': etag } });
  assert.equal(second.status, 304);

  await server.close();
  db.close();
});

test('ziyaret sayaci artar ve gecersiz turu reddeder', async () => {
  const db = makeDb();
  const server = await startServer(db);

  const ok = await fetch(`${server.base}/api/stats/view`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'category', value: 'mangal' }),
  });
  assert.equal(ok.status, 204);

  const bad = await fetch(`${server.base}/api/stats/view`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'sifre-calma', value: 'x' }),
  });
  assert.equal(bad.status, 400);

  const row = db.prepare("SELECT count FROM visit_stats WHERE kind='category' AND value='mangal'").get();
  assert.equal(row.count, 1);

  await server.close();
  db.close();
});

test('urun olusturma varyant ve etiketleri birlikte yazar', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({
      categoryId: ids.categoryId,
      name: { tr: 'Tavuk Şiş', en: 'Chicken Skewer' },
      description: { tr: 'Terbiyelenmiş' },
      tags: ['gluten_free'],
      variants: [
        { name: { tr: 'Yarım' }, price: 16000 },
        { name: { tr: 'Tam' }, price: 32000 },
      ],
    }),
  });
  assert.equal(response.status, 201);
  const { id } = await response.json();

  const menu = await (await fetch(`${server.base}/api/menu`)).json();
  const created = menu.categories[0].products.find((p) => p.id === id);
  assert.equal(created.name.en, 'Chicken Skewer');
  assert.deepEqual(created.tags, ['gluten_free']);
  assert.deepEqual(created.variants.map((v) => v.price), [16000, 32000]);

  await server.close();
  db.close();
});

test('bilinmeyen alerjen etiketi reddedilir', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({
      categoryId: ids.categoryId,
      name: { tr: 'Deneme' },
      tags: ['uydurma_etiket'],
    }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Bilinmeyen etiket/);

  await server.close();
  db.close();
});

test('Turkce ad bos birakilamaz', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify({ categoryId: ids.categoryId, name: { en: 'Only English' } }),
  });
  assert.equal(response.status, 400);

  await server.close();
  db.close();
});

test('toplu fiyat: onizleme veriyi DEGISTIRMEZ, uygulama degistirir', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const before = db.prepare('SELECT base_price FROM products WHERE id = ?').get(ids.visibleId).base_price;

  const preview = await call('/api/admin/products/bulk-price', {
    method: 'POST',
    body: JSON.stringify({ percent: 10, preview: true }),
  });
  const previewBody = await preview.json();
  assert.equal(previewBody.preview, true);
  assert.ok(previewBody.changes.length > 0);
  assert.equal(
    db.prepare('SELECT base_price FROM products WHERE id = ?').get(ids.visibleId).base_price,
    before,
    'onizleme veriyi degistirmemeli',
  );

  const applied = await call('/api/admin/products/bulk-price', {
    method: 'POST',
    body: JSON.stringify({ percent: 10 }),
  });
  assert.equal(applied.status, 200);

  assert.equal(
    db.prepare('SELECT base_price FROM products WHERE id = ?').get(ids.visibleId).base_price,
    41800,
    '38000 + %10 = 41800',
  );
  // Varyant fiyatlari da zamdan etkilenir
  assert.equal(db.prepare('SELECT price FROM variants ORDER BY sort_order').get().price, 52800);

  await server.close();
  db.close();
});

test('siralama listesi sort_order degerlerini yazar', async () => {
  const db = makeDb();
  const ids = fixture(db);
  const server = await startServer(db);
  const call = await authed(server.base);

  const response = await call('/api/admin/products/reorder', {
    method: 'POST',
    body: JSON.stringify({ ids: [ids.variantProductId, ids.soldOutId, ids.visibleId] }),
  });
  assert.equal(response.status, 200);

  const order = db.prepare('SELECT id FROM products WHERE is_hidden = 0 ORDER BY sort_order').all().map((r) => r.id);
  assert.deepEqual(order, [ids.variantProductId, ids.soldOutId, ids.visibleId]);

  await server.close();
  db.close();
});

test('ayarlar dort dilli duyuruyu ve wifi sifresini saklar', async () => {
  const db = makeDb();
  const server = await startServer(db);
  const call = await authed(server.base);

  await call('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({
      announcement: { tr: 'Bugün tandır var', en: 'Lamb today', ar: '', ru: '' },
      announcementActive: true,
      wifiPassword: 'camvadisi2026',
      hours: [{ day: 'Pazartesi', open: '08:00', close: '22:00' }],
    }),
  });

  const menu = await (await fetch(`${server.base}/api/menu`)).json();
  assert.equal(menu.settings.announcement.tr, 'Bugün tandır var');
  assert.equal(menu.settings.announcementActive, true);
  assert.equal(menu.settings.wifiPassword, 'camvadisi2026');
  assert.equal(menu.settings.hours[0].open, '08:00');

  await server.close();
  db.close();
});
