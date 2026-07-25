import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fromBundle, isRtl, LANG_NAMES, normalizeLang } from '../../shared/i18n.js';

const KEY = 'cam-vadisi-dil';
const LangContext = createContext(null);

export { LANG_NAMES };

/**
 * Arapca font TALEP UZERINE yuklenir.
 *
 * IBM Plex Sans Arabic ~124 KB (Arapca glif seti buyuk). Bunu index.html'e koymak
 * TR/EN/RU misafirin hicbir ise yaramayan 124 KB indirmesi demekti - zayif sebekede
 * kabul edilemez. Arapca secilince tek sefer eklenir.
 */
const ARABIC_FONT_ID = 'cv-arabic-font';

function ensureArabicFont() {
  if (document.getElementById(ARABIC_FONT_ID)) return;
  const link = document.createElement('link');
  link.id = ARABIC_FONT_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap';
  document.head.append(link);
}

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return normalizeLang(saved);
  } catch {
    /* yoksa tarayici diline bak */
  }
  return normalizeLang(navigator.language);
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  // Dil degisince belge yonu ve lang niteligi guncellenir (RTL dahil).
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = isRtl(lang) ? 'rtl' : 'ltr';
    if (isRtl(lang)) ensureArabicFont();
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* onemli degil */
    }
  }, [lang]);

  const setLang = useCallback((next) => setLangState(normalizeLang(next)), []);

  // t(): cok dilli sozlugu ({tr,en,ar,ru}) secili dile cozer, fallback zinciriyle.
  const t = useCallback((bundle) => fromBundle(bundle, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, rtl: isRtl(lang) }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang bir LangProvider içinde kullanılmalı');
  return ctx;
}
