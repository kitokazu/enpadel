import Link from "next/link";
import type { Locale } from "@/lib/content";
import { content, t } from "@/lib/content";
import InstagramIcon from "@/components/InstagramIcon";
import NavScroll from "@/components/NavScroll";
import RevealObserver from "@/components/RevealObserver";
import VideoModal from "@/components/VideoModal";
import ContactForm from "@/components/ContactForm";
import TiltCard from "@/components/TiltCard";
import MobileMenu from "@/components/MobileMenu";
import HeroSlideshow from "@/components/HeroSlideshow";
import LazyIframe from "@/components/LazyIframe";


export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "ja" ? "ja" : "en";
  const altLocale: Locale = locale === "ja" ? "en" : "ja";
  const c = content;

  return (
    <>
      <NavScroll />
      <RevealObserver />

      {/* ─── NAV ─── */}
      <nav id="nav">
        <Link href={`/${locale}`} className="nav-logo">
          {c.nav.logo}
        </Link>
        <ul className="nav-center">
          <li><a href="#padel">{t(c.nav.links.padel, locale)}</a></li>
          <li><a href="#who">{t(c.nav.links.who, locale)}</a></li>
          <li><a href="#event">{t(c.nav.links.events, locale)}</a></li>
          <li><a href="#contact">{t(c.nav.links.contact, locale)}</a></li>
        </ul>
        <div className="nav-right">
          <div className="lang-toggle">
            <Link href="/ja" className={`lang-btn${locale === "ja" ? " active" : ""}`}>JP</Link>
            <span className="lang-sep">|</span>
            <Link href="/en" className={`lang-btn${locale === "en" ? " active" : ""}`}>EN</Link>
          </div>
          <a href="https://instagram.com/enpadel" className="nav-ig" target="_blank" rel="noopener" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <MobileMenu locale={locale} />
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero" id="home">
        <HeroSlideshow />
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="hero-frame"><div className="hero-frame-inner" /></div>

        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-eyebrow">{t(c.hero.eyebrow, locale)}</p>
            <h1 className="hero-title">{c.hero.title}</h1>
            <p className="hero-sub">{t(c.hero.sub, locale)}</p>
            <p className="hero-jp">{t(c.hero.jp, locale)}</p>
            <div className="hero-cta">
              <a href="https://instagram.com/enpadel" className="hero-ig-cta" target="_blank" rel="noopener">
                <InstagramIcon size={16} />
                <span>{t(c.hero.igCta, locale)}</span>
              </a>
            </div>
          </div>

          <div className="hero-card-side">
            <TiltCard className="hero-event-card" href="#event" ariaLabel="View first event details">
              <p className="hec-label">{t(c.hero.card.label, locale)}</p>
              <h3 className="hec-name" dangerouslySetInnerHTML={{ __html: t(c.hero.card.nameHtml, locale) }} />
              <p className="hec-meta">{t(c.hero.card.meta, locale)}</p>
              <p className="hec-desc" dangerouslySetInnerHTML={{ __html: t(c.hero.card.desc, locale) }} />
              <span className="hec-cta">
                <span>{t(c.hero.card.cta, locale)}</span>
                <span className="hec-arrow" />
              </span>
            </TiltCard>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          <span>{t(c.hero.scroll, locale)}</span>
        </div>
      </section>

      {/* ─── CONCEPT ─── */}
      <section className="concept-section" id="concept">
        <div className="concept-en-bg">縁</div>
        <div className="concept-grid">
          <div className="concept-text">
            <p className="section-label reveal">{t(c.concept.label, locale)}</p>
            <h2 className="reveal d1">{t(c.concept.heading, locale)}</h2>
            <p className="concept-subline reveal d2">{t(c.concept.subline, locale)}</p>
            <div className="concept-body reveal-left d3">
              <p>{t(c.concept.body, locale)}</p>
              <span className="concept-highlight">{t(c.concept.highlight, locale)}</span>
            </div>
          </div>
          <div className="concept-visual reveal-scale d2">
            <img src="/right-side-pic.jpg" alt="" className="concept-img" />
          </div>
        </div>
      </section>

      {/* ─── WHAT IS PADEL ─── */}
      <section className="padel-section" id="padel">
        <div className="padel-wrap">
          <div className="padel-head">
            <div>
              <p className="section-label reveal">{t(c.padel.label, locale)}</p>
              <h2 className="reveal d1" dangerouslySetInnerHTML={{ __html: t(c.padel.headingHtml, locale) }} />
            </div>
            <p className="padel-desc reveal d2">{t(c.padel.desc, locale)}</p>
          </div>
          <div className="padel-media">
            <div className="pm-box tall reveal">
              <img src="/sketch1.png" alt="" className="pm-sketch" />
              <span className="pm-label">{t(c.padel.mediaLabels.court, locale)}</span>
            </div>
            <div className="pm-box reveal d1">
              <img src="/sketch2.png" alt="" className="pm-sketch" />
              <span className="pm-label">{t(c.padel.mediaLabels.gameplay, locale)}</span>
            </div>
            <div className="pm-box reveal d2">
              <img src="/sketch3.png" alt="" className="pm-sketch" />
              <span className="pm-label">{t(c.padel.mediaLabels.equipment, locale)}</span>
            </div>
          </div>
          <div className="features-row">
            {c.padel.features.map((f) => (
              <div className="fc reveal" key={f.num}>
                <div className="fc-num">{f.num}</div>
                <h3>{t(f.title, locale)}</h3>
                <p>{t(f.desc, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO WE ARE ─── */}
      <section className="who-section" id="who">
        <div className="who-wrap">
          <div className="who-text">
            <p className="section-label reveal">{t(c.who.label, locale)}</p>
            <h2 className="reveal d1" dangerouslySetInnerHTML={{ __html: t(c.who.headingHtml, locale) }} />
            <div className="who-body-en reveal d2">
              {c.who.body.map((p, i) => (
                <p key={i}>{t(p, locale)}</p>
              ))}
            </div>
            <p className="who-tagline reveal d3">{t(c.who.tagline, locale)}</p>
          </div>
          <div className="who-visual reveal-scale d2">
            <img src="/girls.jpg" alt="" className="who-photo" />
          </div>
        </div>
      </section>

      {/* ─── FIRST EVENT ─── */}
      <section className="event-section" id="event">
        <div className="event-wrap">
          <div>
            <div className="ev-badge reveal">
              <div className="ev-dot" />
              <span>{t(c.event.badge, locale)}</span>
            </div>
            <h2 className="reveal d1" dangerouslySetInnerHTML={{ __html: t(c.event.headingHtml, locale) }} />
            <p className="ev-name reveal d2">{t(c.event.name, locale)}</p>
            <div className="ev-meta reveal d2">
              <div className="ev-meta-item">
                <label>{t(c.event.meta.eventName.label, locale)}</label>
                <p>{t(c.event.meta.eventName.value, locale)}</p>
              </div>
              <div className="ev-meta-item">
                <label>{t(c.event.meta.date.label, locale)}</label>
                <p>{t(c.event.meta.date.value, locale)}</p>
              </div>
              <div className="ev-meta-item" style={{ gridColumn: "span 2" }}>
                <label>{t(c.event.meta.location.label, locale)}</label>
                <p><a href="https://maps.app.goo.gl/oLPtnYDY9ZTZaxwB7" target="_blank" rel="noopener" className="ev-location-link">{t(c.event.meta.location.value, locale)}</a></p>
              </div>
            </div>
            <p className="ev-desc reveal d3">{t(c.event.desc, locale)}</p>
            <a href="https://instagram.com/enpadel" className="ev-ig-cta reveal d4" target="_blank" rel="noopener">
              <InstagramIcon size={15} strokeWidth={1.5} />
              <span>{t(c.event.igCta, locale)}</span>
            </a>
            <p className="ev-collab reveal d4">{t(c.event.collab, locale)}</p>
          </div>
          <div className="ev-visual reveal-left d2">
            <img src="/dj.png" alt="" className="ev-photo" />
            <div className="ev-floater">
              <p className="ev-floater-label">{t(c.event.floater.label, locale)}</p>
              <p className="ev-floater-text">{t(c.event.floater.text, locale)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PAST EVENTS ─── */}
      <section className="past-section" id="past">
        <div className="past-wrap">
          <p className="section-label reveal">{t(c.past.label, locale)}</p>
          <h2 className="reveal d1">{t(c.past.heading, locale)}</h2>
          <div className="past-ratio reveal d2">
            <video
              src="/enpadel.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="past-video"
            />
          </div>
          <div className="past-caption reveal d3">
            <span className="past-caption-name">{t(c.past.captionName, locale)}</span>
            <span className="past-caption-loc">{t(c.past.captionLoc, locale)}</span>
          </div>
          <div className="past-cta reveal d4">
            <a href="#event" className="btn-outline-cream">{t(c.past.cta, locale)}</a>
          </div>
        </div>
      </section>

      <VideoModal closeLabel={t(c.past.modalClose, locale)} />

      {/* ─── INSTAGRAM ─── */}
      <section className="ig-section" id="community">
        <div className="ig-inner">
          <p className="section-label reveal">{t(c.ig.label, locale)}</p>
          <h2 className="ig-headline reveal d1" dangerouslySetInnerHTML={{ __html: t(c.ig.headlineHtml, locale) }} />
          <a href="https://instagram.com/enpadel" className="ig-link reveal d2" target="_blank" rel="noopener">
            <InstagramIcon size={16} strokeWidth={1.5} />
            <span>{t(c.ig.linkText, locale)}</span>
          </a>
          <div className="ig-divider" />
          <p className="ig-handle reveal d3">@enpadel</p>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="contact-section" id="contact">
        <div className="contact-wrap">
          <div className="contact-left">
            <p className="section-label reveal">{t(c.contact.label, locale)}</p>
            <h2 className="reveal d1">{t(c.contact.heading, locale)}</h2>
            <p className="contact-intro reveal d2">{t(c.contact.intro, locale)}</p>
            <div className="contact-email-row reveal d3">
              <span className="contact-email-label">{t(c.contact.emailLabel, locale)}</span>
              <a href="mailto:info@enpadel.com" className="contact-email">info@enpadel.com</a>
            </div>
          </div>
          <div className="contact-right reveal d2">
            <ContactForm locale={locale} />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="footer-grid">
          <div>
            <p className="f-logo">EnPadel</p>
            <p className="f-tag">{t(c.footer.tag, locale)}</p>
          </div>
          <div className="f-col">
            <h4>{t(c.footer.nav, locale)}</h4>
            <a href="#padel">{t(c.footer.navLinks.padel, locale)}</a>
            <a href="#who">{t(c.footer.navLinks.who, locale)}</a>
            <a href="#event">{t(c.footer.navLinks.events, locale)}</a>
            <a href="#past">{t(c.footer.navLinks.pastEvents, locale)}</a>
            <a href="#contact">{t(c.footer.navLinks.contact, locale)}</a>
          </div>
          <div className="f-col">
            <h4>{t(c.footer.connect, locale)}</h4>
            <a href="https://instagram.com/enpadel" target="_blank" rel="noopener">Instagram</a>
            <a href="mailto:info@enpadel.com">info@enpadel.com</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t(c.footer.copyright, locale)}</p>
          <a href="https://instagram.com/enpadel" className="f-ig-link" target="_blank" rel="noopener">
            <InstagramIcon size={13} strokeWidth={1.5} />
            @enpadel
          </a>
        </div>
      </footer>
    </>
  );
}
