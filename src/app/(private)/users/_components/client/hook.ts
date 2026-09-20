"use client";

import { useEffect, useState } from "react";
import type { ActionMenuItem } from "@/components/actionMenu";
import type { TableSortDirection } from "@/components/tableHeader";
import { hasUserPermission, USER_PERMISSIONS } from "@/lib/permissions";
import { useUsersStore } from "@/lib/store/users";
import type { TenantUser } from "@/lib/udas/usersApi";
import { userName } from "@/lib/utils";

export const useUsersClient = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TenantUser | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState<{
    direction: Exclude<TableSortDirection, null>;
    field: "user" | "role" | "status";
  } | null>(null);
  const {
    actorAuth0Id,
    error,
    isLoading,
    loadUsers,
    permissions,
    roles,
    users,
  } = useUsersStore();

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const roleName = (roleId: string | null) =>
    roles.find((role) => role.id === roleId)?.name || "No role";
  const hasPermission = (
    permission: (typeof USER_PERMISSIONS)[keyof typeof USER_PERMISSIONS],
  ) => hasUserPermission(permissions, permission);
  const actor = users.find((user) => user.auth0_id === actorAuth0Id);
  const canManageMembership = hasPermission(USER_PERMISSIONS.REMOVE_USERS);

  const userActions = (user: TenantUser): ActionMenuItem[] => {
    if (!canManageMembership) return [];

    const isTargetOwner = roleName(user.role_id).toLowerCase() === "owner";
    const actions: ActionMenuItem[] = [];

    if (
      user.auth0_id !== actorAuth0Id &&
      !isTargetOwner &&
      hasPermission(USER_PERMISSIONS.REMOVE_USERS)
    ) {
      actions.push({
        label: "Remove",
        destructive: true,
        onSelect: () => setRemoveTarget(user),
      });
    }
    return actions;
  };

  const searchTerm = search.trim().toLowerCase();
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        !searchTerm ||
        `${userName(user)} ${user.email_address || ""} ${roleName(user.role_id)} ${user.status || ""}`
          .toLowerCase()
          .includes(searchTerm);
      return (
        matchesSearch &&
        (statusFilter === "all" || user.status === statusFilter) &&
        (roleFilter === "all" || user.role_id === roleFilter)
      );
    })
    .sort((left, right) => {
      if (!sort) return 0;
      const value = (user: TenantUser) =>
        sort.field === "user"
          ? userName(user)
          : sort.field === "role"
            ? roleName(user.role_id)
            : user.status || "";
      return (
        value(left).localeCompare(value(right)) *
        (sort.direction === "asc" ? 1 : -1)
      );
    });
  const toggleSort = (field: "user" | "role" | "status") =>
    setSort((current) =>
      current?.field === field
        ? { field, direction: current.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );

  return {
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
  };
};
