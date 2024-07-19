const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const directoryPath = "./content/news/"; // Replace with your directory path
const outputFilePath = "./src/json/news.json";
const section = "news"; // Path to save the JSON file

// Function to read all markdown files in the directory
const readMarkdownFiles = (dir) => {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".md");
};

// Function to extract YAML metadata from a file
const extractYAMLMetadata = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const yamlMatch = fileContent.match(/---\s*([\s\S]*?)\s*---/);
  if (yamlMatch && yamlMatch[1]) {
    try {
      return yaml.load(yamlMatch[1]);
    } catch (e) {
      console.error(`Error parsing YAML in file ${filePath}:`, e);
      return null;
    }
  }
  return null;
};

// Main function
const main = () => {
  const markdownFiles = readMarkdownFiles(directoryPath);
  const slugs = markdownFiles
    .map((file) => {
      const filePath = path.join(directoryPath, file);
      const metadata = extractYAMLMetadata(filePath);
      return metadata ? "/" + section + "/" + metadata.slug : null;
    })
    .filter((slug) => slug !== null);

  fs.writeFileSync(outputFilePath, JSON.stringify(slugs, null, 2));
  console.log(`Slugs saved to ${outputFilePath}`);
};

main();
