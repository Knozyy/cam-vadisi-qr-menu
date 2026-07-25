/**
 * Alerjen / diyet etiketleri.
 *
 * Bunlar cevrilebilir sutun DEGIL sabit kimliktir: panelde kutu isaretlenir,
 * 4 dildeki karsiligi burada durur. Yedigul'de bu bilgi `alg_ar`/`alg_ru` gibi
 * serbest metin sutunlarindaydi ve urun basina 4 alan doldurmak gerekiyordu.
 */

/**
 * Her etiketin iki bicimi var:
 *  - tam ad  -> urun detay panelinde (yer bol, netlik onemli)
 *  - `short` -> menu satirinda (uc rozet yan yana sigmali, ikinci satira tasmamali)
 * `short` yoksa tam ad kullanilir.
 */
export const TAGS = {
  vegetarian:  { tr: 'Vejetaryen',       en: 'Vegetarian',    ar: 'نباتي',            ru: 'Вегетарианское',
                 short: { tr: 'Vejetaryen', en: 'Veggie',     ar: 'نباتي',            ru: 'Вегет.' } },
  vegan:       { tr: 'Vegan',            en: 'Vegan',         ar: 'نباتي صرف',        ru: 'Веганское',
                 short: { tr: 'Vegan',   en: 'Vegan',         ar: 'نباتي صرف',        ru: 'Веган' } },
  gluten_free: { tr: 'Glutensiz',        en: 'Gluten free',   ar: 'خالٍ من الغلوتين', ru: 'Без глютена',
                 short: { tr: 'Glutensiz', en: 'No gluten',   ar: 'بلا غلوتين',       ru: 'Без глют.' } },
  spicy:       { tr: 'Acı',              en: 'Spicy',         ar: 'حار',              ru: 'Острое',
                 short: { tr: 'Acı',     en: 'Spicy',         ar: 'حار',              ru: 'Остр.' } },
  nuts:        { tr: 'Kuruyemiş içerir', en: 'Contains nuts', ar: 'يحتوي مكسرات',     ru: 'Содержит орехи',
                 short: { tr: 'Kuruyemiş', en: 'Nuts',        ar: 'مكسرات',           ru: 'Орехи' } },
  dairy:       { tr: 'Süt ürünü içerir', en: 'Contains dairy',ar: 'يحتوي ألبان',      ru: 'Содержит молоко',
                 short: { tr: 'Sütlü',   en: 'Dairy',         ar: 'ألبان',            ru: 'Молоко' } },
};

export const TAG_IDS = Object.keys(TAGS);

export function isValidTag(tag) {
  return Object.hasOwn(TAGS, tag);
}

export function tagLabel(tag, lang, { short = false } = {}) {
  const entry = TAGS[tag];
  if (!entry) return '';
  const source = short && entry.short ? entry.short : entry;
  return source[lang] || source.en || source.tr;
}
