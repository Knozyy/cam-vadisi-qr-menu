import { useCallback, useEffect, useMemo, useState } from 'react';
import { LANG_NAMES } from '@shared/i18n.js';
import { api } from '../lib/api.js';
import { useToast } from '../ui/Toast.jsx';
import { Button } from '../ui/form.jsx';

/** Basit ziyaret sayaci - kisisel veri yok. Menuyu iyilestirme fikri verir. */
export function StatsPanel() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.stats().then((d) => setRows(d.rows)).catch((err) => toast.error(err.message));
  }, [toast]);

  useEffect(load, [load]);

  async function reset() {
    if (!confirm('Tüm ziyaret sayıları silinsin mi? Menü verisi etkilenmez.')) return;
    setBusy(true);
    try {
      const result = await api.resetStats();
      toast.ok(`${result.deleted} kayıt silindi`);
      setRows([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  const summary = useMemo(() => {
    if (!rows) return null;
    const opens = rows.filter((r) => r.kind === 'open').reduce((s, r) => s + r.count, 0);
    const byLang = aggregate(rows.filter((r) => r.kind === 'lang'));
    const byCategory = aggregate(rows.filter((r) => r.kind === 'category')).slice(0, 8);
    return { opens, byLang, byCategory };
  }, [rows]);

  if (!summary) return <p className="text-muted-soft">Yükleniyor…</p>;

  return (
    <div className="max-w-xl space-y-5">
      <Card title="Menü açılışı">
        <p className="font-display text-3xl font-semibold text-pine tabular-nums">{summary.opens}</p>
        <p className="text-[12px] leading-relaxed text-muted-soft">
          Aynı cihaz 4 saat içinde tekrar açarsa yeniden sayılmaz — sayı yaklaşık olarak
          kaç masanın menüye baktığını gösterir. Kişisel veri toplanmaz.
        </p>
      </Card>

      <Card title="Dile göre">
        <BarList items={summary.byLang.map((r) => ({ label: LANG_NAMES[r.value] ?? r.value, count: r.count }))} />
      </Card>

      <Card title="En çok bakılan kategoriler">
        <BarList items={summary.byCategory.map((r) => ({ label: r.value, count: r.count }))} />
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={load} disabled={busy}>Yenile</Button>
        <Button variant="danger" onClick={reset} disabled={busy}>
          {busy ? 'Siliniyor…' : 'Sayıları sıfırla'}
        </Button>
      </div>
    </div>
  );
}

function aggregate(rows) {
  const map = new Map();
  for (const r of rows) map.set(r.value, (map.get(r.value) ?? 0) + r.count);
  return [...map.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-line-strong bg-surface p-5">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-muted">{title}</h3>
      {children}
    </div>
  );
}

function BarList({ items }) {
  if (items.length === 0) return <p className="text-[13px] text-muted-soft">Henüz veri yok.</p>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-[14px] text-ink">{item.label}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sage">
            <span className="block h-full rounded-full bg-pine" style={{ width: `${(item.count / max) * 100}%` }} />
          </span>
          <span className="w-10 shrink-0 text-end text-[13px] font-semibold text-muted tabular-nums">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
