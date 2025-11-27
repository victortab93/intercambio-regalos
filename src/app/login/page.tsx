// src/app/login/page.tsx
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-magenta-50">
      <AuthForm mode="login" />
    </div>
  );
}
