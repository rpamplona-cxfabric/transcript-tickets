"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MailPlus, X } from "lucide-react";
import { Select } from "@/components/select";
import type { TenantRole } from "@/lib/udas/usersApi";
import { Dialog } from "@/components/dialog";
import { inviteUsers } from "@/lib/api/users";
import { useUsersStore } from "@/lib/store/users";
import { emailExpression } from "@/lib/utils";

export const InviteDialog = ({
  roles,
  onClose,
}: {
  roles: TenantRole[];
  onClose: () => void;
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const loadUsers = useUsersStore((state) => state.loadUsers);
  const inviteMutation = useMutation({
    mutationFn: inviteUsers,
    onSuccess: async (result) => {
      if (!result.isSuccessful) {
        toast.error(result.message || "Unable to send invitations.");
        return;
      }
      toast.success(result.message || "Invitations sent.");
      await loadUsers();
      onClose();
    },
  });
  const isPending = inviteMutation.isPending;
  const roleOptions = roles
    .filter((role) => role.name.toLowerCase() !== "owner")
    .map((role) => ({ value: role.id, label: role.name }));
  const addEmails = () => {
    const values = emailInput
      .split(/[\s,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (values.some((email) => !emailExpression.test(email)))
      return toast.error("Enter valid email addresses.");
    const nextEmails = [...new Set([...emails, ...values])].slice(0, 10);
    if (nextEmails.length < emails.length + values.length)
      toast.error("You can invite up to 10 users at a time.");
    setEmails(nextEmails);
    setEmailInput("");
  };
  return (
    <Dialog
      title="Invite users"
      size="wide"
      onClose={isPending ? () => undefined : onClose}
    >
      <div className="space-y-5 pt-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Email addresses
          </label>
          <div className="flex gap-2">
            <input
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addEmails();
                }
              }}
              placeholder="name@example.com"
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white"
            />
            <button
              type="button"
              onClick={addEmails}
              className="rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-black"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">
            Separate multiple addresses with commas, spaces, or Enter.
          </p>
        </div>
        {emails.length > 0 && (
          <div className="space-y-2">
            {emails.map((email) => (
              <div
                key={email}
                className="app-surface-raised flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-[#293442] sm:flex-row sm:items-center"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {email}
                </span>
                <div className="flex items-center gap-2 sm:w-48">
                  <Select
                    value={userRoles[email] || ""}
                    onChange={(value) =>
                      setUserRoles((current) => ({
                        ...current,
                        [email]: value,
                      }))
                    }
                    options={[
                      { value: "", label: "Select role" },
                      ...roleOptions,
                    ]}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEmails((current) =>
                        current.filter((item) => item !== email),
                      )
                    }
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-black"
                    aria-label={`Remove ${email}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Message{" "}
            <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Hey! I’m inviting you to my team."
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white"
          />
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
            type="button"
            onClick={() =>
              inviteMutation.mutate({ emails, roles: userRoles, message })
            }
            disabled={!emails.length || isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4056a1] dark:text-[#f5f7ff] dark:hover:bg-[#4a63b8]"
          >
            <MailPlus className="h-4 w-4" />{" "}
            {isPending ? "Sending…" : "Send invite"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
