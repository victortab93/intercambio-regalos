// src/app/signup/page.tsx
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-magenta-50">
      <AuthForm mode="signup" />
    </div>
  );
}
