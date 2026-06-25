"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Website {
  id: string;
  website_url: string;
  industry: string;
  business_type: string;
  bot_name: string;
  created_at: string;
}

export default function Dashboard() {
const [websites, setWebsites] = useState<Website[]>([]);
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/websites");
      const data = await res.json();

      if (data.success) {
        setWebsites(data.websites);
      }
    }

    load();
  }, []);

  return (
    <main className="p-10">

      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid gap-5">

        {websites.map((site) => (

          <div
            key={site.id}
            className="border rounded-lg p-5 shadow"
          >
            <h2 className="font-bold text-xl">
              {site.website_url}
            </h2>

            <p className="mt-2">
              Industry:
              {" "}
              {site.industry}
            </p>

            <p>
              Business:
              {" "}
              {site.business_type}
            </p>

            <p>
              Bot:
              {" "}
              {site.bot_name}
            </p>
            

            <p className="text-gray-500 mt-2">
              {new Date(site.created_at).toLocaleString()}
            </p>
            <Link
              href={`/dashboard/${site.id}`}
              className="inline-block mt-5 bg-black text-white px-5 py-2 rounded"
            >
              View Details
            </Link>

          </div>

        ))}

      </div>

    </main>
  );
}