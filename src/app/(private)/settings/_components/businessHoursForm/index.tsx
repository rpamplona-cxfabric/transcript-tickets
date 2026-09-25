"use client";

import type { WorkspaceSettings } from "@/lib/api/settings";
import { Select } from "@/components/select";
import { useBusinessHoursForm } from "./hook";

const timezoneOptions = [
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/New_York",
  "America/Phoenix",
];

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  const value = `${String(hour).padStart(2, "0")}:${minute}`;
  const displayHour = hour % 12 || 12;
  const period = hour < 12 ? "AM" : "PM";

  return { label: `${displayHour}:${minute} ${period}`, value };
});

const dayLabel = (day: string) => day.charAt(0).toUpperCase() + day.slice(1);

export const BusinessHoursForm = ({
  settings,
}: {
  settings: WorkspaceSettings;
}) => {
  const { days, form, isPending, submit } = useBusinessHoursForm(settings);
  const { register, setValue, watch } = form;

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block max-w-sm">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Timezone
        </span>
        <Select
          value={watch("timezone")}
          onChange={(timezone) =>
            setValue("timezone", timezone, { shouldDirty: true })
          }
          options={timezoneOptions.map((timezone) => ({
            label: timezone.replace(/_/g, " "),
            value: timezone,
          }))}
          buttonClassName="py-2.5"
        />
      </label>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {days.map((day) => {
          const isEnabled = watch(`businessHours.${day}.enabled`);
          return (
            <div
              key={day}
              className="flex flex-col gap-3 border-b border-zinc-200 p-4 last:border-b-0 dark:border-zinc-800 sm:flex-row sm:items-center"
            >
              <label className="flex min-w-36 items-center gap-3 text-sm font-semibold text-zinc-900 dark:text-white">
                <input
                  type="checkbox"
                  {...register(`businessHours.${day}.enabled`)}
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
                />
                {dayLabel(day)}
              </label>
              <div className="flex flex-1 items-center gap-2 sm:flex-none">
                <Select
                  disabled={!isEnabled}
                  value={watch(`businessHours.${day}.start`)}
                  onChange={(start) =>
                    setValue(`businessHours.${day}.start`, start, {
                      shouldDirty: true,
                    })
                  }
                  options={timeOptions}
                  className="min-w-0 flex-1 sm:w-48 sm:flex-none"
                />
                <span className="text-sm text-zinc-400">to</span>
                <Select
                  disabled={!isEnabled}
                  value={watch(`businessHours.${day}.end`)}
                  onChange={(end) =>
                    setValue(`businessHours.${day}.end`, end, {
                      shouldDirty: true,
                    })
                  }
                  options={timeOptions}
                  className="min-w-0 flex-1 sm:w-48 sm:flex-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-[#4056a1] dark:text-[#f5f7ff] dark:hover:bg-[#4a63b8]"
        >
          {isPending ? "Saving…" : "Save business hours"}
        </button>
      </div>
    </form>
  );
};
