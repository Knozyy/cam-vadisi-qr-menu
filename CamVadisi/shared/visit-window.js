/**
 * Ziyaret sayaci tekillestirme mantigi - saf fonksiyon, depolamadan bagimsiz.
 *
 * Sorun: ayni cihaz menuyu tekrar tekrar acinca "toplam acilis" sisiyordu (ayni sorun
 * Yedigul'de de yasandi). Bir yemek oturmasi boyunca misafir menuyu birkac kez
 * acar-kapatir; bunlarin hepsi TEK ziyaret sayilmali.
 *
 * 4 saat bir oturmayi kapsar; ayni gun ogle ve aksam gelen musteri dogru sekilde
 * 2 ziyaret sayilir.
 */

export const VISIT_WINDOW_MS = 4 * 60 * 60 * 1000;

/**
 * @param {Record<string, number>} store  key -> son sayim zamani (ms)
 * @param {string} key                    "kind:value"
 * @param {number} now                    Date.now()
 * @returns {{ count: boolean, store: Record<string, number>, changed: boolean }}
 *   count  : bu olay simdi sayilmali mi
 *   store  : guncellenmis depo (pencereyi gecen kayitlar atilmis)
 *   changed: deponun diske yazilmasi gerekiyor mu
 */
export function shouldCount(store, key, now = Date.now()) {
  const next = {};
  let changed = false;

  // Pencereyi gecmis kayitlari at - depo sinirsiz buyumesin.
  for (const [existing, stamp] of Object.entries(store ?? {})) {
    if (typeof stamp === 'number' && now - stamp <= VISIT_WINDOW_MS) {
      next[existing] = stamp;
    } else {
      changed = true;
    }
  }

  const seen = typeof next[key] === 'number';
  if (!seen) {
    next[key] = now;
    changed = true;
  }

  return { count: !seen, store: next, changed };
}
