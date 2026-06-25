"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";

interface ChatWidgetProps {
  botName: string;
  messages: {
    sender: string;
    text: string;
  }[];
  onSendMessage: (message: string) => void;
}

export default function ChatWidget({
  botName,
  messages,
  onSendMessage,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState("");

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;

    onSendMessage(input);
    setInput("");
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl text-xl"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-96 h-[550px] bg-zinc-900 text-white border border-zinc-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="bg-black px-4 py-3 flex justify-between items-center border-b border-zinc-700">
        <span className="font-semibold">
          💬 {botName}
        </span>

        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-700 p-3 flex gap-2 bg-zinc-900">
        <input
          type="text"
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder="Ask anything..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}