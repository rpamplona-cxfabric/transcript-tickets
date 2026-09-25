"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  updateBusinessHours,
  type BusinessHours,
  type WorkspaceSettings,
} from "@/lib/api/settings";
import { workspaceSettingsSchema } from "@/lib/settings/schemas";
import { useSettingsStore } from "@/lib/store/settings";

type SettingsFormValues = WorkspaceSettings;

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const normalizeBusinessHours = (businessHours: BusinessHours): BusinessHours =>
  Object.fromEntries(
    days.map((day) => [
      day,
      businessHours[day] ?? { enabled: false, end: "17:00", start: "09:00" },
    ]),
  );

export const useBusinessHoursForm = (settings: WorkspaceSettings) => {
  const setSettings = useSettingsStore((state) => state.setSettings);
  const form = useForm<SettingsFormValues>({
    defaultValues: {
      businessHours: normalizeBusinessHours(settings.businessHours),
      callRouting: settings.callRouting,
      spamHandling: settings.spamHandling,
      timezone: settings.timezone,
    },
    resolver: zodResolver(workspaceSettingsSchema),
  });

  useEffect(() => {
    form.reset({
      businessHours: normalizeBusinessHours(settings.businessHours),
      callRouting: settings.callRouting,
      spamHandling: settings.spamHandling,
      timezone: settings.timezone,
    });
  }, [form, settings]);

  const saveMutation = useMutation({
    mutationFn: updateBusinessHours,
    onSuccess: (updatedSettings) => {
      setSettings(updatedSettings);
      toast.success("Business hours saved.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to save business hours.");
    },
  });

  const submit = form.handleSubmit((values) => saveMutation.mutate(values));

  return { days, form, isPending: saveMutation.isPending, submit };
};
