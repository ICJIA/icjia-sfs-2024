import Thumbor from "thumbor-js-url-builder";
import "dotenv/config";

const thumbor = new Thumbor(
  process.env.THUMBOR_KEY,
  "https://image.icjia.cloud"
);

export default defineEventHandler((event) => {
  const url = getRouterParam(event, "url");
  const query = getQuery(event);
  let options = {
    width: query.width || 1024,
    height: query.height || 768,
    quality: query.quality || 60,
    format: query.format || "jpeg",
    smartCrop: query.smartCrop || true,
  };

  console.log(options);

  return `${thumbor
    .setImagePath(decodeURIComponent(url))
    .resize(options.width, options.height)
    .filter(`quality(${options.quality}):format('${options.format}')`)
    .smartCrop(true)
    .buildUrl()}`;
});

// sample url:
// http://localhost:8000/api/thumbor/https%3A%2F%2Fr3.icjia-api.cloud%2Fuploads%2Fgetty_images_Q_Ygr_G6nkm4g_unsplash_c29c2710e6.jpg?test=1234
