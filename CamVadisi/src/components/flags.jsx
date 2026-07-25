/*
 * Dil bayraklari - inline SVG.
 *
 * Neden emoji degil: emoji bayraklar Windows'ta hic render olmaz (harf cifti gorunur)
 * ve platformlar arasi bicim farki buyuk. SVG her yerde ayni gorunur, koyu cam
 * zeminde tutarli durur ve dis kaynak gerektirmez.
 *
 * Olcu 24x16 (3:2). Kose yuvarlama kapsayicida yapilir.
 */

function Frame({ children }) {
  return (
    <svg viewBox="0 0 24 16" className="h-full w-full" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function FlagTR() {
  return (
    <Frame>
      <rect width="24" height="16" fill="#E30A17" />
      {/* Hilal: beyaz dairenin uzerine kaydirilmis kirmizi daire */}
      <circle cx="9.2" cy="8" r="4" fill="#fff" />
      <circle cx="10.6" cy="8" r="3.2" fill="#E30A17" />
      {/* Bes koseli yildiz */}
      <polygon
        fill="#fff"
        points="17.7,8 16.21,8.52 16.18,10.09 15.23,8.84 13.72,9.29 14.62,8 13.72,6.71 15.23,7.16 16.18,5.91 16.21,7.48"
      />
    </Frame>
  );
}

export function FlagEN() {
  // Birlesik Krallik bayragi - "English" icin yaygin gosterim.
  return (
    <Frame>
      <rect width="24" height="16" fill="#012169" />
      <g strokeLinecap="butt">
        <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3.4" />
        <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
        <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5.2" />
        <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="3.1" />
      </g>
    </Frame>
  );
}

export function FlagAR() {
  // Arapca icin Suudi Arabistan bayragi sadelestirilmis: yesil zemin + kilic seridi.
  // (Arapca tek bir ulkeye ait olmadigindan dil secicilerde bu gosterim yaygindir.)
  return (
    <Frame>
      <rect width="24" height="16" fill="#1B7A3D" />
      <rect x="4" y="10.4" width="16" height="1.1" rx="0.55" fill="#fff" opacity="0.92" />
      <circle cx="19.4" cy="10.95" r="0.9" fill="#fff" opacity="0.92" />
      <rect x="5.5" y="5" width="13" height="0.9" rx="0.45" fill="#fff" opacity="0.55" />
      <rect x="6.5" y="7" width="11" height="0.9" rx="0.45" fill="#fff" opacity="0.55" />
    </Frame>
  );
}

export function FlagRU() {
  return (
    <Frame>
      <rect width="24" height="16" fill="#fff" />
      <rect y="5.33" width="24" height="5.34" fill="#0039A6" />
      <rect y="10.67" width="24" height="5.33" fill="#D52B1E" />
    </Frame>
  );
}

export const FLAGS = { tr: FlagTR, en: FlagEN, ar: FlagAR, ru: FlagRU };
