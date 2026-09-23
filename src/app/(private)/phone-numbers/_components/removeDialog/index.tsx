"use client";

import { ActionConfirmationDialog } from "@/components/dialog/confirmation";
import type { PhoneNumber } from "@/lib/api/phoneNumbers";
import { useRemovePhoneNumberDialog } from "./hook";

export const RemoveDialog = ({
  onClose,
  phoneNumber,
}: {
  onClose: () => void;
  phoneNumber: PhoneNumber;
}) => {
  const { isPending, remove } = useRemovePhoneNumberDialog({
    onClose,
    phoneNumber,
  });

  return (
    <ActionConfirmationDialog
      confirmLabel="Remove phone number"
      isPending={isPending}
      message={
        <>
          Remove{" "}
          <strong className="text-zinc-900 dark:text-white">
            {phoneNumber.phoneNumber}
          </strong>
          ? This action cannot be undone.
        </>
      }
      onClose={isPending ? () => undefined : onClose}
      onConfirm={remove}
      title="Remove phone number"
    />
  );
};
