"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AnalyticsPage() {
  const params = useParams();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      const res = await fetch(
        `/api/analytics/${params.id}`
      );

      const data = await res.json();

      if (data.success) {
        setAnalytics(data.analytics);
      }

      setLoading(false);
    }

    loadAnalytics();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <h2 className="text-3xl font-bold">
          Loading Analytics...
        </h2>
      </main>
    );
  }

  return (
<div className="p-10">
      <h1 className="text-4xl font-bold mb-10">
        Analytics Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">
            Visitors
          </h3>

          <p className="text-5xl font-bold mt-3">
            {analytics.totalVisitors}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">
            Messages
          </h3>

          <p className="text-5xl font-bold mt-3">
            {analytics.totalMessages}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">
            Conversations
          </h3>

          <p className="text-5xl font-bold mt-3">
            {analytics.totalConversations}
          </p>
        </div>

      </div>

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Recent Chats
        </h2>

        <div className="space-y-5">

          {analytics.recentChats.map((chat: any) => (

            <div
              key={chat.id}
              className="bg-white rounded-xl shadow p-5"
            >

              <p>
                <b>Visitor:</b> {chat.visitor_id}
              </p>

              <p className="mt-3">
                <b>Question</b>
              </p>

              <div className="bg-gray-100 p-3 rounded mt-1">
                {chat.question}
              </div>

              <p className="mt-4">
                <b>Answer</b>
              </p>

              <div className="bg-blue-50 p-3 rounded mt-1 whitespace-pre-wrap">
                {chat.answer}
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}