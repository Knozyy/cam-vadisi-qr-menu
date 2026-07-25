import { useEffect, useMemo, useState } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar.jsx';
import { CategorySection } from './components/CategorySection.jsx';
import { CategoryTabs } from './components/CategoryTabs.jsx';
import { FavoritesSheet } from './components/FavoritesSheet.jsx';
import { ProductRow } from './components/ProductRow.jsx';
import { ProductSheet } from './components/ProductSheet.jsx';
import { SearchBar } from './components/SearchBar.jsx';
import { TopBar } from './components/TopBar.jsx';
import { VenueFooter } from './components/VenueFooter.jsx';
import { useLang } from './lib/LangContext.jsx';
import { trackView } from './lib/api.js';
import { productMatches } from './lib/search.js';
import { UI } from './lib/ui-strings.js';
import { useFavorites } from './lib/useFavorites.js';
import { useScrollSpy } from './lib/useScrollSpy.js';

export function MenuPage({ menu, offline, jumpTo, onOpenHome }) {
  const { lang, t } = useLang();
  const favorites = useFavorites();
  const [query, setQuery] = useState('');
  const [openProduct, setOpenProduct] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const categories = menu.categories ?? [];
  const slugs = useMemo(() => categories.map((c) => c.slug), [categories]);
  const { activeSlug, scrollTo } = useScrollSpy(slugs);

  /*
   * Sayaclar. Tekillestirme `trackView` icinde (4 saatlik pencere, localStorage) -
   * ayni cihaz menuyu tekrar acinca ziyaret tekrar sayilmaz.
   */
  useEffect(() => {
    trackView('open');
  }, []);
  useEffect(() => {
    trackView('lang', lang);
  }, [lang]);
  // Kategori sayaci: kaydirmayla aktif kategori degistikce. Panelde "en cok bakilan
  // kategoriler" karti bu veriyi bekliyordu ama hic gonderilmiyordu.
  useEffect(() => {
    if (activeSlug) trackView('category', activeSlug);
  }, [activeSlug]);

  /*
   * Ana sayfadaki kategori mozaiginden gelindiyse (`/menu#slug`) o bolume kaydir.
   *
   * requestAnimationFrame KULLANILMIYOR: sekme arka planda veya compose edilmiyorsa
   * rAF askida kaliyor ve kaydirma hic olmuyordu. Effect zaten render sonrasi calisiyor,
   * DOM hazir. Ikinci cagri `content-visibility: auto` bolumlerin gercek yuksekligi
   * olustuktan sonra hedefi duzeltir - ilk kaydirmada tahmini yukseklik kullanilir.
   */
  useEffect(() => {
    if (!jumpTo || !slugs.includes(jumpTo)) return undefined;
    scrollTo(jumpTo, 'instant');
    const settle = window.setTimeout(() => scrollTo(jumpTo, 'instant'), 140);
    return () => window.clearTimeout(settle);
  }, [jumpTo, slugs, scrollTo]);

  // Tum urunler duz liste - favori paneli ve arama bunu kullanir.
  const allProducts = useMemo(
    () => categories.flatMap((c) => c.products),
    [categories],
  );

  const searching = query.trim() !== '';
  const searchResults = useMemo(() => {
    if (!searching) return [];
    return allProducts.filter((p) => productMatches(p, query, lang));
  }, [searching, allProducts, query, lang]);

  const favoriteProducts = useMemo(
    () => allProducts.filter((p) => favorites.has(p.id)),
    [allProducts, favorites],
  );

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-sage shadow-sm">
      <TopBar
        restaurantName={menu.settings?.restaurantName ?? 'Çam Vadisi'}
        favCount={favorites.count}
        onOpenFavorites={() => setShowFavorites(true)}
        onOpenHome={onOpenHome}
      />
      <AnnouncementBar text={menu.settings} />

      {offline && (
        <p className="bg-pine-700 px-4 py-2 text-center text-[12px] text-sage">{t(UI.offlineNote)}</p>
      )}

      <div className="sticky top-0 z-20 bg-sage">
        <SearchBar value={query} onChange={setQuery} />
        {!searching && (
          <CategoryTabs categories={categories} activeSlug={activeSlug} onSelect={scrollTo} />
        )}
      </div>

      {searching ? (
        <SearchView results={searchResults} favorites={favorites} onOpen={setOpenProduct} />
      ) : (
        <main className="pb-2">
          {categories.map((category) => (
            <CategorySection
              key={category.slug}
              category={category}
              favorites={favorites}
              onOpen={setOpenProduct}
            />
          ))}
          <VenueFooter settings={menu.settings} />
        </main>
      )}

      {openProduct && (
        <ProductSheet
          product={openProduct}
          isFav={favorites.has(openProduct.id)}
          onToggleFav={favorites.toggle}
          onClose={() => setOpenProduct(null)}
        />
      )}

      {showFavorites && (
        <FavoritesSheet
          products={favoriteProducts}
          favorites={favorites}
          onToggleFav={favorites.toggle}
          onOpen={(product) => {
            setShowFavorites(false);
            setOpenProduct(product);
          }}
          onClose={() => setShowFavorites(false)}
        />
      )}
    </div>
  );
}

function SearchView({ results, favorites, onOpen }) {
  const { t } = useLang();
  if (results.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-semibold text-ink">{t(UI.noResults)}</p>
        <p className="mt-1 text-[14px] text-muted">{t(UI.noResultsHint)}</p>
      </div>
    );
  }
  return (
    <ul className="pb-4">
      {results.map((product) => (
        <ProductRow
          key={product.id}
          product={product}
          isFav={favorites.has(product.id)}
          onToggleFav={favorites.toggle}
          onOpen={onOpen}
        />
      ))}
    </ul>
  );
}
