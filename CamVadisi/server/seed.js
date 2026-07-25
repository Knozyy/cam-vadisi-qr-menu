import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS } from '../shared/i18n.js';
import { isValidTag } from '../shared/tags.js';
import { openDb, setSetting } from './db.js';
import { writeSnapshot } from './menu.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(here, 'menu-content.json');

/**
 * ILK KURULUM TOHUMU - tek gercek kaynak DEGIL.
 *
 * Yedigul'de ogrenilen ders: bu dosyayi veya menu-content.json'i sonradan duzenlemek
 * CANLIYI DEGISTIRMEZ. Menu yayina girdikten sonra her degisiklik yonetim panelinden
 * yapilir; tek gercek kaynak data.db'dir.
 *
 * Icerik `menu-content.json`'dan okunur (Cam Vadisi'nin gercek menusu, eski TikaBasa
 * sisteminden cekildi). Fiyatlar KURUS cinsindendir.
 */
function bundleColumns(field, bundle) {
  const out = {};
  for (const lang of LANGS) {
    out[lang === 'tr' ? field : `${field}_${lang}`] = String(bundle?.[lang] ?? '').trim();
  }
  return out;
}

export function loadContent() {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
}

export function seedDatabase(db, { force = false } = {}) {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
  if (existing > 0 && !force) {
    return { skipped: true, reason: 'Veritabanında zaten kategori var (--force ile üzerine yazılır)' };
  }
  if (force) {
    db.exec('DELETE FROM product_tags; DELETE FROM variants; DELETE FROM products; DELETE FROM categories;');
  }

  const content = loadContent();
  const { venue } = content;

  setSetting(db, 'restaurant_name', venue.name);
  setSetting(db, 'address', venue.address ?? '');
  setSetting(db, 'phones', JSON.stringify(venue.phones ?? []));
  setSetting(db, 'location', JSON.stringify(venue.location ?? []));
  setSetting(db, 'wifi_password', venue.wifiPassword ?? '');
  // Calisma saatleri eski sistemde YOKTU - isletme panelden girecek.
  setSetting(db, 'hours', JSON.stringify(venue.hours ?? []));
  setSetting(db, 'announcement_active', '0');
  for (const lang of LANGS) {
    setSetting(db, lang === 'tr' ? 'announcement' : `announcement_${lang}`, '');
  }

  const categoryStmt = db.prepare(
    `INSERT INTO categories (slug, sort_order, time_start, time_end, name, name_en, name_ar, name_ru)
     VALUES (@slug, @sort_order, @time_start, @time_end, @name, @name_en, @name_ar, @name_ru)`,
  );
  const productStmt = db.prepare(
    `INSERT INTO products (category_id, sort_order, is_hidden, is_sold_out, base_price, image_thumb, image_full,
       name, name_en, name_ar, name_ru,
       description, description_en, description_ar, description_ru,
       ingredients, ingredients_en, ingredients_ar, ingredients_ru)
     VALUES (@category_id, @sort_order, @is_hidden, 0, @base_price, @image_thumb, @image_full,
       @name, @name_en, @name_ar, @name_ru,
       @description, @description_en, @description_ar, @description_ru,
       @ingredients, @ingredients_en, @ingredients_ar, @ingredients_ru)`,
  );
  const variantStmt = db.prepare(
    `INSERT INTO variants (product_id, sort_order, price, name, name_en, name_ar, name_ru)
     VALUES (@product_id, @sort_order, @price, @name, @name_en, @name_ar, @name_ru)`,
  );
  const tagStmt = db.prepare('INSERT INTO product_tags (product_id, tag) VALUES (?, ?)');

  let productCount = 0;
  let tagCount = 0;
  const unknownTags = new Set();

  const run = db.transaction(() => {
    content.categories.forEach((category, categoryIndex) => {
      const categoryId = Number(
        categoryStmt.run({
          slug: category.slug,
          sort_order: categoryIndex,
          time_start: category.timeStart ?? '',
          time_end: category.timeEnd ?? '',
          ...bundleColumns('name', category.name),
        }).lastInsertRowid,
      );

      category.products.forEach((product, index) => {
        const productId = Number(
          productStmt.run({
            category_id: categoryId,
            sort_order: index,
            is_hidden: product.isHidden ? 1 : 0,
            base_price: product.basePrice ?? null,
            image_thumb: product.imageThumb ?? '',
            image_full: product.imageFull ?? '',
            ...bundleColumns('name', product.name),
            ...bundleColumns('description', product.description),
            ...bundleColumns('ingredients', product.ingredients),
          }).lastInsertRowid,
        );
        productCount += 1;

        for (const tag of product.tags ?? []) {
          if (!isValidTag(tag)) {
            unknownTags.add(tag);
            continue;
          }
          tagStmt.run(productId, tag);
          tagCount += 1;
        }

        (product.variants ?? []).forEach((variant, order) => {
          variantStmt.run({
            product_id: productId,
            sort_order: order,
            price: variant.price,
            ...bundleColumns('name', variant.name),
          });
        });
      });
    });
  });
  run();

  writeSnapshot(db);
  return {
    skipped: false,
    categories: content.categories.length,
    products: productCount,
    tags: tagCount,
    unknownTags: [...unknownTags],
  };
}

// CLI: npm run seed  |  npm run seed -- --force
if (process.argv[1]?.endsWith('seed.js')) {
  const force = process.argv.includes('--force');
  const db = openDb();
  const result = seedDatabase(db, { force });
  if (result.skipped) {
    console.log(`Atlandı: ${result.reason}`);
  } else {
    console.log(`Tohumlandı: ${result.categories} kategori, ${result.products} ürün, ${result.tags} etiket.`);
    if (result.unknownTags.length) console.log(`UYARI bilinmeyen etiket: ${result.unknownTags.join(', ')}`);
  }
  db.close();
}
