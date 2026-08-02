import { useEffect, useRef } from 'react';
import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { CloseIcon } from './icons.jsx';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

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
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef(null);

  // Kapanma callback'i degisse bile acik panelin scroll kilidi yeniden kurulmasin.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const onKey = (e) => {
      const sheets = document.querySelectorAll('.classic-sheet-root');
      if (sheets[sheets.length - 1] !== rootRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          element instanceof HTMLElement &&
          element.getClientRects().length > 0 &&
          element.getAttribute('aria-hidden') !== 'true',
      );

      if (focusable.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const panelOwnsFocus = active === panel;

      if (
        e.shiftKey &&
        (active === first || panelOwnsFocus || !panel.contains(active))
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (active === last || panelOwnsFocus || !panel.contains(active))
      ) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    lockScroll();
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div ref={rootRef} className="classic-sheet-root fixed inset-0 z-40">
      <button
        type="button"
        aria-label={t(UI.close)}
        onClick={() => onCloseRef.current()}
        className="classic-sheet-backdrop absolute inset-0 bg-[rgba(20,28,22,0.5)] motion-safe:animate-[fade_.18s_ease]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="classic-sheet-panel absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl bg-surface outline-none motion-safe:animate-[slideup_.22s_cubic-bezier(.2,.8,.2,1)]"
      >
        <div className="classic-sheet-header flex-none pt-2.5">
          <div className="classic-sheet-handle mx-auto h-1 w-9 rounded-full bg-line-strong" />
          {title && (
            <div className="classic-sheet-title-row flex items-center gap-2 px-4 pt-2">
              <h2 className="classic-sheet-title flex-1 font-display text-lg font-semibold text-ink">
                {title}
              </h2>
              <button
                type="button"
                onClick={() => onCloseRef.current()}
                aria-label={t(UI.close)}
                className="classic-sheet-close rounded-full p-1.5 text-muted-soft hover:bg-sage"
              >
                <CloseIcon />
              </button>
            </div>
          )}
        </div>
        {children}
        {footer && (
          <div className="classic-sheet-footer flex-none border-t border-line-strong bg-surface px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
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
