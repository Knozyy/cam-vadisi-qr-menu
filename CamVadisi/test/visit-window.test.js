import assert from 'node:assert/strict';
import test from 'node:test';
import { VISIT_WINDOW_MS, shouldCount } from '../shared/visit-window.js';

const T0 = 1_700_000_000_000;

test('ilk acilis sayilir', () => {
  const result = shouldCount({}, 'open:', T0);
  assert.equal(result.count, true);
  assert.equal(result.store['open:'], T0);
});

test('AYNI CIHAZ tekrar acinca sayilmaz - asil hata buydu', () => {
  const first = shouldCount({}, 'open:', T0);
  // Misafir menuyu kapatip 5 dakika sonra tekrar aciyor
  const second = shouldCount(first.store, 'open:', T0 + 5 * 60 * 1000);
  assert.equal(second.count, false);
  // Ve tekrar tekrar
  const third = shouldCount(second.store, 'open:', T0 + 30 * 60 * 1000);
  assert.equal(third.count, false);
});

test('pencere gectikten sonra yeniden sayilir', () => {
  const first = shouldCount({}, 'open:', T0);
  const later = shouldCount(first.store, 'open:', T0 + VISIT_WINDOW_MS + 1000);
  assert.equal(later.count, true, 'aksam tekrar gelen musteri yeni ziyaret sayilmali');
});

test('pencerenin tam sinirinda henuz sayilmaz', () => {
  const first = shouldCount({}, 'open:', T0);
  const edge = shouldCount(first.store, 'open:', T0 + VISIT_WINDOW_MS);
  assert.equal(edge.count, false);
});

test('farkli olaylar birbirini engellemez', () => {
  let store = {};
  const open = shouldCount(store, 'open:', T0);
  store = open.store;
  const lang = shouldCount(store, 'lang:tr', T0);
  store = lang.store;
  const category = shouldCount(store, 'category:mangal', T0);

  assert.equal(open.count, true);
  assert.equal(lang.count, true);
  assert.equal(category.count, true);
  assert.deepEqual(Object.keys(category.store).sort(), ['category:mangal', 'lang:tr', 'open:']);
});

test('dil degistirmek yeni dili sayar, eskisini tekrar saymaz', () => {
  let store = shouldCount({}, 'lang:tr', T0).store;
  const arabic = shouldCount(store, 'lang:ar', T0 + 1000);
  assert.equal(arabic.count, true, 'yeni dil ilgisi kaydedilmeli');
  store = arabic.store;
  const backToTurkish = shouldCount(store, 'lang:tr', T0 + 2000);
  assert.equal(backToTurkish.count, false, 'ayni dile donmek tekrar sayilmamali');
});

test('pencereyi gecen kayitlar depodan atilir - sinirsiz buyume yok', () => {
  const stale = {
    'category:eski-1': T0 - VISIT_WINDOW_MS - 1,
    'category:eski-2': T0 - VISIT_WINDOW_MS - 5000,
    'open:': T0 - 1000,
  };
  const result = shouldCount(stale, 'category:yeni', T0);
  assert.deepEqual(Object.keys(result.store).sort(), ['category:yeni', 'open:']);
  assert.equal(result.changed, true);
});

test('bozuk depo degeri cokme yaratmaz', () => {
  const result = shouldCount({ 'open:': 'bozuk' }, 'open:', T0);
  assert.equal(result.count, true, 'gecersiz zaman damgasi yok sayilmali');
});

test('bos/tanimsiz depo kabul edilir', () => {
  assert.equal(shouldCount(undefined, 'open:', T0).count, true);
  assert.equal(shouldCount(null, 'open:', T0).count, true);
});
