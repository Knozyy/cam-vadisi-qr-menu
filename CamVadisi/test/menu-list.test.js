import assert from "node:assert/strict";
import test from "node:test";
import { menuListTotals, selectionUnitPrice } from "../src/lib/menu-list.js";

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
