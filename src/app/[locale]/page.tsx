import Link from "next/link";
import type { Locale } from "@/lib/content";
import { content, t } from "@/lib/content";
import InstagramIcon from "@/components/InstagramIcon";
import NavScroll from "@/components/NavScroll";
import RevealObserver from "@/components/RevealObserver";
import ContactForm from "@/components/ContactForm";
import MobileMenu from "@/components/MobileMenu";
import ScrollVideoHero, { type HeroPanel } from "@/components/ScrollVideoHero";
import LazyVideo from "@/components/LazyVideo";
import Parallax from "@/components/Parallax";
import PhotoMarquee, { WHO_PHOTOS } from "@/components/PhotoMarquee";
import Picture from "@/components/Picture";


export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "ja" ? "ja" : "en";
  const c = content;

  // Five beats, timed to the five moments of the intro video: the match, the
  // camera gliding past the court, two people talking courtside, the group on
  // the lawn, then the DJ booth. Copy is resolved here so the client component
  // never pulls in the whole content dictionary.
  const heroPanels: HeroPanel[] = [
    {
      // Open blue court, player far left — centred type sits in clean space.
      variant: "center-lg",
      eyebrow: t(c.hero.eyebrow, locale),
      titleHtml: c.hero.title,
      sub: t(c.hero.sub, locale),
    },
    {
      // The camera glides across an empty court. 縁 alone, set as a symbol
      // rather than a headline — and it reads the same in both locales.
      variant: "center-hero",
      eyebrow: t(c.concept.label, locale),
      titleHtml: "縁",
      sub: t(c.concept.subline, locale),
    },
    {
      // Two people on a bench fill the right two-thirds; the left third is
      // dark fencing, which is where the type goes.
      variant: "left-lg",
      eyebrow: t(c.who.label, locale),
      titleHtml: t(c.who.headingHtml, locale),
      sub: t(c.who.tagline, locale),
    },
    {
      // Blurred figure in the right foreground. Smallest explanatory block.
      variant: "left-md",
      eyebrow: t(c.padel.label, locale),
      titleHtml: t(c.padel.features[1].title, locale),
      sub: t(c.padel.features[1].desc, locale),
    },
    {
      // DJ dead centre — the CTA drops to the lower left and keeps him clear.
      variant: "left-low",
      eyebrow: t(c.event.badge, locale),
      titleHtml: t(c.hero.card.nameHtml, locale),
      sub: t(c.hero.card.meta, locale),
      cta: { label: t(c.hero.card.cta, locale), href: "#event" },
    },
  ];

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

      {/* ─── SCROLL VIDEO INTRO ─── */}
      <ScrollVideoHero panels={heroPanels} scrollLabel={t(c.hero.scroll, locale)} />

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
          <Parallax className="concept-visual framed reveal-scale d2">
            <Picture
              src="/right-side-pic-web.jpg"
              alt=""
              sizes="(max-width: 960px) 90vw, 530px"
              className="concept-img"
            />
          </Parallax>
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
              <Picture
                src="/sketch1.png"
                alt=""
                sizes="(max-width: 960px) 92vw, 700px"
                className="pm-sketch"
              />
            </div>
            <div className="pm-box reveal d1">
              <Picture
                src="/sketch2.png"
                alt=""
                sizes="(max-width: 960px) 92vw, 460px"
                className="pm-sketch"
              />
            </div>
            <div className="pm-box reveal d2">
              <Picture
                src="/sketch3.png"
                alt=""
                sizes="(max-width: 960px) 92vw, 460px"
                className="pm-sketch"
              />
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
          <PhotoMarquee photos={WHO_PHOTOS} />
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
          {/* framed clips (and zooms) only the photo; the floater hangs over
              the corner and must stay outside the clip. */}
          <div className="ev-visual reveal-left d2">
            <div className="framed">
              <Picture
                src="/dj.jpg"
                alt=""
                sizes="(max-width: 960px) 90vw, 530px"
                className="ev-photo"
              />
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
          <div className="past-ratio framed reveal d2">
            <LazyVideo
              src="/media/v2/enpadel-web.mp4"
              poster="/media/v2/enpadel-poster.jpg"
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

      {/* ─── INSTAGRAM ─── */}
      <section className="ig-section" id="community">
        <div className="ig-inner">
          <div>
            <p className="section-label reveal">{t(c.ig.label, locale)}</p>
            <h2 className="ig-headline reveal d1" dangerouslySetInnerHTML={{ __html: t(c.ig.headlineHtml, locale) }} />
          </div>
          <div className="ig-cta reveal d2">
            <a href="https://instagram.com/enpadel" className="ig-link" target="_blank" rel="noopener">
              <InstagramIcon size={16} strokeWidth={1.5} />
              <span>{t(c.ig.linkText, locale)}</span>
            </a>
            <p className="ig-handle">@enpadel</p>
          </div>
        </div>
        {/* A designed preview of the feed, not a live embed: instagram.com
            cannot be iframed and the official embeds ship Instagram's own
            script and card chrome. Six of our photos as grid tiles, each
            linking through. Decorative duplicates of the main link above, so
            they are skipped by keyboard and screen readers. */}
        <div className="ig-grid reveal d3">
          {[
            "/friends/trio-web.jpg",
            "/dj.jpg",
            "/friends/pair-web.jpg",
            "/right-side-pic-web.jpg",
            "/friends/group-web.jpg",
            "/friends/table-web.jpg",
          ].map((src) => (
            <a
              key={src}
              href="https://instagram.com/enpadel"
              className="ig-tile"
              target="_blank"
              rel="noopener"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Picture src={src} alt="" sizes="(max-width: 960px) 31vw, 190px" />
              <span className="ig-tile-veil">
                <InstagramIcon size={18} strokeWidth={1.5} />
              </span>
            </a>
          ))}
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
