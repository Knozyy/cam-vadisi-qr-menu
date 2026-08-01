import { CaretDown, Funnel, Info } from "@phosphor-icons/react";
import { tagLabel } from "../../shared/tags.js";
import { useLang } from "../lib/LangContext.jsx";
import { UI } from "../lib/ui-strings.js";

/** "Kacin" etiketleri OLUMSUZ okunur: rozetteki "Sütlü" ile suzgectecki "Sütsüz" ayri. */
const AVOID_LABELS = {
  dairy: UI.withoutDairy,
  nuts: UI.withoutNuts,
  spicy: UI.withoutSpicy,
};

/**
 * Diyet ve alerjen suzgeci.
 *
 * Varsayilan KAPALI: ilk ekranda urunler oncelikli, ustuste iki cip siral
 * kategori sekmeleriyle yarisirdi. Aktif suzgec varsa rozet sayiyi gosterir,
 * boylece kapaliyken bile suzgecin acik oldugu anlasilir.
 */
export function DietFilterBar({
  available,
  dietTags,
  avoidTags,
  open,
  onToggleOpen,
  onToggleDiet,
  onToggleAvoid,
  onClear,
}) {
  const { lang, t } = useLang();
  const activeCount = dietTags.length + avoidTags.length;

  if (available.diet.length === 0 && available.avoid.length === 0) return null;

  return (
    <div className="classic-filter">
      <button
        type="button"
        onClick={onToggleOpen}
        className="classic-filter-trigger"
        aria-expanded={open}
        aria-controls="diet-filter-panel"
      >
        <Funnel size={16} weight="bold" aria-hidden="true" />
        <span>{t(UI.filters)}</span>
        {activeCount > 0 && (
          <strong className="classic-filter-badge">{activeCount}</strong>
        )}
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden="true"
          className={`classic-filter-caret ${open ? "is-open" : ""}`}
        />
      </button>

      {open && (
        <div id="diet-filter-panel" className="classic-filter-panel">
          <div className="classic-filter-chips">
            {available.diet.map((tag) => {
              const active = dietTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleDiet(tag)}
                  aria-pressed={active}
                  className={`classic-filter-chip ${active ? "is-active" : ""}`}
                >
                  {tagLabel(tag, lang)}
                </button>
              );
            })}

            {available.avoid.map((tag) => {
              const active = avoidTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleAvoid(tag)}
                  aria-pressed={active}
                  className={`classic-filter-chip ${active ? "is-active" : ""}`}
                >
                  {t(AVOID_LABELS[tag])}
                </button>
              );
            })}

            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="classic-filter-reset"
              >
                {t(UI.filtersClear)}
              </button>
            )}
          </div>

          <p className="classic-filter-note">
            <Info size={14} weight="bold" aria-hidden="true" />
            <span>{t(UI.filtersDisclaimer)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
