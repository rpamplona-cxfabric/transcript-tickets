"use client";

import { useEffect, useState } from "react";
import type { ActionMenuItem } from "@/components/actionMenu";
import type { TableSortDirection } from "@/components/tableHeader";
import { usePhoneNumbersStore } from "@/lib/store/phoneNumbers";
import { useUsersStore } from "@/lib/store/users";
import type { PhoneNumber } from "@/lib/api/phoneNumbers";
import { userName } from "@/lib/utils";

export type { PhoneNumber };

export const usePhoneNumbersClient = () => {
  const { phoneNumbers, isLoading, error, loadPhoneNumbers } =
    usePhoneNumbersStore();
  const users = useUsersStore((state) => state.users);
  const loadUsers = useUsersStore((state) => state.loadUsers);

  const [assignTarget, setAssignTarget] = useState<PhoneNumber | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<PhoneNumber | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<PhoneNumber | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<{
    direction: Exclude<TableSortDirection, null>;
    field: "phoneNumber" | "status";
  } | null>(null);

  useEffect(() => {
    void loadPhoneNumbers();
    void loadUsers();
  }, [loadPhoneNumbers, loadUsers]);

  const phoneNumberActions = (phoneNumber: PhoneNumber): ActionMenuItem[] => {
    return [
      {
        label: phoneNumber.routing ? "Change assigned user" : "Assign user",
        onSelect: () => setAssignTarget(phoneNumber),
      },
      ...(phoneNumber.routing
        ? [
            {
              label: "Unassign user",
              onSelect: () => setUnassignTarget(phoneNumber),
            },
          ]
        : []),
      {
        label: "Remove",
        destructive: true,
        onSelect: () => setRemoveTarget(phoneNumber),
      },
    ];
  };

  const handleRemove = (phoneNumber: string) => {
    // TODO: Implement actual remove API call
    console.log("Removing phone number:", phoneNumber);
    setRemoveTarget(null);
    // After successful removal, refetch the data
    loadPhoneNumbers();
  };

  const searchTerm = search.trim().toLowerCase();
  const filteredPhoneNumbers = phoneNumbers
    .filter((phoneNumber) => {
      const matchesSearch =
        !searchTerm ||
        `${phoneNumber.phoneNumber} ${phoneNumber.status}`
          .toLowerCase()
          .includes(searchTerm);
      return (
        matchesSearch &&
        (statusFilter === "all" || phoneNumber.status === statusFilter)
      );
    })
    .sort((left, right) => {
      if (!sort) {
        return 0;
      }
      const value = (phoneNumber: PhoneNumber) =>
        sort.field === "phoneNumber"
          ? phoneNumber.phoneNumber
          : phoneNumber.status;
      return (
        value(left).localeCompare(value(right)) *
        (sort.direction === "asc" ? 1 : -1)
      );
    });

  const toggleSort = (field: "phoneNumber" | "status") =>
    setSort((current) =>
      current?.field === field
        ? { field, direction: current.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );

  const routingLabel = (phoneNumber: PhoneNumber) => {
    if (!phoneNumber.routing) {
      return "Unassigned";
    }

    const user = users.find((item) => item.auth0_id === phoneNumber.routing);
    return user ? userName(user) : "Assigned user";
  };

  return {
    assignTarget,
    filteredPhoneNumbers,
    isLoading,
    error,
    isGenerateOpen,
    setIsGenerateOpen,
    setAssignTarget,
    removeTarget,
    search,
    setRemoveTarget,
    setSearch,
    setStatusFilter,
    setUnassignTarget,
    sort,
    statusFilter,
    toggleSort,
    phoneNumberActions,
    routingLabel,
    unassignTarget,
    handleRemove,
  };
};
