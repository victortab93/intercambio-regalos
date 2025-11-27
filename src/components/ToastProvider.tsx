"use client";

import { useState, ReactNode } from "react";
import { ToastContext, ToastMessage } from "./useToast";
import ToastContainer from "./ToastContainer";
import { randomId } from "@/lib/utils";

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function addToast(msg: Omit<ToastMessage, "id">) {
    const id = randomId(8);
    const toast = { ...msg, id };

    setToasts((prev) => [...prev, toast]);

    // Auto-hide at 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}
