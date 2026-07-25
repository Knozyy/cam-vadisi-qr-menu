import { formatPrice, rowPrice } from '../../shared/price.js';
import { useLang } from '../lib/LangContext.jsx';

/**
 * Kaydirmali kart rayi (snap-scroll) - Kovan'da onaylanmis desen
 * ([[tasarim-modelleri]], Beykoz Balik Ekmek). Otomatik gecis YOK: fiyat okuyan
 * misafir konumunu kaybetmemeli ve `prefers-reduced-motion` ile celismemeli.
 *
 * Mobilde 1 tam + yarim kart gorunur; bu kaydirilabilirligi kendiliginden belli eder.
 */
export function HighlightRail({ products, onSelect }) {
  const { t } = useLang();
  if (!products.length) return null;

  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
      {products.map((product) => {
        const price = rowPrice(product);
        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect(product)}
            className="w-[62%] shrink-0 snap-start overflow-hidden rounded-xl border border-line-strong bg-surface text-start"
          >
            {product.imageFull && (
              <img
                src={product.imageFull}
                alt=""
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full bg-sage object-cover"
              />
            )}
            <span className="block px-3 py-2.5">
              <span className="block truncate font-semibold text-ink">{t(product.name)}</span>
              <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-muted">
                {t(product.description)}
              </span>
              {price.price != null && (
                <span className="mt-1.5 block font-semibold text-pine tabular-nums">
                  {formatPrice(price.price)}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
