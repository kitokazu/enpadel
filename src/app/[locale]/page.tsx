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
              <p className="hec-desc">{t(c.hero.card.desc, locale)}</p>
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
        <div className="concept-en-bg reveal">「縁」</div>
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
            <div className="c-frame">
              <div className="c-frame-inner">
                <svg width="82" height="82" viewBox="0 0 82 82" fill="none">
                  <circle cx="41" cy="41" r="39" stroke="#f5f3ef" strokeWidth="0.7" />
                  <path d="M18 41 Q41 16 64 41 Q41 66 18 41Z" stroke="#f5f3ef" strokeWidth="0.7" fill="none" />
                  <circle cx="41" cy="41" r="5" fill="#f5f3ef" />
                </svg>
                <p>{t(c.concept.visualLabel, locale)}</p>
              </div>
            </div>
            <div className="c-accent-line" />
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
              <div className="pm-inner">
                <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
                  <rect x="4" y="4" width="50" height="50" stroke="#012f21" strokeWidth="0.7" />
                  <rect x="4" y="26" width="50" height="6" stroke="#012f21" strokeWidth="0.45" />
                  <line x1="29" y1="4" x2="29" y2="54" stroke="#012f21" strokeWidth="0.45" />
                </svg>
                <span className="pm-label">{t(c.padel.mediaLabels.court, locale)}</span>
              </div>
            </div>
            <div className="pm-box reveal d1">
              <div className="pm-inner">
                <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                  <ellipse cx="23" cy="14" rx="11" ry="12" stroke="#012f21" strokeWidth="0.7" fill="none" />
                  <path d="M12 25 Q10 38 23 40 Q36 38 34 25" stroke="#012f21" strokeWidth="0.7" fill="none" />
                </svg>
                <span className="pm-label">{t(c.padel.mediaLabels.gameplay, locale)}</span>
              </div>
            </div>
            <div className="pm-box reveal d2">
              <div className="pm-inner">
                <svg width="34" height="46" viewBox="0 0 34 46" fill="none">
                  <ellipse cx="17" cy="17" rx="13" ry="13" stroke="#012f21" strokeWidth="0.7" fill="none" />
                  <rect x="14" y="28" width="6" height="16" rx="3" stroke="#012f21" strokeWidth="0.7" fill="none" />
                  <circle cx="17" cy="17" r="4" stroke="#012f21" strokeWidth="0.45" fill="none" />
                </svg>
                <span className="pm-label">{t(c.padel.mediaLabels.equipment, locale)}</span>
              </div>
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
            <div className="who-acc-tl" />
            <div className="who-img">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle cx="26" cy="26" r="15" stroke="#012f21" strokeWidth="0.7" fill="none" />
                <circle cx="46" cy="26" r="15" stroke="#012f21" strokeWidth="0.7" fill="none" />
                <path d="M14 50 Q36 42 58 50" stroke="#012f21" strokeWidth="0.7" fill="none" />
                <path d="M20 60 Q36 54 52 60" stroke="#012f21" strokeWidth="0.5" fill="none" />
              </svg>
              <p>{t(c.who.visualLabel, locale)}</p>
            </div>
            <div className="who-acc-br" />
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
                <p>{t(c.event.meta.location.value, locale)}</p>
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
            <div className="ev-visual-main">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <rect x="4" y="4" width="64" height="64" stroke="#012f21" strokeWidth="0.7" />
                <rect x="4" y="32" width="64" height="8" stroke="#012f21" strokeWidth="0.45" />
                <line x1="36" y1="4" x2="36" y2="68" stroke="#012f21" strokeWidth="0.45" />
                <circle cx="36" cy="36" r="8" stroke="#012f21" strokeWidth="0.45" fill="none" />
              </svg>
              <p>{t(c.event.visualLabel, locale)}</p>
            </div>
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
            <div className="past-placeholder" id="pastPlaceholder" role="button" tabIndex={0} aria-label="Play event recap">
              <div className="past-ph-bg" />
              <div className="past-ph-grid" />
              <div className="past-ph-content">
                <div className="past-play-ring">
                  <div className="past-play-tri" />
                </div>
                <span className="past-ph-label">{t(c.past.phLabel, locale)}</span>
              </div>
              <div className="past-ph-corner">
                <span className="past-ph-corner-title">{t(c.past.phTitle, locale)}</span>
                <span className="past-ph-corner-sub">{t(c.past.phSub, locale)}</span>
              </div>
            </div>
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
