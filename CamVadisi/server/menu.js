import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, toBundle } from '../shared/i18n.js';
import { getSetting } from './db.js';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Yol cagri aninda cozulur (bkz. images.js'teki ayni gerekce). */
export function snapshotPath() {
  return process.env.SNAPSHOT_PATH || path.join(here, 'menu-snapshot.json');
}

/**
 * Tum menuyu TEK cagrida uretir.
 *
 * Dort dilin hepsi ayni yanitta gider - istemci dili cevrimdisi degistirebilsin diye.
 * Tek dil donseydi, sebekesi olmayan misafir dili degistirdiginde yeni bir istek
 * gerekirdi ve dil degismezdi.
 */
export function buildMenu(db, { includeHidden = false } = {}) {
  const categoryFilter = includeHidden ? '' : 'WHERE is_hidden = 0';
  const productFilter = includeHidden ? '' : 'AND is_hidden = 0';

  const categories = db.prepare(
    `SELECT * FROM categories ${categoryFilter} ORDER BY sort_order, id`,
  ).all();

  const productStmt = db.prepare(
    `SELECT * FROM products WHERE category_id = ? ${productFilter} ORDER BY sort_order, id`,
  );
  const variantStmt = db.prepare(
    'SELECT * FROM variants WHERE product_id = ? ORDER BY sort_order, id',
  );
  const tagStmt = db.prepare('SELECT tag FROM product_tags WHERE product_id = ? ORDER BY tag');

  const payload = {
    settings: readSettings(db),
    categories: categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      sortOrder: category.sort_order,
      isHidden: Boolean(category.is_hidden),
      timeStart: category.time_start,
      timeEnd: category.time_end,
      name: toBundle(category, 'name'),
      products: productStmt.all(category.id).map((product) => ({
        id: product.id,
        sortOrder: product.sort_order,
        isHidden: Boolean(product.is_hidden),
        isSoldOut: Boolean(product.is_sold_out),
        basePrice: product.base_price,
        imageThumb: product.image_thumb,
        imageFull: product.image_full,
        name: toBundle(product, 'name'),
        description: toBundle(product, 'description'),
        ingredients: toBundle(product, 'ingredients'),
        tags: tagStmt.all(product.id).map((r) => r.tag),
        variants: variantStmt.all(product.id).map((variant) => ({
          id: variant.id,
          price: variant.price,
          name: toBundle(variant, 'name'),
        })),
      })),
    })),
  };

  payload.etag = `"${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex')}"`;
  return payload;
}

function readSettings(db) {
  const announcement = {};
  for (const lang of LANGS) {
    announcement[lang] = getSetting(db, lang === 'tr' ? 'announcement' : `announcement_${lang}`);
  }
  let hours = [];
  try {
    hours = JSON.parse(getSetting(db, 'hours', '[]'));
  } catch {
    hours = [];
  }
  let phones = [];
  try {
    phones = JSON.parse(getSetting(db, 'phones', '[]'));
  } catch {
    phones = [];
  }
  // [enlem, boylam] - ana sayfadaki "Yol tarifi" baglantisi icin.
  let location = [];
  try {
    const parsed = JSON.parse(getSetting(db, 'location', '[]'));
    if (Array.isArray(parsed) && parsed.length === 2) location = parsed.map(Number);
  } catch {
    location = [];
  }

  return {
    restaurantName: getSetting(db, 'restaurant_name', 'Çam Vadisi'),
    announcement,
    announcementActive: getSetting(db, 'announcement_active', '0') === '1',
    wifiPassword: getSetting(db, 'wifi_password'),
    hours,
    // Gercek isletme bilgileri - ana sayfada "Bize ulasin" bolumunde gosterilir.
    address: getSetting(db, 'address'),
    phones,
    location,
  };
}

/**
 * Emniyet katmani: her basarili yazmadan sonra menunun son iyi hali diske yazilir.
 * Veritabani okunamazsa API bu dosyayi doner - masadaki QR menusuz kalmasin.
 */
export function writeSnapshot(db, target = snapshotPath()) {
  try {
    const payload = buildMenu(db);
    fs.writeFileSync(target, JSON.stringify(payload), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export function readSnapshot(target = snapshotPath()) {
  try {
    return JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch {
    return null;
  }
}
