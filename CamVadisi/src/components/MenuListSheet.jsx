import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";
import {
  MenuListClearButton,
  MenuListContent,
} from "./MenuListContent.jsx";
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
    <MenuListClearButton onClear={onClear} />
  );

  return (
    <Sheet open onClose={onClose} title={t(UI.myList)} footer={footer}>
      <MenuListContent
        products={products}
        quantities={quantities}
        total={total}
        hasEstimate={hasEstimate}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onOpen={onOpen}
      />
    </Sheet>
  );
}
