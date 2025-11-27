"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "./Input";
import { Button } from "./Button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const search = useSearchParams();

  const invite = search.get("invite") || undefined;
  const redirectTo = search.get("redirect") || "/exchanges";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";

    const res = await fetch(invite ? `${endpoint}?invite=${invite}` : endpoint, {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Error");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  }

  async function handleGoogle() {
    const params = new URLSearchParams();
    if (invite) params.set("invite", invite);
    if (redirectTo) params.set("redirect", redirectTo);

    const res = await fetch(`/api/auth/google/url?${params.toString()}`);
    const data = await res.json();

    if (data.ok && data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-xl rounded-xl p-8 space-y-6 border border-gray-200 w-full max-w-md"
    >
      <h1 className="text-2xl font-bold text-center text-magenta-600">
        {mode === "login" ? "Login" : "Create an Account"}
      </h1>

      {mode === "signup" && (
        <Input
          label="Name"
          type="text"
          placeholder="Your name"
          required
          value={form.name}
          onChange={(e) => setField("name", e.currentTarget.value)}
        />
      )}

      <Input
        label="Email"
        type="email"
        placeholder="email@example.com"
        required
        value={form.email}
        onChange={(e) => setField("email", e.currentTarget.value)}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        value={form.password}
        onChange={(e) => setField("password", e.currentTarget.value)}
      />

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {mode === "login" ? "Login" : "Sign up"}
      </Button>

      <Button
        type="button"
        onClick={handleGoogle}
        className="w-full bg-red-500 hover:bg-red-600"
      >
        Continue with Google
      </Button>

      {mode === "login" ? (
        <p className="text-center text-sm text-gray-700">
          Don't have an account?{" "}
          <a href="/signup" className="text-magenta-600 font-medium">
            Sign up here
          </a>
        </p>
      ) : (
        <p className="text-center text-sm text-gray-700">
          Already have an account?{" "}
          <a href="/login" className="text-magenta-600 font-medium">
            Login here
          </a>
        </p>
      )}
    </form>
  );
}
