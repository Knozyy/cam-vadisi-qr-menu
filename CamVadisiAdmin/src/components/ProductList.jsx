import { formatPrice, rowPrice } from '@shared/price.js';
import { api } from '../lib/api.js';
import { missingLangs } from '../lib/empty.js';
import { useDragReorder } from '../lib/useDragReorder.js';
import { useToast } from '../ui/Toast.jsx';

/** Bir kategorinin urunleri: surukle-birak sirala, duzenle, sil. */
export function ProductList({ products, onEdit, onChanged }) {
  const toast = useToast();
  const { handlers, dragId, overId } = useDragReorder(products, (p) => p.id, async (ids) => {
    try {
      await api.reorderProducts(ids);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  });

  async function remove(product) {
    if (!confirm(`"${product.name.tr}" silinsin mi?`)) return;
    try {
      await api.deleteProduct(product.id);
      toast.ok('Ürün silindi');
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (products.length === 0) {
    return <p className="px-4 py-3 text-[13px] text-muted-soft">Bu kategoride ürün yok.</p>;
  }

  return (
    <ul>
      {products.map((product) => {
        const price = rowPrice(product);
        const missing = missingLangs(product);
        return (
          <li
            key={product.id}
            {...handlers(product.id)}
            className={`flex items-center gap-3 border-t border-line px-3 py-2.5 first:border-0 ${
              dragId === product.id ? 'opacity-40' : ''
            } ${overId === product.id && dragId !== product.id ? 'border-t-2 border-t-resin' : ''}`}
          >
            <span className="cursor-grab text-muted-soft" aria-hidden="true">⠿</span>
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-sage">
              {product.imageThumb && <img src={product.imageThumb} alt="" className="h-full w-full object-cover" />}
            </div>
            <button type="button" onClick={() => onEdit(product)} className="min-w-0 flex-1 text-start">
              <span className="flex items-center gap-2">
                <span className="truncate font-semibold text-ink">{product.name.tr}</span>
                {product.isHidden && <Pill tone="muted">gizli</Pill>}
                {product.isSoldOut && <Pill tone="warn">tükendi</Pill>}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-soft">
                {price.price != null && <span className="tabular-nums">{formatPrice(price.price)}</span>}
                {product.variants.length > 0 && <span>· {product.variants.length} porsiyon</span>}
                {missing.length > 0 && <span className="text-resin">· eksik çeviri: {missing.join(', ').toUpperCase()}</span>}
              </span>
            </button>
            <button type="button" onClick={() => remove(product)} aria-label="Sil" className="shrink-0 p-1.5 text-muted-soft hover:text-danger">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Pill({ tone, children }) {
  const styles = tone === 'warn' ? 'bg-resin/15 text-resin' : 'bg-line text-muted';
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${styles}`}>{children}</span>;
}
