import puppeteer, {
  Browser,
  Page,
} from "puppeteer";

import { rankLinks } from "./linkRanker";

/*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
*/

const BLOCKED_RESOURCE_TYPES = new Set([
  "image",
  "font",
  "media",
]);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/131.0.0.0 Safari/537.36";

/*
|--------------------------------------------------------------------------
| PAGE SETUP
|--------------------------------------------------------------------------
*/

async function configurePage(page: Page) {
  await page.setUserAgent(USER_AGENT);

  await page.setViewport({
    width: 1366,
    height: 768,
  });

  await page.setExtraHTTPHeaders({
    "Accept-Language":
      "en-US,en;q=0.9",
  });

  await page.setRequestInterception(true);

  page.on("request", (request) => {
    const type = request.resourceType();

    if (BLOCKED_RESOURCE_TYPES.has(type)) {
      request.abort();
    } else {
      request.continue();
    }
  });
}

/*
|--------------------------------------------------------------------------
| SAFE NAVIGATION
|--------------------------------------------------------------------------
*/

async function safeGoto(
  page: Page,
  url: string
) {
  const attempts = [
    {
      waitUntil:
        "domcontentloaded" as const,
      timeout: 30000,
    },
    {
      waitUntil:
        "load" as const,
      timeout: 30000,
    },
  ];

  let lastError: unknown = null;

  for (let i = 0; i < attempts.length; i++) {
    try {
      console.log(
        `Navigation attempt ${i + 1}: ${url}`
      );

      const response = await page.goto(
        url,
        attempts[i]
      );

      console.log(
        "Response status:",
        response?.status()
      );

      return true;
    } catch (error) {
      lastError = error;

      console.error(
        `Navigation attempt ${i + 1} failed:`,
        error
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
    }
  }

  console.error(
    "All navigation attempts failed:",
    lastError
  );

  return false;
}

/*
|--------------------------------------------------------------------------
| EXTRACT PAGE TEXT
|--------------------------------------------------------------------------
*/

async function extractPageText(
  page: Page
): Promise<string> {
  return await page.evaluate(() => {
    const unwantedSelectors = [
      "script",
      "style",
      "noscript",
      "svg",
      "iframe",
      "nav",
      "footer",
    ];

    unwantedSelectors.forEach(
      (selector) => {
        document
          .querySelectorAll(selector)
          .forEach((element) =>
            element.remove()
          );
      }
    );

    const selectors = [
      "main",
      "article",
      "[role='main']",
      "section",
    ];

    let pageText = "";

    selectors.forEach((selector) => {
      document
        .querySelectorAll(selector)
        .forEach((element) => {
          pageText +=
            " " +
            (element.textContent || "");
        });
    });

    if (pageText.trim().length < 300) {
      pageText =
        document.body?.innerText || "";
    }

    return pageText;
  });
}

/*
|--------------------------------------------------------------------------
| EXTRACT INTERNAL LINKS
|--------------------------------------------------------------------------
*/

async function extractInternalLinks(
  page: Page
): Promise<string[]> {
  return await page.evaluate(() => {
    const origin = location.origin;

    return Array.from(
      document.querySelectorAll("a[href]")
    )
      .map(
        (anchor) =>
          (anchor as HTMLAnchorElement).href
      )
      .filter((href) => {
        try {
          const parsedUrl =
            new URL(href);

          return (
            parsedUrl.origin === origin &&
            parsedUrl.protocol.startsWith("http")
          );
        } catch {
          return false;
        }
      });
  });
}

/*
|--------------------------------------------------------------------------
| CRAWL SINGLE INTERNAL PAGE
|--------------------------------------------------------------------------
*/

async function crawlInternalPage(
  browser: Browser,
  link: string
): Promise<string> {
  const page = await browser.newPage();

  try {
    await configurePage(page);

    console.log("Crawling:", link);

    const success = await safeGoto(
      page,
      link
    );

    if (!success) {
      console.log(
        "Skipped after navigation failure:",
        link
      );

      return "";
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    const text =
      await extractPageText(page);

    console.log(
      `Extracted ${text.length} characters from ${link}`
    );

    return text;
  } catch (error) {
    console.error(
      "Internal page crawl failed:",
      link,
      error
    );

    return "";
  } finally {
    await page.close();
  }
}

/*
|--------------------------------------------------------------------------
| MAIN CRAWLER
|--------------------------------------------------------------------------
*/

export async function crawlWebsite(
  url: string
) {
  console.log(
    "========== CRAWLING WEBSITE =========="
  );

  console.log("URL:", url);

  const browser = await puppeteer.launch({
    headless: true,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",

      /*
      Important for some websites that produce
      HTTP/2 protocol problems in automated Chromium.
      */

      "--disable-http2",
    ],
  });

  try {
    /*
    |--------------------------------------------------------------------------
    | HOMEPAGE
    |--------------------------------------------------------------------------
    */

    const page = await browser.newPage();

    try {
      await configurePage(page);

      const navigationSuccess =
        await safeGoto(page, url);

      if (!navigationSuccess) {
        throw new Error(
          `Unable to open website: ${url}`
        );
      }

      /*
      Give React / Next.js / SPA websites
      some time to render client-side content.
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      /*
      |--------------------------------------------------------------------------
      | HOMEPAGE TEXT
      |--------------------------------------------------------------------------
      */

      let combinedText =
        await extractPageText(page);

      console.log(
        "Homepage characters:",
        combinedText.length
      );

      /*
      |--------------------------------------------------------------------------
      | INTERNAL LINKS
      |--------------------------------------------------------------------------
      */

      const links =
        await extractInternalLinks(page);

      console.log(
        "Internal links found:",
        links.length
      );

      const uniqueLinks = [
        ...new Set(links),
      ];

      const rankedLinks =
        rankLinks(uniqueLinks);

      const pagesToVisit =
        rankedLinks
          .filter((link) => link !== url)
          .slice(0, 4);

      console.log(
        "Pages selected:"
      );

      pagesToVisit.forEach(
        (selectedPage, index) => {
          console.log(
            `${index + 1}. ${selectedPage}`
          );
        }
      );

      /*
      |--------------------------------------------------------------------------
      | CRAWL INTERNAL PAGES
      |--------------------------------------------------------------------------
      */

      const pageTexts: string[] = [];

      for (const link of pagesToVisit) {
        const text =
          await crawlInternalPage(
            browser,
            link
          );

        if (text.trim()) {
          pageTexts.push(text);
        }
      }

      /*
      |--------------------------------------------------------------------------
      | COMBINE CONTENT
      |--------------------------------------------------------------------------
      */

      combinedText +=
        "\n\n" +
        pageTexts.join("\n\n");

      /*
      |--------------------------------------------------------------------------
      | CLEAN FINAL OUTPUT
      |--------------------------------------------------------------------------
      */

      const cleanedText = combinedText
        .replace(/\s+/g, " ")

        /*
        Do not remove all non-ASCII characters.

        Your previous:
        .replace(/[^\x20-\x7E]/g, "")

        would remove Hindi and other Unicode content.
        */

        .replace(/Learn more/gi, "")
        .replace(/\bBuy\b/gi, "")
        .replace(/Privacy Policy/gi, "")
        .replace(/Cookie Policy/gi, "")
        .replace(/Cookies/gi, "")
        .replace(/Terms of Use/gi, "")
        .replace(/All rights reserved/gi, "")
        .replace(/Copyright/gi, "")
        .trim()
        .slice(0, 30000);

      console.log(
        "Final crawled characters:",
        cleanedText.length
      );

      if (cleanedText.length < 100) {
        throw new Error(
          "Website loaded but insufficient readable content was extracted."
        );
      }

      return cleanedText;
    } finally {
      await page.close();
    }
  } finally {
    await browser.close();
  }
}