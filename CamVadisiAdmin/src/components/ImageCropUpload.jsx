import { useCallback, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../ui/Toast.jsx';
import { Button } from '../ui/form.jsx';

const VIEWPORT = 280; // kare kirpma penceresi (px)

/**
 * Gorsel yukleme + kare kirpma.
 * Isletme telefondan buyuk bir foto sec; sabit kare pencere icinde surukleyip
 * yakinlastirir. Kucultme ve WebP donusumu SUNUCUDA yapilir - burada yalnizca
 * hangi kare bolgenin alinacagi (natural piksel) hesaplanip gonderilir.
 */
export function ImageCropUpload({ value, onChange }) {
  const toast = useToast();
  const [src, setSrc] = useState(null);
  const [file, setFile] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const dragRef = useRef(null);

  // Goruntuyu kareye "cover" edecek taban olcek; zoom bunun uzerine biner.
  const baseScale = natural.w && natural.h
    ? Math.max(VIEWPORT / natural.w, VIEWPORT / natural.h)
    : 1;
  const scale = baseScale * zoom;
  const scaledW = natural.w * scale;
  const scaledH = natural.h * scale;

  const clamp = useCallback(
    (next) => {
      const maxX = Math.max(0, (scaledW - VIEWPORT) / 2);
      const maxY = Math.max(0, (scaledH - VIEWPORT) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [scaledW, scaledH],
  );

  function pickFile(e) {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    const url = URL.createObjectURL(chosen);
    const img = new Image();
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setSrc(url);
      setFile(chosen);
    };
    img.src = url;
  }

  function onPointerDown(e) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, base: offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current) return;
    const { startX, startY, base } = dragRef.current;
    setOffset(clamp({ x: base.x + (e.clientX - startX), y: base.y + (e.clientY - startY) }));
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  async function confirm() {
    if (!file) return;
    setBusy(true);
    try {
      // Pencere merkezinin goruntu uzerindeki natural piksel kaynagini hesapla.
      const cropSizeNatural = VIEWPORT / scale;
      const centerX = natural.w / 2 - offset.x / scale;
      const centerY = natural.h / 2 - offset.y / scale;
      const crop = {
        left: Math.max(0, centerX - cropSizeNatural / 2),
        top: Math.max(0, centerY - cropSizeNatural / 2),
        width: cropSizeNatural,
        height: cropSizeNatural,
      };
      const form = new FormData();
      form.append('image', file);
      form.append('crop', JSON.stringify(crop));
      const urls = await api.upload(form);
      onChange(urls);
      reset();
      toast.ok('Görsel yüklendi');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setFile(null);
  }

  // Kirpma modu
  if (src) {
    return (
      <div className="rounded-xl border border-line-strong p-3">
        <div
          className="relative mx-auto touch-none overflow-hidden rounded-lg bg-ink"
          style={{ width: VIEWPORT, height: VIEWPORT }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: scaledW,
              height: scaledH,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/40" />
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-[12px] text-muted">Yakınlaştır</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => {
              setZoom(Number(e.target.value));
              setOffset((o) => clamp(o));
            }}
            className="w-full accent-pine"
          />
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={reset} disabled={busy}>Vazgeç</Button>
          <Button type="button" onClick={confirm} disabled={busy}>{busy ? 'Yükleniyor…' : 'Kırp ve yükle'}</Button>
        </div>
      </div>
    );
  }

  // Onizleme + secim modu
  return (
    <div className="flex items-center gap-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line-strong bg-sage">
        {value?.thumb ? (
          <img src={value.thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-[11px] text-muted-soft">Görsel yok</div>
        )}
      </div>
      <div>
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-4 py-2.5 text-[14px] font-semibold text-ink hover:bg-sage">
            {value?.thumb ? 'Değiştir' : 'Görsel seç'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </label>
        {value?.thumb && (
          <button
            type="button"
            onClick={() => onChange({ thumb: '', full: '' })}
            className="ms-2 text-[13px] font-semibold text-danger"
          >
            Kaldır
          </button>
        )}
      </div>
    </div>
  );
}
