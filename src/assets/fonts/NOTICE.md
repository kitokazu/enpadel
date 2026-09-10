# Bundled font files

These two `.subset.ttf` files exist only for the Open Graph card
(`src/lib/og-card.tsx`). The site itself loads its fonts through
`next/font/google` and ships nothing from this directory.

They are TTF rather than woff2 because satori — the renderer behind
`next/og`'s `ImageResponse` — cannot read woff2. They are subset to the handful
of characters the card actually sets, because shipping the full Shippori Mincho
(several MB of Japanese) to render one line would slow every card render for
nothing.

Regenerate with `./scripts/build-og-fonts.sh` after changing `meta.ogEyebrow`
or `meta.ogTagline` in `src/lib/content.ts` — a character not in the subset
renders as a blank box on the card.

| File | Family | Licence |
|---|---|---|
| `CormorantGaramond-400.subset.ttf` | Cormorant Garamond | OFL |
| `ShipporiMincho-400.subset.ttf` | Shippori Mincho | OFL |
