"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { TenantUser } from "@/lib/udas/usersApi";
import { Dialog } from "@/components/dialog";
import { removeUser } from "@/lib/api/users";
import { useUsersStore } from "@/lib/store/users";
import { userName } from "@/lib/utils";

export const RemoveDialog = ({
  user,
  onClose,
}: {
  user: TenantUser;
  onClose: () => void;
}) => {
  const loadUsers = useUsersStore((state) => state.loadUsers);
  const removeMutation = useMutation({
    mutationFn: () => removeUser(user.auth0_id),
    onSuccess: async (result) => {
      if (!result.isSuccessful) {
        toast.error(result.message || "Unable to remove user.");
        return;
      }
      toast.success(result.message || "User removed.");
      await loadUsers();
      onClose();
    },
  });
  const isPending = removeMutation.isPending;
  return (
    <Dialog title="Remove user" onClose={onClose}>
      <div className="space-y-5 pt-5">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Are you sure you want to remove{" "}
          <strong className="text-zinc-900 dark:text-white">
            {user.email_address || userName(user)}
          </strong>{" "}
          from this workspace?
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
            onClick={() => removeMutation.mutate()}
            disabled={isPending}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Removing…" : "Remove user"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
