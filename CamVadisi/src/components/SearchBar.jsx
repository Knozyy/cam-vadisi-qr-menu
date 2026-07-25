import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { CloseIcon, SearchIcon } from './icons.jsx';

export function SearchBar({ value, onChange }) {
  const { t } = useLang();
  return (
    <div className="relative px-4 pt-3 pb-2.5">
      <span className="pointer-events-none absolute inset-y-0 start-7 flex items-center text-muted-soft">
        <SearchIcon />
      </span>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t(UI.search)}
        aria-label={t(UI.search)}
        className="h-11 w-full rounded-lg border border-line-strong bg-surface ps-10 pe-10 text-[15px] text-ink outline-none placeholder:text-muted-soft focus:border-pine"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t(UI.close)}
          className="absolute inset-y-0 end-7 flex items-center text-muted-soft"
        >
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
