export function parseAnalysis(analysis: string) {
  try {
    const clean = analysis
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(clean);
  } catch {
    return {
      industry: "",
      businessType: "",
      recommendedBot: "",
      features: [],
    };
  }
}