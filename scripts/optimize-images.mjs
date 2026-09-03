/**
 * Generates AVIF and WebP derivatives for every photo the page actually loads.
 *
 * Originals in /public stay put and remain the <img> fallback; the derivatives
 * live under /public/img/<VER>/ so the whole set is versioned by one path
 * segment and can be served `immutable` (see next.config.ts). Bump VER when a
 * source photo changes.
 *
 * Writes src/lib/image-manifest.json, which <Picture> reads so it can never
 * emit a srcset entry for a file that was not generated.
 *
 *   node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const VER = "v1";
const ROOT = new URL("..", import.meta.url).pathname;
const OUT_ROOT = join(ROOT, "public/img", VER);

/** Candidate widths. Anything wider than the source is dropped. */
const WIDTHS = [320, 640, 960, 1400];

const SOURCES = [
  "public/right-side-pic-web.jpg",
  "public/dj.jpg",
  "public/sketch1.png",
  "public/sketch2.png",
  "public/sketch3.png",
  "public/friends/trio-web.jpg",
  "public/friends/table-web.jpg",
  "public/friends/pair-web.jpg",
  "public/friends/group-web.jpg",
];

const manifest = {};
let before = 0;
let after = 0;

for (const rel of SOURCES) {
  const abs = join(ROOT, rel);
  const img = sharp(abs);
  const meta = await img.metadata();
  const publicPath = "/" + relative("public", rel);
  const stem = publicPath.replace(/\.[^.]+$/, "");

  const widths = WIDTHS.filter((w) => w < meta.width).concat(meta.width);
  const outDir = join(OUT_ROOT, dirname(publicPath));
  await mkdir(outDir, { recursive: true });

  before += (await sharp(abs).toBuffer()).byteLength;

  for (const w of widths) {
    const base = join(OUT_ROOT, `${stem}.${w}`);
    // effort 6 is slow but this runs once, by hand, not in the build.
    const avif = await sharp(abs)
      .resize({ width: w, withoutEnlargement: true })
      .avif({ quality: 52, effort: 6 })
      .toBuffer();
    const webp = await sharp(abs)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    await writeFile(`${base}.avif`, avif);
    await writeFile(`${base}.webp`, webp);
    if (w === meta.width) after += avif.byteLength;
    console.log(
      `${publicPath} @${w}  avif ${(avif.byteLength / 1024) | 0}KB  webp ${(webp.byteLength / 1024) | 0}KB`
    );
  }

  manifest[publicPath] = {
    dir: `/img/${VER}`,
    width: meta.width,
    height: meta.height,
    widths,
  };
}

await writeFile(
  join(ROOT, "src/lib/image-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);

console.log(
  `\noriginals ${(before / 1024) | 0}KB → full-size avif ${(after / 1024) | 0}KB`
);
