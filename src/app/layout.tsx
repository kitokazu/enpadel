import type { Metadata } from "next";
import "./globals.css";

/**
 * Root layout renders nothing but its children: <html> and <body> live in
 * app/[locale]/layout.tsx, which is the first place the locale is known.
 *
 * What stays here is the metadata that is identical on both locales — the
 * icons and metadataBase. Per-locale title, description, canonical, hreflang
 * and the share card are set in the locale layout and merge over these.
 */
export const metadata: Metadata = {
  // Absolute URLs for og:image, og:url and canonical are resolved against this.
  metadataBase: new URL("https://www.enpadel.com"),
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
