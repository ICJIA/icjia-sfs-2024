/**
 * Sitemap generation script for the ICJIA Safe From the Start application.
 *
 * This build-time script generates an XML sitemap for search engine optimization (SEO).
 * The sitemap includes all application routes with metadata about update frequency and
 * priority, helping search engines efficiently crawl and index the site.
 *
 * The generated sitemap.xml file is placed in the public directory and is accessible
 * at https://sfs.icjia.illinois.gov/sitemap.xml
 *
 * This script is executed as part of the build pipeline via the "scripts" command in package.json.
 *
 * @module creators/generateSiteMap
 */

import { createRequire } from "module";
import { createWriteStream } from "fs";
import { SitemapStream } from "sitemap";

import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create CommonJS require function for importing JSON in ES modules
const require = createRequire(import.meta.url);

// Import the consolidated list of all application routes
const routes = require("../src/json/appRoutes.json");

// Production hostname for the Safe From the Start website
const host = "https://sfs.icjia.illinois.gov";

/**
 * Create a sitemap stream with the production hostname.
 * The SitemapStream handles XML formatting and validation according to
 * the sitemap protocol specification.
 */
const sitemap = new SitemapStream({
  hostname: host,
});

// Create a write stream to output the sitemap to the public directory
const writeStream = createWriteStream("public/sitemap.xml");

// Pipe the sitemap stream to the file write stream
sitemap.pipe(writeStream);

/**
 * Add each route to the sitemap with SEO metadata.
 *
 * changefreq: "weekly" - Indicates content is updated approximately weekly
 * priority: 0.3 - Relative priority (0.0 to 1.0) for crawling this URL
 *
 * Note: These are hints to search engines and don't guarantee crawl behavior.
 * The priority is set relatively low (0.3) as most pages are informational
 * and don't change frequently.
 */
routes.forEach((route) => {
  const url = host + route;
  sitemap.write({ url, changefreq: "weekly", priority: 0.3 });
});

// Close the sitemap stream to finalize the XML file
sitemap.end();

console.log("Created: public/sitemap.xml");
