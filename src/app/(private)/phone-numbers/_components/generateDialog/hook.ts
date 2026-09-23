"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  purchasePhoneNumber,
  fetchAvailablePhoneNumbers,
} from "@/lib/api/phoneNumbers";
import type { AvailablePhoneNumbersResponse } from "@/lib/api/phoneNumbers";
import { usePhoneNumbersStore } from "@/lib/store/phoneNumbers";

const phoneNumberSchema = z.object({
  phoneNumber: z.string().min(1, "Select a phone number."),
});

type PhoneNumberFormValues = z.infer<typeof phoneNumberSchema>;

export const useGeneratePhoneNumberDialog = (onClose: () => void) => {
  const queryClient = useQueryClient();
  const availablePhoneNumbers = usePhoneNumbersStore(
    (state) => state.availablePhoneNumbers,
  );
  const appendPhoneNumber = usePhoneNumbersStore(
    (state) => state.appendPhoneNumber,
  );
  const setAvailablePhoneNumbers = usePhoneNumbersStore(
    (state) => state.setAvailablePhoneNumbers,
  );
  const form = useForm<PhoneNumberFormValues>({
    defaultValues: { phoneNumber: "" },
    resolver: zodResolver(phoneNumberSchema),
  });
  const availableQuery = useQuery({
    queryKey: ["available-phone-numbers"],
    queryFn: fetchAvailablePhoneNumbers,
  });

  useEffect(() => {
    if (availableQuery.data?.success) {
      setAvailablePhoneNumbers(availableQuery.data.phoneNumbers);
    }
  }, [availableQuery.data, setAvailablePhoneNumbers]);

  const purchaseMutation = useMutation({
    mutationFn: purchasePhoneNumber,
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error("Unable to purchase the selected phone number.");
        return;
      }

      toast.success(`Phone number ${result.phoneNumber} created successfully.`);
      appendPhoneNumber(result.item);
      setAvailablePhoneNumbers(
        availablePhoneNumbers.filter(
          (availablePhoneNumber) =>
            availablePhoneNumber.phoneNumber !== result.phoneNumber,
        ),
      );
      queryClient.setQueryData<AvailablePhoneNumbersResponse>(
        ["available-phone-numbers"],
        (current) =>
          current
            ? {
                ...current,
                phoneNumbers: current.phoneNumbers.filter(
                  (availablePhoneNumber) =>
                    availablePhoneNumber.phoneNumber !== result.phoneNumber,
                ),
              }
            : current,
      );
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to purchase the selected number.");
    },
  });

  const submit = form.handleSubmit(({ phoneNumber }) => {
    purchaseMutation.mutate(phoneNumber);
  });
  const selectedPhoneNumber = useWatch({
    control: form.control,
    name: "phoneNumber",
  });

  return {
    availablePhoneNumbers,
    availableQuery,
    form,
    isPending: purchaseMutation.isPending,
    selectedPhoneNumber,
    submit,
  };
};
