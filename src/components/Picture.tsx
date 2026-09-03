import manifest from "@/lib/image-manifest.json";

type Entry = { dir: string; width: number; height: number; widths: number[] };
const MANIFEST = manifest as Record<string, Entry>;

/**
 * A photo served as AVIF → WebP → the original file.
 *
 * Nothing here is dynamic: the derivatives are produced ahead of time by
 * `node scripts/optimize-images.mjs`, which writes the manifest this reads. If
 * a source has no manifest entry the component degrades to a plain <img>, so
 * adding a photo to the page never renders a broken srcset — it just misses the
 * optimisation until the script is re-run.
 *
 * Deliberately not next/image: these are static art-directed photos on a page
 * that is otherwise fully prerendered, and routing them through the optimiser
 * would add a per-request hop (and Vercel image units) for no gain over files
 * we can encode once at build time and cache immutably.
 */
export default function Picture({
  src,
  alt,
  sizes,
  className,
  loading = "lazy",
  fetchPriority,
  width,
  height,
}: {
  src: string;
  alt: string;
  /** Required: without it the browser assumes 100vw and picks the widest file. */
  sizes: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
}) {
  const entry = MANIFEST[src];

  const img = (
    <img
      src={src}
      alt={alt}
      width={width ?? entry?.width}
      height={height ?? entry?.height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
    />
  );

  if (!entry) return img;

  const stem = src.replace(/\.[^.]+$/, "");
  const set = (ext: string) =>
    entry.widths.map((w) => `${entry.dir}${stem}.${w}.${ext} ${w}w`).join(", ");

  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      {img}
    </picture>
  );
}
