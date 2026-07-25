import { useLang } from '../lib/LangContext.jsx';
import { ProductRow } from './ProductRow.jsx';

export function CategorySection({ category, favorites, onOpen }) {
  const { t } = useLang();
  const hasTime = category.timeStart && category.timeEnd;

  return (
    /* defer-paint: ekran disindaki kategoriyi tarayici yerlestirmesin.
       139 urunlu menude ilk boyamayi belirgin hizlandiriyor. */
    <section data-slug={category.slug} className="defer-paint scroll-mt-28">
      <div className="flex items-baseline gap-3 px-4 pt-5 pb-2.5">
        <h2 className="font-display text-xl font-semibold text-pine">{t(category.name)}</h2>
        <span className="h-px flex-1 bg-line-strong" />
        {hasTime && (
          <span className="whitespace-nowrap text-[11px] font-medium tracking-wide text-muted tabular-nums">
            {category.timeStart} – {category.timeEnd}
          </span>
        )}
      </div>

      <ul>
        {category.products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            isFav={favorites.has(product.id)}
            onToggleFav={favorites.toggle}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </section>
  );
}
