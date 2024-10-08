import { ThumborUrlBuilder } from "thumbor-url-builder-ts";

const getThumborUrl = ({ url, width, height, quality, format }) => {
  let options = {
    url: url || "https://sfs.icjia.illinois.gov/error.jpg",
    width: width || 1024,
    height: height || 768,
    quality: quality || 80,
    format: format || "webp",
  };
  const thumbor = new ThumborUrlBuilder(
    import.meta.env.VITE_THUMBOR_KEY,
    "https://image.icjia.cloud"
  );

  return thumbor
    .setImagePath(options.url)
    .resize(options.width, options.height)
    .filter(`quality(${options.quality}):format('${options.format}')`)
    .smartCrop(true)
    .buildUrl();
};

export { getThumborUrl };
