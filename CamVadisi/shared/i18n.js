/**
 * Ceviri fallback zinciri. Hem sunucu hem istemci ayni mantigi kullanir.
 *
 * Zincir: secili dil -> EN -> TR
 * Sebep: isletme panelden yeni urun ekledinde AR/RU alanlari bos kalir; menu bos
 * satir gostermek yerine anlasilabilir bir metne duser.
 */

export const LANGS = ['tr', 'en', 'ar', 'ru'];
export const DEFAULT_LANG = 'tr';
export const RTL_LANGS = ['ar'];

/** Dillerin kendi dilindeki adlari - dil seciciler ve istatistik icin. */
export const LANG_NAMES = {
  tr: 'Türkçe',
  en: 'English',
  ar: 'العربية',
  ru: 'Русский',
};

/** DB satirindaki alan adi: tr icin sade, digerleri icin _<lang> ekli. */
export function fieldFor(field, lang) {
  return lang === 'tr' ? field : `${field}_${lang}`;
}

/**
 * Cok dilli bir alani secili dile cozer.
 * @param {object} row - { name, name_en, name_ar, name_ru } gibi duz satir
 */
export function pick(row, field, lang) {
  if (!row) return '';
  const chain = [lang, 'en', 'tr'];
  for (const candidate of chain) {
    const value = row[fieldFor(field, candidate)];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return '';
}

/** Duz satiri { tr, en, ar, ru } sozlugune cevirir - API bu bicimde doner. */
export function toBundle(row, field) {
  const bundle = {};
  for (const lang of LANGS) bundle[lang] = row[fieldFor(field, lang)] || '';
  return bundle;
}

/** API'den gelen { tr, en, ar, ru } sozlugunu secili dile cozer. */
export function fromBundle(bundle, lang) {
  if (!bundle) return '';
  for (const candidate of [lang, 'en', 'tr']) {
    const value = bundle[candidate];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return '';
}

/** Tarayici dilini destekledigimiz bir dile esler. */
export function normalizeLang(raw) {
  if (!raw) return DEFAULT_LANG;
  const base = String(raw).toLowerCase().split('-')[0];
  return LANGS.includes(base) ? base : DEFAULT_LANG;
}

export function isRtl(lang) {
  return RTL_LANGS.includes(lang);
}
