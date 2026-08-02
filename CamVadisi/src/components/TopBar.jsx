import { Translate } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";
import { LangStrip } from "./LangStrip.jsx";

/**
 * Klasik katalog ust bari: marka, dil ve Listem davranislarini korur; eski genis
 * banner yerine urunleri ilk ekrana tasiyan kompakt marka satiri kullanir.
 */
export function TopBar({
  restaurantName,
  favCount,
  onOpenFavorites,
  onOpenHome,
}) {
  const { lang, t } = useLang();
  const [showLanguages, setShowLanguages] = useState(false);
  const languageButtonRef = useRef(null);
  const languagePopoverRef = useRef(null);

  useEffect(() => {
    if (!showLanguages) return undefined;

    function onPointerDown(event) {
      if (
        languageButtonRef.current?.contains(event.target) ||
        languagePopoverRef.current?.contains(event.target)
      ) {
        return;
      }
      setShowLanguages(false);
    }

    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setShowLanguages(false);
      languageButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showLanguages]);

  return (
    <header className="classic-topbar">
      <button
        type="button"
        onClick={onOpenHome}
        className="classic-topbar-brand"
        aria-label={t(UI.backHome)}
      >
        <img src="/icon-192.png" alt="" width="40" height="40" />
        <span>
          <strong>{restaurantName}</strong>
          <small>{t(UI.restaurantLocationShort)}</small>
        </span>
      </button>

      <div className="classic-topbar-actions">
        <button
          ref={languageButtonRef}
          type="button"
          onClick={() => setShowLanguages((open) => !open)}
          className="classic-language-button"
          aria-expanded={showLanguages}
          aria-controls="classic-language-popover"
          aria-label="Dil seçimi"
        >
          <Translate size={18} weight="bold" aria-hidden="true" />
          <span>{lang.toLocaleUpperCase("tr-TR")}</span>
        </button>

        <button
          type="button"
          onClick={onOpenFavorites}
          className="classic-topbar-list"
          aria-label={t(UI.myList)}
        >
          <span>{t(UI.myList)}</span>
          <strong>{favCount}</strong>
        </button>
      </div>

      {showLanguages && (
        <div
          ref={languagePopoverRef}
          id="classic-language-popover"
          className="classic-language-popover"
          role="region"
          aria-label="Dil seçimi"
        >
          <LangStrip
            tone="light"
            onSelect={() => {
              setShowLanguages(false);
              languageButtonRef.current?.focus();
            }}
          />
        </div>
      )}
    </header>
  );
}
