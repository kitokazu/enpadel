import type { NextConfig } from "next";

/**
 * Media in /public is served by Vercel with `max-age=0, must-revalidate` by
 * default, which meant re-validating ~12MB of video on every visit.
 *
 * Everything this project generates now lives under a versioned directory —
 * /media/v2 for the video and its posters, /img/v1 for the AVIF and WebP
 * derivatives — so the URL changes whenever the bytes do and those two trees
 * can be cached hard for a year. The version is a path segment rather than a
 * filename suffix so the match here is a plain prefix and never has to reason
 * about which dot in a filename is the extension.
 *
 * The legacy JPEG/PNG originals keep their unversioned names at the root
 * because they are the <picture> fallback of last resort, so they get a month
 * with revalidation rather than `immutable`.
 *
 * To ship new media: write it into a bumped directory (/media/v3, /img/v2),
 * update the references, and delete the old tree once nothing points at it.
 */
const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      // Order matters: every matching rule applies and the LAST one wins for a
      // given header. The broad extension rule therefore goes first, so the
      // versioned-tree rule below can override it — otherwise the posters
      // inside /media/v2 would take the short policy on the strength of their
      // .jpg extension.
      {
        source: "/:file*.:ext(jpg|jpeg|png|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:tree(media|img)/:version/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
