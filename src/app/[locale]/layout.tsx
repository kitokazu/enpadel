import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Shippori_Mincho,
  Zen_Kaku_Gothic_New,
} from "next/font/google";
import { meta, type Locale } from "@/lib/content";

/* ── Latin ──
   Weights and italics per the design handoff: Cormorant 300/400/500 with
   italics for the leads, DM Sans 300/400 with italic. The redesign sets its
   display type at 300 and its leads in serif italic, so both are loaded again.

   No `fallback` array on either, deliberately. next/font bakes it into the CSS
   variable, and a generic family (`serif`, `sans-serif`) is TERMINAL in font
   matching — one sitting inside --font-serif, ahead of the Japanese face in
   --stack-display, silently swallows every Japanese glyph and /ja renders in
   Hiragino no matter what loaded. The generic belongs once, at the end of the
   JP stacks below. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

/* ── Japanese ──
   Shippori Mincho on display, Zen Kaku Gothic New on text. Kept exactly as the
   client approved them: this pair is the change that made /ja look designed
   rather than left to whatever font the visitor's OS supplies.

   Shippori was originally picked to stand up to Young Serif's weight. It sits
   a little heavier than Cormorant does, which reads as deliberate contrast
   rather than a mismatch — but if it ever looks too dark beside the Latin,
   Zen Old Mincho is the lighter swap and needs only this one line changed.

   Both sit SECOND in the stacks (see --stack-display / --stack-text in
   globals.css), so Latin still resolves to Cormorant and DM Sans and only
   Japanese falls through.

   preload: false is deliberate. Google serves these as ~100 unicode-range
   slices each; the browser fetches only the slices the page's glyphs need, and
   preloading would pull the lot on every visit — including /en, which sets one
   Japanese character. */
const jpSerif = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jp-serif",
  display: "swap",
  preload: false,
  fallback: ["Hiragino Mincho ProN", "Yu Mincho", "serif"],
});

const jpSans = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jp-sans",
  display: "swap",
  preload: false,
  fallback: ["Hiragino Kaku Gothic ProN", "Yu Gothic", "sans-serif"],
});

const FONTS = [cormorant, dmSans, jpSerif, jpSans]
  .map((f) => f.variable)
  .join(" ");

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ja" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = raw === "ja" ? "ja" : "en";
  const c = meta[locale];

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: `/${locale}`,
      // Both directions plus x-default, so neither locale is treated as a
      // duplicate of the other.
      languages: { en: "/en", ja: "/ja", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "EnPadel",
      url: `/${locale}`,
      title: c.title,
      description: c.description,
      locale: c.ogLocale,
      alternateLocale: locale === "en" ? ["ja_JP"] : ["en_US"],
      // og:image comes from app/[locale]/opengraph-image.tsx; setting it here
      // as well would replace the generated entry rather than add to it.
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = (locale as Locale) === "ja" ? "ja" : "en";

  return (
    <html lang={lang} className={FONTS}>
      <head>
        {/* First paint of the intro, before any video byte has decoded. */}
        <link
          rel="preload"
          as="image"
          href="/media/v2/scroll-hero-poster.jpg"
          fetchPriority="high"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
