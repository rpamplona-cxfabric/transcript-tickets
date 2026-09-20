"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DialogProps {
  children: ReactNode;
  className?: string;
  onClose: () => void;
  size?: "default" | "wide" | "medium";
  title?: string;
}

export const Dialog = ({
  children,
  className = "",
  onClose,
  size = "default",
  title,
}: DialogProps) => {
  const maxWidth =
    size === "wide" ? "max-w-xl" : size === "medium" ? "max-w-md" : "max-w-lg";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={`app-surface app-shadow-surface w-full ${maxWidth} rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 sm:p-6 ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-black dark:hover:text-white"
              aria-label={`Close ${title}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </section>
    </div>,
    document.body,
  );
};
