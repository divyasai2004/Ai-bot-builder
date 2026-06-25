import ollama from "ollama";

export async function analyzeBusiness(content: string) {
const prompt = `
You are a business analyst.

Return ONLY valid JSON.

Industry MUST be one of:

Technology
Healthcare
Education
Finance
Restaurant
Ecommerce
Travel
RealEstate

Business Type examples:

Technology → Consumer Electronics, SaaS, Software Company
Healthcare → Hospital, Clinic
Education → School, University
Ecommerce → Online Store

Recommended Bot MUST be one of:

Sales Assistant
Support Assistant
Booking Assistant
Lead Generation Assistant

Return ONLY JSON.

{
  "industry":"",
  "businessType":"",
  "recommendedBot":"",
  "features":[]
}

Website Content:

${content}
`;

  const response = await ollama.chat({
    model: "qwen2.5:1.5b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.message.content;
}