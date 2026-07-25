import { TAGS, TAG_IDS } from '@shared/tags.js';

/**
 * Alerjen/diyet etiketleri kutu isaretleme ile secilir - serbest metin degil.
 * Etiketin 4 dildeki adi sabit oldugundan burada ceviri girisi YOK.
 */
export function TagPicker({ selected, onChange }) {
  function toggle(tag) {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_IDS.map((tag) => {
        const on = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            aria-pressed={on}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold ${
              on ? 'border-pine bg-pine text-white' : 'border-line-strong text-muted'
            }`}
          >
            {TAGS[tag].tr}
          </button>
        );
      })}
    </div>
  );
}
