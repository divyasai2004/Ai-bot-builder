export function generateBotConfig(
  websiteAnalysis: string
) {
  let analysis = "";

try {
  const parsed = JSON.parse(websiteAnalysis);

  analysis = JSON.stringify(parsed).toLowerCase();
} catch {
  analysis = websiteAnalysis.toLowerCase();
}

  let botName = "Website Assistant";

  let questions = [
    "Tell me about your products",
    "What services do you offer?",
    "How can I contact you?"
  ];

  if (
  analysis.includes("apple") ||
  analysis.includes("iphone") ||
  analysis.includes("airpods")||
  analysis.includes("technology") ||
  analysis.includes("electronics")
) {
    botName = "Apple Sales Assistant";

    questions = [
      "Tell me about your products",
      "Compare products",
      "Latest releases"
    ];
  }

  if (
    analysis.includes("healthcare") ||
    analysis.includes("hospital") ||
    analysis.includes("doctor")
  ) {
    botName = "Healthcare Assistant";

    questions = [
      "Book appointment",
      "Doctor information",
      "Hospital timings"
    ];
  }

  if (
    analysis.includes("restaurant") ||
    analysis.includes("food") ||
    analysis.includes("menu")
  ) {
    botName = "Restaurant Assistant";

    questions = [
      "View menu",
      "Book table",
      "Opening hours"
    ];
  }

  return {
    botName,
    welcomeMessage:
      `Hi! I'm ${botName}. How can I help you today?`,
    theme: "dark",
    suggestedQuestions: questions,
  };
}