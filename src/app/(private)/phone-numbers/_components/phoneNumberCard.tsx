import type { ActionMenuItem } from "@/components/actionMenu";
import { ActionMenu } from "@/components/actionMenu";
import { StatusBadge } from "@/components/statusBadge";
import type { PhoneNumber } from "./client/hook";

export const PhoneNumberCard = ({
  phoneNumber,
  actions,
}: {
  phoneNumber: PhoneNumber;
  actions: ActionMenuItem[];
}) => {
  return (
    <div className="flex w-full items-center gap-3 p-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-white">
          {phoneNumber.phoneNumber}
        </span>
        <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400 lg:text-sm">
          Tenant: {phoneNumber.tenantId}
        </span>
      </div>
      <div className="shrink-0">
        <StatusBadge status={phoneNumber.status} />
      </div>
      <ActionMenu
        ariaLabel={`Actions for ${phoneNumber.phoneNumber}`}
        actions={actions}
      />
    </div>
  );
};
