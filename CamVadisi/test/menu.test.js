import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, makeDb } from './helpers.js';
import { buildMenu } from '../server/menu.js';

function menuOf(db, options) {
  return buildMenu(db, options);
}

test('gizli kategori misafir menusunde yok, panelde var', () => {
  const db = makeDb();
  fixture(db);

  const publicMenu = menuOf(db);
  const adminMenu = menuOf(db, { includeHidden: true });

  assert.deepEqual(publicMenu.categories.map((c) => c.slug), ['mangal']);
  assert.deepEqual(adminMenu.categories.map((c) => c.slug), ['mangal', 'gizli-kategori']);
  db.close();
});

test('gizli urun menude HIC gorunmez, tukenen urun GORUNUR', () => {
  const db = makeDb();
  fixture(db);
  const products = menuOf(db).categories[0].products;
  const names = products.map((p) => p.name.tr);

  assert.ok(!names.includes('Gizli Ürün'), 'gizli urun sizmamali');
  assert.ok(names.includes('Izgara Köfte'), 'tukenen urun listede kalmali');
  assert.equal(products.find((p) => p.name.tr === 'Izgara Köfte').isSoldOut, true);
  db.close();
});

test('menu dort dili birden tasir - dil degistirmek yeni istek gerektirmesin', () => {
  const db = makeDb();
  fixture(db);
  const category = menuOf(db).categories[0];

  assert.deepEqual(Object.keys(category.name), ['tr', 'en', 'ar', 'ru']);
  assert.equal(category.name.ru, 'Гриль');
  assert.equal(category.name.ar, ''); // bos: istemci fallback zincirini uygular
  db.close();
});

test('varyantlar sirali gelir ve etiketler dizide toplanir', () => {
  const db = makeDb();
  const ids = fixture(db);
  const products = menuOf(db).categories[0].products;

  const pirzola = products.find((p) => p.id === ids.variantProductId);
  assert.deepEqual(pirzola.variants.map((v) => v.price), [48000, 89000]);

  const adana = products.find((p) => p.id === ids.visibleId);
  assert.deepEqual(adana.tags, ['spicy']);
  db.close();
});

test('kategoriye yazilan saat bilgi amaclidir - kategori gizlenmez', () => {
  const db = makeDb();
  fixture(db);
  const category = menuOf(db).categories[0];
  assert.equal(category.timeStart, '12:00');
  assert.equal(category.timeEnd, '22:00');
  assert.equal(category.isHidden, false);
  db.close();
});

test('etag icerik degisince degisir, degismeyince ayni kalir', () => {
  const db = makeDb();
  const ids = fixture(db);

  const first = menuOf(db).etag;
  assert.equal(menuOf(db).etag, first, 'ayni veri ayni etag uretmeli');

  db.prepare('UPDATE products SET base_price = 41800 WHERE id = ?').run(ids.visibleId);
  assert.notEqual(menuOf(db).etag, first, 'fiyat degisince etag degismeli');
  db.close();
});
