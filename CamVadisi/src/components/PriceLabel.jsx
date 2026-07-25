import { formatPrice, rowPrice } from '../../shared/price.js';
import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';

/**
 * Menu satirindaki fiyat. Uc bicim:
 *  - tek fiyat            -> "380 ₺"
 *  - tek etiketli varyant -> "kişi başı 450 ₺"
 *  - cok varyant          -> "başlayan 480 ₺"
 */
export function PriceLabel({ product }) {
  const { t } = useLang();
  const info = rowPrice(product);
  if (info.price === null || info.price === undefined) return null;

  let prefix = '';
  if (info.kind === 'labelled') prefix = t(info.label);
  else if (info.kind === 'from') prefix = t(UI.from);

  return (
    <span className="ms-auto whitespace-nowrap font-semibold text-pine tabular-nums">
      {prefix && <span className="me-1 text-[11px] font-medium text-muted">{prefix}</span>}
      {formatPrice(info.price)}
    </span>
  );
}
