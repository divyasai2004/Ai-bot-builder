import * as cheerio from "cheerio";
import { isSafeUrl } from "./ssrfProtection";

export async function crawlWebsite(url: string) {
  if (!(await isSafeUrl(url))) {
    throw new Error("Unsafe URL");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load website: ${response.status}`
    );
  }

  const html = await response.text();

  const $ = cheerio.load(html);

  const title = $("title").text();

  const description =
    $('meta[name="description"]').attr("content") || "";

  const headings = $("h1,h2,h3")
    .map((_, el) => $(el).text())
    .get()
    .join(" ");

  const body = $("body").text();

  return `
Title: ${title}

Description: ${description}

Headings: ${headings}

${body}
  `.slice(0, 30000);
}

