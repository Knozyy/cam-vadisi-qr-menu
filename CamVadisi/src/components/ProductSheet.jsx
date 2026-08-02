import { useEffect, useState } from "react";
import { formatPrice } from "../../shared/price.js";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";
import { ChevronIcon } from "./icons.jsx";
import { QuantityControl } from "./QuantityControl.jsx";
import { Sheet } from "./Sheet.jsx";
import { TagBadges } from "./TagBadges.jsx";

/** Urun detayi: tam boy gorsel + varyantlar + rozetler + katlanir icindekiler. */
export function ProductSheet({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onClose,
}) {
  const { t } = useLang();
  const [showIngredients, setShowIngredients] = useState(false);

  // Yeni urun acildiginda icindekiler yine kapali baslasin.
  useEffect(() => setShowIngredients(false), [product?.id]);

  if (!product) return null;

  const ingredients = t(product.ingredients);
  const description = t(product.description);

  const footer = (
    <QuantityControl
      product={product}
      quantity={quantity}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
      className="classic-quantity--sheet"
      expandedLabel
    />
  );

  return (
    <Sheet open onClose={onClose} title={t(product.name)} footer={footer}>
      <div className="overflow-y-auto pb-4">
        {product.imageFull && (
          <img
            src={product.imageFull}
            alt={t(product.name)}
            className="mx-4 mt-3 h-52 w-[calc(100%-2rem)] rounded-[6px_22px_6px_22px] bg-sage object-cover"
            loading="lazy"
            decoding="async"
          />
        )}

        {description && (
          <p className="px-4 pt-3 text-[14px] leading-relaxed text-muted">
            {description}
          </p>
        )}

        {product.tags?.length > 0 && (
          <div className="px-4 pt-3.5">
            <TagBadges tags={product.tags} size="md" />
          </div>
        )}

        {product.variants?.length > 0 && (
          <div className="mx-4 mt-4 overflow-hidden rounded-xl border border-line-strong">
            <h3 className="border-b border-line bg-sage/60 px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
              {t(UI.portions)}
            </h3>
            <ul>
              {product.variants.map((variant) => (
                <li
                  key={variant.id}
                  className="flex items-center border-t border-line px-3.5 py-3 text-[15px] first:border-t-0"
                >
                  <span className="text-ink">{t(variant.name)}</span>
                  <span className="ms-auto font-semibold text-pine tabular-nums">
                    <bdi dir="ltr">{formatPrice(variant.price)}</bdi>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* `?.length === 0` yazilirsa variants tanimsiz oldugunda (undefined === 0 -> false)
            fiyat hic gorunmezdi. `!length` hem bos dizi hem tanimsiz durumu kapsar. */}
        {!product.variants?.length && product.basePrice != null && (
          <div className="mx-4 mt-4 flex items-center rounded-xl border border-line-strong px-3.5 py-3">
            <span className="text-[13px] font-semibold uppercase tracking-widest text-muted">
              {t(UI.price)}
            </span>
            <span className="ms-auto text-lg font-semibold text-pine tabular-nums">
              <bdi dir="ltr">{formatPrice(product.basePrice)}</bdi>
            </span>
          </div>
        )}

        {ingredients && (
          <div className="mx-4 mt-4 border-t border-line-strong">
            <button
              type="button"
              onClick={() => setShowIngredients((v) => !v)}
              aria-expanded={showIngredients}
              className="flex w-full items-center gap-2 py-3.5 text-start text-[14px] font-semibold text-ink"
            >
              {t(UI.ingredients)}
              <ChevronIcon
                className={`ms-auto text-muted-soft transition-transform ${showIngredients ? "rotate-180" : ""}`}
              />
            </button>
            {showIngredients && (
              <p className="pb-4 text-[14px] leading-relaxed text-muted">
                {ingredients}
              </p>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}
