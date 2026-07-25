import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';
import express from 'express';
import multer from 'multer';
import { LANGS } from '../../shared/i18n.js';
import { applyPercent } from '../../shared/price.js';
import { isValidTag } from '../../shared/tags.js';
import {
  COOKIE_NAME, clearFailures, clientIp, cookieOptions, issueToken,
  lockState, recordFailure, requireAuth, verifyPassword,
} from '../auth.js';
import { getSetting, nextSortOrder, setSetting } from '../db.js';
import { removeImages, saveImage, uploadDir } from '../images.js';
import { buildMenu, writeSnapshot } from '../menu.js';

/**
 * Yalnizca raster fotograf kabul edilir. SVG bilincli olarak DISARIDA: icine script
 * gomulebilir ve `/uploads` altindan ayni origin'de servis edildigi icin XSS yuzeyi olur.
 */
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      cb(new HttpError(400, 'Yalnızca JPEG, PNG, WebP veya HEIC fotoğraf yüklenebilir'));
      return;
    }
    cb(null, true);
  },
});

/** { name: {tr,en,ar,ru} } -> { name, name_en, name_ar, name_ru } */
function bundleColumns(field, bundle) {
  const out = {};
  for (const lang of LANGS) {
    const column = lang === 'tr' ? field : `${field}_${lang}`;
    out[column] = String(bundle?.[lang] ?? '').trim();
  }
  return out;
}

function requireTurkish(bundle, label) {
  const value = String(bundle?.tr ?? '').trim();
  if (!value) throw new HttpError(400, `${label} için Türkçe alan zorunlu`);
  return value;
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function adminRouter(db) {
  const router = express.Router();
  const touch = () => writeSnapshot(db);

  // ---------------------------------------------------------------- auth
  router.post('/auth/login', (req, res) => {
    const ip = clientIp(req);
    const lock = lockState(ip);
    if (lock.locked) {
      const minutes = Math.ceil(lock.remainingMs / 60000);
      return res.status(429).json({ error: `Çok fazla deneme. ${minutes} dakika sonra tekrar deneyin.` });
    }
    if (!verifyPassword(req.body?.password)) {
      recordFailure(ip);
      return res.status(401).json({ error: 'Şifre hatalı' });
    }
    clearFailures(ip);
    res.cookie(COOKIE_NAME, issueToken(), cookieOptions());
    return res.json({ ok: true });
  });

  router.post('/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.json({ ok: true });
  });

  router.get('/auth/session', requireAuth, (req, res) => res.json({ ok: true }));

  // Buradan sonrasi korumali
  router.use(requireAuth);

  // ---------------------------------------------------------------- menu
  router.get('/menu', (req, res) => res.json(buildMenu(db, { includeHidden: true })));

  router.get('/stats', (req, res) => {
    const rows = db.prepare(
      'SELECT day, kind, value, count FROM visit_stats ORDER BY day DESC, count DESC LIMIT 400',
    ).all();
    return res.json({ rows });
  });

  // Test verisini yayina gecmeden temizlemek icin. Sayaclar menu verisi degil,
  // bu yuzden snapshot'a dokunmaz.
  router.delete('/stats', (req, res) => {
    const info = db.prepare('DELETE FROM visit_stats').run();
    return res.json({ deleted: info.changes });
  });

  // ---------------------------------------------------------- categories
  router.post('/categories', (req, res) => {
    const { slug, name, timeStart = '', timeEnd = '' } = req.body ?? {};
    requireTurkish(name, 'Kategori adı');
    const cleanSlug = String(slug ?? '').trim() || slugify(name.tr);
    const columns = bundleColumns('name', name);
    const info = db.prepare(
      `INSERT INTO categories (slug, sort_order, time_start, time_end, name, name_en, name_ar, name_ru)
       VALUES (@slug, @sort_order, @time_start, @time_end, @name, @name_en, @name_ar, @name_ru)`,
    ).run({
      slug: cleanSlug,
      sort_order: nextSortOrder(db, 'categories'),
      time_start: String(timeStart).trim(),
      time_end: String(timeEnd).trim(),
      ...columns,
    });
    touch();
    return res.status(201).json({ id: info.lastInsertRowid });
  });

  router.put('/categories/:id', (req, res) => {
    const { name, timeStart = '', timeEnd = '', isHidden = false, slug } = req.body ?? {};
    requireTurkish(name, 'Kategori adı');
    const columns = bundleColumns('name', name);
    const result = db.prepare(
      `UPDATE categories SET slug = COALESCE(@slug, slug), time_start = @time_start, time_end = @time_end,
         is_hidden = @is_hidden, name = @name, name_en = @name_en, name_ar = @name_ar, name_ru = @name_ru
       WHERE id = @id`,
    ).run({
      id: Number(req.params.id),
      slug: slug ? String(slug).trim() : null,
      time_start: String(timeStart).trim(),
      time_end: String(timeEnd).trim(),
      is_hidden: isHidden ? 1 : 0,
      ...columns,
    });
    if (result.changes === 0) throw new HttpError(404, 'Kategori bulunamadı');
    touch();
    return res.json({ ok: true });
  });

  router.delete('/categories/:id', (req, res) => {
    const id = Number(req.params.id);
    const images = db.prepare('SELECT image_thumb, image_full FROM products WHERE category_id = ?').all(id);
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    if (result.changes === 0) throw new HttpError(404, 'Kategori bulunamadı');
    for (const row of images) removeImages(row.image_thumb, row.image_full);
    touch();
    return res.json({ ok: true });
  });

  router.post('/categories/reorder', (req, res) => {
    applyOrder(db, 'categories', req.body?.ids);
    touch();
    return res.json({ ok: true });
  });

  // ------------------------------------------------------------ products
  router.post('/products', (req, res) => {
    const id = upsertProduct(db, null, req.body ?? {});
    touch();
    return res.status(201).json({ id });
  });

  router.put('/products/:id', (req, res) => {
    upsertProduct(db, Number(req.params.id), req.body ?? {});
    touch();
    return res.json({ ok: true });
  });

  router.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT image_thumb, image_full FROM products WHERE id = ?').get(id);
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (result.changes === 0) throw new HttpError(404, 'Ürün bulunamadı');
    removeImages(row?.image_thumb, row?.image_full);
    touch();
    return res.json({ ok: true });
  });

  router.post('/products/reorder', (req, res) => {
    applyOrder(db, 'products', req.body?.ids);
    touch();
    return res.json({ ok: true });
  });

  /**
   * Toplu fiyat guncelleme. `preview: true` ile once ne olacagi gosterilir,
   * onaylanmadan veri degismez.
   */
  router.post('/products/bulk-price', (req, res) => {
    const percent = Number(req.body?.percent);
    const categoryId = req.body?.categoryId ? Number(req.body.categoryId) : null;
    const preview = Boolean(req.body?.preview);
    if (!Number.isFinite(percent) || percent === 0) {
      throw new HttpError(400, 'Geçerli bir yüzde girin');
    }

    const where = categoryId ? 'WHERE category_id = ?' : '';
    const products = categoryId
      ? db.prepare(`SELECT id, name, base_price FROM products ${where}`).all(categoryId)
      : db.prepare('SELECT id, name, base_price FROM products').all();
    const ids = products.map((p) => p.id);
    const variants = ids.length
      ? db.prepare(
        `SELECT id, product_id, name, price FROM variants WHERE product_id IN (${ids.map(() => '?').join(',')})`,
      ).all(...ids)
      : [];

    const changes = [
      ...products
        .filter((p) => p.base_price !== null)
        .map((p) => ({ kind: 'product', id: p.id, name: p.name, from: p.base_price, to: applyPercent(p.base_price, percent) })),
      ...variants.map((v) => ({ kind: 'variant', id: v.id, name: v.name, from: v.price, to: applyPercent(v.price, percent) })),
    ];

    if (preview) return res.json({ preview: true, changes });

    const run = db.transaction(() => {
      const productStmt = db.prepare('UPDATE products SET base_price = ? WHERE id = ?');
      const variantStmt = db.prepare('UPDATE variants SET price = ? WHERE id = ?');
      for (const change of changes) {
        if (change.kind === 'product') productStmt.run(change.to, change.id);
        else variantStmt.run(change.to, change.id);
      }
    });
    run();
    touch();
    return res.json({ updated: changes.length });
  });

  // ------------------------------------------------------------ settings
  router.put('/settings', (req, res) => {
    const body = req.body ?? {};
    if (body.announcement) {
      for (const lang of LANGS) {
        setSetting(db, lang === 'tr' ? 'announcement' : `announcement_${lang}`, body.announcement[lang] ?? '');
      }
    }
    if (body.announcementActive !== undefined) {
      setSetting(db, 'announcement_active', body.announcementActive ? '1' : '0');
    }
    if (body.wifiPassword !== undefined) setSetting(db, 'wifi_password', body.wifiPassword);
    if (body.restaurantName !== undefined) setSetting(db, 'restaurant_name', body.restaurantName);
    if (body.hours !== undefined) setSetting(db, 'hours', JSON.stringify(body.hours ?? []));
    if (body.address !== undefined) setSetting(db, 'address', body.address);
    if (body.phones !== undefined) {
      const phones = (Array.isArray(body.phones) ? body.phones : [])
        .map((p) => String(p).trim())
        .filter(Boolean);
      setSetting(db, 'phones', JSON.stringify(phones));
    }
    touch();
    return res.json({ ok: true });
  });

  // -------------------------------------------------------------- upload
  router.post('/upload', upload.single('image'), async (req, res, next) => {
    try {
      if (!req.file) throw new HttpError(400, 'Görsel bulunamadı');
      let crop;
      if (req.body?.crop) {
        try {
          crop = JSON.parse(req.body.crop);
        } catch {
          throw new HttpError(400, 'Kırpma bilgisi okunamadı');
        }
      }
      const urls = await saveImage(req.file.buffer, crop);
      return res.status(201).json(urls);
    } catch (err) {
      return next(err);
    }
  });

  // -------------------------------------------------------------- backup
  router.get('/backup', (req, res) => {
    const stamp = new Date().toISOString().slice(0, 10);
    res.attachment(`cam-vadisi-yedek-${stamp}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => res.destroy(err));
    archive.pipe(res);

    // Tutarli kopya: WAL acikken dosyayi dogrudan okumak yarim veri verebilir.
    const dir = uploadDir();
    const tempDb = path.join(dir, '..', `backup-${Date.now()}.db`);
    db.backup(tempDb)
      .then(() => {
        archive.file(tempDb, { name: 'data.db' });
        if (fs.existsSync(dir)) archive.directory(dir, 'uploads');
        return archive.finalize();
      })
      .then(() => {
        fs.rm(tempDb, { force: true }, () => {});
      })
      .catch((err) => res.destroy(err));
  });

  // Router'a ozel hata yakalayici
  router.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    // multer kendi hata sinifini atar (boyut/adet siniri) - kullaniciya anlasilir cevir.
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fotoğraf çok büyük (en fazla 12 MB)' });
    }
    if (err?.name === 'MulterError') {
      return res.status(400).json({ error: 'Fotoğraf yüklenemedi' });
    }
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    return res.status(status).json({ error: err.message || 'Beklenmeyen hata' });
  });

  return router;
}

// ---------------------------------------------------------------- helpers

function slugify(text) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
  return String(text)
    .toLowerCase()
    .replace(/[çğıöşü]/g, (c) => map[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function applyOrder(db, table, ids) {
  if (!Array.isArray(ids) || ids.length === 0) throw new HttpError(400, 'Sıralama listesi boş');
  const stmt = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`);
  db.transaction(() => {
    ids.forEach((id, index) => stmt.run(index, Number(id)));
  })();
}

function upsertProduct(db, id, body) {
  const { name, description, ingredients, categoryId, basePrice = null,
    isHidden = false, isSoldOut = false, imageThumb = '', imageFull = '',
    tags = [], variants = [] } = body;

  requireTurkish(name, 'Ürün adı');
  for (const tag of tags) {
    if (!isValidTag(tag)) throw new HttpError(400, `Bilinmeyen etiket: ${tag}`);
  }
  // basePrice null olabilir (varyantli urunlerde yok sayilir) ama sayi geldiyse gecerli olmali.
  if (basePrice !== null && basePrice !== undefined) {
    const value = Number(basePrice);
    if (!Number.isFinite(value) || value < 0) throw new HttpError(400, 'Geçerli bir fiyat girin');
  }

  const columns = {
    ...bundleColumns('name', name),
    ...bundleColumns('description', description),
    ...bundleColumns('ingredients', ingredients),
  };

  const run = db.transaction(() => {
    let productId = id;
    if (productId === null) {
      const category = Number(categoryId);
      if (!Number.isFinite(category)) throw new HttpError(400, 'Kategori seçilmedi');
      const info = db.prepare(
        `INSERT INTO products (category_id, sort_order, base_price, image_thumb, image_full,
           name, name_en, name_ar, name_ru,
           description, description_en, description_ar, description_ru,
           ingredients, ingredients_en, ingredients_ar, ingredients_ru)
         VALUES (@category_id, @sort_order, @base_price, @image_thumb, @image_full,
           @name, @name_en, @name_ar, @name_ru,
           @description, @description_en, @description_ar, @description_ru,
           @ingredients, @ingredients_en, @ingredients_ar, @ingredients_ru)`,
      ).run({
        category_id: category,
        sort_order: nextSortOrder(db, 'products', 'category_id', category),
        base_price: basePrice,
        image_thumb: imageThumb,
        image_full: imageFull,
        ...columns,
      });
      productId = Number(info.lastInsertRowid);
    } else {
      const previous = db.prepare('SELECT image_thumb, image_full FROM products WHERE id = ?').get(productId);
      if (!previous) throw new HttpError(404, 'Ürün bulunamadı');
      const result = db.prepare(
        `UPDATE products SET
           category_id = COALESCE(@category_id, category_id),
           base_price = @base_price, is_hidden = @is_hidden, is_sold_out = @is_sold_out,
           image_thumb = @image_thumb, image_full = @image_full,
           name = @name, name_en = @name_en, name_ar = @name_ar, name_ru = @name_ru,
           description = @description, description_en = @description_en,
           description_ar = @description_ar, description_ru = @description_ru,
           ingredients = @ingredients, ingredients_en = @ingredients_en,
           ingredients_ar = @ingredients_ar, ingredients_ru = @ingredients_ru
         WHERE id = @id`,
      ).run({
        id: productId,
        category_id: categoryId ? Number(categoryId) : null,
        base_price: basePrice,
        is_hidden: isHidden ? 1 : 0,
        is_sold_out: isSoldOut ? 1 : 0,
        image_thumb: imageThumb,
        image_full: imageFull,
        ...columns,
      });
      if (result.changes === 0) throw new HttpError(404, 'Ürün bulunamadı');
      // Gorsel degistiyse eskisini birak
      if (previous.image_thumb && previous.image_thumb !== imageThumb) {
        removeImages(previous.image_thumb, previous.image_full);
      }
    }

    db.prepare('DELETE FROM product_tags WHERE product_id = ?').run(productId);
    const tagStmt = db.prepare('INSERT INTO product_tags (product_id, tag) VALUES (?, ?)');
    for (const tag of tags) tagStmt.run(productId, tag);

    db.prepare('DELETE FROM variants WHERE product_id = ?').run(productId);
    const variantStmt = db.prepare(
      `INSERT INTO variants (product_id, sort_order, price, name, name_en, name_ar, name_ru)
       VALUES (@product_id, @sort_order, @price, @name, @name_en, @name_ar, @name_ru)`,
    );
    variants.forEach((variant, index) => {
      requireTurkish(variant.name, 'Porsiyon adı');
      // Gecersiz sayi dogrudan DB'ye gidince "NOT NULL" ihlali 500 uretiyordu;
      // burada anlasilir bir 400 doneriz.
      const price = Number(variant.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new HttpError(400, `"${variant.name.tr}" için geçerli bir fiyat girin`);
      }
      variantStmt.run({
        product_id: productId,
        sort_order: index,
        price: Math.round(price),
        ...bundleColumns('name', variant.name),
      });
    });

    return productId;
  });

  return run();
}
