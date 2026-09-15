import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/content";
import { content, t } from "@/lib/content";
import InstagramIcon from "@/components/InstagramIcon";
import NavScroll from "@/components/NavScroll";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import MobileMenu from "@/components/MobileMenu";
import ScrollVideoHero, { type HeroPanel } from "@/components/ScrollVideoHero";
import ArchiveVideo from "@/components/ArchiveVideo";
import Heading from "@/components/Heading";
import PhotoMarquee, { WHO_PHOTOS } from "@/components/PhotoMarquee";

/** The six photos in the feed preview, in grid order. */
const IG_TILES = [
  "/friends/trio-web.jpg",
  "/dj.jpg",
  "/friends/pair-web.jpg",
  "/right-side-pic-web.jpg",
  "/friends/group-web.jpg",
  "/friends/table-web.jpg",
];

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

  const label = (text: string) => (
    <p className="section-label" data-label="">
      <span>{text}</span>
    </p>
  );

  return (
    <>
      <NavScroll />
      <Reveal />

      {/* ─── NAV ─── */}
      <nav id="nav">
        <Link href={`/${locale}`} className="nav-logo" data-nav-item="">
          {c.nav.logo}
        </Link>
        <ul className="nav-center">
          <li data-nav-item=""><a href="#padel">{t(c.nav.links.padel, locale)}</a></li>
          <li data-nav-item=""><a href="#who">{t(c.nav.links.who, locale)}</a></li>
          <li data-nav-item=""><a href="#event">{t(c.nav.links.events, locale)}</a></li>
          <li data-nav-item=""><a href="#contact">{t(c.nav.links.contact, locale)}</a></li>
        </ul>
        <div className="nav-right" data-nav-item="">
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
        <div className="concept-en-bg" data-parallax="60" aria-hidden="true">縁</div>
        <div className="concept-grid grid-2">
          <div className="concept-text">
            {label(t(c.concept.label, locale))}
            <Heading html={t(c.concept.heading, locale)} />
            <p className="concept-subline" data-pop="">{t(c.concept.subline, locale)}</p>
            <div className="concept-body" data-stagger="">
              <p>{t(c.concept.body, locale)}</p>
              <span className="concept-highlight">{t(c.concept.highlight, locale)}</span>
            </div>
          </div>
          {/* Wipes in from the right; the picture drifts against the scroll
              inside it, so the two transforms never fight over one element. */}
          <div className="concept-visual framed" data-wipe="right">
            <div className="par" data-parallax="30">
              <Image
                src="/right-side-pic-web.jpg"
                alt=""
                fill
                sizes="(max-width: 860px) 100vw, 50vw"
                className="concept-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT IS PADEL ─── */}
      <section className="padel-section" id="padel">
        <div className="padel-wrap">
          <div className="padel-head grid-2">
            <div>
              {label(t(c.padel.label, locale))}
              <Heading html={t(c.padel.headingHtml, locale)} />
            </div>
            <div>
              <p className="padel-lead" data-pop="">{t(c.padel.desc, locale)}</p>
              {/* The media labels set an index line here rather than captions
                  printed over the artwork. */}
              <p className="padel-index" data-pop="">
                <span>{t(c.padel.mediaLabels.equipment, locale)}</span>
                <span className="sep" aria-hidden="true">·</span>
                <span>{t(c.padel.mediaLabels.court, locale)}</span>
                <span className="sep" aria-hidden="true">·</span>
                <span>{t(c.padel.mediaLabels.gameplay, locale)}</span>
              </p>
            </div>
          </div>

          <div className="padel-media">
            {[
              { src: "/sketch1.png", text: t(c.padel.mediaLabels.equipment, locale) },
              { src: "/sketch2.png", text: t(c.padel.mediaLabels.court, locale) },
              { src: "/sketch3.png", text: t(c.padel.mediaLabels.gameplay, locale) },
            ].map((tile) => (
              <div className="pm-box framed" key={tile.src} data-wipe="bottom" data-tilt="">
                <Image
                  src={tile.src}
                  alt=""
                  fill
                  sizes="(max-width: 860px) 100vw, 33vw"
                  className="pm-sketch"
                />
                <span className="pm-label">{tile.text}</span>
              </div>
            ))}
          </div>

          {/* Four hairline rows instead of four dark cards. */}
          <div className="features-row">
            {c.padel.features.map((f) => (
              <div className="fc" key={f.num} data-pop="">
                <div className="fc-num" data-count={f.num}>00</div>
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
          <div className="who-text grid-2">
            <div>
              {label(t(c.who.label, locale))}
              <Heading html={t(c.who.headingHtml, locale)} />
            </div>
            <div>
              <div className="who-body-en" data-stagger="">
                {c.who.body.map((p, i) => (
                  <p key={i}>{t(p, locale)}</p>
                ))}
              </div>
              <p className="who-tagline" data-pop="">{t(c.who.tagline, locale)}</p>
            </div>
          </div>
        </div>
        {/* Full-bleed strip below the copy, drifting on its own. No scroll
            coupling — it is a reel, not a scrubbed element. */}
        <div className="who-reel">
          <PhotoMarquee photos={WHO_PHOTOS} />
        </div>
      </section>

      {/* ─── NEXT EVENT ─── */}
      <section className="event-section" id="event">
        <div className="event-wrap">
          <div className="event-top grid-2">
            <div>
              <div className="ev-badge" data-pop="">
                <div className="ev-dot" />
                <span>{t(c.event.badge, locale)}</span>
              </div>
              <Heading html={t(c.event.headingHtml, locale)} />
              <p className="ev-name" data-pop="">{t(c.event.name, locale)}</p>
              <p className="ev-desc" data-pop="">{t(c.event.desc, locale)}</p>
            </div>

            <div>
              <div className="ev-meta" data-stagger="">
                <div className="ev-meta-item">
                  <label>{t(c.event.meta.eventName.label, locale)}</label>
                  <p>{t(c.event.meta.eventName.value, locale)}</p>
                </div>
                <div className="ev-meta-item">
                  <label>{t(c.event.meta.date.label, locale)}</label>
                  <p>{t(c.event.meta.date.value, locale)}</p>
                </div>
                <div className="ev-meta-item">
                  <label>{t(c.event.meta.location.label, locale)}</label>
                  <p>
                    <a
                      href="https://maps.app.goo.gl/oLPtnYDY9ZTZaxwB7"
                      target="_blank"
                      rel="noopener"
                      className="ev-location-link"
                    >
                      {t(c.event.meta.location.value, locale)}
                    </a>
                  </p>
                </div>
              </div>

              <div className="ev-cta-row" data-pop="">
                <a href="#contact" className="btn-cream" data-magnet="">
                  {t(c.contact.label, locale)}
                </a>
                <a href="https://instagram.com/enpadel" className="ev-ig-cta" target="_blank" rel="noopener">
                  <InstagramIcon size={15} strokeWidth={1.5} />
                  <span>{t(c.event.igCta, locale)}</span>
                </a>
              </div>
              <p className="ev-collab" data-pop="">{t(c.event.collab, locale)}</p>
            </div>
          </div>

          <div className="ev-visual">
            <div className="ev-photo-frame framed" data-wipe="left">
              <div className="par" data-parallax="30">
                <Image
                  src="/dj.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 860px) 100vw, 90vw"
                  className="ev-photo"
                />
              </div>
            </div>
            {/* Anchored over the corner on desktop; a caption underneath on a
                phone, where overlapping the photo just hides both. */}
            <div className="ev-floater" data-pop="">
              <p className="ev-floater-label">{t(c.event.floater.label, locale)}</p>
              <p className="ev-floater-text">{t(c.event.floater.text, locale)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PAST EVENTS ─── */}
      <section className="past-section" id="past">
        <div className="past-wrap">
          <div className="past-copy">
            <div>
              {label(t(c.past.label, locale))}
              <Heading html={t(c.past.heading, locale)} />
            </div>
            <div className="past-caption" data-pop="">
              <span className="past-caption-name">{t(c.past.captionName, locale)}</span>
              <span className="past-caption-loc">{t(c.past.captionLoc, locale)}</span>
            </div>
            <a href="#event" className="btn-outline-cream" data-pop="">
              {t(c.past.cta, locale)}
            </a>
          </div>
          <div className="past-ratio framed" data-wipe="bottom">
            <ArchiveVideo
              src="/media/v2/enpadel-web.mp4"
              poster="/media/v2/enpadel-poster.jpg"
              className="past-video"
            />
          </div>
        </div>
      </section>

      {/* ─── INSTAGRAM ─── */}
      <section className="ig-section" id="community">
        <div className="ig-inner">
          <div>
            {label(t(c.ig.label, locale))}
            <Heading html={t(c.ig.headlineHtml, locale)} className="ig-headline" />
          </div>
          <div className="ig-cta" data-pop="">
            <a
              href="https://instagram.com/enpadel"
              className="btn-solid-green"
              target="_blank"
              rel="noopener"
              data-magnet=""
            >
              <InstagramIcon size={16} strokeWidth={1.5} />
              <span>{t(c.ig.linkText, locale)}</span>
            </a>
            <p className="ig-handle">@enpadel</p>
          </div>
        </div>
        {/* A designed preview of the feed, not a live embed: instagram.com
            cannot be iframed and the official embeds ship Instagram's own
            script and card chrome. Decorative duplicates of the link above, so
            they are skipped by keyboard and screen readers. */}
        <div className="ig-grid">
          {IG_TILES.map((src) => (
            <a
              key={src}
              href="https://instagram.com/enpadel"
              className="ig-tile"
              target="_blank"
              rel="noopener"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image src={src} alt="" fill sizes="(max-width: 600px) 50vw, 16vw" />
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
            {label(t(c.contact.label, locale))}
            <Heading html={t(c.contact.heading, locale)} />
            <p className="contact-intro" data-pop="">{t(c.contact.intro, locale)}</p>
            <div className="contact-email-row" data-pop="">
              <span className="contact-email-label">{t(c.contact.emailLabel, locale)}</span>
              <a href="mailto:info@enpadel.com" className="contact-email">info@enpadel.com</a>
            </div>
          </div>
          <div className="contact-right" data-pop="">
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
