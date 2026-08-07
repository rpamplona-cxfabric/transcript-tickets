import { redirect } from 'next/navigation';
import { PrivateAppShell } from '@/components/auth/privateAppShell';
import { auth0 } from '@/lib/auth/auth0';

export const dynamic = 'force-dynamic';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/signin?returnTo=/');
  }

  return <PrivateAppShell authUser={session.user}>{children}</PrivateAppShell>;
}
