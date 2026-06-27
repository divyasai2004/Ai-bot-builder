import { NextResponse } from "next/server";
import { crawlWebsite } from "../../../lib/crawler";
import { analyzeBusiness } from "../../../lib/analyzer";
import { generateBotConfig } from "../../../lib/botGenerator";
import { generateWidgetCode } from "../../../lib/widgetGenerator";
import { extractProducts } from "../../../lib/extractProducts";
import { chunkText } from "../../../lib/chunkText";
import { parseAnalysis } from "../../../lib/analysisParser";
import { getWebsite, saveWebsite } from "../../../lib/websiteService";
import { saveChunks } from "../../../lib/vectorStore";
import { cleanWebsite } from "../../../lib/cleanWebsite";
import { cleanContent } from "../../../lib/contentCleaner";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if website already exists
    const existingWebsite = await getWebsite(body.url);

    if (existingWebsite) {
      console.log("Website already analyzed.");

      const cachedBotConfig = generateBotConfig(
        JSON.stringify(existingWebsite.analysis_json)
      );

      const cachedWidgetCode =
        generateWidgetCode(cachedBotConfig);

     return NextResponse.json({
  success: true,

  websiteId: existingWebsite.id,

  analysis: JSON.stringify(
    existingWebsite.analysis_json,
    null,
    2
  ),

  botConfig: cachedBotConfig,

  widgetCode: cachedWidgetCode,

  websiteContent: existingWebsite.website_content,

  products: existingWebsite.products,

  cached: true,
});
    }

    // Crawl website
   const content = await crawlWebsite(body.url);

const cleanedContent = cleanContent(
  cleanWebsite(content)
);
const shortContent = cleanedContent.slice(0, 15000);
    // Analyze
    const analysis = await analyzeBusiness(shortContent);

    const botConfig = generateBotConfig(analysis);

    const widgetCode = generateWidgetCode(botConfig);

    const products = extractProducts(shortContent);

    // Future RAG
    const chunks = chunkText(shortContent);

    console.log("========== ANALYSIS ==========");
    console.log(analysis);

    console.log("Chunks:");
    console.log(chunks.length);
    console.log(chunks);
    chunks.forEach((chunk, index) => {
  console.log(
    `Chunk ${index + 1}: ${chunk.length} chars`
  );
});        

    // Parse analysis JSON
    const parsedAnalysis = parseAnalysis(analysis);

    // Save to Supabase
    const website = await saveWebsite({
  website_url: body.url,
  industry: parsedAnalysis.industry || "",
  business_type: parsedAnalysis.businessType || "",
  bot_name: botConfig.botName,
  website_content: shortContent,
  analysis_json: parsedAnalysis,
  products,
});
await saveChunks(
  website.id,
  chunks
);

    return NextResponse.json({
  success: true,

  websiteId: website.id,

  analysis,

  websiteAnalysis: analysis,

  botConfig,

  widgetCode,

  websiteContent: shortContent,

  products,

  cached: false,
});
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: "Analysis failed",
    });
  }
}