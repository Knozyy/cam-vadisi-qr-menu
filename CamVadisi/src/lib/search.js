/** Turkce arama icin normalizasyon: buyuk/kucuk ve aksan farkini yok say. */
function normalize(text) {
  return String(text ?? '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Bir urun sorguyla eslesiyor mu?
 * Secili dilin YANINDA Turkce de aranir: turist "kofte" yazsa da "Köfte"yi bulsun.
 */
export function productMatches(product, query, lang) {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = [
    product.name[lang], product.name.tr, product.name.en,
    product.description[lang], product.description.tr,
  ]
    .filter(Boolean)
    .map(normalize)
    .join(' ');
  return haystack.includes(q);
}
