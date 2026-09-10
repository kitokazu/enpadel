/**
 * A film strip of prints drifting sideways on its own — no scroll coupling.
 * Pure CSS animation (see .marquee-* in globals.css), so this stays a server
 * component: no client JS ships for it.
 *
 * The loop: the reel is rendered twice and the track translates exactly -50%,
 * so the second copy lands where the first began and the wrap is invisible.
 * The reel itself is the photo list doubled — with only four photos, one pass
 * is narrower than a wide viewport and the wrap point would flash a gap.
 */
import Picture from "@/components/Picture";

export type MarqueePhoto = {
  src: string;
  /** Natural pixel size — sets the print's aspect so nothing is cropped. */
  width: number;
  height: number;
};

export const WHO_PHOTOS: MarqueePhoto[] = [
  { src: "/friends/trio-web.jpg",  width: 1400, height: 933 },
  { src: "/friends/table-web.jpg", width: 815,  height: 1100 },
  { src: "/friends/pair-web.jpg",  width: 934,  height: 1400 },
  { src: "/friends/group-web.jpg", width: 1400, height: 933 },
];

export default function PhotoMarquee({ photos }: { photos: MarqueePhoto[] }) {
  const reel = [...photos, ...photos];
  return (
    // Decorative: the photos carry no copy and have empty alt, and the strip
    // repeats itself, so screen readers skip the whole thing.
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {/* sizes: fixed height / natural width means a landscape print is
            about 510px across at the reel's tallest, a portrait one ~250px. */}
        {[...reel, ...reel].map((photo, i) => (
          <figure className="marquee-print" key={i}>
            <Picture
              src={photo.src}
              alt=""
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 960px) 460px, 520px"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
