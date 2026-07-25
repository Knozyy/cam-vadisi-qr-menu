import assert from 'node:assert/strict';
import test from 'node:test';
import { applyPercent, formatPrice, parsePrice, rowPrice } from '../shared/price.js';

test('fiyat simge sonda bicimlenir', () => {
  assert.equal(formatPrice(45000), '450 ₺');
  assert.equal(formatPrice(89000), '890 ₺');
});

test('kurus artigi virgulle gosterilir', () => {
  assert.equal(formatPrice(45050), '450,50 ₺');
  assert.equal(formatPrice(45005), '450,05 ₺');
});

test('panel girdisi kurusa cevrilir', () => {
  assert.equal(parsePrice('450'), 45000);
  assert.equal(parsePrice('450,50'), 45050);
  assert.equal(parsePrice('450 ₺'), 45000);
  assert.equal(parsePrice(450), 45000);
  assert.equal(parsePrice(''), null);
});

test('yuzde zam tam sayi kurus uretir', () => {
  assert.equal(applyPercent(38000, 10), 41800);
  // Yuvarlama tam sayida kalir - kayan noktali birikme olmaz
  assert.equal(Number.isInteger(applyPercent(33333, 7)), true);
  assert.equal(applyPercent(45000, -20), 36000);
});

test('varyantsiz urun tek fiyat gosterir', () => {
  assert.deepEqual(rowPrice({ basePrice: 38000, variants: [] }), { kind: 'single', price: 38000 });
});

test('tek varyant etiketli fiyat gosterir', () => {
  // "kisi basi 450 ₺" durumu: ayri bir price_note sutunu yerine varyant ile modellenir
  const result = rowPrice({ variants: [{ price: 45000, name: { tr: 'Kişi başı' } }] });
  assert.equal(result.kind, 'labelled');
  assert.equal(result.price, 45000);
  assert.deepEqual(result.label, { tr: 'Kişi başı' });
});

test('birden cok varyantta en dusuk fiyat gosterilir', () => {
  const result = rowPrice({ variants: [{ price: 89000 }, { price: 48000 }] });
  assert.deepEqual(result, { kind: 'from', price: 48000 });
});
