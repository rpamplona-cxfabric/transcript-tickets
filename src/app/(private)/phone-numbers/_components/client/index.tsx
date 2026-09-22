"use client";

import { Phone, Search, Plus } from "lucide-react";
import { ActionMenu } from "@/components/actionMenu";
import { Select } from "@/components/select";
import { StatusBadge } from "@/components/statusBadge";
import { SortableTableHeaderCell, TableHeader } from "@/components/tableHeader";
import { RemoveDialog } from "../removeDialog";
import { PhoneNumberCard } from "../phoneNumberCard";
import { GeneratePhoneNumberDialog } from "../generateDialog";
import { usePhoneNumbersClient } from "./hook";

export const PhoneNumbersClient = () => {
  const state = usePhoneNumbersClient();
  const {
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
  } = state;

  return (
    <div className="workspace-canvas flex flex-1">
      <main className="flex w-full flex-col gap-4">
        <section className="app-surface app-shadow-surface rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
                Phone Numbers
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Manage phone numbers and their assignments for your workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGenerateOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-[#4056a1] dark:text-[#f5f7ff] dark:hover:bg-[#4a63b8]"
            >
              <Plus className="h-4 w-4" /> Create Phone Number
            </button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search phone numbers..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-3.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              className="lg:w-40"
            />
          </div>
        </section>
        <section className="app-surface app-shadow-surface min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-zinc-500">
              Loading phone numbers…
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : filteredPhoneNumbers.length === 0 ? (
            <div className="p-12 text-center">
              <Phone className="mx-auto h-9 w-9 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No phone numbers found
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 lg:hidden">
                {filteredPhoneNumbers.map((phoneNumber) => (
                  <PhoneNumberCard
                    key={phoneNumber.phoneNumber}
                    phoneNumber={phoneNumber}
                    actions={phoneNumberActions(phoneNumber)}
                  />
                ))}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <TableHeader>
                    <tr>
                      <SortableTableHeaderCell
                        sortDirection={
                          sort?.field === "phoneNumber" ? sort.direction : null
                        }
                        onSort={() => toggleSort("phoneNumber")}
                      >
                        PHONE NUMBER
                      </SortableTableHeaderCell>
                      <th className="px-6 py-2">TENANT ID</th>
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
                    {filteredPhoneNumbers.map((phoneNumber) => (
                      <tr key={phoneNumber.phoneNumber}>
                        <td className="px-6 py-4">
                          <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
                            {phoneNumber.phoneNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          {phoneNumber.tenantId}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={phoneNumber.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionMenu
                            ariaLabel={`Actions for ${phoneNumber.phoneNumber}`}
                            actions={phoneNumberActions(phoneNumber)}
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
      {isGenerateOpen && (
        <GeneratePhoneNumberDialog onClose={() => setIsGenerateOpen(false)} />
      )}
      {removeTarget && (
        <RemoveDialog
          phoneNumber={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemove}
        />
      )}
    </div>
  );
};
