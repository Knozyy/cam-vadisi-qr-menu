import { ListPlus } from "@phosphor-icons/react";
import { formatPrice, rowPrice } from "../../shared/price.js";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";
import { QuantityControl } from "./QuantityControl.jsx";

/**
 * Listem'in ortak govdesi. Mobil bottom sheet ve masaustu sabit paneli ayni
 * urun, adet ve toplam sunumunu kullanir; liste is mantigi MenuPage'te kalir.
 */
export function MenuListContent({
  products,
  quantities,
  total,
  hasEstimate,
  onIncrement,
  onDecrement,
  onOpen,
  className = "",
}) {
  const { t } = useLang();

  return (
    <div
      className={`classic-list-content classic-list-sheet ${className}`.trim()}
    >
      {products.length === 0 ? (
        <div className="classic-list-content-empty classic-list-empty">
          <ListPlus size={34} weight="regular" aria-hidden="true" />
          <p>{t(UI.myListEmpty)}</p>
          <span>{t(UI.myListHint)}</span>
        </div>
      ) : (
        <>
          <ul className="classic-list-content-items">
            {products.map((product) => {
              const image = product.imageThumb || product.imageFull;
              const price = rowPrice(product).price;
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(product)}
                    className="classic-list-item-main"
                  >
                    {image && (
                      <img
                        src={image}
                        alt=""
                        width="54"
                        height="54"
                        loading="lazy"
                      />
                    )}
                    <span>
                      <strong>{t(product.name)}</strong>
                      {price != null && (
                        <small>
                          <bdi dir="ltr">{formatPrice(price)}</bdi>
                        </small>
                      )}
                    </span>
                  </button>
                  <QuantityControl
                    product={product}
                    quantity={quantities[product.id] ?? 0}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                  />
                </li>
              );
            })}
          </ul>

          <div className="classic-list-content-total classic-sheet-total">
            <span>{hasEstimate ? t(UI.minimumTotal) : t(UI.listTotal)}</span>
            <strong>
              <bdi dir="ltr">{formatPrice(total)}</bdi>
            </strong>
          </div>
        </>
      )}
    </div>
  );
}

export function MenuListClearButton({ onClear, className = "" }) {
  const { t } = useLang();

  return (
    <button
      type="button"
      onClick={onClear}
      className={`classic-list-content-clear h-11 rounded-xl border border-line-strong text-[14px] font-semibold text-muted ${className || "w-full"}`}
    >
      {t(UI.clearList)}
    </button>
  );
}
