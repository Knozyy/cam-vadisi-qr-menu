import { useEffect, useRef } from 'react';
import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { CloseIcon } from './icons.jsx';

/**
 * Sayfa kaydirma kilidi SAYAC ile tutulur. Iki panel ust uste acilirsa (favori
 * listesinden urun detayi acmak gibi) ikincisi kapaninca kilit erken kalkiyordu ve
 * arka plan kayabiliyordu. Sayac sifira dusmeden kilit acilmaz.
 */
let scrollLocks = 0;
let savedOverflow = '';

function lockScroll() {
  if (scrollLocks === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
}

/**
 * Alttan acilan panel (bottom sheet). Hem urun detayi hem favori listesi kullanir.
 * Kapaninca sayfa kaydigi yerde kalir - misafir menudeki konumunu kaybetmesin.
 *
 * Erisilebilirlik: Escape ile kapanir, acilinca odak iceri alinir, arkasi kilitlenir.
 */
export function Sheet({ open, onClose, title, children, footer }) {
  const { t } = useLang();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    lockScroll();
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label={t(UI.close)}
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(20,28,22,0.5)] motion-safe:animate-[fade_.18s_ease]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl bg-surface outline-none motion-safe:animate-[slideup_.22s_cubic-bezier(.2,.8,.2,1)]"
      >
        <div className="flex-none pt-2.5">
          <div className="mx-auto h-1 w-9 rounded-full bg-line-strong" />
          {title && (
            <div className="flex items-center gap-2 px-4 pt-2">
              <h2 className="flex-1 font-display text-lg font-semibold text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t(UI.close)}
                className="rounded-full p-1.5 text-muted-soft hover:bg-sage"
              >
                <CloseIcon />
              </button>
            </div>
          )}
        </div>
        {children}
        {footer && (
          <div className="flex-none border-t border-line-strong bg-surface px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideup { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
