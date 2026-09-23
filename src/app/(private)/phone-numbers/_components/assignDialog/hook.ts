"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { assignPhoneNumber, type PhoneNumber } from "@/lib/api/phoneNumbers";
import { usePhoneNumbersStore } from "@/lib/store/phoneNumbers";
import { useUsersStore } from "@/lib/store/users";
import { userName } from "@/lib/utils";

const assignPhoneNumberSchema = z.object({
  userId: z.string().min(1, "Select a user."),
});

type AssignPhoneNumberFormValues = z.infer<typeof assignPhoneNumberSchema>;

export const useAssignPhoneNumberDialog = ({
  onClose,
  phoneNumber,
}: {
  onClose: () => void;
  phoneNumber: PhoneNumber;
}) => {
  const users = useUsersStore((state) => state.users);
  const usersLoading = useUsersStore((state) => state.isLoading);
  const loadUsers = useUsersStore((state) => state.loadUsers);
  const appendPhoneNumber = usePhoneNumbersStore(
    (state) => state.appendPhoneNumber,
  );
  const form = useForm<AssignPhoneNumberFormValues>({
    defaultValues: { userId: phoneNumber.routing || "" },
    resolver: zodResolver(assignPhoneNumberSchema),
  });
  const selectedUserId = useWatch({
    control: form.control,
    name: "userId",
  });

  useEffect(() => {
    if (!users.length) {
      void loadUsers();
    }
  }, [loadUsers, users.length]);

  const assignMutation = useMutation({
    mutationFn: assignPhoneNumber,
    onSuccess: (result) => {
      appendPhoneNumber({ ...phoneNumber, routing: result.userId });
      toast.success("Phone number assigned successfully.");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to assign the phone number.");
    },
  });
  const userOptions = users
    .filter((user) => user.status !== "suspended")
    .map((user) => ({
      label: userName(user),
      value: user.auth0_id,
    }));
  const submit = form.handleSubmit(({ userId }) => {
    assignMutation.mutate({
      phoneNumber: phoneNumber.phoneNumber,
      userId,
    });
  });

  return {
    assignMutation,
    form,
    isLoading: usersLoading,
    selectedUserId,
    submit,
    userOptions,
  };
};
