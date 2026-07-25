import { useId, useState } from 'react';
import { LANGS } from '@shared/i18n.js';

const LANG_LABELS = { tr: 'TR', en: 'EN', ar: 'AR', ru: 'RU' };

/** Cizgili buton stilleri - tek yerden. */
export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-50';
  const styles = {
    primary: 'bg-pine text-white hover:bg-pine-700',
    ghost: 'text-pine hover:bg-sage',
    outline: 'border border-line-strong text-ink hover:bg-sage',
    danger: 'text-danger hover:bg-danger/10',
    resin: 'bg-resin text-resin-ink',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

/**
 * Etiketli alan sarmalayicisi.
 *
 * DIKKAT: Bu bir <label> DEGIL, <div>. Sebep: <label>'in herhangi bir yerine tiklamak
 * icindeki ilk form kontrolunu aktive eder. Field icinde dosya girdisi veya "Sil"
 * butonu bulundugunda, alanin bos yerine tiklamak dosya seciciyi aciyor ya da varyant
 * siliyordu. Ayrica gorsel yukleme kendi <label>'ini kullaniyor -> ic ice label
 * (gecersiz HTML) olusuyordu.
 *
 * Erisilebilirlik `role="group"` + `aria-labelledby` ile korunur.
 */
export function Field({ label, hint, children }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <span id={id} className="mb-1.5 flex items-baseline gap-2 text-[13px] font-semibold text-muted">
        {label}
        {hint && <span className="font-normal text-muted-soft">{hint}</span>}
      </span>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-pine';

export function TextInput(props) {
  return <input className={inputClass} {...props} />;
}

export function TextArea(props) {
  return <textarea rows={2} className={`${inputClass} resize-y`} {...props} />;
}

/**
 * 4 dilli sekmeli girdi. TR sekmesi zorunlu; diger dillerin bos olmasi sorun degil
 * (menu fallback zinciriyle Turkce/Ingilizce gosterir). Bos sekme rozetle isaretlenir.
 */
export function LangInput({ value, onChange, multiline = false, placeholder }) {
  const [active, setActive] = useState('tr');
  const Input = multiline ? TextArea : TextInput;

  return (
    <div>
      <div className="mb-2 flex gap-1">
        {LANGS.map((lang) => {
          const filled = value?.[lang]?.trim();
          const isActive = active === lang;
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setActive(lang)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-semibold ${
                isActive ? 'bg-pine text-white' : 'bg-sage text-muted'
              }`}
            >
              {LANG_LABELS[lang]}
              {lang !== 'tr' && !filled && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white/60' : 'bg-resin'}`} aria-label="boş" />
              )}
            </button>
          );
        })}
      </div>
      <Input
        value={value?.[active] ?? ''}
        onChange={(e) => onChange({ ...value, [active]: e.target.value })}
        placeholder={active === 'tr' ? placeholder : `${placeholder} (${LANG_LABELS[active]})`}
        dir={active === 'ar' ? 'rtl' : 'ltr'}
      />
    </div>
  );
}
