"use client";

import Link from "next/link";
import {
  CircleHelp,
  ChevronRight,
  LogOut,
  FileAudio,
  Moon,
  UserRound,
  UsersRound,
  X,
  Phone,
} from "lucide-react";
import {
  Dispatch,
  ElementType,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Select } from "@/components/select";
import { HomeIcon } from "@/components/homeIcon";
import type { ThemePreference } from "@/components/sidebar/hook";
import { useUserStore } from "@/lib/store/user";

interface MenuItem {
  name: string;
  path: string;
  icon: ElementType;
}

export interface AuthenticatedUser {
  sub?: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
}

interface SidebarProps {
  authUser: AuthenticatedUser;
  pathname: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const cleanProfileValue = (value: string | null | undefined) => {
  const normalized = value?.trim();
  return normalized && normalized !== "null" && normalized !== "undefined"
    ? normalized
    : "";
};

export const Sidebar = ({
  authUser,
  pathname,
  isOpen,
  setIsOpen,
  theme,
  setTheme,
}: SidebarProps) => {
  const profile = useUserStore((state) => state.profile);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const profileName = [
    cleanProfileValue(profile?.first_name),
    cleanProfileValue(profile?.last_name),
  ]
    .filter(Boolean)
    .join(" ");
  const displayName =
    profileName ||
    authUser.name ||
    authUser.nickname ||
    authUser.email ||
    "Workspace user";
  const displayEmail =
    cleanProfileValue(profile?.email_address) || authUser.email || "";
  const profileImage =
    cleanProfileValue(profile?.image) || authUser.picture || "";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!isOpen && !isProfileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isProfileOpen]);

  const avatar =
    profileImage && !imageFailed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profileImage}
        alt=""
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    ) : (
      initials || "TP"
    );

  const menuItems: MenuItem[] = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Conversations", path: "/conversations", icon: FileAudio },
    { name: "Users", path: "/users", icon: UsersRound },
    { name: "Phone Numbers", path: "/phone-numbers", icon: Phone },
  ];

  return (
    <>
      <aside
        className={`app-surface app-shadow-surface fixed inset-0 z-[60] flex w-full flex-col text-[#1e283e] transition-transform duration-300 ease-in-out dark:text-zinc-400 md:static md:z-auto md:h-auto md:w-64 md:translate-x-0 md:rounded-2xl md:border md:border-zinc-200 md:dark:border-zinc-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800 md:hidden">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white"
          >
            Transcript Portal
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-black"
            aria-label="Close navigation"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-6 py-7 md:px-4 md:py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const iconSize = Icon === HomeIcon ? "h-5 w-5" : "h-4 w-4";
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-normal transition-all duration-200 ${
                  isActive
                    ? "bg-[#e2e8f0] text-[#1e283e] dark:bg-white dark:text-zinc-950"
                    : "text-[#1e283e] hover:bg-[#e2e8f0] dark:text-zinc-400 dark:hover:bg-black dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`${iconSize} transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-[#1e283e]" : "text-[#1e283e] dark:text-zinc-400 dark:group-hover:text-white"}`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-[#1e283e]" />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setIsProfileOpen(true);
          }}
          className="mx-6 mb-7 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-left dark:border-zinc-800 dark:bg-black md:hidden"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            {avatar}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-zinc-950 dark:text-white">
              {displayName}
            </span>
            {displayEmail && (
              <span className="mt-0.5 block truncate text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">
                {displayEmail}
              </span>
            )}
          </span>
        </button>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-zinc-950/40 backdrop-blur-sm md:hidden"
        />
      )}

      {isProfileOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-zinc-950/45 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsProfileOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Profile menu"
            onClick={(event) => event.stopPropagation()}
            className="app-surface app-shadow-surface max-h-[76svh] w-full overflow-x-hidden overflow-y-auto rounded-t-3xl border border-b-0 border-zinc-200 px-5 pb-5 pt-3 dark:border-zinc-700"
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-indigo-500" />
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                {avatar}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                  {displayName}
                </p>
                {displayEmail && (
                  <p className="mt-0.5 truncate text-xs lg:text-sm text-zinc-600 dark:text-zinc-400">
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1 py-3">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-black">
                <UserRound className="h-4.5 w-4.5" />
                <span className="font-medium">Profile</span>
              </div>
              <div className="flex items-center justify-between gap-4 px-3 py-2">
                <span className="flex items-center gap-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Moon className="h-4.5 w-4.5" />
                  Theme
                </span>
                <div className="w-40 min-w-0 shrink-0">
                  <Select
                    value={theme}
                    onChange={(value) => setTheme(value as ThemePreference)}
                    options={[
                      { value: "light", label: "Light" },
                      { value: "dark", label: "Dark" },
                      { value: "system", label: "System" },
                    ]}
                    buttonClassName="py-2"
                  />
                </div>
              </div>
              <a
                href="https://cxfabric-website.pages.dev/contact"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-black"
              >
                <CircleHelp className="h-4.5 w-4.5" /> Help
              </a>
            </div>
            <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <a
                href="/auth/logout"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-black"
              >
                <LogOut className="h-4.5 w-4.5" /> Log out
              </a>
            </div>
          </section>
        </div>
      )}
    </>
  );
};
