"use client";

import { Dialog } from "@/components/dialog";
import type { PhoneNumber } from "./client/hook";

export const RemoveDialog = ({
  phoneNumber,
  onClose,
  onConfirm,
}: {
  phoneNumber: PhoneNumber;
  onClose: () => void;
  onConfirm: (phoneNumber: string) => void;
}) => {
  const handleRemove = () => {
    onConfirm(phoneNumber.phoneNumber);
    onClose();
  };

  return (
    <Dialog title="Remove phone number" onClose={onClose}>
      <div className="space-y-5 pt-5">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Are you sure you want to remove{" "}
          <strong className="text-zinc-900 dark:text-white">
            {phoneNumber.phoneNumber}
          </strong>
          ?
        </p>
        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Remove phone number
          </button>
        </div>
      </div>
    </Dialog>
  );
};
