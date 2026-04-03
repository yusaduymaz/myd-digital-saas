"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm
            text-zinc-900 placeholder:text-zinc-400
            transition-colors duration-200
            focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20
            disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60
            dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100
            dark:placeholder:text-zinc-500 dark:focus:border-zinc-500
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
