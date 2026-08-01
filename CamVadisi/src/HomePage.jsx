import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  InstagramLogo,
  MapPin,
} from '@phosphor-icons/react';
import { useLang } from './lib/LangContext.jsx';
import { trackView } from './lib/api.js';
import './home.css';

const LANG_ORDER = ['tr', 'en', 'ar', 'ru'];
const INSTAGRAM_URL = 'https://www.instagram.com/cam.vadisi/';
const DEFAULT_ADDRESS =
  'Anadolu Kavağı Mahallesi, Feneryolu Caddesi, Çam Vadisi Cafe No:12, Beykoz / İstanbul';
const DEFAULT_PHONES = ['+90 532 244 08 15', '+90 545 248 79 90'];
const DEFAULT_LOCATION = [41.1776, 29.0959];

const NAV_ITEMS = [
  {
    href: '#menu',
    className: 'home-grove-nav__item--menu',
    number: '01',
    title: 'Menü',
    description: 'Günlük tazelik, yerel lezzetler.',
  },
  {
    href: '#hikaye',
    className: 'home-grove-nav__item--story',
    number: '02',
    title: 'Hikâyemiz',
    description: "1998'den beri aynı vadide.",
  },
  {
    href: '#lezzetler',
    className: 'home-grove-nav__item--flavours',
    number: '03',
    title: 'Lezzetler',
    description: 'Günün öne çıkan sofraları.',
  },
  {
    href: '#ulasim',
    className: 'home-grove-nav__item--location',
    number: '04',
    title: 'Ulaşım',
    description: 'Boğaz yolunun en yeşil durağı.',
  },
];

const CATEGORY_SPECS = [
  {
    slug: 'kahvalti-cesitleri',
    image: '/uploads/urun-bal-kaymak-full.webp',
    fallbackTitle: 'Kahvaltı Çeşitleri',
    copy: 'Günlük tazelik, yerel lezzetler.',
    modifier: 'cv-menu-band--kahvalti',
  },
  {
    slug: 'ara-sicaklar',
    image: '/uploads/urun-sahanda-yumurta-2-full.webp',
    fallbackTitle: 'Ara Sıcaklar',
    copy: 'Uzun sofralara mutfaktan sıcak bir başlangıç.',
    modifier: 'cv-menu-band--sicak cv-menu-band--reverse',
  },
  {
    slug: 'deniz-urunleri',
    image: '/uploads/urun-deniz-levregi-full.webp',
    fallbackTitle: 'Deniz Ürünleri',
    copy: 'Izgarada sade pişirim, mevsim yeşillikleri ve limon.',
    modifier: 'cv-menu-band--deniz',
  },
];

const FEATURE_SPECS = [
  {
    needle: 'serpme kahvalti',
    fallbackName: 'Serpme Kahvaltı',
    fallbackDescription: 'Sınırsız çay, ev reçelleri, sıcak pişi ve tereyağında yumurta.',
    label: '2 kişilik',
  },
  {
    needle: 'deniz levregi',
    fallbackName: 'Günlük Deniz Levreği',
    fallbackDescription: 'Izgarada sade pişirim, mevsim yeşillikleri ve limon.',
    label: 'günlük taze',
  },
  {
    needle: 'sahanda yumurta',
    fallbackName: 'Sahanda Yumurta',
    fallbackDescription: 'Döküm sahanda, köy tereyağıyla sıcak servis.',
    label: 'mutfaktan sıcak',
  },
];

function normalize(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ı', 'i');
}

function formatPhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  const national = digits.length === 10 ? '0' + digits : digits;
  if (national.length !== 11) return raw;
  return (
    national.slice(0, 4) +
    ' ' +
    national.slice(4, 7) +
    ' ' +
    national.slice(7, 9) +
    ' ' +
    national.slice(9)
  );
}

function phoneHref(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');

  if (digits.length === 10) return 'tel:+90' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return 'tel:+90' + digits.slice(1);
  if (digits.length === 12 && digits.startsWith('90')) return 'tel:+' + digits;
  return 'tel:' + (String(raw ?? '').trim().startsWith('+') ? '+' : '') + digits;
}

function formatHours(hours) {
  const rows = Array.isArray(hours)
    ? hours.filter((row) => row?.open && row?.close)
    : [];

  if (rows.length === 0) return 'Her gün 08:00 — 23:00';

  return rows
    .map((row) => {
      const day = row.day ? row.day + ' ' : '';
      return day + row.open + ' — ' + row.close;
    })
    .join(' · ');
}

function formatCoordinate(value, positive, negative) {
  const number = Number(value);
  const direction = number >= 0 ? positive : negative;
  return Math.abs(number).toFixed(4) + '° ' + direction;
}

function stripTrailingVariantLabel(value) {
  return String(value ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function SplitTitle({ children }) {
  const words = String(children ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return children;
  const splitAt = Math.ceil(words.length / 2);
  return (
    <>
      {words.slice(0, splitAt).join(' ')}
      <br />
      {words.slice(splitAt).join(' ')}
    </>
  );
}

export function HomePage({ menu, onOpenMenu, onOpenCategory }) {
  const { lang, setLang, t } = useLang();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(false);
  const mobileTriggerRef = useRef(null);
  const mobileNavigationRef = useRef(null);
  const mobileHideTimerRef = useRef(null);
  const mobileOpenFrameRef = useRef(null);
  const settings = menu.settings ?? {};
  const categories = menu.categories ?? [];
  const restaurantName = settings.restaurantName ?? 'Çam Vadisi';
  const address = settings.address || DEFAULT_ADDRESS;
  const phones = settings.phones?.length > 0 ? settings.phones.slice(0, 2) : DEFAULT_PHONES;
  const locationCandidate = Array.isArray(settings.location)
    ? settings.location.map(Number)
    : [];
  const location =
    locationCandidate.length === 2 && locationCandidate.every(Number.isFinite)
      ? locationCandidate
      : DEFAULT_LOCATION;
  const hoursLabel = formatHours(settings.hours);
  const latitudeLabel = formatCoordinate(location[0], 'N', 'S');
  const longitudeLabel = formatCoordinate(location[1], 'E', 'W');

  useEffect(() => {
    trackView('open');
  }, []);

  const mapsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent(location[0] + ',' + location[1]);

  const categoryCards = useMemo(
    () =>
      CATEGORY_SPECS.map((spec, index) => {
        const category = categories.find((item) => item.slug === spec.slug) ?? categories[index];
        return {
          ...spec,
          category,
          title: category ? t(category.name) : spec.fallbackTitle,
          count: category?.products?.length ?? 0,
        };
      }),
    [categories, t],
  );

  const features = useMemo(() => {
    const allProducts = categories.flatMap((category) =>
      (category.products ?? []).map((product) => ({ product, category })),
    );

    return FEATURE_SPECS.map((spec) => {
      const match = allProducts.find(({ product }) =>
        normalize(product.name?.tr).includes(spec.needle),
      );
      return {
        ...spec,
        category: match?.category,
        name: match ? stripTrailingVariantLabel(t(match.product.name)) : spec.fallbackName,
        description:
          match && t(match.product.description)
            ? t(match.product.description)
            : spec.fallbackDescription,
      };
    });
  }, [categories, t]);

  const closeMobileNav = useCallback(({ restoreFocus = false } = {}) => {
    window.clearTimeout(mobileHideTimerRef.current);
    window.cancelAnimationFrame(mobileOpenFrameRef.current);
    setMobileNavOpen(false);
    mobileHideTimerRef.current = window.setTimeout(() => {
      setMobileNavVisible(false);
    }, 320);

    if (restoreFocus) {
      window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
    }
  }, []);

  const openMobileNav = useCallback(() => {
    window.clearTimeout(mobileHideTimerRef.current);
    window.cancelAnimationFrame(mobileOpenFrameRef.current);
    setMobileNavVisible(true);
    mobileOpenFrameRef.current = window.requestAnimationFrame(() => {
      setMobileNavOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    document.body.classList.add('home-menu-is-open');

    function handlePointerDown(event) {
      if (
        !mobileNavigationRef.current?.contains(event.target) &&
        !mobileTriggerRef.current?.contains(event.target)
      ) {
        closeMobileNav();
      }
    }

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeMobileNav({ restoreFocus: true });
    }

    function handleResize() {
      if (window.innerWidth > 1080) closeMobileNav();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.classList.remove('home-menu-is-open');
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [closeMobileNav, mobileNavOpen]);

  useEffect(
    () => () => {
      window.clearTimeout(mobileHideTimerRef.current);
      window.cancelAnimationFrame(mobileOpenFrameRef.current);
      document.body.classList.remove('home-menu-is-open');
    },
    [],
  );

  function openCategory(slug) {
    if (slug) onOpenCategory(slug);
    else onOpenMenu();
  }

  function closeMobileNavFromLink() {
    closeMobileNav({ restoreFocus: true });
  }

  function renderLanguages(mobile = false) {
    return (
      <div
        className={'home-languages' + (mobile ? ' home-languages--mobile' : '')}
        role="group"
        aria-label="Dil seçenekleri"
      >
        {LANG_ORDER.map((code) => (
          <button
            key={code}
            type="button"
            className={lang === code ? 'is-active' : ''}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <a className="home-skip-link" href="#home-content">
        İçeriğe geç
      </a>
      <main className="home-page" id="home-content">
        <section className="home-hero" id="top" aria-labelledby="home-hero-title">
          <img
            className="home-hero__image"
            src="/hero-cam-vadisi-v1.png"
            alt="Çamların arasından Boğaz'a bakan kahvaltı sofrası"
            width="1672"
            height="941"
            fetchPriority="high"
          />
          <div className="home-hero__veil" aria-hidden="true" />

          <header className="home-site-header home-shell">
            <a className="home-brand" href="#top" aria-label="Çam Vadisi ana sayfa">
              <img
                className="home-brand__mark"
                src="/favicon.svg"
                alt=""
                width="64"
                height="64"
              />
              <span>
                <strong>{restaurantName.toLocaleUpperCase('tr-TR')}</strong>
                <small>ANADOLU KAVAĞI</small>
              </span>
            </a>

            <div className="home-header-actions">
              {renderLanguages()}
              <a
                className="home-button home-button--compact home-button--primary"
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Yol Tarifi
              </a>
            </div>

            <button
              ref={mobileTriggerRef}
              className="home-menu-trigger"
              type="button"
              aria-label={mobileNavOpen ? 'Ana menüyü kapat' : 'Ana menüyü aç'}
              aria-expanded={mobileNavOpen}
              aria-controls="home-mobile-navigation"
              onClick={() =>
                mobileNavOpen ? closeMobileNav({ restoreFocus: true }) : openMobileNav()
              }
            >
              <span className="home-menu-trigger__index" aria-hidden="true">
                04
              </span>
              <span>{mobileNavOpen ? 'KAPAT' : 'MENÜ'}</span>
            </button>
          </header>

          <div
            ref={mobileNavigationRef}
            className={
              'home-mobile-navigation' + (mobileNavOpen ? ' is-open' : '')
            }
            id="home-mobile-navigation"
            aria-label="Ana menü"
            aria-hidden={!mobileNavOpen}
            hidden={!mobileNavVisible}
            inert={mobileNavOpen ? undefined : ''}
          >
            <div className="home-mobile-navigation__inner home-shell">
              <div className="home-mobile-navigation__heading" aria-hidden="true">
                <span>VADİDE YÖNLER</span>
                <small>DÖRT DURAK</small>
              </div>

              <nav className="home-mobile-navigation__links" aria-label="Mobil ana menü">
                {NAV_ITEMS.map((item) => (
                  <a key={item.href} href={item.href} onClick={closeMobileNavFromLink}>
                    <span className="home-mobile-navigation__number">{item.number}</span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                  </a>
                ))}
              </nav>

              <div className="home-mobile-navigation__footer">
                {renderLanguages(true)}
                <a
                  className="home-mobile-navigation__route"
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMobileNavFromLink}
                >
                  YOL TARİFİ
                </a>
              </div>
            </div>
          </div>

          <nav className="home-grove-nav home-shell" aria-label="Ana menü">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                className={'home-grove-nav__item ' + item.className}
                href={item.href}
              >
                <span className="home-grove-nav__label">{item.title}</span>
                <span className="home-grove-nav__meta">{item.description}</span>
              </a>
            ))}
          </nav>

          <div className="home-hero__content home-shell">
            <p className="home-eyebrow">BEYKOZ · ANADOLU KAVAĞI</p>
            <h1 id="home-hero-title">
              Gün, ormanın
              <br />
              içinde başlar.
            </h1>
            <p className="home-hero__lead">
              Çamların serinliği, Boğaz’ın dinginliği ve uzun sofraların sıcaklığı bir
              arada.
            </p>
            <div className="home-hero__actions">
              <button className="home-button home-button--primary" type="button" onClick={onOpenMenu}>
                Menüyü İncele
                <ArrowUpRight weight="bold" aria-hidden="true" />
              </button>
              <a className="home-button home-button--outline" href="#ulasim">
                Bizi Bulun
                <MapPin weight="fill" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="home-hero__foot">
            <div className="home-hero__foot-inner home-shell">
              <span>{latitudeLabel + ' · ' + longitudeLabel}</span>
              <a href="#menu">
                Aşağı kaydır
                <ArrowDown weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="cv-menu home-section" id="menu" aria-labelledby="cv-menu-title">
          <div className="home-shell">
            <header className="cv-menu__intro">
              <div>
                <p className="cv-section-kicker home-eyebrow home-eyebrow--dark">
                  <span aria-hidden="true">01 /</span> SOFRADAN SEÇMELER
                </p>
                <h2 className="cv-menu__title" id="cv-menu-title">
                  Her saate yakışan
                  <br />
                  yerel lezzetler.
                </h2>
              </div>
              <div className="cv-menu__summary">
                <p>
                  Kahvaltıdan gün batımına, mevsime ve günlük tazeliğe göre hazırlanan
                  sade bir menü.
                </p>
                <button className="home-text-link" type="button" onClick={onOpenMenu}>
                  Tüm menüyü görüntüle
                  <ArrowUpRight weight="bold" aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="cv-menu__trail">
              {categoryCards.map((card, index) => (
                <article
                  className={'cv-menu-band ' + card.modifier}
                  key={card.slug}
                >
                  <figure className="cv-menu-band__media">
                    <img
                      className="cv-menu-band__image"
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                    />
                  </figure>
                  <div className="cv-menu-band__body">
                    <span className="cv-menu-band__index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="cv-menu-band__count">
                      {card.count || '—'} seçenek
                    </p>
                    <h3 className="cv-menu-band__title">
                      <SplitTitle>{card.title}</SplitTitle>
                    </h3>
                    <p className="cv-menu-band__copy">{card.copy}</p>
                    <button
                      className="cv-menu-band__link"
                      type="button"
                      onClick={() => openCategory(card.category?.slug ?? card.slug)}
                      aria-label={card.title + ' bölümünü görüntüle'}
                    >
                      Sofraya bak
                      <ArrowUpRight weight="bold" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cv-story home-section" id="hikaye" aria-labelledby="cv-story-title">
          <div className="home-shell cv-story__mast">
            <figure className="cv-story__media">
              <img
                className="cv-story__image"
                src="/logo-banner.webp"
                alt="Çam Vadisi'nin doğa içindeki mekânı"
                loading="lazy"
              />
              <span className="cv-story__era cv-story__era--past" aria-hidden="true">
                1998
              </span>
              <span className="cv-story__era cv-story__era--present" aria-hidden="true">
                BUGÜN
              </span>
              <figcaption>
                <span>1998'DEN BERİ</span>
                <strong>
                  Aynı vadide,
                  <br />
                  aynı sıcaklıkla.
                </strong>
              </figcaption>
            </figure>

            <div className="cv-story__field">
              <p className="cv-section-kicker home-eyebrow home-eyebrow--dark">
                <span aria-hidden="true">02 /</span> ÇAM VADİSİ'NDE
              </p>
              <h2 className="cv-story__title" id="cv-story-title">
                Şehrin telaşına
                <br />
                kısa bir ara.
              </h2>
              <p className="cv-story__lead">
                Burası yalnızca yemek yenilen bir yer değil; çocukların koştuğu, çayın
                tazelendiği, sohbetin aceleye gelmediği bir vadi.
              </p>
              <dl className="cv-story__facts">
                <div className="cv-story__fact">
                  <dt>28</dt>
                  <dd>yıllık yerel hafıza</dd>
                </div>
                <div className="cv-story__fact">
                  <dt>4</dt>
                  <dd>mevsim açık sofra</dd>
                </div>
                <div className="cv-story__fact">
                  <dt>0</dt>
                  <dd>şehir gürültüsü</dd>
                </div>
              </dl>
              <a className="cv-story__action home-button home-button--dark" href="#lezzetler">
                Lezzetleri keşfedin
                <ArrowUpRight weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          className="cv-featured home-section"
          id="lezzetler"
          aria-labelledby="cv-featured-title"
        >
          <div className="home-shell">
            <header className="cv-featured__intro">
              <div>
                <p className="cv-section-kicker home-eyebrow">
                  <span aria-hidden="true">03 /</span> BUGÜN SOFRADA
                </p>
                <h2 className="cv-featured__title" id="cv-featured-title">
                  Günün öne çıkanları.
                </h2>
              </div>
              <p className="cv-featured__note">
                Mutfağın o günkü tazeliğine göre seçilen üç lezzet.
              </p>
            </header>

            <div className="cv-dish-ledger">
              {features.map((feature, index) => (
                <article
                  className={'cv-dish' + (index === 1 ? ' cv-dish--offset' : '')}
                  key={feature.needle}
                >
                  <span className="cv-dish__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="cv-dish__body">
                    <h3 className="cv-dish__title">{feature.name}</h3>
                    <p className="cv-dish__description">{feature.description}</p>
                  </div>
                  <strong className="cv-dish__meta">{feature.label}</strong>
                  <button
                    className="cv-dish__link"
                    type="button"
                    onClick={() => openCategory(feature.category?.slug)}
                    aria-label={feature.name + ' ürününü menüde görüntüle'}
                  >
                    <ArrowUpRight weight="bold" aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="cv-destination home-section"
          id="ulasim"
          aria-labelledby="cv-destination-title"
        >
          <div className="home-shell">
            <p className="cv-destination__coordinates">
              <span>{latitudeLabel}</span>
              <span>{longitudeLabel}</span>
            </p>

            <div className="cv-destination__grid">
              <figure className="cv-destination__media">
                <img
                  className="cv-destination__image"
                  src="/logo-banner.webp"
                  alt="Çam Vadisi'nin doğa içindeki mekânı"
                  loading="lazy"
                />
                <figcaption>Anadolu Kavağı · Beykoz</figcaption>
              </figure>

              <div className="cv-destination__content">
                <p className="cv-section-kicker home-eyebrow home-eyebrow--dark">
                  <span aria-hidden="true">04 /</span> BİZE ULAŞIN
                </p>
                <h2 className="cv-destination__title" id="cv-destination-title">
                  Boğaz yolunun
                  <br />
                  en yeşil durağı.
                </h2>
                <address className="cv-destination__address">{address}</address>

                <div className="cv-destination__meta">
                  <div className="cv-destination__meta-group">
                    <span className="cv-destination__label">Telefon</span>
                    <div className="cv-destination__phones">
                      {phones.map((phone) => (
                        <a key={phone} href={phoneHref(phone)}>
                          {formatPhone(phone)}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="cv-destination__meta-group">
                    <span className="cv-destination__label">Açılış saatleri</span>
                    <strong>{hoursLabel}</strong>
                  </div>
                </div>

                <a
                  className="cv-destination__directions home-button home-button--primary"
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Maps'te Aç
                  <ArrowUpRight weight="bold" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="cv-footer" aria-labelledby="cv-footer-title">
          <div className="home-shell">
            <p className="cv-section-kicker cv-footer__kicker">
              <span aria-hidden="true">05 /</span> VADİDEN
            </p>
            <h2 className="cv-footer__marquee" id="cv-footer-title">
              <span className="cv-footer__word">ÇAM</span>
              <span className="cv-footer__word cv-footer__word--valley">VADİSİ</span>
            </h2>

            <div className="cv-footer__grid">
              <div className="cv-footer__identity">
                <strong>{restaurantName.toLocaleUpperCase('tr-TR')}</strong>
                <span>ANADOLU KAVAĞI</span>
                <p className="cv-footer__note">
                  Doğanın içinde, Boğaz'ın kıyısında uzun sofralar.
                </p>
              </div>

              <address className="cv-footer__contact">
                <span>İletişim</span>
                {phones.map((phone) => (
                  <a key={phone} href={phoneHref(phone)}>
                    {formatPhone(phone)}
                  </a>
                ))}
              </address>

              <div className="cv-footer__hours">
                <span>Açılış saatleri</span>
                <strong>{hoursLabel}</strong>
              </div>

              <div className="cv-footer__social">
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  <InstagramLogo weight="bold" aria-hidden="true" />
                  Instagram
                </a>
                <span aria-hidden="true">·</span>
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  Google Maps
                </a>
              </div>

              <a className="cv-footer__back home-button home-button--outline" href="#top">
                Başa dön
                <ArrowUp weight="bold" aria-hidden="true" />
              </a>
            </div>

            <div className="cv-footer__legal">
              <span>© {new Date().getFullYear()} Çam Vadisi</span>
              <span>{latitudeLabel + ' · ' + longitudeLabel}</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
