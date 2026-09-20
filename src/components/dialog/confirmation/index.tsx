"use client";

import type { ReactNode } from "react";
import { Dialog } from "..";

interface ConfirmationDialogProps {
  confirmLabel: string;
  isPending: boolean;
  message: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export const ActionConfirmationDialog = ({
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm,
  isPending,
}: ConfirmationDialogProps) => (
  <Dialog title={title} onClose={onClose}>
    <div className="space-y-5 pt-5">
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {message}
      </p>
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-[#4056a1] dark:text-[#f5f7ff]"
        >
          {isPending ? "Working…" : confirmLabel}
        </button>
      </div>
    </div>
  </Dialog>
);
