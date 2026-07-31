import { useEffect, useRef } from "react";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";

/**
 * Yapiskan kategori sekmeleri. Aktif sekme kaydirilinca gorunur alana getirilir;
 * uzun menude misafir aktif kategoriyi kaybetmesin.
 */
export function CategoryTabs({
  categories,
  activeSlug,
  onSelect,
  includeAll = false,
}) {
  const { t } = useLang();
  const activeRef = useRef(null);
  const items = includeAll
    ? [{ slug: "all", name: UI.allCategories }, ...categories]
    : categories;

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeSlug]);

  return (
    <nav
      className="classic-category-tabs no-scrollbar snap-tabs flex overflow-x-auto border-b border-line-strong px-4"
      aria-label="Kategoriler"
    >
      {items.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <button
            key={category.slug}
            ref={active ? activeRef : null}
            type="button"
            onClick={() => onSelect(category.slug)}
            aria-current={active ? "true" : undefined}
            className={`classic-category-tab -mb-px shrink-0 snap-center whitespace-nowrap border-b-2 transition-colors ${
              active
                ? "border-resin text-pine"
                : "border-transparent text-muted"
            }`}
          >
            {t(category.name)}
          </button>
        );
      })}
    </nav>
  );
}
