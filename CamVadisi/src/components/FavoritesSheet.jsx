import { formatPrice, rowPrice } from '../../shared/price.js';
import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { HeartIcon } from './icons.jsx';
import { Sheet } from './Sheet.jsx';

/**
 * "Listem": favori isaretlenen urunler. Siparis DEGIL - garsona okumak icin.
 * Urunler menu duzenindeki sirayla listelenir.
 */
export function FavoritesSheet({ products, favorites, onToggleFav, onOpen, onClose }) {
  const { t } = useLang();

  const footer = favorites.count > 0 && (
    <button
      type="button"
      onClick={favorites.clear}
      className="h-11 w-full rounded-xl border border-line-strong text-[14px] font-semibold text-muted"
    >
      {t(UI.clearList)}
    </button>
  );

  return (
    <Sheet open onClose={onClose} title={t(UI.myList)} footer={footer}>
      <div className="overflow-y-auto px-4 pb-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <HeartIcon width={32} height={32} className="text-line-strong" />
            <p className="mt-3 font-semibold text-ink">{t(UI.myListEmpty)}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{t(UI.myListHint)}</p>
          </div>
        ) : (
          <ul className="pt-1">
            {products.map((product) => {
              const info = rowPrice(product);
              return (
                <li key={product.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <button
                    type="button"
                    onClick={() => onOpen(product)}
                    className="flex flex-1 items-center gap-3 text-start"
                  >
                    {product.imageThumb && (
                      <img
                        src={product.imageThumb}
                        alt=""
                        width="48"
                        height="48"
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{t(product.name)}</span>
                      {info.price != null && (
                        <span className="text-[13px] text-muted tabular-nums">{formatPrice(info.price)}</span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFav(product.id)}
                    aria-label={t(UI.removeFav)}
                    className="shrink-0 p-1 text-resin"
                  >
                    <HeartIcon filled />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
