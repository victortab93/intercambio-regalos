// src/app/signup/page.tsx

import { Suspense } from "react";
import { AuthFormWrapper } from "@/components/AuthFormWrapper";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-magenta-50">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthFormWrapper mode="signup" />
      </Suspense>
    </div>
  );
}
