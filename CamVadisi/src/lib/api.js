import { shouldCount } from '../../shared/visit-window.js';

/** Misafir menusunu ceker. Service worker araya girip cevrimdisi da yanit verebilir. */
export async function fetchMenu() {
  const response = await fetch('/api/menu', { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Menü alınamadı (${response.status})`);
  return response.json();
}

const VISIT_KEY = 'cam-vadisi-sayac';

/**
 * Tekillestirme penceresi icinde bu olay daha once sayildi mi?
 * Karar mantigi `shared/visit-window.js`'te (saf, test edilir); burada yalnizca
 * localStorage okuma/yazma var.
 *
 * localStorage erisilemezse (gizli sekme) olay sayilir - sayim kaybetmek yerine
 * nadir bir sisme tercih edilir.
 */
function passesWindow(key) {
  let store;
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    store = raw ? JSON.parse(raw) : {};
  } catch {
    return true;
  }

  const result = shouldCount(store, key, Date.now());
  if (result.changed) {
    try {
      localStorage.setItem(VISIT_KEY, JSON.stringify(result.store));
    } catch {
      /* kota dolu - sayim yine gonderilir */
    }
  }
  return result.count;
}

/**
 * Ziyaret sayaci - kisisel veri gondermez, hata yutulur.
 * Menunun acilisini engellememesi icin bilincli olarak beklenmez.
 */
export function trackView(kind, value = '') {
  if (!passesWindow(`${kind}:${value}`)) return;
  try {
    const body = JSON.stringify({ kind, value });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/stats/view', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/stats/view', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* sayac kritik degil */
  }
}
