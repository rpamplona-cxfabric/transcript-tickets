"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Dialog } from "@/components/dialog";
import { createPhoneNumber } from "@/lib/api/phoneNumbers";
import { usePhoneNumbersStore } from "@/lib/store/phoneNumbers";

export const GeneratePhoneNumberDialog = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const loadPhoneNumbers = usePhoneNumbersStore(
    (state) => state.loadPhoneNumbers,
  );

  const generateMutation = useMutation({
    mutationFn: createPhoneNumber,
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error("Unable to generate phone number.");
        return;
      }
      toast.success(`Phone number ${result.phoneNumber} created successfully!`);

      await loadPhoneNumbers();
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate phone number.");
    },
  });

  const isPending = generateMutation.isPending;

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  return (
    <Dialog title="Generate Phone Number" onClose={onClose}>
      <div className="space-y-5 pt-5">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Are you sure you want to generate a new phone number? This will create
          a new Twilio phone number for your workspace.
        </p>
        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-[#4056a1] dark:text-[#f5f7ff] dark:hover:bg-[#4a63b8]"
          >
            {isPending ? "Generating…" : "Generate Phone Number"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
