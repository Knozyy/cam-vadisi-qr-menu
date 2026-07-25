import { useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../ui/Toast.jsx';
import { Button, Field, LangInput, TextArea, TextInput } from '../ui/form.jsx';

/** Duyuru seridi, calisma saatleri ve wifi sifresi. */
export function SettingsPanel({ settings, reload }) {
  const toast = useToast();
  const [draft, setDraft] = useState(() => ({
    restaurantName: settings.restaurantName ?? 'Çam Vadisi',
    announcement: settings.announcement ?? { tr: '', en: '', ar: '', ru: '' },
    announcementActive: settings.announcementActive ?? false,
    wifiPassword: settings.wifiPassword ?? '',
    hours: settings.hours?.length ? settings.hours : [{ day: '', open: '', close: '' }],
    address: settings.address ?? '',
    phonesText: (settings.phones ?? []).join(', '),
  }));
  const [busy, setBusy] = useState(false);

  function set(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }
  function setHour(index, patch) {
    set({ hours: draft.hours.map((h, i) => (i === index ? { ...h, ...patch } : h)) });
  }

  async function save() {
    setBusy(true);
    try {
      await api.updateSettings({
        restaurantName: draft.restaurantName,
        announcement: draft.announcement,
        announcementActive: draft.announcementActive,
        wifiPassword: draft.wifiPassword,
        hours: draft.hours.filter((h) => h.day.trim()),
        address: draft.address,
        phones: draft.phonesText.split(',').map((p) => p.trim()).filter(Boolean),
      });
      toast.ok('Ayarlar kaydedildi');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6 rounded-xl border border-line-strong bg-surface p-5">
      <Field label="Restoran adı">
        <TextInput value={draft.restaurantName} onChange={(e) => set({ restaurantName: e.target.value })} />
      </Field>

      <Field label="Adres" hint="ana sayfada görünür">
        <TextArea value={draft.address} onChange={(e) => set({ address: e.target.value })} rows={2} />
      </Field>

      <Field label="Telefon" hint="virgülle ayırın; ana sayfada aranabilir buton olur">
        <TextInput
          value={draft.phonesText}
          onChange={(e) => set({ phonesText: e.target.value })}
          placeholder="5322440815, 5452487990"
        />
      </Field>

      <div className="border-t border-line pt-5">
        <label className="mb-3 flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={draft.announcementActive} onChange={(e) => set({ announcementActive: e.target.checked })} className="h-4 w-4 accent-pine" />
          <span className="text-[14px] font-semibold text-ink">Duyuru şeridini göster</span>
        </label>
        <Field label="Duyuru metni" hint="menünün üstünde görünür">
          <LangInput value={draft.announcement} onChange={(announcement) => set({ announcement })} placeholder="ör. Bugün kuzu tandır var" />
        </Field>
      </div>

      <div className="border-t border-line pt-5">
        <span className="mb-2 block text-[13px] font-semibold text-muted">Çalışma saatleri</span>
        <div className="space-y-2">
          {draft.hours.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <TextInput value={row.day} onChange={(e) => setHour(index, { day: e.target.value })} placeholder="Pazartesi – Cuma" className="flex-1" />
              <TextInput value={row.open} onChange={(e) => setHour(index, { open: e.target.value })} placeholder="08:00" className="w-24" />
              <span className="text-muted-soft">–</span>
              <TextInput value={row.close} onChange={(e) => setHour(index, { close: e.target.value })} placeholder="22:00" className="w-24" />
              <button type="button" onClick={() => set({ hours: draft.hours.filter((_, i) => i !== index) })} className="p-1 text-muted-soft hover:text-danger" aria-label="Satırı sil">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-2" onClick={() => set({ hours: [...draft.hours, { day: '', open: '', close: '' }] })}>+ Satır ekle</Button>
      </div>

      <div className="border-t border-line pt-5">
        <Field label="Wifi şifresi" hint="menüde kopyalanabilir alan olarak görünür">
          <TextInput value={draft.wifiPassword} onChange={(e) => set({ wifiPassword: e.target.value })} className="max-w-xs" />
        </Field>
      </div>

      <div className="flex justify-end border-t border-line pt-5">
        <Button onClick={save} disabled={busy}>{busy ? 'Kaydediliyor…' : 'Ayarları kaydet'}</Button>
      </div>
    </div>
  );
}
