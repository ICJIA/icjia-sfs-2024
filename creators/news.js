/**
 * News route generation script for the ICJIA Safe From the Start application.
 *
 * This build-time script scans the content/news directory for markdown files,
 * extracts their YAML frontmatter metadata (specifically the slug field), and
 * generates a JSON file containing all news article routes.
 *
 * The generated news.json file can be used for:
 * - Static site generation (pre-rendering news pages)
 * - Dynamic route generation
 * - News listing/navigation components
 *
 * This script is executed as part of the build pipeline via the "create:news" command.
 *
 * @module creators/news
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Directory containing news article markdown files
const directoryPath = "./content/news/";

// Output path for the generated news routes JSON file
const outputFilePath = "./src/json/news.json";

// URL section/prefix for news routes (e.g., /news/article-slug)
const section = "news";

/**
 * Reads all markdown files from a directory.
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
 * Markdown files in the content directory use YAML frontmatter (delimited by ---)
 * to store metadata like title, slug, date, author, etc. This function parses
 * that frontmatter and returns it as a JavaScript object.
 *
 * @param {string} filePath - Path to the markdown file
 * @returns {Object|null} Parsed YAML metadata object, or null if parsing fails or no frontmatter exists
 *
 * @example
 * // For a file with frontmatter:
 * // ---
 * // title: "My Article"
 * // slug: "my-article"
 * // ---
 * const metadata = extractYAMLMetadata('./content/news/article.md')
 * // Returns: { title: "My Article", slug: "my-article" }
 */
const extractYAMLMetadata = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Match YAML frontmatter between --- delimiters
  const yamlMatch = fileContent.match(/---\s*([\s\S]*?)\s*---/);

  if (yamlMatch && yamlMatch[1]) {
    try {
      // Parse the YAML content into a JavaScript object
      return yaml.load(yamlMatch[1]);
    } catch (e) {
      console.error(`Error parsing YAML in file ${filePath}:`, e);
      return null;
    }
  }

  // No frontmatter found
  return null;
};

/**
 * Main execution function.
 *
 * Orchestrates the process of:
 * 1. Reading all markdown files from the news directory
 * 2. Extracting slug metadata from each file
 * 3. Constructing full route paths (e.g., /news/article-slug)
 * 4. Writing the routes to a JSON file
 *
 * @returns {void}
 */
const main = () => {
  // Get all markdown files in the news directory
  const markdownFiles = readMarkdownFiles(directoryPath);

  // Extract slugs and construct full route paths
  const slugs = markdownFiles
    .map((file) => {
      const filePath = path.join(directoryPath, file);
      const metadata = extractYAMLMetadata(filePath);

      // Only include files with valid metadata and slug field
      return metadata ? "/" + section + "/" + metadata.slug : null;
    })
    .filter((slug) => slug !== null); // Remove any null entries from failed parsing

  // Write the routes array to JSON file with pretty formatting
  fs.writeFileSync(outputFilePath, JSON.stringify(slugs, null, 2));

  console.log(`Slugs saved to ${outputFilePath}`);
};

// Execute the main function
main();
