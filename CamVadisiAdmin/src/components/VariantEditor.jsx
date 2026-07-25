import { formatPrice, parsePrice } from '@shared/price.js';
import { emptyBundle } from '../lib/empty.js';
import { Button, LangInput } from '../ui/form.jsx';

/**
 * Porsiyon varyantlari. "kisi basi", "yarim/tam porsiyon", "1 kg" hepsi buradan.
 * Fiyat KURUS tutulur; kullanici lira girer, blur'da bicimlenip geri gosterilir.
 */
export function VariantEditor({ variants, onChange }) {
  function update(index, patch) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  function add() {
    onChange([...variants, { name: emptyBundle(), price: 0, _priceText: '' }]);
  }
  function remove(index) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {variants.length === 0 && (
        <p className="text-[13px] text-muted-soft">
          Varyant yoksa ürünün tek fiyatı kullanılır. Yarım/tam porsiyon gibi seçenekler için ekleyin.
        </p>
      )}
      {variants.map((variant, index) => (
        <div key={index} className="rounded-lg border border-line-strong p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-muted">Porsiyon {index + 1}</span>
            <button type="button" onClick={() => remove(index)} className="text-[13px] font-semibold text-danger">
              Sil
            </button>
          </div>
          <LangInput
            value={variant.name}
            onChange={(name) => update(index, { name })}
            placeholder="Porsiyon adı (ör. Yarım porsiyon)"
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              inputMode="decimal"
              className="w-32 rounded-lg border border-line-strong px-3 py-2 text-[15px] tabular-nums outline-none focus:border-pine"
              value={variant._priceText ?? (variant.price ? String(variant.price / 100) : '')}
              onChange={(e) => update(index, { _priceText: e.target.value })}
              onBlur={(e) => {
                const kurus = parsePrice(e.target.value) ?? 0;
                update(index, { price: kurus, _priceText: undefined });
              }}
              placeholder="Fiyat"
            />
            <span className="text-[13px] text-muted-soft">₺ · {formatPrice(variant.price)}</span>
          </div>
        </div>
      ))}
      <Button variant="outline" type="button" onClick={add}>+ Porsiyon ekle</Button>
    </div>
  );
}
