import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { CheckIcon } from './icons.jsx';
import { PineMark } from './PineMark.jsx';

/** Calisma saatleri + wifi. "Su an acik" rozeti YOK (kullanici karari). */
export function VenueFooter({ settings }) {
  const { t } = useLang();
  const hours = settings?.hours ?? [];
  const wifi = settings?.wifiPassword;
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);
  const wifiRef = useRef(null);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  /**
   * Pano API'si HTTPS olmayan baglantida ve bazi mobil tarayicilarda yok. O durumda
   * sifreyi secili hale getiririz - misafir elle kopyalayabilsin. Onceki surum
   * sessizce basarisiz oluyordu, misafir butona bastigini sanip hicbir sey almiyordu.
   */
  async function copyWifi() {
    try {
      await navigator.clipboard.writeText(wifi);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const node = wifiRef.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  if (hours.length === 0 && !wifi) return null;

  return (
    <footer className="mt-1.5 border-t border-line-strong px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      {hours.length > 0 && (
        <>
          <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-widest text-muted">
            {t(UI.hours)}
          </h3>
          <dl className="text-[14px]">
            {hours.map((row, index) => (
              <div key={index} className="flex items-baseline justify-between py-0.5">
                <dt className="text-ink">{row.day}</dt>
                <dd className="text-muted tabular-nums">
                  {row.open} – {row.close}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {wifi && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line-strong bg-surface px-3.5 py-3">
          <div className="min-w-0">
            <span className="block text-[12px] text-muted">{t(UI.wifi)}</span>
            <strong ref={wifiRef} className="block truncate text-[15px] tracking-wide text-ink">
              {wifi}
            </strong>
          </div>
          <button
            type="button"
            onClick={copyWifi}
            className="ms-auto flex items-center gap-1.5 rounded-lg bg-resin px-3 py-2.5 text-[13px] font-semibold text-resin-ink"
          >
            {copied ? (
              <>
                <CheckIcon /> {t(UI.copied)}
              </>
            ) : (
              t(UI.copy)
            )}
          </button>
        </div>
      )}

      {/* Marka imzası: banner artık ÜST BARDA (kullanıcı kararı), burada yalnızca
          küçük bir çam işareti kalır - tekrar olmasın. */}
      <div className="mt-7 flex justify-center border-t border-line pt-6">
        <PineMark className="h-7 w-7 text-gold" title="Çam Vadisi" />
      </div>
    </footer>
  );
}
