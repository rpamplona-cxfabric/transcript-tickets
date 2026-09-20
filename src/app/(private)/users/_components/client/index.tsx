"use client";

import { MailPlus, Search, UserRound } from "lucide-react";
import { ActionMenu } from "@/components/actionMenu";
import { Select } from "@/components/select";
import { StatusBadge } from "@/components/statusBadge";
import { SortableTableHeaderCell, TableHeader } from "@/components/tableHeader";
import { USER_PERMISSIONS } from "@/lib/permissions";
import { InviteDialog } from "../inviteDialog";
import { RemoveDialog } from "../removeDialog";
import { UserCard } from "../userCard";
import { userName } from "@/lib/utils";
import { useUsersClient } from "./hook";

export const UsersClient = () => {
  const state = useUsersClient();
  const {
    error,
    filteredUsers,
    hasPermission,
    isInviteOpen,
    isLoading,
    removeTarget,
    roleFilter,
    roleName,
    roles,
    search,
    setIsInviteOpen,
    setRemoveTarget,
    setRoleFilter,
    setSearch,
    setStatusFilter,
    sort,
    statusFilter,
    toggleSort,
    userActions,
  } = state;

  return (
    <div className="workspace-canvas flex flex-1">
      <main className="flex w-full flex-col gap-4">
        <section className="app-surface app-shadow-surface rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
                Users
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage invitations, roles, and account access for your
                workspace.
              </p>
            </div>
            {hasPermission(USER_PERMISSIONS.INVITE_USERS) && (
              <button
                type="button"
                onClick={() => setIsInviteOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-[#4056a1] dark:text-[#f5f7ff] dark:hover:bg-[#4a63b8]"
              >
                <MailPlus className="h-4 w-4" /> Invite users
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-3.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "invited", label: "Invited" },
                { value: "suspended", label: "Suspended" },
              ]}
              className="lg:w-40"
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: "all", label: "All roles" },
                ...roles.map((role) => ({ value: role.id, label: role.name })),
              ]}
              className="lg:w-48"
            />
          </div>
        </section>
        <section className="app-surface app-shadow-surface min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-zinc-500">
              Loading users…
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UserRound className="mx-auto h-9 w-9 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No users found
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 lg:hidden">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.auth0_id}
                    user={user}
                    role={roleName(user.role_id)}
                    actions={userActions(user)}
                  />
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <TableHeader>
                    <tr>
                      <SortableTableHeaderCell
                        sortDirection={
                          sort?.field === "user" ? sort.direction : null
                        }
                        onSort={() => toggleSort("user")}
                      >
                        USERS
                      </SortableTableHeaderCell>
                      <SortableTableHeaderCell
                        sortDirection={
                          sort?.field === "role" ? sort.direction : null
                        }
                        onSort={() => toggleSort("role")}
                      >
                        ROLE
                      </SortableTableHeaderCell>
                      <SortableTableHeaderCell
                        sortDirection={
                          sort?.field === "status" ? sort.direction : null
                        }
                        onSort={() => toggleSort("status")}
                      >
                        STATUS
                      </SortableTableHeaderCell>
                      <th className="px-6 py-2 text-right">ACTIONS</th>
                    </tr>
                  </TableHeader>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.auth0_id}>
                        <td className="px-6 py-4">
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
                                userName(user)
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")
                                  .toUpperCase()
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-white">
                                {userName(user)}
                              </span>
                              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400 lg:text-sm">
                                {user.email_address || "No email address"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                          {roleName(user.role_id)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionMenu
                            ariaLabel={`Actions for ${userName(user)}`}
                            actions={userActions(user)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
      {isInviteOpen && (
        <InviteDialog roles={roles} onClose={() => setIsInviteOpen(false)} />
      )}
      {removeTarget && (
        <RemoveDialog
          user={removeTarget}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
};
