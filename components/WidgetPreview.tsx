"use client";

interface WidgetPreviewProps {
  botName: string;
  welcomeMessage: string;
  logoUrl?: string;
  theme?: string;
  primaryColor?: string;
  headerColor?: string;
  widgetWidth?: number;
  borderRadius?: number;
}

export default function WidgetPreview({
  botName,
  welcomeMessage,
  logoUrl,
  theme = "light",
  primaryColor = "#2563eb",
  headerColor = "#2563eb",
  widgetWidth = 350,
  borderRadius = 12,
}: WidgetPreviewProps) {
  const isDark = theme === "dark";

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-2">
        Live Widget Preview
      </h2>

      <p className="text-gray-500 mb-5">
        Changes appear here before saving.
      </p>

      <div className="bg-gray-100 rounded-xl p-6 overflow-x-auto">
        <div
          style={{
            width: `${Math.min(widgetWidth, 420)}px`,
            maxWidth: "100%",
            borderRadius: `${borderRadius}px`,
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            color: isDark ? "#ffffff" : "#111827",
            overflow: "hidden",
            boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
          }}
        >
          {/* Header */}

          <div
            style={{
              background: `linear-gradient(135deg, ${headerColor}, ${primaryColor})`,
            }}
            className="text-white px-4 py-4 flex items-center gap-3"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Bot logo"
                className="w-10 h-10 rounded-full object-cover bg-white"
              />
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
            )}

            <div>
              <p className="font-semibold">
                {botName || "AI Assistant"}
              </p>

              <p className="text-xs opacity-80">
                Online
              </p>
            </div>

            <span className="ml-auto text-xl">
              ×
            </span>
          </div>

          {/* Chat Area */}

          <div
            className="p-4 h-[300px]"
            style={{
              backgroundColor: isDark
                ? "#09090b"
                : "#ffffff",
            }}
          >
            <div
              className="inline-block px-4 py-3 max-w-[85%]"
              style={{
                backgroundColor: isDark
                  ? "#27272a"
                  : "#f1f5f9",

                color: isDark
                  ? "#ffffff"
                  : "#111827",

                borderRadius: `${Math.min(
                  borderRadius,
                  18
                )}px`,
              }}
            >
              {welcomeMessage ||
                "Hi! How can I help you today?"}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="text-xs px-3 py-2 border rounded-full"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                Tell me about your products
              </button>

              <button
                className="text-xs px-3 py-2 border rounded-full"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                How can you help me?
              </button>
            </div>
          </div>

          {/* Input Area */}

          <div
            className="p-3 flex gap-2 border-t"
            style={{
              backgroundColor: isDark
                ? "#18181b"
                : "#ffffff",

              borderColor: isDark
                ? "#3f3f46"
                : "#e5e7eb",
            }}
          >
            <input
              disabled
              placeholder="Ask anything..."
              className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm bg-transparent"
            />

            <button
              style={{
                backgroundColor: primaryColor,
              }}
              className="text-white px-4 py-2 rounded-lg text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}