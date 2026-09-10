import { meta, type Locale } from "@/lib/content";
import { renderCard, size, contentType } from "@/lib/og-card";

export { size, contentType } from "@/lib/og-card";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ja" }];
}

/**
 * One image per locale, declared rather than a bare `alt` export, because a
 * static export cannot be Japanese on /ja and English on /en — and the alt is
 * the only thing a screen reader gets from a share card.
 */
export function generateImageMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = params.locale === "ja" ? "ja" : "en";
  return [{ id: locale, alt: meta[locale].ogAlt, size, contentType }];
}

export default async function Image({ id }: { id: Promise<string> }) {
  const locale = await id;
  return renderCard((locale === "ja" ? "ja" : "en") as Locale);
}
