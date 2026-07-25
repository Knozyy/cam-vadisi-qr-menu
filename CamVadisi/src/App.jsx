import { useEffect, useState } from 'react';
import { HomePage } from './HomePage.jsx';
import { MenuPage } from './MenuPage.jsx';
import { fetchMenu } from './lib/api.js';
import { useLang } from './lib/LangContext.jsx';
import { UI } from './lib/ui-strings.js';
import { ROUTES, useRoute } from './lib/useRoute.js';

export default function App() {
  const { t } = useLang();
  const { route, hash, navigate } = useRoute();
  const [state, setState] = useState({ status: 'loading' });

  async function load() {
    setState({ status: 'loading' });
    try {
      const menu = await fetchMenu();
      // Service worker cevrimdisi yaniti veriyorsa isaretler.
      setState({ status: 'ready', menu, offline: menu.__offline === true });
    } catch {
      setState({ status: 'error' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center bg-sage">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-pine" aria-label="Yükleniyor" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="grid min-h-dvh place-items-center bg-sage px-6 text-center">
        <div>
          <p className="font-semibold text-ink">{t(UI.loadError)}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-lg bg-pine px-5 py-2.5 text-[15px] font-semibold text-white"
          >
            {t(UI.retry)}
          </button>
        </div>
      </div>
    );
  }

  // QR dogrudan /menu'yu acar; "/" tanitim sayfasidir.
  if (route === ROUTES.menu) {
    return (
      <MenuPage
        menu={state.menu}
        offline={state.offline}
        jumpTo={hash}
        onOpenHome={() => navigate(ROUTES.home)}
      />
    );
  }

  return (
    <HomePage
      menu={state.menu}
      onOpenMenu={() => navigate(ROUTES.menu)}
      onOpenCategory={(slug) => navigate(ROUTES.menu, slug)}
    />
  );
}
