import { Minus, Plus } from "@phosphor-icons/react";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";

export function QuantityControl({
  product,
  quantity,
  onIncrement,
  onDecrement,
  className = "",
  expandedLabel = false,
}) {
  const { t } = useLang();
  const name = t(product.name);

  if (product.isSoldOut) {
    return (
      <span className={`classic-sold-out ${className}`}>{t(UI.soldOut)}</span>
    );
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => onIncrement(product.id)}
        className={`classic-add-button ${className}`}
        aria-label={`${name}: ${t(UI.addFav)}`}
      >
        <Plus size={16} weight="bold" aria-hidden="true" />
        {expandedLabel ? t(UI.addFav) : t(UI.add)}
      </button>
    );
  }

  return (
    <div
      className={`classic-quantity ${className}`}
      aria-label={`${name}: ${quantity}`}
    >
      <button
        type="button"
        onClick={() => onDecrement(product.id)}
        aria-label={`${name}: ${t(UI.decrease)}`}
      >
        <Minus size={15} weight="bold" aria-hidden="true" />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        type="button"
        onClick={() => onIncrement(product.id)}
        aria-label={`${name}: ${t(UI.increase)}`}
      >
        <Plus size={15} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
