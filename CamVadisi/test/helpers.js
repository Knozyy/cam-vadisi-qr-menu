import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Testler gercek uploads/ klasorunu ve anlik goruntuyu kirletmesin.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'cam-vadisi-test-'));
process.env.UPLOAD_DIR = path.join(scratch, 'uploads');
process.env.SNAPSHOT_PATH = path.join(scratch, 'menu-snapshot.json');
process.env.ADMIN_PASSWORD = 'test-sifresi';
process.env.JWT_SECRET = 'test-anahtari';

const { createApp } = await import('../server/app.js');
const { openDb } = await import('../server/db.js');
const { resetAllFailures } = await import('../server/auth.js');

export const SCRATCH = scratch;

export function makeDb() {
  return openDb(':memory:');
}

/** Kategori + urun iskeleti: gizli, tukenmis ve varyantli ornekler dahil. */
export function fixture(db) {
  const category = db.prepare(
    `INSERT INTO categories (slug, sort_order, time_start, time_end, name, name_en, name_ar, name_ru)
     VALUES ('mangal', 0, '12:00', '22:00', 'Mangal', 'Grill', '', 'Гриль')`,
  ).run();
  const hidden = db.prepare(
    `INSERT INTO categories (slug, sort_order, is_hidden, name) VALUES ('gizli-kategori', 1, 1, 'Gizli')`,
  ).run();

  const visible = db.prepare(
    `INSERT INTO products (category_id, sort_order, base_price, name, name_en, description, description_en)
     VALUES (?, 0, 38000, 'Adana Kebap', 'Adana Kebab', 'Acılı', 'Spicy')`,
  ).run(category.lastInsertRowid);

  const soldOut = db.prepare(
    `INSERT INTO products (category_id, sort_order, is_sold_out, base_price, name)
     VALUES (?, 1, 1, 34000, 'Izgara Köfte')`,
  ).run(category.lastInsertRowid);

  const hiddenProduct = db.prepare(
    `INSERT INTO products (category_id, sort_order, is_hidden, base_price, name)
     VALUES (?, 2, 1, 99000, 'Gizli Ürün')`,
  ).run(category.lastInsertRowid);

  const withVariants = db.prepare(
    `INSERT INTO products (category_id, sort_order, name) VALUES (?, 3, 'Kuzu Pirzola')`,
  ).run(category.lastInsertRowid);
  db.prepare(
    `INSERT INTO variants (product_id, sort_order, price, name) VALUES (?, 0, 48000, 'Yarım porsiyon')`,
  ).run(withVariants.lastInsertRowid);
  db.prepare(
    `INSERT INTO variants (product_id, sort_order, price, name) VALUES (?, 1, 89000, 'Tam porsiyon')`,
  ).run(withVariants.lastInsertRowid);
  db.prepare('INSERT INTO product_tags (product_id, tag) VALUES (?, ?)').run(visible.lastInsertRowid, 'spicy');

  return {
    categoryId: Number(category.lastInsertRowid),
    hiddenCategoryId: Number(hidden.lastInsertRowid),
    visibleId: Number(visible.lastInsertRowid),
    soldOutId: Number(soldOut.lastInsertRowid),
    hiddenProductId: Number(hiddenProduct.lastInsertRowid),
    variantProductId: Number(withVariants.lastInsertRowid),
  };
}

/** Gercek HTTP sunucusu baslatir; testler fetch ile konusur. */
export async function startServer(db) {
  resetAllFailures();
  const app = createApp(db);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  return {
    base: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

/** Giris yapar ve sonraki isteklerde kullanilacak cerezi doner. */
export async function login(base, password = 'test-sifresi') {
  const response = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const raw = response.headers.getSetCookie?.() ?? [];
  return { response, cookie: raw.map((c) => c.split(';')[0]).join('; ') };
}
