import puppeteer from "puppeteer";
import { rankLinks } from "./linkRanker";

export async function crawlWebsite(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    // -------------------------
    // HOMEPAGE
    // -------------------------
    const page = await browser.newPage();

    // Speed up crawling
    await page.setRequestInterception(true);

    page.on("request", (request) => {
      const type = request.resourceType();

      if (
        type === "image" ||
        type === "font" ||
        type === "media" ||
        type === "stylesheet"
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    

    // Give React/Next.js pages time to render
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let combinedText = await page.evaluate(() => {
      return document.body.innerText;
    });

    // -------------------------
    // INTERNAL LINKS
    // -------------------------
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => href.startsWith(location.origin));
    });

    console.log("Internal links found:", links.length);

    const pagesToVisit = [...new Set(rankLinks(links))].slice(0, 4);

    console.log("Pages selected:");

pagesToVisit.forEach((page, i) => {
  console.log(`${i + 1}. ${page}`);
});

    // -------------------------
    // CRAWL PAGES
    // -------------------------
    const pageTexts: string[] = [];

for (const link of pagesToVisit) {
  const newPage = await browser.newPage();

  try {
    await newPage.setRequestInterception(true);

    newPage.on("request", (request) => {
      const type = request.resourceType();

      if (
        type === "image" ||
        type === "font" ||
        type === "media" ||
        type === "stylesheet"
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log("Crawling:", link);

    await newPage.goto(link, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    const text = await newPage.evaluate(() => {
      const selectors = [
        "main",
        "article",
        "section",
        "[role='main']",
      ];

      let pageText = "";

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          pageText += " " + (el.textContent || "");
        });
      });

      if (pageText.trim().length < 300) {
        pageText = document.body.innerText;
      }

      return pageText;
    });

    pageTexts.push(text);
  } catch (err) {
    console.log("Skipped:", link);
  } finally {
    await newPage.close();
  }
}

    combinedText += "\n\n" + pageTexts.join("\n\n");

    await page.close();

    return combinedText
      .replace(/\s+/g, " ")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/Learn more/gi, "")
      .replace(/Buy/gi, "")
      .replace(/Privacy/gi, "")
      .replace(/Cookie/gi, "")
      .replace(/Cookies/gi, "")
      .replace(/Terms of Use/gi, "")
      .replace(/All rights reserved/gi, "")
      .replace(/Copyright/gi, "")
      .trim()
      .slice(0, 30000);
  } finally {
    await browser.close();
  }
}