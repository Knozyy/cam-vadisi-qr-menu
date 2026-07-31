import { LANG_NAMES, useLang } from "../lib/LangContext.jsx";
import { FLAGS } from "./flags.jsx";

const LANG_ORDER = ["tr", "en", "ar", "ru"];

/**
 * Yan yana dil bayraklari - acilir menu DEGIL.
 *
 * Acilir menu iki kez kirpilma/tiklanamama sorunu cikardi (bkz. Kovan:
 * overflow-clip-yalnizca-dekoratif-katmanda). Tasan katman olmayinca sorun kokten bitti
 * ve dil degistirmek tek dokunus oldu.
 *
 * Dort esit sutun: yan yana `flex` denendi, 375px'te icerik 418px olup son dil tasiyordu.
 * Bayrak ustte + ad altta olunca tum adlar kirpilmadan sigar.
 */
export function LangStrip({ className = "", tone = "dark" }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={`grid grid-cols-4 gap-1.5 ${className}`}
      role="group"
      aria-label="Dil seçimi"
    >
      {LANG_ORDER.map((code) => {
        const Flag = FLAGS[code];
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            lang={code}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold leading-none transition-colors ${
              active
                ? "bg-sage text-pine"
                : tone === "light"
                  ? "bg-pine/6 text-muted"
                  : "bg-white/10 text-sage/80"
            }`}
          >
            <span
              className={`h-4 w-6 shrink-0 overflow-hidden rounded-[2px] ring-1 ${
                active ? "ring-pine/25" : "ring-white/25"
              }`}
            >
              <Flag />
            </span>
            <span className="max-w-full truncate">{LANG_NAMES[code]}</span>
          </button>
        );
      })}
    </div>
  );
}
