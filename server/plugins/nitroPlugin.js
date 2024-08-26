const base = "https://sfs.icjia.illinois.gov";

function removeMetadata(markdownContent) {
  // Removes YAML from raw markdown content
  const match = markdownContent.match(/^---([\s\S]*?)---([\s\S]*)/);

  if (match && match[2]) {
    return match[2].trim();
  }

  return markdownContent.trim();
}

export default defineNitroPlugin((nitroApp) => {
  let files = {};

  nitroApp.hooks.hook("content:file:beforeParse", (file) => {
    if (file._id.endsWith(".md")) {
      files[file._id] = file.body;
    }
  });

  nitroApp.hooks.hook("content:file:afterParse", (file) => {
    let URL;
    if (file.section && file.section.length > 0) {
      URL = `/${file.section}/${file.slug}`;
    } else {
      URL = `/${file.slug}`;
    }
    // console.log(file);
    if (file._id.endsWith(".md")) {
      file.rawMarkdown = removeMetadata(files[file._id]);
      file.externalURL = `${base}${URL}`;
      file.internalURL = `${URL}`;
    }
  });
});
