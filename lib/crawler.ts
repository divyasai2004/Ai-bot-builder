import * as cheerio from "cheerio";
import { isSafeUrl } from "./ssrfProtection";

export async function crawlWebsite(url: string) {
  if (!(await isSafeUrl(url))) {
    throw new Error("Unsafe URL");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load website: ${response.status}`
    );
  }

  const html = await response.text();

  const $ = cheerio.load(html);

  // --------------------------------------------------
  // 1. Remove useless elements
  // --------------------------------------------------

  $(
    "script, style, noscript, svg, iframe, canvas, template, " +
      "form, input, button, select, textarea, " +
      "picture, source, img"
  ).remove();

  // Remove navigation and footer
  $("nav, footer").remove();

  // --------------------------------------------------
  // 2. Extract page title
  // --------------------------------------------------

  const title = $("title")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  // --------------------------------------------------
  // 3. Extract meta description
  // --------------------------------------------------

  const description =
    $('meta[name="description"]')
      .attr("content")
      ?.replace(/\s+/g, " ")
      .trim() || "";

  // --------------------------------------------------
  // 4. Extract headings
  // --------------------------------------------------

  const headings = $("h1, h2, h3")
    .map((_, el) => {
      return $(el)
        .text()
        .replace(/\s+/g, " ")
        .trim();
    })
    .get()
    .filter(Boolean);

  // --------------------------------------------------
  // 5. Extract visible body text
  // --------------------------------------------------

 const body = $("body")
  .text()
  .replace(/\s+/g, " ")
  .trim();

  // --------------------------------------------------
  // 6. Build clean knowledge content
  // --------------------------------------------------

  const sections: string[] = [];

  if (title) {
    sections.push(`Title: ${title}`);
  }

  if (description) {
    sections.push(`Description: ${description}`);
  }

  if (headings.length > 0) {
    sections.push(
      `Headings:\n${headings.join("\n")}`
    );
  }

  if (body) {
    sections.push(`Content:\n${body}`);
  }

  const cleanContent = sections.join("\n\n");

  // --------------------------------------------------
  // 7. Debug output
  // --------------------------------------------------

  console.log(
    "========== CLEAN CRAWLED CONTENT =========="
  );

  console.log(cleanContent.slice(0, 5000));

  console.log(
    "==========================================="
  );

  return cleanContent.slice(0, 30000);
}