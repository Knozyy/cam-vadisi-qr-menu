import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Kaydirma ile aktif kategoriyi belirler ve bir bolume yumusak kaydirir.
 *
 * Bolumleri `[data-slug]` ile DOM'dan bulur. Onceki surum bir ref Map'i tutuyordu
 * ama `register(slug)` her render'da yeni bir callback urettigi icin React ref'i
 * once null'layip Map'ten siliyordu; ana sayfadan bir kategoriye atlarken
 * `scrollTo` node'u bulamayip sessizce hicbir sey yapmiyordu. DOM sorgusu hem
 * bu zamanlama sorununu ortadan kaldiriyor hem daha az kod.
 *
 * `programmatic` bayragi, bir bolume kaydirirken gozlemcinin araya girip yanlis
 * sekmeyi isaretlemesini onler.
 */
const SECTION_SELECTOR = '[data-slug]';

function findSection(slug) {
  if (!slug) return null;
  const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(slug) : slug;
  return document.querySelector(`[data-slug="${escaped}"]`);
}

export function useScrollSpy(slugs) {
  const [activeSlug, setActiveSlug] = useState(slugs[0] ?? null);
  const programmatic = useRef(false);
  const settleTimer = useRef(0);

  useEffect(() => {
    if (slugs.length > 0 && !slugs.includes(activeSlug)) setActiveSlug(slugs[0]);
  }, [slugs, activeSlug]);

  useEffect(() => {
    const nodes = [...document.querySelectorAll(SECTION_SELECTOR)];
    if (nodes.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (programmatic.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSlug(visible[0].target.dataset.slug);
      },
      // Ust seride ~120px sekme + arama var; tetik cizgisini oranin altina al.
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [slugs]);

  /**
   * @param {string} slug
   * @param {'smooth'|'instant'} [behavior]
   *   Menu icinde sekmeye basmak `smooth` olmali - misafir baglami korusun.
   *   Ana sayfadan bir kategoriye atlarken `instant` daha dogru: sayfa yeni aciliyor,
   *   arada gosterilecek bir baglam yok ve misafir zaten hedefe gitmek istiyor.
   */
  const scrollTo = useCallback((slug, behavior = 'smooth') => {
    const node = findSection(slug);
    if (!node) return;
    programmatic.current = true;
    setActiveSlug(slug);
    node.scrollIntoView({ behavior, block: 'start' });
    // Kaydirma bitene kadar gozlemciyi devre disi tut.
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      programmatic.current = false;
    }, 650);
  }, []);

  // Bilesen sokulurken bekleyen zamanlayiciyi temizle.
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  return { activeSlug, scrollTo };
}
