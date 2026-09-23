import type { ActionMenuItem } from "@/components/actionMenu";
import { ActionMenu } from "@/components/actionMenu";
import { StatusBadge } from "@/components/statusBadge";
import type { TenantUser } from "@/lib/udas/usersApi";
import { userName } from "@/lib/utils";

export const UserCard = ({
  user,
  role,
  actions,
}: {
  user: TenantUser;
  role: string;
  actions: ActionMenuItem[];
}) => {
  const initials = userName(user)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex w-full items-center gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 lg:text-sm">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-white">
            {userName(user)}
          </span>
          <span className="mb-1 block truncate text-xs text-zinc-500 dark:text-zinc-400 lg:text-sm">
            {user.email_address || "No email address"}
          </span>
          <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 lg:text-sm">
            {role}
          </span>
        </span>
      </div>
      <div className="ml-auto shrink-0">
        <StatusBadge status={user.status} />
      </div>
      <ActionMenu
        ariaLabel={`Actions for ${userName(user)}`}
        actions={actions}
        orientation="vertical"
      />
    </div>
  );
};
