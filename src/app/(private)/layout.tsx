import { PrivateAppShell } from '@/components/auth/privateAppShell';

export const dynamic = 'force-dynamic';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <PrivateAppShell>{children}</PrivateAppShell>;
}
