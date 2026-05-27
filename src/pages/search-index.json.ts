/**
 * Build-time search index — emits dist/search-index.json containing every
 * indexable route's title, URL, summary, and stripped-markdown body. The
 * /search page fetches this JSON on demand and runs Fuse over it, instead
 * of bundling the index into the search page's JS (which would balloon
 * the page weight).
 *
 * Index size for SFS (~7 markdown pages + the home page) is well under
 * 50 KB uncompressed.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

type Doc = {
  title: string;
  url: string;
  summary: string;
  body: string;
};

function stripMarkdown(md: string): string {
  return md
    // fenced code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // inline code
    .replace(/`[^`]*`/g, " ")
    // images
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    // links — keep the label, drop the URL
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // headings / blockquote / list markers
    .replace(/^\s{0,3}(#{1,6}|>+|[-*+])\s+/gm, "")
    // ordered list markers
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    // emphasis / strong / strikethrough
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    // HTML tags (the resources page has the occasional inline tag)
    .replace(/<[^>]+>/g, " ")
    // HTML entities — leave them; Fuse will tokenize fine
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export const GET: APIRoute = async () => {
  const pages = await getCollection("pages");

  const docs: Doc[] = pages.map((p) => {
    const summary = (p.data.summary ?? p.data.description ?? "").trim();
    return {
      title: p.data.title,
      url: `/${p.id}`,
      summary,
      body: stripMarkdown(p.body ?? ""),
    };
  });

  // The home page isn't in the markdown collection — index it manually
  // from the inline content of src/pages/index.astro so /search results
  // can surface "Childhood Exposure to Violence and Trauma" etc.
  docs.unshift({
    title: "Safe From the Start",
    url: "/",
    summary:
      "The Safe From the Start (SFS) program provides developmentally and culturally appropriate direct services to children, ages 0–5, who have witnessed or been exposed to violence and their families.",
    body:
      "Childhood Exposure to Violence and Trauma. Childhood exposure to violence (CEV) is pervasive and negatively impacts communities. CEV includes experiencing or witnessing physical abuse, sexual assault, maltreatment/neglect, domestic violence, and other violent crimes.",
  });

  return new Response(JSON.stringify(docs), {
    headers: { "Content-Type": "application/json" },
  });
};
