import { Translate } from "@phosphor-icons/react";
import { useState } from "react";
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
          type="button"
          onClick={() => setShowLanguages((open) => !open)}
          className="classic-language-button"
          aria-expanded={showLanguages}
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
        <div className="classic-language-popover">
          <LangStrip tone="light" />
        </div>
      )}
    </header>
  );
}
