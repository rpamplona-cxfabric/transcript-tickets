"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deletePhoneNumber, type PhoneNumber } from "@/lib/api/phoneNumbers";
import { usePhoneNumbersStore } from "@/lib/store/phoneNumbers";

export const useRemovePhoneNumberDialog = ({
  onClose,
  phoneNumber,
}: {
  onClose: () => void;
  phoneNumber: PhoneNumber;
}) => {
  const removePhoneNumber = usePhoneNumbersStore(
    (state) => state.removePhoneNumber,
  );
  const removeMutation = useMutation({
    mutationFn: deletePhoneNumber,
    onSuccess: () => {
      removePhoneNumber(phoneNumber.phoneNumber);
      toast.success("Phone number removed successfully.");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to remove the phone number.");
    },
  });

  const remove = () => {
    removeMutation.mutate({
      phoneNumber: phoneNumber.phoneNumber,
      sid: phoneNumber.sid,
    });
  };

  return { isPending: removeMutation.isPending, remove };
};
