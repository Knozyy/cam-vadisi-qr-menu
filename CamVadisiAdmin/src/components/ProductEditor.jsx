import { useState } from 'react';
import { parsePrice } from '@shared/price.js';
import { api } from '../lib/api.js';
import { useToast } from '../ui/Toast.jsx';
import { Button, Field, LangInput } from '../ui/form.jsx';
import { Modal } from '../ui/Modal.jsx';
import { ImageCropUpload } from './ImageCropUpload.jsx';
import { TagPicker } from './TagPicker.jsx';
import { VariantEditor } from './VariantEditor.jsx';

/** Yeni urun veya var olani duzenleme. Tek formda ad/aciklama/icindekiler 4 dilli. */
export function ProductEditor({ product, categories, onClose, onSaved }) {
  const toast = useToast();
  const [draft, setDraft] = useState(() => ({
    ...product,
    _priceText: product.basePrice != null ? String(product.basePrice / 100) : '',
  }));
  const [busy, setBusy] = useState(false);
  const isNew = product.id === undefined;
  const hasVariants = draft.variants.length > 0;

  function set(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  async function save() {
    if (!draft.name.tr?.trim()) {
      toast.error('Türkçe ürün adı zorunlu');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        categoryId: draft.categoryId,
        name: draft.name,
        description: draft.description,
        ingredients: draft.ingredients,
        basePrice: hasVariants ? null : parsePrice(draft._priceText),
        imageThumb: draft.imageThumb,
        imageFull: draft.imageFull,
        isHidden: draft.isHidden,
        isSoldOut: draft.isSoldOut,
        tags: draft.tags,
        variants: draft.variants.map((v) => ({ name: v.name, price: v.price })),
      };
      if (isNew) await api.createProduct(payload);
      else await api.updateProduct(product.id, payload);
      toast.ok(isNew ? 'Ürün eklendi' : 'Ürün güncellendi');
      onSaved();
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={busy}>Vazgeç</Button>
      <Button onClick={save} disabled={busy}>{busy ? 'Kaydediliyor…' : 'Kaydet'}</Button>
    </>
  );

  return (
    <Modal open onClose={onClose} title={isNew ? 'Yeni ürün' : 'Ürünü düzenle'} footer={footer} wide>
      <div className="space-y-5">
        <Field label="Kategori">
          <select
            value={draft.categoryId}
            onChange={(e) => set({ categoryId: Number(e.target.value) })}
            className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-pine"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name.tr}</option>
            ))}
          </select>
        </Field>

        <Field label="Ad" hint="TR zorunlu">
          <LangInput value={draft.name} onChange={(name) => set({ name })} placeholder="Ürün adı" />
        </Field>

        <Field label="Açıklama">
          <LangInput value={draft.description} onChange={(description) => set({ description })} multiline placeholder="Kısa açıklama" />
        </Field>

        <Field label="İçindekiler" hint="menüde katlanır bölümde görünür">
          <LangInput value={draft.ingredients} onChange={(ingredients) => set({ ingredients })} multiline placeholder="Malzeme listesi" />
        </Field>

        <Field label="Görsel">
          <ImageCropUpload
            value={{ thumb: draft.imageThumb, full: draft.imageFull }}
            onChange={(urls) => set({ imageThumb: urls.thumb, imageFull: urls.full })}
          />
        </Field>

        {!hasVariants && (
          <Field label="Fiyat" hint="varyant eklerseniz bu alan yok sayılır">
            <div className="flex items-center gap-2">
              <input
                inputMode="decimal"
                className="w-36 rounded-lg border border-line-strong px-3 py-2.5 text-[15px] tabular-nums outline-none focus:border-pine"
                value={draft._priceText}
                onChange={(e) => set({ _priceText: e.target.value })}
                placeholder="0"
              />
              <span className="text-muted-soft">₺</span>
            </div>
          </Field>
        )}

        <Field label="Porsiyonlar">
          <VariantEditor variants={draft.variants} onChange={(variants) => set({ variants })} />
        </Field>

        <Field label="Alerjen & diyet">
          <TagPicker selected={draft.tags} onChange={(tags) => set({ tags })} />
        </Field>

        <div className="flex flex-wrap gap-4 border-t border-line pt-4">
          <Toggle label="Menüde gizle" checked={draft.isHidden} onChange={(isHidden) => set({ isHidden })} hint="tamamen görünmez" />
          <Toggle label="Tükendi" checked={draft.isSoldOut} onChange={(isSoldOut) => set({ isSoldOut })} hint="görünür ama pasif" />
        </div>
      </div>
    </Modal>
  );
}

/**
 * Anahtar. Tumu tek bir <button role="switch"> - onceki hali <label> icinde <button>
 * tutuyordu; <button> "labelable" olmadigi icin metne tiklamak anahtari degistirmiyordu.
 */
function Toggle({ label, hint, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center gap-2.5 text-start"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-pine' : 'bg-line-strong'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'start-[22px]' : 'start-0.5'}`}
        />
      </span>
      <span className="text-[14px]">
        <span className="font-semibold text-ink">{label}</span>
        {hint && <span className="ms-1 text-[12px] text-muted-soft">· {hint}</span>}
      </span>
    </button>
  );
}
