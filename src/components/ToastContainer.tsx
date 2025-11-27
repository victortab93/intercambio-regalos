"use client";

import { ToastMessage } from "./useToast";

export default function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="
      fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs
      z-50 flex flex-col space-y-2 px-4
    ">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-white text-sm
            animate-slide-up
            ${toast.type === "success" ? "bg-green-600" : ""}
            ${toast.type === "error" ? "bg-red-500" : ""}
            ${toast.type === "info" ? "bg-blue-500" : ""}
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
