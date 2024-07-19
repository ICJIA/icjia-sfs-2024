import { createRequire } from "module";
import * as dotenv from "dotenv";
const require = createRequire(import.meta.url);
const { v4: uuidv4 } = require("uuid");
const jsonfile = require("jsonfile");
const pageRoutes = require("../src/json/pages.json");
// const newsRoutes = require("../src/json/news.json");

dotenv.config();

const appRoutes = Array.from(new Set([...pageRoutes]));

jsonfile.writeFileSync(`./src/json/appRoutes.json`, appRoutes, function (err) {
  if (err) {
    console.error(err);
  }
});

console.log("appRoutes.json created in /src/appRoutes.json:", appRoutes);

console.log("Total app routes: ", appRoutes.length);
