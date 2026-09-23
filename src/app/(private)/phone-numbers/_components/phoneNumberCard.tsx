import type { ActionMenuItem } from "@/components/actionMenu";
import { ActionMenu } from "@/components/actionMenu";
import { StatusBadge } from "@/components/statusBadge";
import type { PhoneNumber } from "./client/hook";
import { RoutingBadge } from "./routingBadge";

export const PhoneNumberCard = ({
  phoneNumber,
  routingLabel,
  actions,
}: {
  phoneNumber: PhoneNumber;
  routingLabel: string;
  actions: ActionMenuItem[];
}) => {
  return (
    <div className="flex w-full items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-white">
          {phoneNumber.phoneNumber}
        </span>
        <div className="mt-2 min-w-0">
          <RoutingBadge
            className="max-w-[12rem] truncate"
            label={routingLabel}
            routing={phoneNumber.routing}
          />
        </div>
      </div>
      <div className="shrink-0">
        <StatusBadge status={phoneNumber.status} />
      </div>
      <ActionMenu
        ariaLabel={`Actions for ${phoneNumber.phoneNumber}`}
        actions={actions}
        orientation="vertical"
      />
    </div>
  );
};
