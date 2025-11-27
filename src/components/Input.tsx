// src/components/Input.tsx
import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, className = "", ...props }: Props) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`
          border border-gray-300 rounded-md px-3 py-2
          focus:ring-2 focus:ring-magenta-500 focus:border-magenta-500
          outline-none transition-all
          ${className}
        `}
      />
    </div>
  );
};
