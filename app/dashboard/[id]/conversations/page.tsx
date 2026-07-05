"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ConversationsPage() {
  const params = useParams();

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `/api/analytics/${params.id}`
      );

      const data = await res.json();

      if (data.success) {
        setChats(data.analytics.recentChats);
      }

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="p-10">
        Loading...
      </main>
    );
  }

  return (
<div className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Conversations
      </h1>

      <div className="space-y-6">

        {chats.map((chat) => (

          <div
            key={chat.id}
            className="bg-white rounded-xl shadow p-6"
          >

            <div className="text-sm text-gray-500">
              Visitor
            </div>

            <div className="font-mono">
              {chat.visitor_id}
            </div>

            <div className="mt-5">

              <h3 className="font-bold">
                User
              </h3>

              <div className="bg-blue-100 rounded p-3 mt-2">
                {chat.question}
              </div>

            </div>

            <div className="mt-5">

              <h3 className="font-bold">
                AI
              </h3>

              <div className="bg-gray-100 rounded p-3 mt-2 whitespace-pre-wrap">
                {chat.answer}
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}