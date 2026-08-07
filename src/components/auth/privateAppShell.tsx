import { Sidebar, type AuthenticatedUser } from '@/components/sidebar';
import { StoreInitializer } from '@/components/storeInitializer';
import { UserProfileInitializer } from '@/components/auth/userProfileInitializer';

interface PrivateAppShellProps {
  authUser: AuthenticatedUser;
  children: React.ReactNode;
}

export const PrivateAppShell = ({ authUser, children }: PrivateAppShellProps) => {
  return (
    <div className="workspace-canvas flex min-h-screen flex-col text-zinc-900 md:flex-row dark:text-zinc-50">
      <Sidebar authUser={authUser} />
      <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col overflow-x-hidden md:h-screen md:min-h-screen md:overflow-y-auto">
        <UserProfileInitializer>
          <StoreInitializer>{children}</StoreInitializer>
        </UserProfileInitializer>
      </main>
    </div>
  );
};
