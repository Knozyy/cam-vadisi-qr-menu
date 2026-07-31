import { CaretUp } from "@phosphor-icons/react";
import { formatPrice } from "../../shared/price.js";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";

export function MenuListBar({ count, total, hasEstimate, onOpen }) {
  const { t } = useLang();

  return (
    <div className="classic-list-bar-wrap">
      <button type="button" onClick={onOpen} className="classic-list-bar">
        <span className="classic-list-count">{count}</span>
        <span className="classic-list-copy">
          <strong>{t(UI.myList)}</strong>
          <span>
            {count > 0
              ? `${count} ${t(UI.selectedItems)}`
              : t(UI.myListEmptyShort)}
          </span>
        </span>
        <span className="classic-list-total">
          {hasEstimate && <small>{t(UI.from)}</small>}
          {formatPrice(total)}
        </span>
        <CaretUp
          className="classic-list-caret"
          size={18}
          weight="bold"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
