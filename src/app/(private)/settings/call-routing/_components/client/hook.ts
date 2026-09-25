"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateCallRouting } from "@/lib/api/settings";
import { defaultWorkspaceSettings } from "@/lib/settings/defaults";
import { callRoutingSettingsSchema } from "@/lib/settings/schemas";
import type { CallRoutingSettings } from "@/lib/settings/types";
import { useSettingsStore } from "@/lib/store/settings";
import { useUsersStore } from "@/lib/store/users";

export const useCallRoutingClient = () => {
  const error = useSettingsStore((state) => state.error);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const loadUsers = useUsersStore((state) => state.loadUsers);
  const users = useUsersStore((state) => state.users);
  const callRouting =
    settings?.callRouting ?? defaultWorkspaceSettings.callRouting;
  const form = useForm<CallRoutingSettings>({
    defaultValues: callRouting,
    resolver: zodResolver(callRoutingSettingsSchema),
  });

  useEffect(() => {
    form.reset(callRouting);
  }, [callRouting, form]);

  useEffect(() => {
    if (users.length === 0) {
      void loadUsers();
    }
  }, [loadUsers, users.length]);

  const saveMutation = useMutation({
    mutationFn: updateCallRouting,
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || "Unable to save call routing.");
    },
    onSuccess: (callRouting) => {
      if (settings) {
        setSettings({ ...settings, callRouting });
      }

      toast.success("Call routing saved.");
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
    users,
  };
};
