/**
 * Diyet ve alerjen suzgeci.
 *
 * Iki etiket grubunun anlami TERSTIR ve bu yuzden ayri tutulur:
 *  - diyet  -> urun bu etikete SAHIP OLMALI  ("Vejetaryen" secilince vejetaryenler)
 *  - kacin  -> urun bu etikete SAHIP OLMAMALI ("Sutsuz" secilince sut icerenler duser)
 *
 * Tek bir listede karistirilsaydi misafir "Sutlu" rozetine basinca sutlu urunleri mi
 * gorecegini yoksa eleyecegini mi bilemezdi.
 *
 * UYARI: etiketler urun ADINDAN turetildi ve mutfak tarafindan dogrulanmadi.
 * Bu yuzden suzgec bir GARANTI degil daraltma aracidir; arayuzde personele danisma
 * uyarisi ile birlikte gosterilmelidir.
 */

export const DIET_TAGS = ["vegetarian", "vegan", "gluten_free"];
export const AVOID_TAGS = ["dairy", "nuts", "spicy"];

/**
 * Menude GERCEKTEN bulunan etiketleri doner.
 *
 * Sabit listeyi cizmek bos sonuc ureten dugmeler dogururdu: bu menude hicbir urune
 * `vegan` ya da `gluten_free` atanmamis (mutfak dogrulamasi bekliyor).
 */
export function availableFilterTags(products) {
  const present = new Set();
  for (const product of products) {
    for (const tag of product.tags ?? []) present.add(tag);
  }

  return {
    diet: DIET_TAGS.filter((tag) => present.has(tag)),
    avoid: AVOID_TAGS.filter((tag) => present.has(tag)),
  };
}

/**
 * Secili diyet etiketlerinin HEPSINI tasiyan ve secili kacinma etiketlerinin
 * HICBIRINI tasimayan urunler gecer.
 */
export function productPassesFilters(product, dietTags, avoidTags) {
  const tags = new Set(product.tags ?? []);

  for (const tag of dietTags) {
    if (!tags.has(tag)) return false;
  }
  for (const tag of avoidTags) {
    if (tags.has(tag)) return false;
  }
  return true;
}

/** Aktif suzgec sayisi - "Temizle" dugmesini ve rozeti surer. */
export function activeFilterCount(dietTags, avoidTags) {
  return dietTags.length + avoidTags.length;
}

/** Bir etiketi listede varsa cikarir yoksa ekler. */
export function toggleTag(list, tag) {
  return list.includes(tag)
    ? list.filter((item) => item !== tag)
    : [...list, tag];
}
