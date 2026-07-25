import { tagLabel } from '../../shared/tags.js';
import { useLang } from '../lib/LangContext.jsx';

/**
 * Alerjen/diyet rozetleri. Etiketler sabit kimlik; adlari sozlukten gelir.
 *
 * `size="sm"` (menu satiri) KISA adi kullanir - uc rozet yan yana sigsin, satir
 * ikinci sataya tasmasin. `size="md"` (detay paneli) tam adi gosterir.
 *
 * `spicy` kehribar vurgu alir: "aci" bir uyaridir, dikkat cekmesi dogru.
 */
export function TagBadges({ tags, size = 'sm' }) {
  const { lang } = useLang();
  if (!tags?.length) return null;

  const short = size === 'sm';
  const pad = short ? 'px-1.5 py-1 text-[10px]' : 'px-2 py-1 text-[11px]';

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const label = tagLabel(tag, lang, { short });
        if (!label) return null;
        const isSpicy = tag === 'spicy';
        return (
          <span
            key={tag}
            className={`inline-flex items-center whitespace-nowrap rounded font-semibold uppercase tracking-wide ${pad} ${
              isSpicy ? 'border border-resin/40 text-resin' : 'border border-line-strong text-muted'
            }`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
