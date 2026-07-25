import { useState } from 'react';
import { api } from '../lib/api.js';
import { emptyCategory, emptyProduct } from '../lib/empty.js';
import { useDragReorder } from '../lib/useDragReorder.js';
import { useToast } from '../ui/Toast.jsx';
import { Button } from '../ui/form.jsx';
import { CategoryEditor } from './CategoryEditor.jsx';
import { ProductEditor } from './ProductEditor.jsx';
import { ProductList } from './ProductList.jsx';

/** Menu duzenleme ana ekrani: kategoriler (surukle-birak) + her birinin urunleri. */
export function MenuManager({ menu, reload }) {
  const toast = useToast();
  const categories = menu.categories ?? [];
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());

  const { handlers, dragId, overId } = useDragReorder(categories, (c) => c.id, async (ids) => {
    try {
      await api.reorderCategories(ids);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  });

  async function removeCategory(category) {
    if (!confirm(`"${category.name.tr}" ve içindeki tüm ürünler silinsin mi?`)) return;
    try {
      await api.deleteCategory(category.id);
      toast.ok('Kategori silindi');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function toggleCollapse(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-soft">Sürükleyerek sıralayın</p>
        <Button onClick={() => setEditingCategory(emptyCategory())}>+ Kategori</Button>
      </div>

      {categories.map((category) => {
        const isCollapsed = collapsed.has(category.id);
        return (
          <section
            key={category.id}
            {...handlers(category.id)}
            className={`overflow-hidden rounded-xl border border-line-strong bg-surface ${
              dragId === category.id ? 'opacity-40' : ''
            } ${overId === category.id && dragId !== category.id ? 'ring-2 ring-resin' : ''}`}
          >
            <header className="flex items-center gap-2 border-b border-line bg-sage/50 px-3 py-2.5">
              <span className="cursor-grab text-muted-soft" aria-hidden="true">⠿</span>
              <button type="button" onClick={() => toggleCollapse(category.id)} className="flex min-w-0 flex-1 items-center gap-2 text-start">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`shrink-0 text-muted-soft transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span className="truncate font-display text-[17px] font-semibold text-pine">{category.name.tr}</span>
                {category.isHidden && <span className="rounded bg-line px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">gizli</span>}
                <span className="text-[12px] text-muted-soft">· {category.products.length} ürün</span>
                {category.timeStart && category.timeEnd && (
                  <span className="text-[12px] text-muted-soft tabular-nums">· {category.timeStart}–{category.timeEnd}</span>
                )}
              </button>
              <button type="button" onClick={() => setEditingCategory(category)} className="p-1.5 text-muted-soft hover:text-pine" aria-label="Düzenle">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4" />
                </svg>
              </button>
              <button type="button" onClick={() => removeCategory(category)} className="p-1.5 text-muted-soft hover:text-danger" aria-label="Sil">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                </svg>
              </button>
            </header>

            {!isCollapsed && (
              <>
                <ProductList products={category.products} onEdit={setEditingProduct} onChanged={reload} />
                <div className="border-t border-line px-3 py-2.5">
                  <Button variant="ghost" onClick={() => setEditingProduct(emptyProduct(category.id))}>+ Ürün ekle</Button>
                </div>
              </>
            )}
          </section>
        );
      })}

      {editingCategory && (
        <CategoryEditor
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={() => { setEditingCategory(null); reload(); }}
        />
      )}
      {editingProduct && (
        <ProductEditor
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={() => { setEditingProduct(null); reload(); }}
        />
      )}
    </div>
  );
}
