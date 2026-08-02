import { useEffect, useMemo, useState } from "react";
import { AnnouncementBar } from "./components/AnnouncementBar.jsx";
import { CategoryTabs } from "./components/CategoryTabs.jsx";
import { ClassicProductRow } from "./components/ClassicProductRow.jsx";
import { DietFilterBar } from "./components/DietFilterBar.jsx";
import { MenuListBar } from "./components/MenuListBar.jsx";
import {
  MenuListClearButton,
  MenuListContent,
} from "./components/MenuListContent.jsx";
import { MenuListSheet } from "./components/MenuListSheet.jsx";
import { ProductSheet } from "./components/ProductSheet.jsx";
import { SearchBar } from "./components/SearchBar.jsx";
import { TopBar } from "./components/TopBar.jsx";
import { VenueFooter } from "./components/VenueFooter.jsx";
import { useLang } from "./lib/LangContext.jsx";
import { trackView } from "./lib/api.js";
import {
  availableFilterTags,
  productPassesFilters,
  toggleTag,
} from "./lib/filters.js";
import { menuListTotals } from "./lib/menu-list.js";
import { productMatches } from "./lib/search.js";
import { UI } from "./lib/ui-strings.js";
import { useMenuList } from "./lib/useMenuList.js";

export function MenuPage({ menu, offline, jumpTo, onOpenHome }) {
  const { lang, t } = useLang();
  const menuList = useMenuList();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openProduct, setOpenProduct] = useState(null);
  const [showList, setShowList] = useState(false);
  const [dietTags, setDietTags] = useState([]);
  const [avoidTags, setAvoidTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = menu.categories ?? [];
  const slugs = useMemo(
    () => categories.map((category) => category.slug),
    [categories],
  );
  const allProducts = useMemo(
    () => categories.flatMap((category) => category.products),
    [categories],
  );

  useEffect(() => {
    trackView("open");
  }, []);

  useEffect(() => {
    trackView("lang", lang);
  }, [lang]);

  useEffect(() => {
    if (activeCategory !== "all") trackView("category", activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (!jumpTo || !slugs.includes(jumpTo)) return;
    setActiveCategory(jumpTo);
  }, [jumpTo, slugs]);

  const availableFilters = useMemo(
    () => availableFilterTags(allProducts),
    [allProducts],
  );

  const visibleCategories = useMemo(() => {
    const categoryPool =
      activeCategory === "all"
        ? categories
        : categories.filter((category) => category.slug === activeCategory);

    return categoryPool
      .map((category) => ({
        ...category,
        products: category.products.filter(
          (product) =>
            productMatches(product, query, lang) &&
            productPassesFilters(product, dietTags, avoidTags),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }, [activeCategory, avoidTags, categories, dietTags, lang, query]);

  const filtersActive = dietTags.length + avoidTags.length > 0;

  function clearFilters() {
    setDietTags([]);
    setAvoidTags([]);
  }

  const visibleCount = useMemo(
    () =>
      visibleCategories.reduce(
        (count, category) => count + category.products.length,
        0,
      ),
    [visibleCategories],
  );

  const selectedProducts = useMemo(
    () => allProducts.filter((product) => menuList.get(product.id) > 0),
    [allProducts, menuList],
  );

  const listTotals = useMemo(
    () => menuListTotals(allProducts, menuList.quantities),
    [allProducts, menuList.quantities],
  );

  /**
   * Menuden kalkan urunleri listeden dus. Menu bos gelirse (cevrimdisi ya da
   * API hatasi) DOKUNMA - yoksa misafirin listesi sebeke koptugu icin silinir.
   */
  const pruneList = menuList.prune;
  useEffect(() => {
    if (allProducts.length === 0) return;
    pruneList(allProducts.map((product) => product.id));
  }, [allProducts, pruneList]);

  function selectCategory(slug) {
    setActiveCategory(slug);
    document
      .getElementById("menu-catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openFromList(product) {
    setShowList(false);
    setOpenProduct(product);
  }

  const activeLabel =
    activeCategory === "all"
      ? t(UI.allFlavors)
      : t(
          categories.find((category) => category.slug === activeCategory)?.name,
        );

  return (
    <div className="classic-menu-page mx-auto min-h-dvh max-w-md shadow-sm">
      <TopBar
        restaurantName={menu.settings?.restaurantName ?? "Çam Vadisi"}
        favCount={listTotals.count}
        onOpenFavorites={() => setShowList(true)}
        onOpenHome={onOpenHome}
      />
      <AnnouncementBar text={menu.settings} />

      {offline && (
        <p className="bg-pine-700 px-4 py-2 text-center text-[12px] text-sage">
          {t(UI.offlineNote)}
        </p>
      )}

      <section className="classic-menu-intro">
        <p>{t(UI.menuIntroKicker)}</p>
        <h1>{t(UI.menuIntroTitle)}</h1>
        <span>{t(UI.menuIntroText)}</span>
      </section>

      <div className="classic-menu-layout">
        <aside className="classic-menu-sidebar">
          <div className="classic-menu-tools">
            <SearchBar value={query} onChange={setQuery} />
            <CategoryTabs
              categories={categories}
              activeSlug={activeCategory}
              onSelect={selectCategory}
              includeAll
            />
            <DietFilterBar
              available={availableFilters}
              dietTags={dietTags}
              avoidTags={avoidTags}
              open={showFilters}
              onToggleOpen={() => setShowFilters((open) => !open)}
              onToggleDiet={(tag) =>
                setDietTags((tags) => toggleTag(tags, tag))
              }
              onToggleAvoid={(tag) =>
                setAvoidTags((tags) => toggleTag(tags, tag))
              }
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div className="classic-menu-content">
          {/*
            key YALNIZCA kategoriye bagli: kategori degisimi bilincli bir gecis, giris
            animasyonunu yeniden oynatmasi dogru. Aramayi ya da dili de keye koymak her
            tus vurusunda 139 satirlik katalogu sokup yeniden kuruyor ve animasyonu
            bastan oynatiyordu.
          */}
          <main
            key={activeCategory}
            id="menu-catalog"
            className="classic-menu-catalog"
          >
            <div className="classic-result-meta">
              <strong>{activeLabel}</strong>
              <span>
                {visibleCount} {t(UI.products)}
              </span>
            </div>

            {visibleCategories.length === 0 ? (
              <div className="classic-no-results">
                {/* Sonucu suzgec sildiyse "baska kelime deneyin" yanlis yonlendirir. */}
                <p>{t(filtersActive ? UI.filtersNoMatch : UI.noResults)}</p>
                <span>
                  {t(filtersActive ? UI.filtersNoMatchHint : UI.noResultsHint)}
                </span>
                {filtersActive && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="classic-filter-reset"
                  >
                    {t(UI.filtersClear)}
                  </button>
                )}
              </div>
            ) : (
              visibleCategories.map((category) => (
                <section
                  key={category.slug}
                  data-slug={category.slug}
                  className="classic-category-section"
                >
                  <div className="classic-category-heading">
                    <span aria-hidden="true" />
                    <h2>{t(category.name)}</h2>
                    <span aria-hidden="true" />
                  </div>
                  {category.timeStart && category.timeEnd && (
                    <p className="classic-category-time">
                      <bdi dir="ltr">
                        {category.timeStart} – {category.timeEnd}
                      </bdi>
                    </p>
                  )}
                  <ul className="classic-product-list">
                    {category.products.map((product, index) => (
                      <ClassicProductRow
                        key={product.id}
                        product={product}
                        quantity={menuList.get(product.id)}
                        onIncrement={menuList.increment}
                        onDecrement={menuList.decrement}
                        onOpen={setOpenProduct}
                        stagger={index}
                      />
                    ))}
                  </ul>
                </section>
              ))
            )}

            <VenueFooter settings={menu.settings} />
          </main>
        </div>

        <aside
          className="classic-desktop-list-panel"
          aria-labelledby="classic-desktop-list-title"
        >
          <header className="classic-desktop-list-header">
            <h2 id="classic-desktop-list-title">{t(UI.myList)}</h2>
            <strong
              aria-live="polite"
              aria-label={`${listTotals.count} ${t(UI.selectedItems)}`}
            >
              {listTotals.count}
            </strong>
          </header>

          <MenuListContent
            className="classic-desktop-list-body"
            products={selectedProducts}
            quantities={menuList.quantities}
            total={listTotals.total}
            hasEstimate={listTotals.hasEstimate}
            onIncrement={menuList.increment}
            onDecrement={menuList.decrement}
            onOpen={openFromList}
          />

          {selectedProducts.length > 0 && (
            <MenuListClearButton
              className="classic-desktop-list-clear"
              onClear={menuList.clear}
            />
          )}
        </aside>
      </div>

      <MenuListBar
        count={listTotals.count}
        total={listTotals.total}
        hasEstimate={listTotals.hasEstimate}
        onOpen={() => setShowList(true)}
      />

      {openProduct && (
        <ProductSheet
          product={openProduct}
          quantity={menuList.get(openProduct.id)}
          onIncrement={menuList.increment}
          onDecrement={menuList.decrement}
          onClose={() => setOpenProduct(null)}
        />
      )}

      {showList && (
        <MenuListSheet
          products={selectedProducts}
          quantities={menuList.quantities}
          total={listTotals.total}
          hasEstimate={listTotals.hasEstimate}
          onIncrement={menuList.increment}
          onDecrement={menuList.decrement}
          onOpen={openFromList}
          onClear={menuList.clear}
          onClose={() => setShowList(false)}
        />
      )}
    </div>
  );
}
