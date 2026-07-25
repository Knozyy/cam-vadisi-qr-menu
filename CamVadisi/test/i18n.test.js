import assert from 'node:assert/strict';
import test from 'node:test';
import { fromBundle, normalizeLang, pick, toBundle } from '../shared/i18n.js';

const row = {
  name: 'Kuzu Pirzola',
  name_en: 'Lamb Chops',
  name_ar: '',
  name_ru: 'Бараньи рёбрышки',
};

test('secili dil doluysa dogrudan onu verir', () => {
  assert.equal(pick(row, 'name', 'ru'), 'Бараньи рёбрышки');
  assert.equal(pick(row, 'name', 'tr'), 'Kuzu Pirzola');
});

test('bos ceviri once İngilizceye duser', () => {
  // Arapca alani bos: isletme panelden yeni urun ekleyip AR doldurmadiginda olan sey.
  assert.equal(pick(row, 'name', 'ar'), 'Lamb Chops');
});

test('İngilizce de bossa Turkceye duser', () => {
  const onlyTurkish = { name: 'Şalgam', name_en: '', name_ar: '', name_ru: '' };
  assert.equal(pick(onlyTurkish, 'name', 'ar'), 'Şalgam');
  assert.equal(pick(onlyTurkish, 'name', 'ru'), 'Şalgam');
});

test('sadece bosluk iceren ceviri dolu sayilmaz', () => {
  const spaced = { name: 'Ayran', name_en: '   ', name_ar: '', name_ru: '' };
  assert.equal(pick(spaced, 'name', 'ar'), 'Ayran');
});

test('hicbir dilde deger yoksa bos dizge doner, hata atmaz', () => {
  assert.equal(pick({ name: '', name_en: '', name_ar: '', name_ru: '' }, 'name', 'ar'), '');
  assert.equal(pick(undefined, 'name', 'tr'), '');
});

test('toBundle ve fromBundle ayni zinciri korur', () => {
  const bundle = toBundle(row, 'name');
  assert.deepEqual(Object.keys(bundle), ['tr', 'en', 'ar', 'ru']);
  assert.equal(fromBundle(bundle, 'ar'), 'Lamb Chops');
  assert.equal(fromBundle(bundle, 'tr'), 'Kuzu Pirzola');
});

test('tarayici dili desteklenen dile eslenir', () => {
  assert.equal(normalizeLang('ru-RU'), 'ru');
  assert.equal(normalizeLang('ar'), 'ar');
  assert.equal(normalizeLang('de-DE'), 'tr'); // desteklenmeyen dil TR'ye duser
  assert.equal(normalizeLang(undefined), 'tr');
});
