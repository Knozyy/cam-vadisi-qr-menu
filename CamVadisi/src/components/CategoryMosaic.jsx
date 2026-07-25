import { useState } from 'react';
import { useLang } from '../lib/LangContext.jsx';
import { PineMark } from './PineMark.jsx';

/**
 * IMZA OGESI: asimetrik kategori mozaigi.
 *
 * Neden bu: 90 gercek urun fotografi var ve menu satirlarinda yalnizca 72px'lik
 * karelerde goruluyordu. Ana sayfada kategorileri gercek fotograflariyla gostermek
 * hem sayfayi zenginlestiriyor hem KULLANISLILIGI artiriyor - misafir menuye girmeden
 * ne oldugunu goruyor ve dogrudan o kategoriye atliyor.
 *
 * Kontur bandi burada KULLANILMADI: Kovan kurali "kontur yalnizca ust barda,
 * ikinci bir yerde tekrarlanmaz" ([[tasarim-modelleri]]).
 *
 * Asimetri kasitli: her kategori ayni boyutta olsa siradan bir izgara olurdu.
 * Ilk kategori ve her 5. eleman genis - goz sayfada duruyor, tarama ritmi olusuyor.
 */
export function CategoryMosaic({ categories, onSelect }) {
  const { t } = useLang();
  if (!categories.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-2.5 px-4">
      {categories.map((category, index) => {
        // 0., 5., 10.... kategoriler tam genislik - ritim bozulmasi kasitli.
        const wide = index % 5 === 0;
        const count = category.products.length;

        return (
          <li key={category.slug} className={wide ? 'col-span-2' : ''}>
            <button
              type="button"
              onClick={() => onSelect(category.slug)}
              className="group relative block w-full overflow-hidden rounded-xl bg-pine text-start"
              style={{ aspectRatio: wide ? '21 / 9' : '4 / 3' }}
            >
              <CoverImage slug={category.slug} />

              {/* Metin okunurlugu icin alttan koyu gecis - fotograf ne olursa olsun
                  kategori adi okunmali. Ust tarafta gecis yok: fotograf net kalsin. */}
              <span
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, color-mix(in oklab, #24402F 88%, transparent) 0%, color-mix(in oklab, #24402F 40%, transparent) 45%, transparent 75%)',
                }}
              />

              <span className="absolute inset-x-0 bottom-0 flex items-end gap-2 p-3">
                <span className="min-w-0 flex-1">
                  <span className="font-display block truncate text-[16px] font-semibold text-sage">
                    {t(category.name)}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-sage/75 tabular-nums">
                    {count} çeşit
                  </span>
                </span>
                {/* Ok RTL'de aynalanir. */}
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden="true"
                  className="mb-0.5 shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 motion-reduce:transition-none"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Kategori kapagi. `-full.webp` (1000px, ~64 KB) yerine ozel uretilmis hafif kapak
 * kullanilir: 11 karo icin 708 KB yerine 225 KB.
 *
 * Dosya adi slug'dan tureiyor; kapagi olmayan kategoride (or. fotografsiz Sicak
 * Icecekler) cam isaretli koyu yuzeye duser - bos kare gorunmesin.
 */
function CoverImage({ slug }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="absolute inset-0 grid place-items-center">
        <PineMark className="h-10 w-10 text-gold/35" />
      </span>
    );
  }

  return (
    <img
      src={`/uploads/kapak-${slug}.webp`}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
}
