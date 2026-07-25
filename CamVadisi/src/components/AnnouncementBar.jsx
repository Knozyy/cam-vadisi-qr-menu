import { useEffect, useState } from 'react';
import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { CloseIcon } from './icons.jsx';

/**
 * Duyuru seridi. Misafir kapatabilir; kapatma metnin kendisine gore hatirlanir,
 * boylece isletme YENI bir duyuru yazinca yeniden gorunur.
 */
export function AnnouncementBar({ text }) {
  const { t } = useLang();
  const message = t(text?.announcement ?? {});
  const active = text?.announcementActive && message;
  const storageKey = active ? `cam-vadisi-duyuru-kapali:${hash(message)}` : null;

  const [dismissed, setDismissed] = useState(() => {
    if (!storageKey) return false;
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setDismissed(storageKey ? localStorage.getItem(storageKey) === '1' : false);
  }, [storageKey]);

  if (!active || dismissed) return null;

  return (
    <div className="flex items-center gap-2.5 border-b border-line bg-[#DDE3D8] px-4 py-2.5 text-[13px] leading-snug text-ink">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-resin" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label={t(UI.close)}
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem(storageKey, '1');
          } catch {
            /* onemli degil */
          }
        }}
        className="shrink-0 text-muted-soft"
      >
        <CloseIcon width={16} height={16} />
      </button>
    </div>
  );
}

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}
