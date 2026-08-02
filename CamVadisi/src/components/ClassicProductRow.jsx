import { formatPrice, rowPrice } from "../../shared/price.js";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";
import { QuantityControl } from "./QuantityControl.jsx";

export function ClassicProductRow({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onOpen,
  stagger = 0,
}) {
  const { t } = useLang();
  const name = t(product.name);
  const description = t(product.description);
  const price = rowPrice(product);
  const image = product.imageThumb || product.imageFull;

  let pricePrefix = "";
  if (price.kind === "labelled") pricePrefix = t(price.label);
  else if (price.kind === "from") pricePrefix = t(UI.from);

  return (
    <li
      className={`classic-product-row ${product.isSoldOut ? "classic-product-row--sold-out" : ""}`}
      style={{ "--classic-stagger": `${Math.min(stagger, 8) * 32}ms` }}
    >
      {image && (
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="classic-product-image-button"
          aria-label={`${name}: ${t(UI.details)}`}
        >
          <img
            src={image}
            alt={name}
            width="88"
            height="88"
            loading="lazy"
            decoding="async"
          />
        </button>
      )}

      <div
        className={`classic-product-copy ${image ? "" : "classic-product-copy--wide"}`}
      >
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="classic-product-text-button"
        >
          <span className="classic-product-name">{name}</span>
          {description && (
            <span className="classic-product-description">{description}</span>
          )}
        </button>

        <div className="classic-product-bottom">
          {price.price != null ? (
            <span className="classic-product-price">
              {pricePrefix && <small>{pricePrefix}</small>}
              <bdi className="classic-product-price-value" dir="ltr">
                {formatPrice(price.price)}
              </bdi>
            </span>
          ) : (
            <span />
          )}
          <QuantityControl
            product={product}
            quantity={quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        </div>
      </div>
    </li>
  );
}
