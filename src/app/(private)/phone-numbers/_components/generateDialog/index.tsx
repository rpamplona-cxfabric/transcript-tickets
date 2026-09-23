"use client";

import { MapPin, MessageSquareText, Phone, Radio } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { useGeneratePhoneNumberDialog } from "./hook";

export const GeneratePhoneNumberDialog = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const {
    availablePhoneNumbers,
    availableQuery,
    form,
    isPending,
    selectedPhoneNumber,
    submit,
  } = useGeneratePhoneNumberDialog(onClose);

  return (
    <Dialog
      title="Choose a Phone Number"
      size="wide"
      onClose={isPending ? () => undefined : onClose}
    >
      <form onSubmit={submit} className="space-y-5 pt-5">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Choose a number to purchase for your workspace. You will be asked to
          confirm before a billable number is created.
        </p>

        {availableQuery.isLoading ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            Finding available phone numbers…
          </div>
        ) : availableQuery.error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
            {availableQuery.error instanceof Error
              ? availableQuery.error.message
              : "Unable to load available phone numbers."}
          </div>
        ) : availablePhoneNumbers.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            No phone numbers are currently available. Try again shortly.
          </div>
        ) : (
          <fieldset className="max-h-80 space-y-2 overflow-y-auto pr-1">
            <legend className="sr-only">Available phone numbers</legend>
            {availablePhoneNumbers.map((phoneNumber) => {
              const isSelected =
                selectedPhoneNumber === phoneNumber.phoneNumber;
              return (
                <label
                  key={phoneNumber.phoneNumber}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="radio"
                    value={phoneNumber.phoneNumber}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                    {...form.register("phoneNumber")}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
                      {phoneNumber.friendlyName}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 lg:text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {phoneNumber.locality}, {phoneNumber.region},{" "}
                      {phoneNumber.isoCountry}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400 lg:text-sm">
                      {phoneNumber.capabilities.voice && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> Voice
                        </span>
                      )}
                      {phoneNumber.capabilities.SMS && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquareText className="h-3.5 w-3.5" /> SMS
                        </span>
                      )}
                      {phoneNumber.capabilities.MMS && (
                        <span className="inline-flex items-center gap-1">
                          <Radio className="h-3.5 w-3.5" /> MMS
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}
        {form.formState.errors.phoneNumber && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.phoneNumber.message}
          </p>
        )}
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
            type="submit"
            disabled={
              isPending ||
              availableQuery.isLoading ||
              availablePhoneNumbers.length === 0
            }
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-[#4056a1] dark:text-[#f5f7ff]"
          >
            {isPending ? "Purchasing…" : "Confirm and Purchase"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
