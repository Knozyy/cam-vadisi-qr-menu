import { useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../ui/Toast.jsx';
import { Button, Field, LangInput, TextInput } from '../ui/form.jsx';
import { Modal } from '../ui/Modal.jsx';

/** Kategori ekle/duzenle. Saat alanlari yalnizca BILGI rozeti; kategoriyi gizlemez. */
export function CategoryEditor({ category, onClose, onSaved }) {
  const toast = useToast();
  const [draft, setDraft] = useState(category);
  const [busy, setBusy] = useState(false);
  const isNew = category.id === undefined;

  function set(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  async function save() {
    if (!draft.name.tr?.trim()) {
      toast.error('Türkçe kategori adı zorunlu');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: draft.name,
        timeStart: draft.timeStart,
        timeEnd: draft.timeEnd,
        isHidden: draft.isHidden,
      };
      if (isNew) await api.createCategory(payload);
      else await api.updateCategory(category.id, payload);
      toast.ok(isNew ? 'Kategori eklendi' : 'Kategori güncellendi');
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
    <Modal open onClose={onClose} title={isNew ? 'Yeni kategori' : 'Kategoriyi düzenle'} footer={footer}>
      <div className="space-y-5">
        <Field label="Ad" hint="TR zorunlu">
          <LangInput value={draft.name} onChange={(name) => set({ name })} placeholder="Kategori adı" />
        </Field>
        <Field label="Servis saati" hint="isteğe bağlı — sadece bilgi rozeti">
          <div className="flex items-center gap-2">
            <TextInput value={draft.timeStart} onChange={(e) => set({ timeStart: e.target.value })} placeholder="08:00" className="w-28" />
            <span className="text-muted-soft">–</span>
            <TextInput value={draft.timeEnd} onChange={(e) => set({ timeEnd: e.target.value })} placeholder="12:00" className="w-28" />
          </div>
        </Field>
        {!isNew && (
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={draft.isHidden} onChange={(e) => set({ isHidden: e.target.checked })} className="h-4 w-4 accent-pine" />
            <span className="text-[14px] font-semibold text-ink">Kategoriyi menüde gizle</span>
          </label>
        )}
      </div>
    </Modal>
  );
}
