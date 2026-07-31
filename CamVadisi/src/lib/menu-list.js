import { rowPrice } from "../../shared/price.js";

export function selectionUnitPrice(product) {
  return rowPrice(product).price ?? 0;
}

export function menuListTotals(products, quantities) {
  return products.reduce(
    (totals, product) => {
      const quantity = Math.max(0, Number(quantities[product.id]) || 0);
      if (quantity === 0) return totals;

      totals.count += quantity;
      totals.total += selectionUnitPrice(product) * quantity;
      totals.hasEstimate ||= (product.variants?.length ?? 0) > 1;
      return totals;
    },
    { count: 0, total: 0, hasEstimate: false },
  );
}
