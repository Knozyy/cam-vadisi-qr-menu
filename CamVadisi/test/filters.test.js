import assert from "node:assert/strict";
import test from "node:test";
import {
  availableFilterTags,
  productPassesFilters,
  toggleTag,
} from "../src/lib/filters.js";

const products = [
  { id: 1, tags: ["vegetarian", "dairy"] },
  { id: 2, tags: ["vegetarian"] },
  { id: 3, tags: ["nuts", "dairy"] },
  { id: 4, tags: [] },
];

test("yalnizca menude bulunan etiketler suzgecte cikar", () => {
  // Bu menuye hic `vegan`/`gluten_free` atanmadi - dugmesi de cizilmemeli,
  // yoksa bos sonuc ureten bir suzgec olur.
  const available = availableFilterTags(products);

  assert.deepEqual(available.diet, ["vegetarian"]);
  assert.deepEqual(available.avoid, ["dairy", "nuts"]);
});

test("etiketsiz menude suzgec hic gosterilmez", () => {
  const available = availableFilterTags([{ id: 9, tags: [] }]);

  assert.deepEqual(available.diet, []);
  assert.deepEqual(available.avoid, []);
});

test("diyet etiketi ICEREN urunler gecer", () => {
  assert.equal(productPassesFilters(products[0], ["vegetarian"], []), true);
  assert.equal(productPassesFilters(products[2], ["vegetarian"], []), false);
});

test("kacinma etiketi ICERMEYEN urunler gecer - ters anlam", () => {
  assert.equal(productPassesFilters(products[0], [], ["dairy"]), false);
  assert.equal(productPassesFilters(products[1], [], ["dairy"]), true);
});

test("birden cok diyet etiketi VE ile birlesir", () => {
  const both = { id: 5, tags: ["vegetarian", "gluten_free"] };

  assert.equal(
    productPassesFilters(both, ["vegetarian", "gluten_free"], []),
    true,
  );
  assert.equal(
    productPassesFilters(products[1], ["vegetarian", "gluten_free"], []),
    false,
  );
});

test("diyet ve kacinma ayni anda uygulanir", () => {
  // Vejetaryen ama sutsuz: 1 sutlu oldugu icin duser, 2 gecer.
  assert.equal(productPassesFilters(products[0], ["vegetarian"], ["dairy"]), false);
  assert.equal(productPassesFilters(products[1], ["vegetarian"], ["dairy"]), true);
});

test("etiketsiz urun kacinma suzgecinden gecer", () => {
  assert.equal(productPassesFilters(products[3], [], ["dairy", "nuts"]), true);
});

test("suzgec secimi acilir kapanir", () => {
  assert.deepEqual(toggleTag([], "dairy"), ["dairy"]);
  assert.deepEqual(toggleTag(["dairy"], "dairy"), []);
  assert.deepEqual(toggleTag(["dairy"], "nuts"), ["dairy", "nuts"]);
});
