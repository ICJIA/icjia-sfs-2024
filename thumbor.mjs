import Thumbor from "thumbor-js-url-builder";
import "dotenv/config";
const thumbor = new Thumbor(
  process.env.THUMBOR_KEY,
  "https://image.icjia.cloud"
);

const thumborize = (type = "jpeg", url, num = 1, width = 600, height = 400) => {
  return thumbor
    .filter(`format(${type})`)
    .setImagePath(url)
    .resize(width * num, height * num)
    .buildUrl();
};

// export default thumborize;
console.log(
  thumbor
    .setImagePath(
      "https://r3.icjia-api.cloud/uploads/large_getty_images_Q_Ygr_G6nkm4g_unsplash_c29c2710e6.jpg"
    )
    .resize(1600, 600)
    .buildUrl()
);

export default thumborize;
