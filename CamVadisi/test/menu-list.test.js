import assert from "node:assert/strict";
import test from "node:test";
import {
  menuListTotals,
  pruneQuantities,
  selectionUnitPrice,
} from "../src/lib/menu-list.js";

const products = [
  {
    id: 1,
    basePrice: 38000,
    variants: [],
  },
  {
    id: 2,
    basePrice: null,
    variants: [
      { id: 1, price: 48000 },
      { id: 2, price: 89000 },
    ],
  },
  {
    id: 3,
    basePrice: null,
    variants: [{ id: 3, price: 45000 }],
  },
];

test("liste birim fiyati varyantsiz urunde temel fiyattir", () => {
  assert.equal(selectionUnitPrice(products[0]), 38000);
});

test("cok varyantli urunde liste toplami en dusuk varyanttan hesaplanir", () => {
  assert.equal(selectionUnitPrice(products[1]), 48000);

  const totals = menuListTotals(products, { 1: 2, 2: 1, 3: 1 });
  assert.deepEqual(totals, {
    count: 4,
    total: 169000,
    hasEstimate: true,
  });
});

test("sifir ve gecersiz adetler toplama girmez", () => {
  const totals = menuListTotals(products, { 1: 0, 2: -4, 3: "abc" });
  assert.deepEqual(totals, {
    count: 0,
    total: 0,
    hasEstimate: false,
  });
});

test("menuden kalkan urun listeden dusuruluyor - HAYALET SAYAC hatasi", () => {
  // 999999 menude yok: isletme gizlemis ya da silmis.
  const { quantities, removed } = pruneQuantities(
    { 1: 2, 999999: 3 },
    [1, 2, 3],
  );

  assert.equal(removed, 1);
  assert.deepEqual(quantities, { 1: 2 });
});

test("budama hicbir sey dusurmezse AYNI nesneyi doner", () => {
  // Ayni referans donmezse state her menu yuklemesinde bosuna guncellenir.
  const current = { 1: 2, 3: 1 };
  const result = pruneQuantities(current, [1, 2, 3]);

  assert.equal(result.removed, 0);
  assert.equal(result.quantities, current);
});

test("budama metin ve sayi kimlikleri birlikte kabul eder", () => {
  // Urun kimligi sayi, localStorage anahtari metindir.
  const { removed } = pruneQuantities({ 1: 1 }, new Set(["1"]));
  assert.equal(removed, 0);
});

test("tukenen urun listedeyse toplamda kalir - misafir cikarabilmeli", () => {
  const soldOut = [{ id: 9, basePrice: 12000, variants: [], isSoldOut: true }];
  const totals = menuListTotals(soldOut, { 9: 2 });

  assert.equal(totals.count, 2);
  assert.equal(totals.total, 24000);
});
