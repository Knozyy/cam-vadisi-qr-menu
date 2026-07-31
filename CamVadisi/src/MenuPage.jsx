import { useEffect, useMemo, useState } from "react";
import { AnnouncementBar } from "./components/AnnouncementBar.jsx";
import { CategoryTabs } from "./components/CategoryTabs.jsx";
import { ClassicProductRow } from "./components/ClassicProductRow.jsx";
import { MenuListBar } from "./components/MenuListBar.jsx";
import { MenuListSheet } from "./components/MenuListSheet.jsx";
import { ProductSheet } from "./components/ProductSheet.jsx";
import { SearchBar } from "./components/SearchBar.jsx";
import { TopBar } from "./components/TopBar.jsx";
import { VenueFooter } from "./components/VenueFooter.jsx";
import { useLang } from "./lib/LangContext.jsx";
import { trackView } from "./lib/api.js";
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

  const visibleCategories = useMemo(() => {
    const categoryPool =
      activeCategory === "all"
        ? categories
        : categories.filter((category) => category.slug === activeCategory);

    return categoryPool
      .map((category) => ({
        ...category,
        products: category.products.filter((product) =>
          productMatches(product, query, lang),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }, [activeCategory, categories, lang, query]);

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
        favCount={menuList.count}
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

      <div className="classic-menu-tools">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryTabs
          categories={categories}
          activeSlug={activeCategory}
          onSelect={selectCategory}
          includeAll
        />
      </div>

      <main
        key={`${activeCategory}-${query}-${lang}`}
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
            <p>{t(UI.noResults)}</p>
            <span>{t(UI.noResultsHint)}</span>
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
                  {category.timeStart} – {category.timeEnd}
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
