"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateSpamHandling } from "@/lib/api/settings";
import { spamHandlingSettingsSchema } from "@/lib/settings/schemas";
import type { SpamHandlingSettings } from "@/lib/settings/types";
import { useSettingsStore } from "@/lib/store/settings";

export const useSpamHandlingClient = () => {
  const error = useSettingsStore((state) => state.error);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const form = useForm<SpamHandlingSettings>({
    defaultValues: settings?.spamHandling,
    resolver: zodResolver(spamHandlingSettingsSchema),
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings.spamHandling);
    }
  }, [form, settings]);

  const saveMutation = useMutation({
    mutationFn: updateSpamHandling,
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || "Unable to save spam handling.");
    },
    onSuccess: (spamHandling) => {
      if (settings) {
        setSettings({ ...settings, spamHandling });
      }

      toast.success("Spam handling saved.");
    },
  });

  const submit = form.handleSubmit((values) => saveMutation.mutate(values));

  return {
    error,
    form,
    isLoading,
    isPending: saveMutation.isPending,
    settings,
    submit,
  };
};
