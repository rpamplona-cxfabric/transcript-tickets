"use client";

import { Select } from "@/components/select";
import type { RoutingDestination } from "@/lib/settings/types";
import { SettingsPageShell } from "../../../_components/settingsPageShell";
import { CallRoutingSkeleton } from "../callRoutingSkeleton";
import { useCallRoutingClient } from "./hook";

const getDestinationValue = (destination?: RoutingDestination) =>
  destination?.type === "user" && destination.userId
    ? destination.userId
    : "unassigned";

const toDestination = (value: string): RoutingDestination =>
  value === "unassigned"
    ? { type: "unassigned" }
    : { type: "user", userId: value };

export const CallRoutingClient = () => {
  const { error, form, isLoading, isPending, settings, submit, users } =
    useCallRoutingClient();
  const { register, setValue, watch } = form;
  const destinationOptions = [
    { label: "Unassigned", value: "unassigned" },
    ...users
      .filter((user) => user.status === "active")
      .map((user) => ({
        label:
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          user.username ||
          user.email_address ||
          user.auth0_id,
        value: user.auth0_id,
      })),
  ];

  return (
    <SettingsPageShell
      title="Call routing"
      description="Choose how inbound calls are directed when a phone number does not have its own assignment."
    >
      {isLoading ? (
        <CallRoutingSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      ) : settings ? (
        <form
          onSubmit={submit}
          className="divide-y divide-zinc-200 dark:divide-zinc-800"
        >
          <section className="pb-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Default inbound routing
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Use this destination for unassigned phone numbers.
            </p>
            <label className="mt-4 block max-w-md">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Destination
              </span>
              <Select
                value={getDestinationValue(watch("defaultDestination"))}
                onChange={(value) =>
                  setValue("defaultDestination", toDestination(value), {
                    shouldDirty: true,
                  })
                }
                options={destinationOptions}
              />
            </label>
          </section>

          <section className="py-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register("afterHours.enabled")}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              <span>
                <span className="block text-base font-semibold text-zinc-900 dark:text-white">
                  After-hours routing
                </span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                  Apply this route outside the Business Hours schedule.
                </span>
              </span>
            </label>
            <label className="mt-4 block max-w-md">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Destination
              </span>
              <Select
                disabled={!watch("afterHours.enabled")}
                value={getDestinationValue(watch("afterHours.destination"))}
                onChange={(value) =>
                  setValue("afterHours.destination", toDestination(value), {
                    shouldDirty: true,
                  })
                }
                options={destinationOptions}
              />
            </label>
          </section>

          <section className="py-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register("noAnswer.enabled")}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              <span>
                <span className="block text-base font-semibold text-zinc-900 dark:text-white">
                  No-answer handling
                </span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                  Continue routing when the initial destination does not answer.
                </span>
              </span>
            </label>
            <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Ring timeout
                </span>
                <Select
                  disabled={!watch("noAnswer.enabled")}
                  value={String(watch("noAnswer.ringTimeoutSeconds"))}
                  onChange={(value) =>
                    setValue("noAnswer.ringTimeoutSeconds", Number(value), {
                      shouldDirty: true,
                    })
                  }
                  options={[15, 20, 30, 45, 60].map((seconds) => ({
                    label: `${seconds} seconds`,
                    value: String(seconds),
                  }))}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Continue to
                </span>
                <Select
                  disabled={!watch("noAnswer.enabled")}
                  value={getDestinationValue(watch("noAnswer.destination"))}
                  onChange={(value) =>
                    setValue("noAnswer.destination", toDestination(value), {
                      shouldDirty: true,
                    })
                  }
                  options={destinationOptions}
                />
              </label>
            </div>
          </section>

          <section className="py-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Fallback destination
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Use this route when no other configured destination is available.
            </p>
            <label className="mt-4 block max-w-md">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Destination
              </span>
              <Select
                value={getDestinationValue(watch("fallbackDestination"))}
                onChange={(value) =>
                  setValue("fallbackDestination", toDestination(value), {
                    shouldDirty: true,
                  })
                }
                options={destinationOptions}
              />
            </label>
          </section>

          <div className="flex justify-end pt-5">
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
