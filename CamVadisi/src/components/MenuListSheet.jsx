import { ListPlus } from "@phosphor-icons/react";
import { formatPrice, rowPrice } from "../../shared/price.js";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";
import { QuantityControl } from "./QuantityControl.jsx";
import { Sheet } from "./Sheet.jsx";

export function MenuListSheet({
  products,
  quantities,
  total,
  hasEstimate,
  onIncrement,
  onDecrement,
  onOpen,
  onClear,
  onClose,
}) {
  const { t } = useLang();

  const footer = products.length > 0 && (
    <button
      type="button"
      onClick={onClear}
      className="h-11 w-full rounded-xl border border-line-strong text-[14px] font-semibold text-muted"
    >
      {t(UI.clearList)}
    </button>
  );

  return (
    <Sheet open onClose={onClose} title={t(UI.myList)} footer={footer}>
      <div className="classic-list-sheet">
        {products.length === 0 ? (
          <div className="classic-list-empty">
            <ListPlus size={34} weight="regular" aria-hidden="true" />
            <p>{t(UI.myListEmpty)}</p>
            <span>{t(UI.myListHint)}</span>
          </div>
        ) : (
          <>
            <ul>
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
                        {price != null && <small>{formatPrice(price)}</small>}
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

            <div className="classic-sheet-total">
              <span>{hasEstimate ? t(UI.minimumTotal) : t(UI.listTotal)}</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
