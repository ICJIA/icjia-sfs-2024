import { createRequire } from "module";
import { createWriteStream } from "fs";
import { SitemapStream } from "sitemap";

import * as dotenv from "dotenv";
dotenv.config();

const require = createRequire(import.meta.url);
const routes = require("../src/json/appRoutes.json");
const host = "https://sfs.icjia.illinois.gov";

const sitemap = new SitemapStream({
  hostname: host,
});
const writeStream = createWriteStream("public/sitemap.xml");

sitemap.pipe(writeStream);

routes.forEach((route) => {
  const url = host + route;
  sitemap.write({ url, changefreq: "weekly", priority: 0.3 });
});

sitemap.end();

console.log("Created: public/sitemap.xml");

// console.log('Creating "sitemap.xml" in "public" folder...');
