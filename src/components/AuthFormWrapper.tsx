"use client";

import { AuthForm } from "./AuthForm";

export function AuthFormWrapper({ mode }: { mode: "login" | "signup" }) {
  return <AuthForm mode={mode} />;
}
