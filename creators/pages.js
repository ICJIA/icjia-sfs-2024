/**
 * Page route generation script for the ICJIA Safe From the Start application.
 *
 * This build-time script scans the content directory for markdown files,
 * extracts their YAML frontmatter metadata (specifically the slug field), and
 * generates a JSON file containing all page routes.
 *
 * The generated pages.json file is used by:
 * - generateRoutes.mjs to create the consolidated appRoutes.json
 * - Nuxt's static site generation to pre-render all pages
 *
 * This script is executed as part of the build pipeline via the "create:pages" command.
 *
 * @module creators/pages
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Directory containing page content markdown files
const directoryPath = "./content";

// Output path for the generated page routes JSON file
const outputFilePath = "./src/json/pages.json";

/**
 * Reads all markdown files from a directory.
 *
 * This function scans the specified directory and returns only files with
 * the .md extension, filtering out subdirectories and other file types.
 *
 * @param {string} dir - Directory path to scan for markdown files
 * @returns {string[]} Array of markdown filenames (with .md extension)
 */
const readMarkdownFiles = (dir) => {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".md");
};

/**
 * Extracts YAML frontmatter metadata from a markdown file.
 *
 * Content markdown files use YAML frontmatter (delimited by ---) to store
 * metadata such as title, slug, description, and other page-specific data.
 * This function parses that frontmatter and returns it as a JavaScript object.
 *
 * @param {string} filePath - Path to the markdown file
 * @returns {Object|null} Parsed YAML metadata object, or null if parsing fails or no frontmatter exists
 *
 * @example
 * // For a file with frontmatter:
 * // ---
 * // title: "About Us"
 * // slug: "about"
 * // ---
 * const metadata = extractYAMLMetadata('./content/about.md')
 * // Returns: { title: "About Us", slug: "about" }
 */
const extractYAMLMetadata = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Match YAML frontmatter between --- delimiters
  // The regex captures everything between the first pair of --- markers
  const yamlMatch = fileContent.match(/---\s*([\s\S]*?)\s*---/);

  if (yamlMatch && yamlMatch[1]) {
    try {
      // Parse the YAML content into a JavaScript object
      return yaml.load(yamlMatch[1]);
    } catch (e) {
      // Log parsing errors but continue processing other files
      console.error(`Error parsing YAML in file ${filePath}:`, e);
      return null;
    }
  }

  // No frontmatter found in the file
  return null;
};

/**
 * Main execution function.
 *
 * Orchestrates the process of:
 * 1. Reading all markdown files from the content directory
 * 2. Extracting slug metadata from each file's frontmatter
 * 3. Constructing full route paths (e.g., /about, /resources)
 * 4. Writing the routes to a JSON file for use in static generation
 *
 * @returns {void}
 */
const main = () => {
  // Get all markdown files in the content directory
  const markdownFiles = readMarkdownFiles(directoryPath);

  // Extract slugs and construct route paths
  const slugs = markdownFiles
    .map((file) => {
      const filePath = path.join(directoryPath, file);
      const metadata = extractYAMLMetadata(filePath);

      // Only include files with valid metadata and slug field
      // Prepend "/" to create a valid route path
      return metadata ? "/" + metadata.slug : null;
    })
    .filter((slug) => slug !== null); // Remove any null entries from failed parsing

  // Additional routes can be added manually if needed
  // Currently commented out as news and contact pages are not active
  // slugs.push("/news");
  // slugs.push("/contact");

  // Write the routes array to JSON file with pretty formatting (2-space indent)
  fs.writeFileSync(outputFilePath, JSON.stringify(slugs, null, 2));

  console.log(`Slugs saved to ${outputFilePath}`);
};

// Execute the main function
main();
