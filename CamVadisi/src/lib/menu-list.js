import { rowPrice } from "../../shared/price.js";

export function selectionUnitPrice(product) {
  return rowPrice(product).price ?? 0;
}

/**
 * Menuden kalkan urunlerin adetlerini listeden duser.
 *
 * Isletme bir urunu gizlerse ya da silerse misafirin deposunda o kimlik kalir;
 * budama yapilmazsa ust bardaki sayac hic dusmeyen bir "hayalet" gosterir ve
 * misafir listeyi acinca bos ekran gorup temizleyemez.
 *
 * Hicbir sey dusmediyse AYNI nesne doner - gereksiz state guncellemesi ve
 * bunun tetikleyecegi depo yazimi olmasin diye.
 */
export function pruneQuantities(quantities, validIds) {
  const valid = validIds instanceof Set ? validIds : new Set(validIds);
  const next = {};
  let removed = 0;

  for (const [id, quantity] of Object.entries(quantities)) {
    // Urun kimlikleri sayi, nesne anahtarlari metin - iki bicimi de kabul et.
    if (valid.has(id) || valid.has(Number(id))) next[id] = quantity;
    else removed += 1;
  }

  return { quantities: removed === 0 ? quantities : next, removed };
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
