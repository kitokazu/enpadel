import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { meta, type Locale } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card, rendered once per locale at build time.
 *
 * Generated rather than exported from Figma so the tagline can never drift from
 * the copy in content.ts — the card reads the same strings the page does.
 *
 * Art direction is the intro's first frame under the site's green scrim, with
 * the wordmark and one line of copy. Satori supports flexbox and a subset of
 * CSS only: no grid, no background-size, and every element with more than one
 * child needs an explicit `display: flex`.
 */
export async function renderCard(locale: Locale) {
  const c = meta[locale];
  const root = process.cwd();

  const [latin, jp, poster] = await Promise.all([
    readFile(join(root, "src/assets/fonts/CormorantGaramond-400.subset.ttf")),
    readFile(join(root, "src/assets/fonts/ShipporiMincho-400.subset.ttf")),
    readFile(join(root, "public/media/v2/scroll-hero-poster.jpg")),
  ]);

  const posterUri = `data:image/jpeg;base64,${poster.toString("base64")}`;
  // Latin first so ASCII resolves to Cormorant and only Japanese falls through
  // to the Mincho — the same rule the site's --stack-display follows.
  const stack = "Cormorant, ShipporiMincho";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#021a13",
          fontFamily: stack,
        }}
      >
        {/* 1200x630 is wider than the 16:9 poster is tall, so the frame is
            sized to cover on width and pulled up to keep the court centred. */}
        <img
          src={posterUri}
          alt=""
          width={1200}
          height={675}
          style={{ position: "absolute", left: 0, top: -22 }}
        />
        {/* Two layers, because the poster's first frame is bright midday sun
            and cream type needs real help: a flat scrim over the whole card,
            then a left-weighted gradient under the copy. Longhand throughout:
            satori parses gradients only from `backgroundImage`, and it has no
            `inset` shorthand at all — an overlay written with `inset: 0`
            silently does not paint. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundColor: "rgba(2,26,19,0.36)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(100deg, rgba(2,26,19,0.94) 0%, rgba(2,26,19,0.80) 42%, rgba(2,26,19,0.18) 100%)",
          }}
        />

        {/* 縁 — the brand mark, sitting low right as a watermark. */}
        <div
          style={{
            position: "absolute",
            right: 54,
            bottom: -96,
            fontFamily: "ShipporiMincho",
            fontSize: 420,
            lineHeight: 1,
            color: "rgba(245,243,239,0.09)",
          }}
        >
          縁
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 88px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 56, height: 1, backgroundColor: "#b89a6a" }} />
            <div
              style={{
                fontFamily: "Cormorant, ShipporiMincho",
                fontSize: 22,
                // Latin small caps get tracking; Japanese does not (see §2 of
                // the type rules) — the JA eyebrow is already un-uppercased.
                letterSpacing: locale === "en" ? "0.22em" : "0.06em",
                color: "#d4b896",
              }}
            >
              {c.ogEyebrow}
            </div>
          </div>

          <div
            style={{
              marginTop: 34,
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: "-0.005em",
              color: "#f5f3ef",
            }}
          >
            EnPadel
          </div>

          <div
            style={{
              marginTop: 30,
              fontSize: locale === "en" ? 46 : 42,
              lineHeight: 1.4,
              maxWidth: 760,
              color: "rgba(245,243,239,0.86)",
            }}
          >
            {c.ogTagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: latin, style: "normal", weight: 400 },
        { name: "ShipporiMincho", data: jp, style: "normal", weight: 400 },
      ],
    }
  );
}
