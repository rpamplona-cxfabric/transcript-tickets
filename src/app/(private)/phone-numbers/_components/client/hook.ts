"use client";

import { useEffect, useState } from "react";
import type { ActionMenuItem } from "@/components/actionMenu";
import type { TableSortDirection } from "@/components/tableHeader";
import { usePhoneNumbersStore } from "@/lib/store/phoneNumbers";
import type { PhoneNumber } from "@/lib/api/phoneNumbers";

export type { PhoneNumber };

export const usePhoneNumbersClient = () => {
  const { phoneNumbers, isLoading, error, loadPhoneNumbers } =
    usePhoneNumbersStore();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<PhoneNumber | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<{
    direction: Exclude<TableSortDirection, null>;
    field: "phoneNumber" | "status";
  } | null>(null);

  useEffect(() => {
    loadPhoneNumbers();
  }, [loadPhoneNumbers]);

  const phoneNumberActions = (phoneNumber: PhoneNumber): ActionMenuItem[] => {
    return [
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

  return {
    filteredPhoneNumbers,
    isLoading,
    error,
    isGenerateOpen,
    setIsGenerateOpen,
    removeTarget,
    search,
    setRemoveTarget,
    setSearch,
    setStatusFilter,
    sort,
    statusFilter,
    toggleSort,
    phoneNumberActions,
    handleRemove,
  };
};
