"use client";

import { Select } from "@/components/select";
import type { SpamHandlingSettings } from "@/lib/settings/types";
import { SettingsPageShell } from "../../../_components/settingsPageShell";
import { SpamHandlingSkeleton } from "../spamHandlingSkeleton";
import { useSpamHandlingClient } from "./hook";

const treatmentOptions = [
  { label: "Send to voicemail", value: "voicemail" },
  { label: "Silence the call", value: "silence" },
  { label: "Block the call", value: "block" },
];

export const SpamHandlingClient = () => {
  const { error, form, isLoading, isPending, settings, submit } =
    useSpamHandlingClient();
  const { register, setValue, watch } = form;
  const screeningEnabled = watch("enabled");

  return (
    <SettingsPageShell
      title="Spam handling"
      description="Set how suspected spam calls are screened and handled for your workspace."
    >
      {isLoading ? (
        <SpamHandlingSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      ) : settings ? (
        <form onSubmit={submit} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-zinc-900 dark:text-white">
              Call screening
            </legend>
            <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <input
                type="checkbox"
                {...register("enabled")}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              <span>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
                  Screen suspected spam calls
                </span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                  Identify calls that are likely to be spam before they reach a
                  workspace destination.
                </span>
              </span>
            </label>

            <label className="block max-w-md">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                When a call is flagged
              </span>
              <Select
                disabled={!screeningEnabled}
                value={watch("treatment")}
                onChange={(treatment) =>
                  setValue(
                    "treatment",
                    treatment as SpamHandlingSettings["treatment"],
                    {
                      shouldDirty: true,
                    },
                  )
                }
                options={treatmentOptions}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <legend className="text-sm font-semibold text-zinc-900 dark:text-white">
              Additional rules
            </legend>
            <label className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                {...register("blockUnknownCallers")}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              <span>
                <span className="block font-semibold">
                  Block unknown callers
                </span>
                <span className="mt-1 block text-zinc-500 dark:text-zinc-400">
                  Prevent calls without a recognized caller identity from being
                  routed.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                {...register("notifyOnScreenedCalls")}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              <span>
                <span className="block font-semibold">
                  Notify the workspace about screened calls
                </span>
                <span className="mt-1 block text-zinc-500 dark:text-zinc-400">
                  Create a future notification when a call is screened or
                  blocked.
                </span>
              </span>
            </label>
          </fieldset>

          <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#4056a1] dark:text-[#f5f7ff] dark:hover:bg-[#4a63b8]"
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      ) : null}
    </SettingsPageShell>
  );
};
