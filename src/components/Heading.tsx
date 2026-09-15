/**
 * A heading whose lines can each be animated out of their own mask.
 *
 * The copy still comes from content.ts verbatim — this only splits it on the
 * `<br/>` the strings already carry, so `More than<br/>a sport.` becomes two
 * masked lines and `パデルとは？` stays one. Nothing is reworded, and a string
 * with no break still works.
 *
 * Rendering each line as text rather than dangerouslySetInnerHTML is the point:
 * the old markup pushed whole headings through innerHTML purely to honour the
 * break, which meant no per-line structure to animate.
 */
export default function Heading({
  html,
  className,
  as: Tag = "h2",
}: {
  /** May contain `<br/>`. Sourced from content.ts, never from user input. */
  html: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const lines = html.split(/<br\s*\/?>/i);
  return (
    <Tag className={className} data-heading="">
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
