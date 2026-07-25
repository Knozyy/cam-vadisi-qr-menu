import { useCallback, useEffect, useState } from 'react';

const KEY = 'cam-vadisi-favoriler';

/**
 * Favori urunler yalnizca localStorage'da tutulur - sunucuya HICBIR sey gitmez.
 * Bu bir siparis degil; kalabalik masada garsona okumak icin kisisel bir liste.
 */
export function useFavorites() {
  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...ids]));
    } catch {
      /* depolama dolu veya kapali - sessizce gec */
    }
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const has = useCallback((id) => ids.has(id), [ids]);
  const clear = useCallback(() => setIds(new Set()), []);

  return { ids, count: ids.size, has, toggle, clear };
}
