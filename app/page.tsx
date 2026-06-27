"use client";

import { useState } from "react";
import ChatWidget from "../components/ChatWidget";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [widgetCode, setWidgetCode] = useState("");
  const [websiteContent, setWebsiteContent] = useState("");
  const [botConfig, setBotConfig] = useState<any>(null);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<
  { sender: string; text: string }[]
>([
    {
      sender: "bot",
      text: "Hi! How can I help you today?",
    },
  ]);
  const [products, setProducts] = useState<string[]>([]);
const [websiteId, setWebsiteId] = useState("");

const [chatHistory, setChatHistory] = useState<
  { role: string; content: string }[]
>([]);

const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function analyzeWebsite() {
    try {
      setResult("Analyzing...");
      setBotConfig(null);
      setWidgetCode("");
      setProducts([]);
      setIsAnalyzing(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (data.cached) {
  console.log("Loaded from cache");
}

      if (data.success) {
        setResult(data.analysis);
        setBotConfig(data.botConfig);
        setWidgetCode(data.widgetCode);
        setWebsiteContent(data.websiteContent);
        setProducts(data.products || []);
        setWebsiteId(data.websiteId);
        setChatHistory([]);
        setMessages([
          {
            sender: "bot",
            text:
              data.botConfig?.welcomeMessage ||
              "Hi! How can I help you today?",
          },
        ]);
      } else {
        setResult(data.error);
      }
    } catch (error) {
      console.error(error);
      setResult("Something went wrong");
    }
  }
async function handleSend() {
  if (!userInput.trim()) return;

  await sendQuestion(userInput);

  setUserInput("");
}
  async function sendQuestion(question: string) {
  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: question,
    },
  ]);

  setIsTyping(true);

  // Keep history before current question
  const history = [...chatHistory];

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        websiteId,
        history,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: data.answer,
      },
    ]);

    // Save conversation
    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
      {
        role: "assistant",
        content: data.answer,
      },
    ]);
  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Sorry, I couldn't process your request.",
      },
    ]);
  } finally {
    setIsTyping(false);
    setIsAnalyzing(false);
  }
}

  function copyWidgetCode() {
    navigator.clipboard.writeText(widgetCode);
    alert("Widget code copied!");
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">
        AI Website Bot Builder
      </h1>

      <p className="mt-4">
        Enter your website URL and generate an AI chatbot.
      </p>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="border p-3 mt-5 w-full rounded"
      />

      <button
  onClick={analyzeWebsite}
  disabled={isAnalyzing}
  className="bg-black text-white px-5 py-3 mt-4 rounded disabled:opacity-50"
>
  {isAnalyzing ? "Analyzing..." : "Analyze Website"}
</button>

      {result && (
        <div className="mt-8 border p-4 rounded">
          <h2 className="font-bold text-xl mb-2">
            Website Analysis
          </h2>

          <pre className="whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}

      {products.length > 0 && (
  <div className="mt-6 border p-4 rounded shadow">
    <h2 className="font-bold text-xl mb-3">
      Products Found
    </h2>

    <div className="flex flex-wrap gap-2">
      {products.map((product) => (
        <span
          key={product}
          className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full"
        >
          {product}
        </span>
      ))}
    </div>
  </div>
)}

      {botConfig && (
        <div className="mt-10 border p-5 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">
            Generated Chatbot
          </h2>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-lg">
              {botConfig.botName}
            </h3>

            <p className="mt-2">
              {botConfig.welcomeMessage}
            </p>

            <div className="mt-6 border rounded p-3 h-64 overflow-y-auto bg-white">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.sender === "user"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <span className="inline-block border px-3 py-2 rounded">
                    {msg.text}
                  </span>
                </div>
              ))}

              {isTyping && (
  <div className="text-left">
    <span className="inline-block border px-3 py-2 rounded bg-gray-100 text-gray-500">
      Bot is typing...
    </span>
  </div>
)}

            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {botConfig.suggestedQuestions.map(
                (question: string) => (
                  <button
                    key={question}
                    onClick={() =>
                      sendQuestion(question)
                    }
                    className="border px-3 py-2 rounded bg-white hover:bg-gray-100"
                  >
                    {question}
                  </button>
                )
              )}
            </div>

            <div className="mt-4 flex gap-2">
  <input
    type="text"
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    placeholder="Ask anything..."
    className="border p-2 flex-1 rounded"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    }}
  />

  <button
  onClick={handleSend}
  disabled={isTyping}
  className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
>
  {isTyping ? "Sending..." : "Send"}
</button>
</div>
          </div>
        </div>
      )}

      {widgetCode && (
        <div className="mt-10 border p-5 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">
            Install Widget Code
          </h2>

          <textarea
            readOnly
            value={widgetCode}
            className="w-full h-56 border p-3 rounded font-mono text-sm"
          />

          <button
            onClick={copyWidgetCode}
            className="bg-green-600 text-white px-5 py-2 mt-4 rounded"
          >
            Copy Widget Code
          </button>
        </div>
      )}
      {
  botConfig && (
    <ChatWidget
  botName={botConfig.botName}
  messages={messages}
  onSendMessage={sendQuestion}
/>
  )
}
    </main>
  );
}