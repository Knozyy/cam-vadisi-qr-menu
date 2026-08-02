import { useRef } from 'react';
import { useLang } from '../lib/LangContext.jsx';
import { UI } from '../lib/ui-strings.js';
import { CloseIcon, SearchIcon } from './icons.jsx';

export function SearchBar({ value, onChange }) {
  const { t } = useLang();
  const inputRef = useRef(null);

  function clearSearch() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className="classic-search-bar relative px-4 pt-3 pb-2.5">
      <span className="classic-search-icon pointer-events-none absolute inset-y-0 start-7 flex items-center text-muted-soft">
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
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
          onClick={clearSearch}
          aria-label={t(UI.close)}
          className="classic-search-clear absolute end-4 top-3 flex h-11 w-11 items-center justify-center text-muted-soft"
        >
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
