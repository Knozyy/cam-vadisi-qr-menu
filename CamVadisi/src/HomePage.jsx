import { useEffect, useMemo, useState } from 'react';
import { CategoryMosaic } from './components/CategoryMosaic.jsx';
import { HighlightRail } from './components/HighlightRail.jsx';
import { LangStrip } from './components/LangStrip.jsx';
import { PineMark } from './components/PineMark.jsx';
import { ProductSheet } from './components/ProductSheet.jsx';
import { useLang } from './lib/LangContext.jsx';
import { trackView } from './lib/api.js';
import { UI } from './lib/ui-strings.js';
import { useFavorites } from './lib/useFavorites.js';

/** "5322440815" -> "0532 244 08 15" - okunur bicim. */
function formatPhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  const national = digits.length === 10 ? `0${digits}` : digits;
  if (national.length !== 11) return raw;
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7, 9)} ${national.slice(9)}`;
}

/**
 * Tanitim ana sayfasi. QR dogrudan /menu'yu acar; bu sayfa arama/paylasim yoluyla
 * gelen ziyaretcinin mekani taniyip menuye gectigi yerdir.
 *
 * Bolumler `.reveal` ile kaydirinca ortaya cikar - CSS scroll-driven animation,
 * JS gozlemci yok (bkz. styles.css).
 */
export function HomePage({ menu, onOpenMenu, onOpenCategory }) {
  const { t } = useLang();
  const favorites = useFavorites();
  const [openProduct, setOpenProduct] = useState(null);
  const settings = menu.settings ?? {};
  const categories = menu.categories ?? [];

  useEffect(() => {
    trackView('open');
  }, []);

  /*
   * One cikanlar: her kategoriden IKINCI fotografli urun.
   *
   * Neden ikinci: kategori mozaiginin kapagi ILK fotografli urunu kullaniyor.
   * Ilk urunu burada da gostermek ayni fotografi sayfada iki kez tekrarlamak olurdu -
   * ikinciyi almak iki bolumun farkli urunler gostermesini garanti eder.
   */
  const highlights = useMemo(() => {
    const picked = [];
    for (const category of categories) {
      const withPhoto = (category.products ?? []).filter(
        (p) => !p.isSoldOut && (p.imageFull || p.imageThumb),
      );
      const product = withPhoto[1] ?? withPhoto[0];
      if (product) picked.push(product);
      if (picked.length === 6) break;
    }
    return picked;
  }, [categories]);

  const productCount = useMemo(
    () => categories.reduce((sum, c) => sum + (c.products?.length ?? 0), 0),
    [categories],
  );

  /** Konum linki: iframe YOK - Kovan'daki CSP frame-src tuzagina girmemek icin. */
  const mapsUrl = settings.location?.length === 2
    ? `https://www.google.com/maps/search/?api=1&query=${settings.location[0]},${settings.location[1]}`
    : settings.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
      : null;

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-sage">
      <header className="relative bg-pine px-3 pt-[calc(env(safe-area-inset-top)+10px)] pb-4 text-sage">
        <img
          src="/logo-banner.webp"
          srcSet="/logo-banner-sm.webp 640w, /logo-banner.webp 1200w"
          sizes="(max-width: 448px) 100vw, 448px"
          alt={settings.restaurantName ?? 'Çam Vadisi'}
          width="1200"
          height="509"
          fetchPriority="high"
          decoding="async"
          className="w-full rounded-lg bg-pine"
        />
        <div className="mt-3">
          <LangStrip />
        </div>
      </header>

      {/* Konum satiri: mekanin en ayirt edici bilgisi - orman VE deniz bir arada. */}
      <p className="flex items-center justify-center gap-2 border-b border-line bg-[#DDE3D8] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
        <PineMark className="h-3.5 w-3.5 shrink-0 text-pine" />
        {t(UI.locationLine)}
      </p>

      {/* Iki eylem: menu birincil (kehribar dolgu), yol tarifi ikincil (cerceve). */}
      <div className="flex gap-2 px-4 pt-4">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-resin text-[17px] font-semibold text-resin-ink"
        >
          {t(UI.viewMenu)}
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
            className="rtl:-scale-x-100"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl border border-pine px-4 text-[15px] font-semibold text-pine"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 21s-7-6-7-11a7 7 0 1 1 14 0c0 5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {t(UI.directions)}
          </a>
        )}
      </div>

      <section className="reveal px-4 pt-7">
        <h2 className="font-display balance text-xl font-semibold text-pine">{t(UI.welcomeTitle)}</h2>
        <p className="pretty mt-2 text-[15px] leading-relaxed text-muted">{t(UI.welcomeText)}</p>
      </section>

      {/* IMZA: kategori mozaigi. Menuye girmeden ne oldugunu gosterir ve
          dogrudan o bolume atlar. */}
      {categories.length > 0 && (
        <section className="reveal pt-8">
          <div className="flex items-baseline gap-3 px-4 pb-3">
            <h2 className="font-display text-xl font-semibold text-pine">{t(UI.whatsOnMenu)}</h2>
            <span className="h-px flex-1 bg-line-strong" />
            <span className="whitespace-nowrap text-[11px] text-muted tabular-nums">{productCount}</span>
          </div>
          <CategoryMosaic categories={categories} onSelect={onOpenCategory} />
        </section>
      )}

      {highlights.length > 0 && (
        <section className="reveal pt-8">
          <div className="flex items-baseline gap-3 px-4 pb-3">
            <h2 className="font-display text-xl font-semibold text-pine">{t(UI.highlights)}</h2>
            <span className="h-px flex-1 bg-line-strong" />
            <span className="whitespace-nowrap text-[11px] text-muted">{t(UI.highlightsHint)}</span>
          </div>
          <HighlightRail products={highlights} onSelect={setOpenProduct} />
        </section>
      )}

      {(settings.address || settings.phones?.length > 0) && (
        <section className="reveal px-4 pt-8">
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-widest text-muted">
            {t(UI.findUs)}
          </h2>
          {settings.address && (
            <p className="pretty text-[15px] leading-relaxed text-ink">{settings.address}</p>
          )}
          {settings.phones?.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {settings.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] font-semibold text-pine tabular-nums"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
                    </svg>
                    {formatPhone(phone)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {settings.hours?.length > 0 && (
        <section className="reveal px-4 pt-8">
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-widest text-muted">
            {t(UI.hours)}
          </h2>
          <dl className="text-[15px]">
            {settings.hours.map((row, index) => (
              <div key={index} className="flex items-baseline justify-between border-b border-line py-1.5 last:border-0">
                <dt className="text-ink">{row.day}</dt>
                <dd className="text-muted tabular-nums">
                  {row.open} – {row.close}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <footer className="mt-9 flex flex-col items-center gap-2 border-t border-line px-4 pt-7 pb-[calc(env(safe-area-inset-bottom)+28px)] text-center">
        <PineMark className="h-8 w-8 text-gold" />
        <p className="font-display balance text-[15px] font-semibold text-pine">{t(UI.slogan)}</p>
      </footer>

      {openProduct && (
        <ProductSheet
          product={openProduct}
          isFav={favorites.has(openProduct.id)}
          onToggleFav={favorites.toggle}
          onClose={() => setOpenProduct(null)}
        />
      )}
    </div>
  );
}
