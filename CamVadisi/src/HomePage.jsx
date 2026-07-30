import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  InstagramLogo,
  List,
  MapPin,
  X,
} from '@phosphor-icons/react';
import { PineMark } from './components/PineMark.jsx';
import { useLang } from './lib/LangContext.jsx';
import { trackView } from './lib/api.js';
import './home.css';

const LANG_ORDER = ['tr', 'en', 'ar', 'ru'];
const INSTAGRAM_URL = 'https://www.instagram.com/cam.vadisi/';

const CATEGORY_SPECS = [
  {
    slug: 'kahvalti-cesitleri',
    image: '/uploads/urun-bal-kaymak-full.webp',
    fallbackTitle: 'Kahvaltı Çeşitleri',
  },
  {
    slug: 'ara-sicaklar',
    image: '/uploads/urun-sahanda-yumurta-2-full.webp',
    fallbackTitle: 'Ara Sıcaklar',
  },
  {
    slug: 'deniz-urunleri',
    image: '/uploads/urun-deniz-levregi-full.webp',
    fallbackTitle: 'Deniz Ürünleri',
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
  const national = digits.length === 10 ? `0${digits}` : digits;
  if (national.length !== 11) return raw;
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7, 9)} ${national.slice(9)}`;
}

function Brand({ compact = false, restaurantName = 'Çam Vadisi' }) {
  return (
    <span className={`home-brand${compact ? ' home-brand--compact' : ''}`}>
      <span className="home-brand__mark">
        <PineMark title={restaurantName} />
      </span>
      <span className="home-brand__copy">
        <strong>{restaurantName.toLocaleUpperCase('tr-TR')}</strong>
        <small>ANADOLU KAVAĞI</small>
      </span>
    </span>
  );
}

export function HomePage({ menu, onOpenMenu, onOpenCategory }) {
  const { lang, setLang, t } = useLang();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const settings = menu.settings ?? {};
  const categories = menu.categories ?? [];
  const restaurantName = settings.restaurantName ?? 'Çam Vadisi';

  useEffect(() => {
    trackView('open');
  }, []);

  const mapsUrl = settings.location?.length === 2
    ? `https://www.google.com/maps/search/?api=1&query=${settings.location[0]},${settings.location[1]}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        settings.address ?? 'Çam Vadisi Anadolu Kavağı',
      )}`;

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
        name: match ? t(match.product.name) : spec.fallbackName,
        description: match && t(match.product.description)
          ? t(match.product.description)
          : spec.fallbackDescription,
      };
    });
  }, [categories, t]);

  function openCategory(slug) {
    if (slug) onOpenCategory(slug);
    else onOpenMenu();
  }

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <img
          className="home-hero__image"
          src="/hero-cam-vadisi-v1.png"
          alt="Çamların arasından Boğaz'a bakan kahvaltı sofrası"
          width="1536"
          height="1024"
          fetchPriority="high"
        />
        <div className="home-hero__veil" aria-hidden="true" />

        <header className="home-header home-shell">
          <a className="home-brand-link" href="#home-top" aria-label="Çam Vadisi ana sayfa">
            <Brand restaurantName={restaurantName} />
          </a>

          <nav className="home-nav" aria-label="Ana menü">
            <a href="#home-menu">Menü</a>
            <a href="#home-story">Hikâyemiz</a>
            <a href="#home-flavours">Lezzetler</a>
            <a href="#home-contact">Ulaşım</a>
          </nav>

          <div className="home-header__actions">
            <div className="home-languages" role="group" aria-label="Dil seçimi">
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
            className="home-mobile-menu"
            type="button"
            aria-label={mobileNavOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X weight="bold" /> : <List weight="bold" />}
          </button>
        </header>

        {mobileNavOpen && (
          <nav className="home-mobile-nav" aria-label="Mobil ana menü">
            <a href="#home-menu" onClick={() => setMobileNavOpen(false)}>Menü</a>
            <a href="#home-story" onClick={() => setMobileNavOpen(false)}>Hikâyemiz</a>
            <a href="#home-flavours" onClick={() => setMobileNavOpen(false)}>Lezzetler</a>
            <a href="#home-contact" onClick={() => setMobileNavOpen(false)}>Ulaşım</a>
          </nav>
        )}

        <div className="home-hero__content home-shell" id="home-top">
          <p className="home-eyebrow">BEYKOZ · ANADOLU KAVAĞI</p>
          <h1 id="home-hero-title">
            Gün, ormanın
            <br />
            içinde başlar.
          </h1>
          <p className="home-hero__lead">
            Çamların serinliği, Boğaz’ın dinginliği ve uzun sofraların sıcaklığı bir arada.
          </p>
          <div className="home-hero__actions">
            <button
              className="home-button home-button--primary"
              type="button"
              onClick={onOpenMenu}
            >
              Menüyü İncele
              <ArrowUpRight weight="bold" aria-hidden="true" />
            </button>
            <a className="home-button home-button--outline" href="#home-contact">
              Bizi Bulun
              <MapPin weight="fill" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="home-hero__foot home-shell">
          <span>41.1776° N · 29.0959° E</span>
          <a href="#home-menu">
            Aşağı kaydır
            <ArrowDown weight="bold" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="home-menu-section home-section" id="home-menu">
        <div className="home-shell">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow home-eyebrow--dark">SOFRADAN SEÇMELER</p>
              <h2>
                Her saate yakışan
                <br />
                yerel lezzetler.
              </h2>
            </div>
            <div className="home-section-heading__aside">
              <p>
                Kahvaltıdan gün batımına, mevsime ve günlük tazeliğe göre hazırlanan
                sade bir menü.
              </p>
              <button className="home-text-link" type="button" onClick={onOpenMenu}>
                Tüm menüyü görüntüle
                <ArrowUpRight weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="home-category-grid">
            {categoryCards.map((card) => (
              <article className="home-category-card" key={card.slug}>
                <img src={card.image} alt={card.title} loading="lazy" />
                <div className="home-category-card__shade" aria-hidden="true" />
                <div className="home-category-card__content">
                  <span>{card.count || '—'} seçenek</span>
                  <h3>{card.title}</h3>
                  <button
                    type="button"
                    onClick={() => openCategory(card.category?.slug ?? card.slug)}
                    aria-label={`${card.title} bölümünü görüntüle`}
                  >
                    <ArrowUpRight weight="bold" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-story home-section" id="home-story">
        <div className="home-shell home-story__grid">
          <div className="home-story__image-wrap">
            <img
              className="home-story__image"
              src="/logo-banner.webp"
              alt="Çam Vadisi'nin doğa içindeki mekânı"
              loading="lazy"
            />
            <div className="home-story__note">
              <span>1998'DEN BERİ</span>
              <strong>
                Aynı vadide,
                <br />
                aynı sıcaklıkla.
              </strong>
            </div>
          </div>

          <div className="home-story__copy">
            <p className="home-eyebrow home-eyebrow--dark">ÇAM VADİSİ'NDE</p>
            <h2>
              Şehrin telaşına
              <br />
              kısa bir ara.
            </h2>
            <p className="home-story__lead">
              Burası yalnızca yemek yenilen bir yer değil; çocukların koştuğu, çayın
              tazelendiği, sohbetin aceleye gelmediği bir vadi.
            </p>
            <div className="home-story__facts">
              <div><strong>28</strong><span>yıllık yerel hafıza</span></div>
              <div><strong>4</strong><span>mevsim açık sofra</span></div>
              <div><strong>0</strong><span>şehir gürültüsü</span></div>
            </div>
            <a className="home-button home-button--dark" href="#home-flavours">
              Lezzetleri keşfedin
              <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="home-featured home-section" id="home-flavours">
        <div className="home-shell">
          <div className="home-featured__header">
            <div>
              <p className="home-eyebrow">BUGÜN SOFRADA</p>
              <h2>Günün öne çıkanları.</h2>
            </div>
            <p>Mutfağın o günkü tazeliğine göre seçilen üç lezzet.</p>
          </div>

          <div className="home-dish-list">
            {features.map((feature, index) => (
              <article className="home-dish" key={feature.needle}>
                <div>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{feature.name}</h3>
                  <p>{feature.description}</p>
                </div>
                <strong>{feature.label}</strong>
                <button
                  type="button"
                  onClick={() => openCategory(feature.category?.slug)}
                  aria-label={`${feature.name} ürününü menüde görüntüle`}
                >
                  <ArrowUpRight weight="bold" aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-location home-section" id="home-contact">
        <div className="home-shell home-location__grid">
          <div className="home-location__copy">
            <p className="home-eyebrow home-eyebrow--dark">BİZE ULAŞIN</p>
            <h2>
              Boğaz yolunun
              <br />
              en yeşil durağı.
            </h2>
            <p>
              {settings.address ??
                'Anadolu Kavağı Mahallesi, Feneryolu Caddesi, Çam Vadisi Cafe No:12, Beykoz / İstanbul'}
            </p>
            {settings.phones?.length > 0 && (
              <div className="home-contact-row">
                {settings.phones.slice(0, 2).map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`}>
                    {formatPhone(phone)}
                  </a>
                ))}
              </div>
            )}
            <a
              className="home-button home-button--primary"
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Google Maps'te Aç
              <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          </div>

          <a
            className="home-map-card"
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Çam Vadisi konumunu Google Maps'te aç"
          >
            <img
              className="home-map-card__image"
              src="/cam-vadisi-map-v1.png"
              alt=""
              loading="lazy"
            />
            <span className="home-map-card__pin">
              <MapPin weight="fill" aria-hidden="true" />
              <span>
                <strong>ÇAM VADİSİ</strong>
                <small>Anadolu Kavağı</small>
              </span>
            </span>
          </a>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-shell home-footer__top">
          <Brand compact restaurantName={restaurantName} />
          <p>Doğanın içinde, Boğaz'ın kıyısında uzun sofralar.</p>
          <a className="home-button home-button--outline" href="#home-top">
            Başa dön
            <ArrowUp weight="bold" aria-hidden="true" />
          </a>
        </div>
        <div className="home-shell home-footer__bottom">
          <span>© {new Date().getFullYear()} Çam Vadisi</span>
          <span>Her gün 08:00 — 23:00</span>
          <span className="home-footer__socials">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <InstagramLogo weight="bold" aria-hidden="true" />
              @cam.vadisi
            </a>
            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <MapPin weight="bold" aria-hidden="true" />
              Google Maps
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}
