/**
 * Same artwork as the Open Graph card. It exists as its own file because Next
 * only emits `twitter:image` from a `twitter-image` route — an
 * `opengraph-image` alone leaves X, and anything that reads Twitter's tags
 * first, with no picture.
 */
export {
  default,
  size,
  contentType,
  generateStaticParams,
  generateImageMetadata,
} from "./opengraph-image";
