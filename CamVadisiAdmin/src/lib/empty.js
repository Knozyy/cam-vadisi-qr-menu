import { LANGS } from '@shared/i18n.js';

/** Bos 4 dilli sozluk - yeni kayit formlari icin. */
export function emptyBundle() {
  return LANGS.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {});
}

export function emptyCategory() {
  return { name: emptyBundle(), timeStart: '', timeEnd: '', isHidden: false };
}

export function emptyProduct(categoryId) {
  return {
    categoryId,
    name: emptyBundle(),
    description: emptyBundle(),
    ingredients: emptyBundle(),
    basePrice: null,
    imageThumb: '',
    imageFull: '',
    isHidden: false,
    isSoldOut: false,
    tags: [],
    variants: [],
  };
}

/**
 * Bir bundle'da hangi dillerin bos oldugunu bulur - ceviri doluluk rozeti icin.
 * TR zaten zorunlu; yalnizca en/ar/ru eksigi raporlanir.
 */
export function missingLangs(product) {
  // Olcut urun ADI: aciklama bos olabilir ama ad her dilde olmali.
  return ['en', 'ar', 'ru'].filter((lang) => !product.name?.[lang]?.trim());
}
