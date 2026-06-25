export function generateWidgetCode(botConfig: any) {
  return `
<script>
window.AIBotConfig = {
  botName: "${botConfig.botName}",
  welcomeMessage: "${botConfig.welcomeMessage}",
  suggestedQuestions: ${JSON.stringify(
    botConfig.suggestedQuestions
  )}
};

console.log("AI Bot Loaded");
console.log(window.AIBotConfig);
</script>
`;
}