"use client";

import { Dialog } from "@/components/dialog";
import { Select } from "@/components/select";
import type { PhoneNumber } from "@/lib/api/phoneNumbers";
import { useAssignPhoneNumberDialog } from "./hook";

export const AssignPhoneNumberDialog = ({
  onClose,
  phoneNumber,
}: {
  onClose: () => void;
  phoneNumber: PhoneNumber;
}) => {
  const {
    assignMutation,
    form,
    isLoading,
    selectedUserId,
    submit,
    userOptions,
  } = useAssignPhoneNumberDialog({ onClose, phoneNumber });
  const isPending = assignMutation.isPending;

  return (
    <Dialog
      title={phoneNumber.routing ? "Change assigned user" : "Assign user"}
      onClose={isPending ? () => undefined : onClose}
    >
      <form onSubmit={submit} className="space-y-5 pt-5">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Route calls and messages for{" "}
          <strong className="text-zinc-900 dark:text-white">
            {phoneNumber.phoneNumber}
          </strong>{" "}
          to a workspace user.
        </p>
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            User
          </label>
          <Select
            value={selectedUserId}
            onChange={(userId) =>
              form.setValue("userId", userId, { shouldValidate: true })
            }
            options={userOptions}
            placeholder={isLoading ? "Loading users…" : "Select user"}
          />
          {form.formState.errors.userId && (
            <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 lg:text-sm">
              {form.formState.errors.userId.message}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isLoading || !userOptions.length}
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4056a1] dark:text-[#f5f7ff] dark:hover:bg-[#4a63b8]"
          >
            {isPending ? "Assigning…" : "Assign user"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
