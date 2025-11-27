"use client";

import { createContext, useContext } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface ToastContextType {
  addToast: (msg: Omit<ToastMessage, "id">) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}
