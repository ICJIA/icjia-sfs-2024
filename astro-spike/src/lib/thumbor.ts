/**
 * Thumbor URL builder mirroring app/utils/thumbor.js in the Nuxt project.
 * The build runs at SSG time, so this is server-only — no env exposure to
 * the client bundle.
 */
import { ThumborUrlBuilder } from "thumbor-url-builder-ts";

const THUMBOR_KEY = import.meta.env.VITE_THUMBOR_KEY ?? "ICJIA";
const THUMBOR_HOST = "https://image.icjia.cloud";

export interface ThumborOpts {
  url: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

export function getThumborUrl({
  url,
  width = 1024,
  height = 768,
  quality = 80,
  format = "webp",
}: ThumborOpts): string {
  return new ThumborUrlBuilder(THUMBOR_KEY, THUMBOR_HOST)
    .setImagePath(url)
    .resize(width, height)
    .filter(`quality(${quality}):format('${format}')`)
    .smartCrop(true)
    .buildUrl();
}
