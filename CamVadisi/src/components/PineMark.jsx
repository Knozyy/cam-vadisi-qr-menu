/**
 * Marka isareti: kademeli cam agaci.
 *
 * Isletmenin logosundaki altin agacin vektor karsiligi. Raster banner favicon veya
 * 36px ust bar ikonunda bulaniklasir; vektor her olcekte keskin kalir ve
 * `currentColor` ile baglama gore renk alir.
 *
 * Form logodan: uc kademe + kisa govde + hafif genisleyen taban plakasi.
 */
export function PineMark({ className = '', title }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M32 6
           L39.5 21 L35 21
           L44.5 36 L39 36
           L50 50.5 L35.5 50.5
           L35.5 55.5 L39.5 59 L24.5 59 L28.5 55.5
           L28.5 50.5 L14 50.5
           L25 36 L19.5 36
           L29 21 L24.5 21 Z"
      />
    </svg>
  );
}
