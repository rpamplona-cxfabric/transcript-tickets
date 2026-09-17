'use client';

import { Sidebar, type AuthenticatedUser } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/components/sidebar/hook';
import { StoreInitializer } from '@/components/storeInitializer';
import { UserProfileInitializer } from '@/components/auth/userProfileInitializer';

interface PrivateAppShellProps {
  authUser: AuthenticatedUser;
  children: React.ReactNode;
}

export const PrivateAppShell = ({ authUser, children }: PrivateAppShellProps) => {
  const { pathname, isOpen, setIsOpen, theme, setTheme } = useSidebar();

  return (
    <div className="workspace-canvas flex h-[100svh] flex-col overflow-hidden text-zinc-900 dark:text-zinc-50 md:gap-[9px] md:p-[9px]">
      <Header
        authUser={authUser}
        isSidebarOpen={isOpen}
        setIsSidebarOpen={setIsOpen}
        theme={theme}
        setTheme={setTheme}
      />
      <div className="flex min-h-0 flex-1 flex-col md:gap-[9px] md:flex-row">
        <Sidebar
          authUser={authUser}
          pathname={pathname}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          theme={theme}
          setTheme={setTheme}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-[9px] md:p-0">
          <UserProfileInitializer>
            <StoreInitializer>
              {children}
            </StoreInitializer>
          </UserProfileInitializer>
        </main>
      </div>
    </div>
  );
};
