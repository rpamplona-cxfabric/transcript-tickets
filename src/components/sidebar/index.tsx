'use client';

import Link from 'next/link';
import {
  Terminal,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  FileAudio,
  LogOut,
} from 'lucide-react';
import { useSidebar } from './hook';
import { ElementType, useState } from 'react';
import { useUserStore } from '@/lib/store/user';

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
}

interface SidebarAvatarProps {
  displayName: string;
  imageUrl: string;
  initials: string;
}

const SidebarAvatar = ({ displayName, imageUrl, initials }: SidebarAvatarProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold text-zinc-950"
      aria-label={`${displayName} profile photo`}
    >
      {imageUrl && !imageFailed ? (
        // UDAS profile images can be hosted on tenant-specific domains.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials || 'CX'
      )}
    </div>
  );
};

const cleanProfileValue = (value: string | null | undefined) => {
  const normalized = value?.trim();
  return normalized && normalized !== 'null' && normalized !== 'undefined' ? normalized : '';
};

export const Sidebar = ({ authUser }: SidebarProps) => {
  const profile = useUserStore((state) => state.profile);
  const {
    pathname,
    isOpen,
    setIsOpen,
    theme,
    toggleTheme,
  } = useSidebar();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transcriptions', path: '/transcriptions', icon: FileAudio },
  ];

  const udasDisplayName = [
    cleanProfileValue(profile?.first_name),
    cleanProfileValue(profile?.last_name),
  ]
    .filter(Boolean)
    .join(' ');
  const displayName =
    udasDisplayName || authUser.name || authUser.nickname || authUser.email || 'Workspace user';
  const displayEmail =
    cleanProfileValue(profile?.email_address) || authUser.email || '';
  const profileImage = cleanProfileValue(profile?.image) || authUser.picture || '';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight text-zinc-900 dark:text-white">CXF Console</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100svh] w-[min(18rem,85vw)] flex-col border-r border-zinc-800/80 bg-zinc-950 text-zinc-400 transition-transform duration-300 ease-in-out md:static md:h-auto md:w-64 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-zinc-950" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2.5 border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-3 py-3">
            <SidebarAvatar
              key={profileImage || 'profile-fallback'}
              displayName={displayName}
              imageUrl={profileImage}
              initials={initials}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{displayName}</p>
              {displayEmail && displayEmail !== displayName && (
                <p className="mt-0.5 truncate text-[11px] text-zinc-500">{displayEmail}</p>
              )}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400 transition-all duration-150 hover:bg-zinc-900 hover:text-white"
          >
            <span className="flex items-center gap-2.5">
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
          </button>
          <a
            href="/auth/logout"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400 transition-all duration-150 hover:bg-zinc-900 hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign out</span>
          </a>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
};
