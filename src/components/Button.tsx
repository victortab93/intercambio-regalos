// src/components/Button.tsx
import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = ({ children, loading, className = "", ...props }: Props) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        px-4 py-2 rounded-md font-medium
        text-white bg-[#0f62fe]
        hover:bg-[#0d55d8]
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all
        ${className}
      `}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
