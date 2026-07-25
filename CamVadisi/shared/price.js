/**
 * Fiyatlar veritabaninda TAM SAYI KURUS olarak tutulur.
 * Sebep: yuzde bazli toplu zam (or. %10) ondalik uretir; kayan noktali sayida
 * biriken yuvarlama hatasi fiyat listesinde kabul edilemez.
 */

/** 45000 -> "450 ₺" ; 45050 -> "450,50 ₺" (simge sonda - kullanici karari) */
export function formatPrice(kurus) {
  if (kurus === null || kurus === undefined) return '';
  const lira = Math.trunc(kurus / 100);
  const rest = Math.abs(kurus % 100);
  const body = rest === 0
    ? lira.toLocaleString('tr-TR')
    : `${lira.toLocaleString('tr-TR')},${String(rest).padStart(2, '0')}`;
  return `${body} ₺`;
}

/** Panelden gelen "450" veya "450,50" girdisini kurusa cevirir. */
export function parsePrice(input) {
  if (typeof input === 'number') return Math.round(input * 100);
  const cleaned = String(input).trim().replace(/[^\d,.-]/g, '').replace(',', '.');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

/** Yuzde bazli zam/indirim. En yakin kurusa yuvarlar. */
export function applyPercent(kurus, percent) {
  return Math.round(kurus * (1 + percent / 100));
}

/**
 * Menu satirinda gosterilecek fiyat bilgisi.
 * - varyant yok        -> { kind: 'single', price }
 * - tek varyant        -> { kind: 'labelled', price, label }  ("kisi basi 450 ₺")
 * - birden cok varyant -> { kind: 'from', price }             ("baslayan 480 ₺")
 */
export function rowPrice(product) {
  const variants = product.variants || [];
  if (variants.length === 0) return { kind: 'single', price: product.basePrice };
  if (variants.length === 1) {
    return { kind: 'labelled', price: variants[0].price, label: variants[0].name };
  }
  const min = Math.min(...variants.map((v) => v.price));
  return { kind: 'from', price: min };
}
