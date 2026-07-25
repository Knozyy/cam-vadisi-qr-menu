-- Cam Vadisi Restorant - menu semasi
-- Ceviri sutunlari ve is_hidden/is_sold_out ayrimi BASTAN kurulur; sonradan eklemek
-- her tabloyu, her API sozlesmesini ve panelin her formunu dolasmak demek.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_hidden   INTEGER NOT NULL DEFAULT 0,
  time_start  TEXT    NOT NULL DEFAULT '',   -- "08:00" - yalnizca BILGI rozeti
  time_end    TEXT    NOT NULL DEFAULT '',   -- kategori saate gore GIZLENMEZ
  name        TEXT    NOT NULL,
  name_en     TEXT    NOT NULL DEFAULT '',
  name_ar     TEXT    NOT NULL DEFAULT '',
  name_ru     TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id    INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_hidden      INTEGER NOT NULL DEFAULT 0,  -- menude HIC gorunmez
  is_sold_out    INTEGER NOT NULL DEFAULT 0,  -- gorunur ama pasif
  base_price     INTEGER,                     -- KURUS; varyant varsa yok sayilir
  image_thumb    TEXT NOT NULL DEFAULT '',    -- 160px kare, listede
  image_full     TEXT NOT NULL DEFAULT '',    -- 1000px, yalnizca detay panelinde
  name           TEXT NOT NULL,
  name_en        TEXT NOT NULL DEFAULT '',
  name_ar        TEXT NOT NULL DEFAULT '',
  name_ru        TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_ar TEXT NOT NULL DEFAULT '',
  description_ru TEXT NOT NULL DEFAULT '',
  ingredients    TEXT NOT NULL DEFAULT '',
  ingredients_en TEXT NOT NULL DEFAULT '',
  ingredients_ar TEXT NOT NULL DEFAULT '',
  ingredients_ru TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id, sort_order);

-- Porsiyon varyanti. "kisi basi", "yarim porsiyon", "1 kg" hepsi buradan gecer;
-- bu sayede urun tablosuna ayri bir cevrilebilir "fiyat notu" sutunu gerekmiyor.
CREATE TABLE IF NOT EXISTS variants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  price      INTEGER NOT NULL,               -- KURUS
  name       TEXT    NOT NULL,
  name_en    TEXT    NOT NULL DEFAULT '',
  name_ar    TEXT    NOT NULL DEFAULT '',
  name_ru    TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id, sort_order);

-- Alerjen / diyet etiketi: cevrilebilir METIN DEGIL, sabit kimlik.
-- Etiket adlarinin 4 dildeki karsiligi uygulama sozlugunde (shared/tags.js).
CREATE TABLE IF NOT EXISTS product_tags (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag        TEXT    NOT NULL,
  PRIMARY KEY (product_id, tag)
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Kisisel veri YOK: yalnizca gun bazinda sayac.
CREATE TABLE IF NOT EXISTS visit_stats (
  day   TEXT    NOT NULL,           -- YYYY-MM-DD
  kind  TEXT    NOT NULL,           -- 'open' | 'category' | 'lang'
  value TEXT    NOT NULL DEFAULT '',
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind, value)
);
