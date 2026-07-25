import { useCallback, useEffect, useState } from 'react';

/**
 * Iki sayfalik basit yonlendirme: "/" ana sayfa, "/menu" menu.
 *
 * react-router eklenmedi: iki rota icin ~10 KB bagimlilik, zayif sebekede odenmesi
 * gereksiz bir bedel. History API yeterli.
 *
 * Kategori hedefi HASH ile tasinir (`/menu#izgara-cesitleri`): ana sayfadaki mozaikten
 * bir bolume atlarken menu o kategoriye kayar. Hash kullanmak geri dugmesini de dogal
 * olarak calistirir.
 *
 * Sunucu tarafi: nginx `try_files ... /index.html` ve Express `/*splat` bilinmeyen
 * yollari index.html'e dusuruyor, yani /menu dogrudan acilabilir (QR bunu kodlar).
 */
export const ROUTES = { home: '/', menu: '/menu' };

function readRoute() {
  const onMenu = window.location.pathname.replace(/\/+$/, '') === '/menu';
  return {
    route: onMenu ? ROUTES.menu : ROUTES.home,
    hash: window.location.hash.replace(/^#/, ''),
  };
}

export function useRoute() {
  const [state, setState] = useState(readRoute);

  useEffect(() => {
    const onPop = () => setState(readRoute());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  /**
   * @param {string} to        ROUTES degeri
   * @param {string} [hash]    kategori slug'i (yalnizca menu icin anlamli)
   */
  const navigate = useCallback((to, hash = '') => {
    const url = hash ? `${to}#${hash}` : to;
    if (window.location.pathname + window.location.hash !== url) {
      window.history.pushState({}, '', url);
    }
    setState({ route: to === ROUTES.menu ? ROUTES.menu : ROUTES.home, hash });
    // Hash varsa MenuPage kendisi kaydiracak; yoksa sayfa basina don.
    if (!hash) window.scrollTo(0, 0);
  }, []);

  return { route: state.route, hash: state.hash, navigate };
}
