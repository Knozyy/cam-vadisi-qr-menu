import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { ContourBand, HeartIcon } from './icons.jsx';
import { LangStrip } from './LangStrip.jsx';

/**
 * Menu sayfasinin ust bari: logo banner + dil bayraklari + favori sayaci.
 *
 * Banner burada, footer'da DEGIL (kullanici karari): marka misafirin ilk gordugu sey
 * olmali. Bar YAPISKAN DEGIL - kaydirinca yukari kayip gider ve yalnizca arama +
 * kategori sekmeleri yapiskan kalir. Boylece ilk bakista marka guclu, menude
 * gezinirken ekran kompakt olur.
 */
export function TopBar({ restaurantName, favCount, onOpenFavorites, onOpenHome }) {
  const { t } = useLang();

  return (
    <header className="relative bg-pine px-3 pt-[calc(env(safe-area-inset-top)+10px)] pb-3 text-sage">
      {/* Kontur yalnizca kendi katmaninda kirpilir. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <ContourBand className="absolute inset-0 h-full w-full opacity-15" />
      </div>

      <button type="button" onClick={onOpenHome} className="relative block w-full" aria-label={t(UI.backHome)}>
        <img
          src="/logo-banner.webp"
          srcSet="/logo-banner-sm.webp 640w, /logo-banner.webp 1200w"
          sizes="(max-width: 448px) 100vw, 448px"
          alt={restaurantName}
          width="1200"
          height="509"
          /* Ilk ekranda gorunur: lazy DEGIL, aksi halde marka gec gelir. */
          fetchPriority="high"
          decoding="async"
          className="w-full rounded-lg bg-pine"
        />
      </button>

      <div className="relative mt-3 flex items-center gap-2">
        <LangStrip className="flex-1" />
        <button
          type="button"
          onClick={onOpenFavorites}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-white/12 px-3 text-[13px] font-semibold"
          aria-label={t(UI.myList)}
        >
          <HeartIcon filled width={18} height={18} />
          {favCount > 0 && (
            <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-resin px-1 text-[11px] font-bold text-resin-ink">
              {favCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
