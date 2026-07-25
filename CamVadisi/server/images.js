import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Yol cagri aninda cozulur, modul yuklenirken degil.
 * Sebep: ESM importlari yukari tasinir; test ortam degiskenini once ayarlayamazdi.
 */
export function uploadDir() {
  return process.env.UPLOAD_DIR || path.join(here, 'uploads');
}

/** Listede gorunen kare kucuk resim - zayif sebekede tek onemli olcu. */
const THUMB_SIZE = 160;
/** Yalnizca detay paneli acilinca cekilir. */
const FULL_WIDTH = 1000;

export function ensureUploadDir() {
  fs.mkdirSync(uploadDir(), { recursive: true });
}

/**
 * Isletme telefonundan 4 MB'lik JPEG yukler; kucultme SUNUCUNUN isi.
 * Kullanicidan boyut hazirligi beklenmez.
 *
 * @param {Buffer} buffer ham yuklenen dosya
 * @param {{left:number,top:number,width:number,height:number}} [crop] panelden gelen kare kadraj
 * @returns {Promise<{thumb:string, full:string}>} public URL'ler
 */
export async function saveImage(buffer, crop) {
  ensureUploadDir();
  const id = crypto.randomUUID();

  // EXIF yonunu once uygula: kirpma koordinatlari panelde DONDURULMUS goruntu
  // uzerinden hesaplandi, ham piksel uzerinden degil.
  const rotated = await sharp(buffer).rotate().toBuffer();
  let pipeline = sharp(rotated);

  if (crop && Number.isFinite(crop.width) && crop.width > 0) {
    // Kirpma alanini goruntu sinirlarina sikistir - sharp `extract` disari tasarsa
    // hata atar ve yukleme 500 dondururdu.
    const meta = await sharp(rotated).metadata();
    const region = clampRegion(crop, meta.width, meta.height);
    if (region) pipeline = pipeline.extract(region);
  }
  const normalized = await pipeline.toBuffer();

  const thumbName = `${id}-thumb.webp`;
  const fullName = `${id}-full.webp`;

  await sharp(normalized)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' })
    .webp({ quality: 72 })
    .toFile(path.join(uploadDir(), thumbName));

  await sharp(normalized)
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(uploadDir(), fullName));

  return { thumb: `/uploads/${thumbName}`, full: `/uploads/${fullName}` };
}

/**
 * Panelden gelen kirpma alanini goruntu sinirlarina sikistirir.
 * Gecersiz/kullanilamaz alan icin null doner (kirpma atlanir, tam gorsel kullanilir).
 */
export function clampRegion(crop, imageWidth, imageHeight) {
  if (!imageWidth || !imageHeight) return null;

  const left = Math.min(Math.max(0, Math.round(crop.left ?? 0)), imageWidth - 1);
  const top = Math.min(Math.max(0, Math.round(crop.top ?? 0)), imageHeight - 1);
  const width = Math.min(Math.round(crop.width), imageWidth - left);
  const height = Math.min(Math.round(crop.height ?? crop.width), imageHeight - top);

  if (!(width > 0 && height > 0)) return null;
  return { left, top, width, height };
}

/** Urun silinince veya gorsel degisince eski dosyalari birak. */
export function removeImages(...urls) {
  for (const url of urls) {
    if (!url || !url.startsWith('/uploads/')) continue;
    const name = path.basename(url);
    try {
      fs.unlinkSync(path.join(uploadDir(), name));
    } catch {
      /* dosya zaten yoksa sorun degil */
    }
  }
}
