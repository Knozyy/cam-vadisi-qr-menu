import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { HeartIcon } from './icons.jsx';
import { PriceLabel } from './PriceLabel.jsx';
import { TagBadges } from './TagBadges.jsx';

/**
 * Listede tek urun satiri. Sadece THUMBNAIL kullanir (160px); tam boy gorsel
 * yalnizca detay paneli acilinca cekilir - zayif sebekede bant genisligi onemli.
 */
export function ProductRow({ product, isFav, onToggleFav, onOpen }) {
  const { t } = useLang();
  const name = t(product.name);
  const description = t(product.description);

  return (
    <li
      className={`flex items-start gap-3 border-t border-line bg-surface px-4 py-3 first:border-line-strong ${
        product.isSoldOut ? 'opacity-55' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="flex flex-1 items-start gap-3 text-start"
      >
        {product.imageThumb && (
          <img
            src={product.imageThumb}
            alt=""
            width="72"
            height="72"
            loading="lazy"
            decoding="async"
            /* bg: gorsel yuklenene kadar bos kare degil, yer tutan bir yuzey gorunsun */
            className="h-[72px] w-[72px] shrink-0 rounded-md bg-sage object-cover"
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">{name}</span>
          {description && (
            <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-muted">
              {description}
            </span>
          )}
          {/* Rozetler fiyattan AYRI satirda: fiyatla paylasinca 170px'e sikisip
              ikinci satira tasiyorlardi. Ayri satirda uc rozet tek satira sigar. */}
          {!product.isSoldOut && product.tags?.length > 0 && (
            <span className="mt-1.5 block">
              <TagBadges tags={product.tags} />
            </span>
          )}
          <span className="mt-1.5 flex items-center gap-2">
            {product.isSoldOut && (
              <span className="rounded bg-muted-soft px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {t(UI.soldOut)}
              </span>
            )}
            <PriceLabel product={product} />
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggleFav(product.id)}
        aria-pressed={isFav}
        aria-label={isFav ? t(UI.removeFav) : t(UI.addFav)}
        className={`mt-0.5 shrink-0 p-1 ${isFav ? 'text-resin' : 'text-muted-soft'}`}
      >
        <HeartIcon filled={isFav} />
      </button>
    </li>
  );
}
