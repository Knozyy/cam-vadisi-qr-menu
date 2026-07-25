/* Tek dosyada ince cizgili ikonlar - ayri bir ikon kutuphanesi cekmemek icin. */

export function HeartIcon({ filled = false, ...props }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 21s-8-5.2-8-10.3A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8 3.7C20 15.8 12 21 12 21z" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function ChevronIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

/** Ust bardaki vadi konturu - mekanin adini dekorasyonla degil topografyayla soyler. */
export function ContourBand({ className }) {
  return (
    <svg className={className} viewBox="0 0 390 76" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="#E7EAE1" strokeWidth="1">
        <path d="M-10 66 C60 40 120 78 190 52 S320 22 400 46" />
        <path d="M-10 52 C60 26 120 64 190 38 S320 8 400 32" />
        <path d="M-10 38 C60 12 120 50 190 24 S320 -6 400 18" />
        <path d="M-10 80 C60 54 120 92 190 66 S320 36 400 60" />
      </g>
    </svg>
  );
}
