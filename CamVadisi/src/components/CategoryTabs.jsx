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
  const tabsRef = useRef(null);
  const activeRef = useRef(null);
  const items = includeAll
    ? [{ slug: "all", name: UI.allCategories }, ...categories]
    : categories;

  useEffect(() => {
    const tabs = tabsRef.current;
    const active = activeRef.current;
    if (!tabs || !active) return;

    const horizontalOverflow = tabs.scrollWidth > tabs.clientWidth + 1;
    const verticalOverflow = tabs.scrollHeight > tabs.clientHeight + 1;
    if (!horizontalOverflow && !verticalOverflow) return;

    const tabsRect = tabs.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const left = horizontalOverflow
      ? activeRect.left + activeRect.width / 2 - (tabsRect.left + tabsRect.width / 2)
      : 0;
    const top = verticalOverflow
      ? activeRect.top + activeRect.height / 2 - (tabsRect.top + tabsRect.height / 2)
      : 0;
    const motionQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    const reducedMotion = motionQuery?.matches ?? false;

    tabs.scrollBy({
      left,
      top,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeSlug]);

  return (
    <nav
      ref={tabsRef}
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
            aria-controls="menu-catalog"
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
