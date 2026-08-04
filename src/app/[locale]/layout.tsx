import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import type { Locale } from "@/lib/content";

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

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ja" }];
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
    <html lang={lang} className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* First paint of the intro, before any video byte has decoded. */}
        <link rel="preload" as="image" href="/scroll-hero-poster.jpg" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
