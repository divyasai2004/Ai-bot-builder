"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function KnowledgePage() {
  const params = useParams();

  const websiteId = params.id as string;

  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadFiles() {
    const res = await fetch(`/api/knowledge/${websiteId}`);
    const data = await res.json();

    if (data.success) {
      setFiles(data.files);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function uploadFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");

    const form = new FormData();

    form.append("file", file);
    form.append("websiteId", websiteId);

    const res = await fetch("/api/knowledge/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (data.success) {
      setMessage(
        `✅ ${data.fileName} uploaded successfully.`
      );

      loadFiles();
    } else {
      setMessage(data.error);
    }

    setUploading(false);
  }

  async function deleteFile(fileName: string) {
  if (!confirm(`Delete "${fileName}"?`)) return;

  const res = await fetch("/api/knowledge/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      websiteId,
      fileName,
    }),
  });

  const data = await res.json();

  if (data.success) {
    loadFiles();
  } else {
    alert(data.error);
  }
}

  return (
    <main className="p-10">

      <h1 className="text-4xl font-bold mb-8">
        Knowledge Base
      </h1>

      <div className="bg-white rounded-xl shadow p-6">

        <input
          type="file"
          onChange={uploadFile}
        />

        {uploading && (
          <p className="mt-4">Uploading...</p>
        )}

        {message && (
          <p className="mt-4">{message}</p>
        )}

      </div>

      <div className="bg-white rounded-xl shadow mt-10 p-6">

        <h2 className="text-2xl font-bold mb-5">
          Uploaded Documents
        </h2>

        <table className="w-full border">

          <thead>

            <tr className="bg-gray-100">

              <th className="p-3 text-left">
                File
              </th>

              <th className="p-3">
                Chunks
              </th>

              <th className="p-3">
                Uploaded
              </th>
              <th className="p-3">
  Action
</th>

            </tr>

          </thead>

          <tbody>

            {files.map((file) => (

              <tr
                key={file.fileName}
                className="border-t"
              >

                <td className="p-3">
                  {file.fileName === "__website__"
                    ? "🌐 Website Crawl"
                    : file.fileName || "Unknown"}
                </td>

                <td className="text-center">
                  {file.chunks}
                </td>

                <td className="text-center">
                  {new Date(
                    file.uploadedAt
                  ).toLocaleString()}
                </td>
                <td className="text-center">

  {file.fileName === "__website__" ? (

    <span className="text-gray-500">
      Protected
    </span>

  ) : (

    <button
      onClick={() => deleteFile(file.fileName)}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
    >
      Delete
    </button>

  )}

</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}