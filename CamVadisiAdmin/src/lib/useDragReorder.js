import { useRef, useState } from 'react';

/**
 * Native HTML5 surukle-birak ile liste siralama - ek kutuphane yok.
 *
 * IC ICE LISTE UYARISI: kategoriler de urunler de suruklenebilir ve urun listesi
 * kategorinin ICINDE. HTML5 drag olaylari kabarcik yaptigi icin bir urunu suruklemek
 * ayni zamanda kategori suruklemesini baslatiyordu (ve urun birakinca kategoriler
 * yeniden siralaniyordu). Bu yuzden her olayda `stopPropagation` cagrilir.
 */
export function useDragReorder(items, getId, onReorder) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  /**
   * Karar icin ref, gorsel geri bildirim icin state.
   * `dragId` state'i bir sonraki render'da guncellenir; hizli surukleme veya
   * dokunmatik cihazda `drop` ayni tick'te gelirse state hala null olup birakma
   * sessizce yok sayilabiliyordu. Ref senkron oldugu icin karar hep dogru.
   */
  const dragIdRef = useRef(null);

  function handlers(id) {
    return {
      draggable: true,
      onDragStart: (e) => {
        e.stopPropagation();
        dragIdRef.current = id;
        setDragId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Firefox suruklemeyi baslatmak icin veri bekler.
        try {
          e.dataTransfer.setData('text/plain', String(id));
        } catch {
          /* bazi tarayicilar dragstart disinda reddeder */
        }
      },
      onDragOver: (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (id !== overId) setOverId(id);
      },
      onDrop: (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dragging = dragIdRef.current;
        if (dragging === null || dragging === id) return reset();
        const ids = items.map(getId);
        const from = ids.indexOf(dragging);
        const to = ids.indexOf(id);
        // Suruklenen oge bu listede degilse (ic ice listeden gelmis) dokunma.
        if (from === -1 || to === -1) return reset();
        ids.splice(to, 0, ids.splice(from, 1)[0]);
        onReorder(ids);
        return reset();
      },
      onDragEnd: (e) => {
        e.stopPropagation();
        reset();
      },
    };
  }

  function reset() {
    dragIdRef.current = null;
    setDragId(null);
    setOverId(null);
  }

  return { handlers, dragId, overId };
}
