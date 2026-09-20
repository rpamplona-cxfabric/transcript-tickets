"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  Check,
  ChevronLeft,
  FileAudio,
  ListTodo,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Sun,
  UsersRound,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AuthenticatedUser } from "@/components/sidebar";
import type { ThemePreference } from "@/components/sidebar/hook";
import { HomeIcon } from "@/components/homeIcon";
import { useUserStore } from "@/lib/store/user";

interface HeaderProps {
  authUser: AuthenticatedUser;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const cleanProfileValue = (value: string | null | undefined) => {
  const normalized = value?.trim();
  return normalized && normalized !== "null" && normalized !== "undefined"
    ? normalized
    : "";
};

const breadcrumbPages = {
  "/": { title: "Home", icon: HomeIcon },
  "/conversations": { title: "Conversations", icon: FileAudio },
  "/tasks": { title: "Tasks", icon: ListTodo },
  "/users": { title: "Users", icon: UsersRound },
};

export const Header = ({
  authUser,
  isSidebarOpen,
  setIsSidebarOpen,
  theme,
  setTheme,
}: HeaderProps) => {
  const pathname = usePathname();
  const profile = useUserStore((state) => state.profile);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
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
  const pageTitle =
    pathname.split("/").filter(Boolean).at(-1)?.replace(/-/g, " ") || "Home";
  const breadcrumb = breadcrumbPages[
    pathname as keyof typeof breadcrumbPages
  ] ?? {
    title: pageTitle,
    icon: HomeIcon,
  };
  const BreadcrumbIcon = breadcrumb.icon;
  const breadcrumbIconSize =
    BreadcrumbIcon === HomeIcon ? "h-5 w-5" : "h-4 w-4";

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeMenu = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsThemeMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("touchstart", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("touchstart", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

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

  return (
    <div className="relative z-50 shrink-0">
      <header className="app-surface app-shadow-surface flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800 sm:px-5 md:rounded-2xl md:border">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-xl"
          >
            Transcript Portal
          </Link>
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-2 text-sm font-normal leading-5 text-[#1e283e] dark:text-zinc-200 md:flex"
          >
            <Link
              href={pathname}
              aria-label={`Go to ${breadcrumb.title}`}
              className="rounded-sm text-[#1e283e] transition-colors hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-white"
            >
              <BreadcrumbIcon className={`${breadcrumbIconSize} shrink-0`} />
            </Link>
            <span className="text-zinc-400 dark:text-zinc-500">/</span>
            <span className="capitalize">{breadcrumb.title}</span>
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-lg p-2 text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden dark:text-zinc-200 dark:hover:bg-black"
          aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        <div ref={menuRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => {
              if (isMenuOpen) setIsThemeMenuOpen(false);
              setIsMenuOpen((isOpen) => !isOpen);
            }}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-100 text-xs lg:text-sm font-semibold text-zinc-700 transition hover:ring-2 hover:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:ring-zinc-700"
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            {avatar}
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="app-surface app-shadow-menu absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-zinc-200 p-3 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-100 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                  {avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="mt-0.5 truncate text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />

              <div className="space-y-1">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                  <UserRound className="h-4.5 w-4.5" />
                  <span>Profile</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setIsThemeMenuOpen((isOpen) => !isOpen)}
                  aria-haspopup="menu"
                  aria-expanded={isThemeMenuOpen}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-black"
                >
                  <span className="flex items-center gap-3">
                    {theme === "light" ? (
                      <Sun className="h-4.5 w-4.5" />
                    ) : theme === "dark" ? (
                      <Moon className="h-4.5 w-4.5" />
                    ) : (
                      <Monitor className="h-4.5 w-4.5" />
                    )}
                    Theme
                  </span>
                  <ChevronLeft
                    className={`h-4 w-4 transition-transform ${isThemeMenuOpen ? "" : "rotate-180"}`}
                  />
                </button>
                {isThemeMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Theme"
                    className="app-surface app-shadow-menu absolute right-[calc(100%+0.5rem)] top-24 w-44 rounded-2xl border border-zinc-200 p-2 dark:border-zinc-700"
                  >
                    {(
                      [
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Monitor },
                      ] as const
                    ).map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={theme === option.value}
                          onClick={() => {
                            setTheme(option.value);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${theme === option.value ? "bg-zinc-100 text-zinc-950 dark:bg-black dark:text-white" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-black"}`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4.5 w-4.5" />
                            {option.label}
                          </span>
                          {theme === option.value && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                <a
                  role="menuitem"
                  href="https://cxfabric-website.pages.dev/contact"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-black"
                >
                  <CircleHelp className="h-4.5 w-4.5" />
                  Help
                </a>
              </div>

              <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" />

              <a
                role="menuitem"
                href="/auth/logout"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-black"
              >
                <LogOut className="h-4.5 w-4.5" />
                Log out
              </a>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};
