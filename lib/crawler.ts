import puppeteer from "puppeteer";
import { rankLinks } from "./linkRanker";

export async function crawlWebsite(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  const links = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("a"))
    .map((a) => (a as HTMLAnchorElement).href)
    .filter((href) => href.startsWith(location.origin));
});

console.log("Internal links found:", links.length);

  let combinedText = await page.evaluate(() => {
  return document.body.innerText;
});

// Visit only first 5 internal pages
const pagesToVisit = rankLinks(links).slice(0, 8);

for (const link of pagesToVisit) {
  try {
    console.log("Crawling:", link);

    await page.goto(link, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const pageText = await page.evaluate(() => {
  const selectors = [
    "main",
    "article",
    "section",
    "[role='main']"
  ];

  let text = "";

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      text += " " + (el.textContent || "");
    });
  });

  return text;
});

    combinedText += "\n\n" + pageText;

  } catch {
    console.log("Skipped:", link);
  }
}
  await browser.close();

  return combinedText
  .replace(/\s+/g, " ")
  .replace(/[^\x20-\x7E]/g, "")
  .replace(/Learn more/g, "")
  .replace(/Buy/g, "")
  .trim()
  .slice(0, 10000);
}