import { useState } from 'react';
import { formatPrice } from '@shared/price.js';
import { api } from '../lib/api.js';
import { useToast } from '../ui/Toast.jsx';
import { Button, Field } from '../ui/form.jsx';
import { Modal } from '../ui/Modal.jsx';

/**
 * Toplu fiyat guncelleme. Once ONIZLEME cekilir (veri degismez); kullanici
 * ne olacagini gorur, onaylayinca uygulanir. Sezonluk fiyat degisen bir mekanda
 * 30 urunu tek tek duzenlemekten kurtarir.
 */
export function BulkPriceDialog({ categories, onClose, onApplied }) {
  const toast = useToast();
  const [percent, setPercent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  async function runPreview() {
    const value = Number(percent);
    if (!Number.isFinite(value) || value === 0) {
      toast.error('Geçerli bir yüzde girin (ör. 10 veya -15)');
      return;
    }
    setBusy(true);
    try {
      const result = await api.bulkPrice({
        percent: value,
        categoryId: categoryId || null,
        preview: true,
      });
      setPreview(result.changes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    setBusy(true);
    try {
      const result = await api.bulkPrice({ percent: Number(percent), categoryId: categoryId || null });
      toast.ok(`${result.updated} fiyat güncellendi`);
      onApplied();
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  const footer = preview ? (
    <>
      <Button variant="outline" onClick={() => setPreview(null)} disabled={busy}>Geri</Button>
      <Button variant="resin" onClick={apply} disabled={busy || preview.length === 0}>
        {busy ? 'Uygulanıyor…' : `${preview.length} fiyatı uygula`}
      </Button>
    </>
  ) : (
    <>
      <Button variant="outline" onClick={onClose}>Vazgeç</Button>
      <Button onClick={runPreview} disabled={busy}>Önizle</Button>
    </>
  );

  return (
    <Modal open onClose={onClose} title="Toplu fiyat güncelleme" footer={footer} wide>
      {!preview ? (
        <div className="space-y-5">
          <Field label="Yüzde" hint="zam için pozitif, indirim için negatif">
            <div className="flex items-center gap-2">
              <input
                inputMode="decimal"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="10"
                className="w-28 rounded-lg border border-line-strong px-3 py-2.5 text-[15px] tabular-nums outline-none focus:border-pine"
              />
              <span className="text-muted-soft">%</span>
            </div>
          </Field>
          <Field label="Kapsam">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-pine"
            >
              <option value="">Tüm menü</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name.tr}</option>
              ))}
            </select>
          </Field>
        </div>
      ) : preview.length === 0 ? (
        <p className="py-6 text-center text-muted">Fiyatı olan ürün bulunamadı.</p>
      ) : (
        <ul className="divide-y divide-line">
          {preview.map((change) => (
            <li key={`${change.kind}-${change.id}`} className="flex items-center gap-2 py-2 text-[14px]">
              <span className="flex-1 truncate text-ink">{change.name}</span>
              <span className="text-muted-soft tabular-nums line-through">{formatPrice(change.from)}</span>
              <span aria-hidden="true" className="text-muted-soft">→</span>
              <span className="font-semibold text-pine tabular-nums">{formatPrice(change.to)}</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
