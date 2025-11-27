// src/components/ui/Button.tsx
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-xl text-sm font-medium transition border',
        'disabled:opacity-50 disabled:cursor-not-allowed',

        variant === 'primary' &&
          'bg-fuchsia-600 border-fuchsia-500 text-white hover:bg-fuchsia-700',

        variant === 'secondary' &&
          'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700',

        variant === 'danger' &&
          'bg-red-600 border-red-500 text-white hover:bg-red-700',

        className
      )}
    >
      {children}
    </button>
  );
}
