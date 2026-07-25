import { useCallback, useEffect, useState } from 'react';
import { api } from './lib/api.js';
import { LoginScreen } from './LoginScreen.jsx';
import { BulkPriceDialog } from './components/BulkPriceDialog.jsx';
import { MenuManager } from './components/MenuManager.jsx';
import { QrPanel } from './components/QrPanel.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { StatsPanel } from './components/StatsPanel.jsx';
import { ToolsPanel } from './components/ToolsPanel.jsx';
import { useToast } from './ui/Toast.jsx';
import { Button } from './ui/form.jsx';

const TABS = [
  { id: 'menu', label: 'Menü' },
  { id: 'settings', label: 'Ayarlar' },
  { id: 'stats', label: 'İstatistik' },
  { id: 'qr', label: 'QR' },
  { id: 'tools', label: 'Yedek' },
];

export function AdminApp() {
  const toast = useToast();
  const [auth, setAuth] = useState('checking'); // checking | out | in
  const [tab, setTab] = useState('menu');
  const [menu, setMenu] = useState(null);
  const [showBulk, setShowBulk] = useState(false);

  useEffect(() => {
    api.session().then(() => setAuth('in')).catch(() => setAuth('out'));
  }, []);

  const reload = useCallback(async () => {
    try {
      setMenu(await api.menu());
    } catch (err) {
      if (err.status === 401) setAuth('out');
      else toast.error(err.message);
    }
  }, [toast]);

  useEffect(() => {
    if (auth === 'in') reload();
  }, [auth, reload]);

  async function logout() {
    await api.logout().catch(() => {});
    setAuth('out');
    setMenu(null);
  }

  if (auth === 'checking') {
    return (
      <div className="grid min-h-dvh place-items-center bg-sage">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-pine" />
      </div>
    );
  }
  if (auth === 'out') {
    return <LoginScreen onSuccess={() => setAuth('in')} />;
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-pine text-sage">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <span className="font-display text-lg font-semibold">Çam Vadisi</span>
          <span className="text-[11px] uppercase tracking-widest opacity-70">Yönetim</span>
          <div className="ms-auto flex items-center gap-2">
            <a href="/menu" target="_blank" rel="noreferrer" className="rounded-lg bg-white/12 px-3 py-1.5 text-[13px] font-semibold">
              Menüyü aç ↗
            </a>
            <button onClick={logout} className="rounded-lg bg-white/12 px-3 py-1.5 text-[13px] font-semibold">Çıkış</button>
          </div>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-4xl gap-1 overflow-x-auto px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[14px] font-semibold ${
                tab === t.id ? 'border-resin text-white' : 'border-transparent text-sage/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5">
        {!menu ? (
          <div className="grid place-items-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-pine" />
          </div>
        ) : tab === 'menu' ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-display text-xl font-semibold text-pine">Menü</h1>
              <Button variant="outline" onClick={() => setShowBulk(true)}>Toplu fiyat</Button>
            </div>
            <MenuManager menu={menu} reload={reload} />
            {showBulk && (
              <BulkPriceDialog
                categories={menu.categories}
                onClose={() => setShowBulk(false)}
                onApplied={() => { setShowBulk(false); reload(); }}
              />
            )}
          </>
        ) : tab === 'settings' ? (
          <SettingsPanel settings={menu.settings} reload={reload} />
        ) : tab === 'stats' ? (
          <StatsPanel />
        ) : tab === 'qr' ? (
          <QrPanel />
        ) : (
          <ToolsPanel />
        )}
      </main>
    </div>
  );
}
