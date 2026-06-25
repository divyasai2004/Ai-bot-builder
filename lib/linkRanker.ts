const priorityKeywords = [
  "iphone",
  "mac",
  "ipad",
  "watch",
  "airpods",
  "vision",
  "store",
  "support",
  "developer",
];

export function rankLinks(links: string[]) {
  return [...new Set(links)]
    .map((link) => {
      let score = 0;

      priorityKeywords.forEach((keyword) => {
        if (link.toLowerCase().includes(keyword)) {
          score += 10;
        }
      });

      if (link.includes("/shop/goto")) score -= 20;
      if (link.includes("privacy")) score -= 20;
      if (link.includes("legal")) score -= 20;
      if (link.includes("newsroom")) score -= 10;
      if (link.includes("#")) score -= 5;

      return { link, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.link);
}