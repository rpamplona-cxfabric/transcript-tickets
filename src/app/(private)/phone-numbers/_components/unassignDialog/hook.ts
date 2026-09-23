"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { assignPhoneNumber, type PhoneNumber } from "@/lib/api/phoneNumbers";
import { usePhoneNumbersStore } from "@/lib/store/phoneNumbers";

export const useUnassignPhoneNumberDialog = ({
  onClose,
  phoneNumber,
}: {
  onClose: () => void;
  phoneNumber: PhoneNumber;
}) => {
  const appendPhoneNumber = usePhoneNumbersStore(
    (state) => state.appendPhoneNumber,
  );
  const unassignMutation = useMutation({
    mutationFn: assignPhoneNumber,
    onSuccess: () => {
      appendPhoneNumber({ ...phoneNumber, routing: "" });
      toast.success("Phone number unassigned successfully.");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to unassign the phone number.");
    },
  });

  const unassign = () => {
    unassignMutation.mutate({
      phoneNumber: phoneNumber.phoneNumber,
      userId: "",
    });
  };

  return { isPending: unassignMutation.isPending, unassign };
};
