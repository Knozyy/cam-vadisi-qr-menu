import { useEffect, useRef } from 'react';
import { useLang } from '../lib/LangContext.jsx';

/**
 * Yapiskan kategori sekmeleri. Aktif sekme kaydirilinca gorunur alana getirilir;
 * uzun menude misafir aktif kategoriyi kaybetmesin.
 */
export function CategoryTabs({ categories, activeSlug, onSelect }) {
  const { t } = useLang();
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeSlug]);

  return (
    <nav
      className="no-scrollbar snap-tabs flex gap-6 overflow-x-auto border-b border-line-strong px-4"
      aria-label="Kategoriler"
    >
      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <button
            key={category.slug}
            ref={active ? activeRef : null}
            type="button"
            onClick={() => onSelect(category.slug)}
            aria-current={active ? 'true' : undefined}
            className={`-mb-px shrink-0 snap-center whitespace-nowrap border-b-2 pt-2.5 pb-3 text-[15px] font-semibold transition-colors ${
              active ? 'border-resin text-pine' : 'border-transparent text-muted'
            }`}
          >
            {t(category.name)}
          </button>
        );
      })}
    </nav>
  );
}
