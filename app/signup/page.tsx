"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "../../lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function signup() {
    setLoading(true);

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully!");

    router.push("/login");
  }

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">

        <h1 className="text-3xl font-bold mb-6">
          Create Account
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded w-full mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded w-full mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signup}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-3 rounded-lg"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

      </div>

    </main>
  );
}