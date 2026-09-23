"use client";

import { ActionConfirmationDialog } from "@/components/dialog/confirmation";
import type { PhoneNumber } from "@/lib/api/phoneNumbers";
import { useUnassignPhoneNumberDialog } from "./hook";

export const UnassignPhoneNumberDialog = ({
  onClose,
  phoneNumber,
}: {
  onClose: () => void;
  phoneNumber: PhoneNumber;
}) => {
  const { isPending, unassign } = useUnassignPhoneNumberDialog({
    onClose,
    phoneNumber,
  });

  return (
    <ActionConfirmationDialog
      confirmLabel="Unassign user"
      isPending={isPending}
      message={
        <>
          Remove the assigned user from{" "}
          <strong className="text-zinc-900 dark:text-white">
            {phoneNumber.phoneNumber}
          </strong>
          ? Calls and messages will no longer route to that user.
        </>
      }
      onClose={isPending ? () => undefined : onClose}
      onConfirm={unassign}
      title="Unassign user"
    />
  );
};
