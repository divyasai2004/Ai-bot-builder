"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signUp() {
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

    alert("Account created! Please verify your email.");
  }

  async function signIn() {
    setLoading(true);

    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950">

      <div className="bg-zinc-900 p-8 rounded-xl w-[400px]">

        <h1 className="text-3xl text-white font-bold mb-6">
          AI Bot Builder
        </h1>

        <input
          placeholder="Email"
          className="w-full p-3 rounded bg-zinc-800 text-white mb-4"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <div className="relative mb-6">
  <input
    placeholder="Password"
    type={showPassword ? "text" : "password"}
    className="w-full p-3 pr-12 rounded bg-zinc-800 text-white"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

        <button
          onClick={signIn}
          className="w-full bg-blue-600 text-white py-3 rounded mb-3"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <button
          onClick={signUp}
          className="w-full border border-zinc-600 text-white py-3 rounded"
        >
          Create Account
        </button>

      </div>

    </main>
  );
}